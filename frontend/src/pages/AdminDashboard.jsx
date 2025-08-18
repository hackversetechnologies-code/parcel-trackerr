import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Package, AlertCircle, Plus, Edit, Trash2, Search, CheckCircle, Upload, Check, Bell } from 'lucide-react';
import axios from 'axios';
import { db } from '@/firebase';
import { collection as fCollection, getDocs as fGetDocs, updateDoc as fUpdateDoc, doc as fDoc } from 'firebase/firestore';

function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newParcel, setNewParcel] = useState({
    tracking_id: '',
    status: 'pending',
    sender: '',
    receiver: '',
    estimated_delivery: '',
    location: { lat: '', lng: '', address: '' },
  });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ status: '', location: { lat: '', lng: '', address: '' } });
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('in transit');

  const [csvOpen, setCsvOpen] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const confirmRef = useRef(null);

  const [isPushOpen, setIsPushOpen] = useState(false);
  const [pushReq, setPushReq] = useState({ uid: '', title: 'Rush Delivery', body: 'This is a test notification.', url: '/notifications' });
  const pushConfirmRef = useRef(null);
  const pushCancelRef = useRef(null);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const addConfirmRef = useRef(null);
  const addCancelRef = useRef(null);
  const csvConfirmRef = useRef(null);
  const csvCancelRef = useRef(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchParcels = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://127.0.0.1:8000/parcels', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ['parcels'],
    queryFn: fetchParcels
  });

  const updateParcelMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      return axios.put(`http://127.0.0.1:8000/parcels/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parcels']);
      toast({ title: 'Parcel updated successfully' });
    }
  });

  const deleteParcelMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      return axios.delete(`http://127.0.0.1:8000/parcels/${id}`, {
        headers: { Authorization: { toString: () => `Bearer ${token}` } }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parcels']);
      toast({ title: 'Parcel deleted successfully' });
    }
  });

  const createParcelMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      return axios.post('http://127.0.0.1:8000/parcels', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parcels']);
      toast({ title: 'Parcel created successfully' });
      setIsAddOpen(false);
      setNewParcel({
        tracking_id: '',
        status: 'pending',
        sender: '',
        receiver: '',
        estimated_delivery: '',
        location: { lat: '', lng: '', address: '' },
      });
    },
    onError: (e) => {
      toast({ title: 'Error', description: e.message });
    }
  });

  const pushTestMutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem('token');
      return axios.post('http://127.0.0.1:8000/push/test', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: ({ data }) => {
      setIsPushOpen(false);
      toast({ title: 'Push sent', description: `Sent: ${data.sent} tokens: ${data.tokens}` });
    },
    onError: (e) => {
      toast({ title: 'Push failed', description: e.message });
    }
  });

  const stats = useMemo(() => ({
    total: parcels.length,
    delivered: parcels.filter(p => p.status === 'delivered').length,
    inTransit: parcels.filter(p => p.status === 'in transit').length,
    pending: parcels.filter(p => p.status === 'pending').length
  }), [parcels]);

  const filteredParcels = useMemo(() => {
    return parcels.filter(p => {
      const matchesQuery = (
        p.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiver.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesStatus = statusFilter ? p.status === statusFilter : true;
      const ed = new Date(p.estimated_delivery);
      const matchesFrom = dateFrom ? ed >= new Date(dateFrom) : true;
      const matchesTo = dateTo ? ed <= new Date(dateTo) : true;
      return matchesQuery && matchesStatus && matchesFrom && matchesTo;
    });
  }, [parcels, searchQuery, statusFilter, dateFrom, dateTo]);

  const toggleSelectedAll = (checked) => {
    if (checked) {
      setSelected(filteredParcels.map(p => p.id));
    } else {
      setSelected([]);
    }
  };

  const toggleSelected = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const applyBulkStatus = async () => {
    if (!selected.length) return;
    try {
      await Promise.all(selected.map(id => updateParcelMutation.mutateAsync({ id, data: { status: bulkStatus } })));
      setSelected([]);
      toast({ title: 'Bulk update completed' });
    } catch (e) {
      toast({ title: 'Bulk update failed', description: e.message });
    }
  };

  const parseCSV = (text) => {
    const rows = [];
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return rows;
    const headers = lines[0].split(',').map(h => h.trim());
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cells = [];
      let current = '';
      let inQuotes = false;
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '"') {
          inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
          cells.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
      cells.push(current);
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (cells[idx] || '').trim(); });
      rows.push(obj);
    }
    return rows;
  };

  const handleCSVFile = async (file) => {
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows.length) { setCsvError('No rows parsed.'); setCsvRows([]); return; }
      const required = ['tracking_id','status','sender','receiver','estimated_delivery','lat','lng','address'];
      const missing = required.filter(r => !(r in rows[0]));
      if (missing.length) { setCsvError(`Missing columns: ${missing.join(', ')}`); setCsvRows([]); return; }
      setCsvError('');
      setCsvRows(rows);
    } catch (e) {
      setCsvError(e.message);
      setCsvRows([]);
    }
  };

  const importCSV = async () => {
    if (!csvRows.length) return;
    try {
      await Promise.all(csvRows.map(async (r) => {
        const payload = {
          tracking_id: r.tracking_id,
          status: r.status,
          sender: r.sender,
          receiver: r.receiver,
          estimated_delivery: new Date(r.estimated_delivery).toISOString(),
          location: { lat: parseFloat(r.lat), lng: parseFloat(r.lng), address: r.address || '' },
          updates: []
        };
        if (r.id) {
          await updateParcelMutation.mutateAsync({ id: r.id, data: payload });
        } else {
          await createParcelMutation.mutateAsync(payload);
        }
      }));
      setCsvOpen(false);
      setCsvRows([]);
      toast({ title: 'CSV import completed' });
    } catch (e) {
      toast({ title: 'CSV import failed', description: e.message });
    }
  };

  useEffect(() => {
    if (confirmDeleteId && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [confirmDeleteId]);

  useEffect(() => {
    if (isPushOpen) {
      setTimeout(() => pushConfirmRef.current?.focus(), 0);
    }
  }, [isPushOpen]);

  useEffect(() => {
    if (isAddOpen) {
      setTimeout(() => addConfirmRef.current?.focus(), 0);
    }
  }, [isAddOpen]);

  useEffect(() => {
    // preload users for Users tab
    (async () => {
      try {
        setLoadingUsers(true);
        const snap = await fGetDocs(fCollection(db, 'users'));
        const list = [];
        snap.forEach((d) => {
          const data = d.data();
          list.push({ id: d.id, email: data.email || '', role: data.role || 'client', tokens: Array.isArray(data.fcm_tokens) ? data.fcm_tokens.length : 0 });
        });
        setUsersList(list);
      } catch {}
      finally { setLoadingUsers(false); }
    })();
  }, []);

  useEffect(() => {
    if (csvOpen) {
      setTimeout(() => csvConfirmRef.current?.focus(), 0);
    }
  }, [csvOpen]);

  if (isLoading) {
    return (
      <div className="pt-20 p-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const onKeyTrap = (e, firstEl, lastEl) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstEl.current) {
          e.preventDefault();
          lastEl.current?.focus();
        }
      } else {
        if (document.activeElement === lastEl.current) {
          e.preventDefault();
          firstEl.current?.focus();
        }
      }
    }
    if (e.key === 'Escape') {
      // handled by specific modal containers
    }
  };

  return (
    <div className="pt-20 p-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage parcels, track deliveries, and monitor performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parcels</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parcels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inTransit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="parcels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parcels">Parcels</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="parcels" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-3 items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search parcels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2 items-center">
                <select className="border rounded-md h-9 px-3" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} aria-label="Filter status">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="in transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
                <Input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} aria-label="From date" />
                <Input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} aria-label="To date" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setCsvOpen(true)} aria-label="Import CSV">
                <Upload className="h-4 w-4 mr-2" /> CSV Import
              </Button>
              <Button variant="outline" onClick={()=>setIsPushOpen(true)} aria-label="Send test push">
                <Bell className="h-4 w-4 mr-2" /> Test Push
              </Button>
              <Button onClick={() => setIsAddOpen(true)} aria-label="Add parcel">
                <Plus className="h-4 w-4 mr-2" /> Add Parcel
              </Button>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Selected: {selected.length}</span>
            <select className="border rounded-md h-9 px-3" value={bulkStatus} onChange={(e)=>setBulkStatus(e.target.value)} aria-label="Bulk status">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="in transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
            <Button size="sm" onClick={applyBulkStatus} aria-label="Apply bulk status"><Check className="h-4 w-4 mr-1" /> Apply</Button>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Parcels</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input type="checkbox" aria-label="Select all"
                        checked={!!selected.length && selected.length === filteredParcels.length}
                        onChange={(e)=>toggleSelectedAll(e.target.checked)} />
                    </TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Receiver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParcels.map((parcel) => (
                    <TableRow key={parcel.id}>
                      <TableCell>
                        <input type="checkbox" aria-label={`Select ${parcel.tracking_id}`} checked={selected.includes(parcel.id)} onChange={()=>toggleSelected(parcel.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{parcel.tracking_id}</TableCell>
                      <TableCell>{parcel.sender}</TableCell>
                      <TableCell>{parcel.receiver}</TableCell>
                      <TableCell>
                        {editingId === parcel.id ? (
                          <select
                            className="border rounded-md h-9 px-2"
                            value={editValues.status}
                            onChange={(e)=>setEditValues({...editValues, status: e.target.value})}
                            aria-label="Edit status"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="in transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        ) : (
                          <Badge className={getStatusColor(parcel.status)}>
                            {parcel.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(parcel.estimated_delivery).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {editingId === parcel.id ? (
                          <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="Lat" value={editValues.location.lat} onChange={(e)=>setEditValues({...editValues, location:{...editValues.location, lat: e.target.value}})} aria-label="Latitude" />
                              <Input placeholder="Lng" value={editValues.location.lng} onChange={(e)=>setEditValues({...editValues, location:{...editValues.location, lng: e.target.value}})} aria-label="Longitude" />
                            </div>
                            <Input placeholder="Address" value={editValues.location.address} onChange={(e)=>setEditValues({...editValues, location:{...editValues.location, address: e.target.value}})} aria-label="Address" />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => {
                                const lat = parseFloat(editValues.location.lat);
                                const lng = parseFloat(editValues.location.lng);
                                if (Number.isNaN(lat) || Number.isNaN(lng)) { toast({ title: 'Validation error', description: 'Latitude/Longitude must be numbers' }); return; }
                                updateParcelMutation.mutate({ id: parcel.id, data: { status: editValues.status, location: { lat, lng, address: editValues.location.address || '' } } });
                                setEditingId(null);
                              }} aria-label="Save changes">Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)} aria-label="Cancel edit">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setEditingId(parcel.id);
                              setEditValues({
                                status: parcel.status,
                                location: { lat: String(parcel.location?.lat ?? ''), lng: String(parcel.location?.lng ?? ''), address: parcel.location?.address ?? '' }
                              });
                            }} aria-label="Edit parcel">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(parcel.id)} aria-label="Delete parcel">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-muted-foreground">Manage user roles and view push tokens</div>
                <Button size="sm" variant="outline" onClick={async ()=>{
                  try {
                    setLoadingUsers(true);
                    const snap = await fGetDocs(fCollection(db, 'users'));
                    const list = [];
                    snap.forEach((d) => {
                      const data = d.data();
                      list.push({ id: d.id, email: data.email || '', role: data.role || 'client', tokens: Array.isArray(data.fcm_tokens) ? data.fcm_tokens.length : 0 });
                    });
                    setUsersList(list);
                  } catch {}
                  finally { setLoadingUsers(false); }
                }}>Refresh</Button>
              </div>
              {loadingUsers ? (
                <div className="text-sm text-muted-foreground">Loading users…</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-3">Email</th>
                        <th className="py-2 pr-3">Role</th>
                        <th className="py-2 pr-3">Tokens</th>
                        <th className="py-2 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id} className="border-b last:border-b-0">
                          <td className="py-2 pr-3">{u.email}</td>
                          <td className="py-2 pr-3">
                            <select className="border rounded-md h-8 px-2" value={u.role} onChange={async (e)=>{
                              try {
                                const role = e.target.value;
                                setUsersList(prev => prev.map(x => x.id === u.id ? { ...x, role } : x));
                                await fUpdateDoc(fDoc(db, 'users', u.id), { role });
                                toast({ title: 'Role updated' });
                              } catch (err) {
                                toast({ title: 'Update failed', description: err?.message || 'Could not update role' });
                              }
                            }}>
                              <option value="client">client</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="py-2 pr-3">{u.tokens}</td>
                          <td className="py-2 pr-3">
                            <div className="text-muted-foreground">—</div>
                          </td>
                        </tr>
                      ))}
                      {usersList.length === 0 && !loadingUsers && (
                        <tr><td colSpan="4" className="py-4 text-center text-muted-foreground">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Analytics features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Parcel Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true"
          onKeyDown={(e)=>{ if (e.key==='Escape') setIsAddOpen(false); onKeyTrap(e, addConfirmRef, addCancelRef); }}>
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Add Parcel</h3>
            <div className="grid grid-cols-1 gap-3">
              <Input placeholder="Tracking ID" value={newParcel.tracking_id} onChange={(e)=>setNewParcel({...newParcel, tracking_id:e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Sender" value={newParcel.sender} onChange={(e)=>setNewParcel({...newParcel, sender:e.target.value})} />
                <Input placeholder="Receiver" value={newParcel.receiver} onChange={(e)=>setNewParcel({...newParcel, receiver:e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select className="border rounded-md h-9 px-3" value={newParcel.status} onChange={(e)=>setNewParcel({...newParcel, status:e.target.value})} aria-label="Status">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="in transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
                <Input type="date" value={newParcel.estimated_delivery} onChange={(e)=>setNewParcel({...newParcel, estimated_delivery:e.target.value})} aria-label="Estimated delivery" />
              </div>
              <Input placeholder="Address" value={newParcel.location.address} onChange={(e)=>setNewParcel({...newParcel, location:{...newParcel.location, address:e.target.value}})} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Latitude" value={newParcel.location.lat} onChange={(e)=>setNewParcel({...newParcel, location:{...newParcel.location, lat:e.target.value}})} />
                <Input placeholder="Longitude" value={newParcel.location.lng} onChange={(e)=>setNewParcel({...newParcel, location:{...newParcel.location, lng:e.target.value}})} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button ref={addCancelRef} variant="outline" onClick={()=>setIsAddOpen(false)} aria-label="Cancel add">Cancel</Button>
              <Button ref={addConfirmRef} onClick={() => {
                const errors = [];
                if (!newParcel.tracking_id.trim()) errors.push('Tracking ID is required');
                if (!newParcel.sender.trim()) errors.push('Sender is required');
                if (!newParcel.receiver.trim()) errors.push('Receiver is required');
                if (!newParcel.estimated_delivery) errors.push('Estimated delivery is required');
                const lat = parseFloat(newParcel.location.lat);
                const lng = parseFloat(newParcel.location.lng);
                if (Number.isNaN(lat) || Number.isNaN(lng)) errors.push('Latitude and Longitude must be numbers');
                if (errors.length) { toast({ title: 'Validation error', description: errors.join(', ') }); return; }
                createParcelMutation.mutate({
                  tracking_id: newParcel.tracking_id.trim(),
                  status: newParcel.status,
                  sender: newParcel.sender.trim(),
                  receiver: newParcel.receiver.trim(),
                  estimated_delivery: new Date(newParcel.estimated_delivery).toISOString(),
                  location: { lat, lng, address: newParcel.location.address || '' },
                  updates: []
                });
              }} aria-label="Create parcel">Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {csvOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true"
          onKeyDown={(e)=>{ if (e.key==='Escape') setCsvOpen(false); onKeyTrap(e, csvConfirmRef, csvCancelRef); }}>
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-3xl p-4">
            <h3 className="text-lg font-semibold mb-2">Import Parcels from CSV</h3>
            <p className="text-sm text-muted-foreground mb-4">Columns: id?, tracking_id, status, sender, receiver, estimated_delivery (YYYY-MM-DD), lat, lng, address</p>
            <input type="file" accept=".csv" onChange={(e)=> e.target.files?.[0] && handleCSVFile(e.target.files[0])} aria-label="Upload CSV" />
            {csvError && <div className="mt-2 text-destructive text-sm">{csvError}</div>}
            {csvRows.length > 0 && (
              <div className="mt-4 max-h-64 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      {Object.keys(csvRows[0]).map((h)=> (<th key={h} className="px-2 py-1 text-left font-medium">{h}</th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((r, i) => (
                      <tr key={i} className="odd:bg-background even:bg-muted/30">
                        {Object.keys(csvRows[0]).map((h)=> (<td key={h} className="px-2 py-1">{r[h]}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button ref={csvCancelRef} variant="outline" onClick={()=>{setCsvOpen(false); setCsvRows([]);}}>Cancel</Button>
              <Button ref={csvConfirmRef} onClick={importCSV} disabled={!csvRows.length}>Import</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-4" onKeyDown={(e)=>{
            if (e.key === 'Escape') setConfirmDeleteId(null);
            if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === confirmRef.current ? (document.getElementById('confirm-cancel')?.focus()) : confirmRef.current?.focus()); }
          }}>
            <h3 className="text-lg font-semibold mb-2">Delete Parcel</h3>
            <p className="text-sm text-muted-foreground mb-4">This action cannot be undone. Are you sure you want to delete this parcel?</p>
            <div className="flex justify-end gap-2">
              <Button id="confirm-cancel" variant="outline" onClick={()=>setConfirmDeleteId(null)}>Cancel</Button>
              <Button ref={confirmRef} variant="destructive" onClick={()=>{ deleteParcelMutation.mutate(confirmDeleteId); setConfirmDeleteId(null); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Test Push Modal */}
      {isPushOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true"
          onKeyDown={(e)=>{ if (e.key==='Escape') setIsPushOpen(false); onKeyTrap(e, pushConfirmRef, pushCancelRef); }}>
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Send Test Push</h3>
            <div className="grid grid-cols-1 gap-3">
              <Input placeholder="Target User UID (optional)" value={pushReq.uid} onChange={(e)=>setPushReq({...pushReq, uid:e.target.value})} />
              <Input placeholder="Title" value={pushReq.title} onChange={(e)=>setPushReq({...pushReq, title:e.target.value})} />
              <Input placeholder="Body" value={pushReq.body} onChange={(e)=>setPushReq({...pushReq, body:e.target.value})} />
              <Input placeholder="Click URL" value={pushReq.url} onChange={(e)=>setPushReq({...pushReq, url:e.target.value})} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button ref={pushCancelRef} variant="outline" onClick={()=>setIsPushOpen(false)}>Cancel</Button>
              <Button ref={pushConfirmRef} onClick={()=>pushTestMutation.mutate(pushReq)}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'bg-green-500';
    case 'in transit': return 'bg-blue-500';
    case 'processing': return 'bg-yellow-500';
    case 'pending': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
}

export default AdminDashboard;
