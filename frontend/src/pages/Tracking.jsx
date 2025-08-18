import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { onSnapshot, doc, collection, query, where, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import L from 'leaflet';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';

// Fix Leaflet default marker icons (Vite + Leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function Tracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('trackingId') || '');
  const [parcel, setParcel] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [recent, setRecent] = useState([]);
  const [offlineUsed, setOfflineUsed] = useState(false);
  const { toast } = useToast();

  const fetchParcel = async () => {
    if (!trackingId.trim()) return null;
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: 'Authentication required', description: 'Please log in to track parcels.' });
      return null;
    }
    const res = await axios.get(`http://127.0.0.1:8000/parcels/${trackingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };

  const { refetch, isLoading } = useQuery({
    queryKey: ['parcel', trackingId],
    queryFn: fetchParcel,
    enabled: !!trackingId.trim(),
    onSuccess: async (data) => {
      if (!data) return;
      setParcel(data);
      setOfflineUsed(false);
      // Cache last successful parcel view
      try { localStorage.setItem(`cached_parcel_${data.tracking_id}`, JSON.stringify(data)); } catch {}
      // Update recent history (localStorage)
      try {
        const id = data.tracking_id;
        const prev = JSON.parse(localStorage.getItem('tracking_history') || '[]');
        const next = [id, ...prev.filter(x => x !== id)].slice(0, 6);
        localStorage.setItem('tracking_history', JSON.stringify(next));
        setRecent(next);
      } catch {}
      // Optional Firestore sync
      try {
        const token = localStorage.getItem('token');
        const payload = token ? decodeJwt(token) : null;
        if (payload?.uid) {
          await setDoc(doc(db, 'users', payload.uid), { tracking_history: recent }, { merge: true });
        }
      } catch {}
    },
    onError: (error) => {
      // Attempt offline fallback
      try {
        const cached = JSON.parse(localStorage.getItem(`cached_parcel_${trackingId}`) || 'null');
        if (cached) {
          setParcel(cached);
          setOfflineUsed(true);
          toast({ title: 'Offline data', description: 'Showing last saved tracking data.' });
          return;
        }
      } catch {}
      toast({ title: 'Error', description: error.message });
    }
  });

  // Load recent from localStorage and subscribe to realtime Firestore updates for this trackingId
  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem('tracking_history') || '[]');
      setRecent(prev);
    } catch {}

    if (trackingId.trim()) {
      const q = query(collection(db, 'parcels'), where('tracking_id', '==', trackingId));
      const unsub = onSnapshot(q, (snapshot) => {
        let found = null;
        snapshot.forEach((d) => { found = d.data(); });
        if (found) setParcel(found);
      });
      return () => unsub();
    }
  }, [trackingId]);

  const handleSearch = () => {
    if (trackingId.trim()) {
      setSearchParams({ trackingId: trackingId.trim() });
      refetch();
    }
  };

  const handleQuickSelect = (id) => {
    setTrackingId(id);
    setSearchParams({ trackingId: id });
    refetch();
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/tracking?trackingId=${trackingId || parcel?.tracking_id || ''}`;
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied', description: 'Tracking link copied to clipboard.' });
    } catch (e) {
      toast({ title: 'Copy failed', description: 'Unable to copy the link.' });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-500';
      case 'in transit': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressValue = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 100;
      case 'in transit': return 75;
      case 'processing': return 50;
      case 'pending': return 25;
      default: return 0;
    }
  };

  // Build polyline from origin/location to destination if available, and compute ETA
  const polylinePoints = useMemo(() => {
    if (parcel?.origin?.lat && parcel?.origin?.lng && parcel?.destination?.lat && parcel?.destination?.lng) {
      return [
        [parcel.origin.lat, parcel.origin.lng],
        [parcel.destination.lat, parcel.destination.lng]
      ];
    }
    if (parcel?.location?.lat && parcel?.location?.lng && parcel?.destination?.lat && parcel?.destination?.lng) {
      return [
        [parcel.location.lat, parcel.location.lng],
        [parcel.destination.lat, parcel.destination.lng]
      ];
    }
    return null;
  }, [parcel]);

  function haversine(a, b) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(lat1) * Math.cos(lat2);
    const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * d;
  }

  const etaText = useMemo(() => {
    try {
      const start = parcel?.location || parcel?.origin;
      const end = parcel?.destination;
      if (start?.lat && start?.lng && end?.lat && end?.lng) {
        const dist = haversine({ lat: start.lat, lng: start.lng }, { lat: end.lat, lng: end.lng });
        const speed = 50; // km/h assumed
        const hours = dist / speed;
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `~${h}h ${m}m`;
      }
      return null;
    } catch { return null; }
  }, [parcel]);

  const timeline = parcel?.updates?.length
    ? parcel.updates.map((u, idx) => ({
        status: (u.status || u.message || 'Update'),
        date: u.timestamp ? new Date(u.timestamp).toLocaleDateString() : '',
        icon: ((u.status || '')).toLowerCase() === 'delivered' ? CheckCircle
          : ((u.status || '')).toLowerCase() === 'in transit' ? Truck
          : ((u.status || '')).toLowerCase() === 'processing' ? Clock
          : Package,
        completed: ((u.status || '')).toLowerCase() === 'delivered' || idx < (parcel.updates.length - 1)
      }))
    : [
      { status: 'Order Placed', date: '2024-01-15', icon: CheckCircle, completed: true },
      { status: 'Processing', date: '2024-01-16', icon: Clock, completed: true },
      { status: 'In Transit', date: '2024-01-17', icon: Truck, completed: true },
      { status: 'Out for Delivery', date: '2024-01-18', icon: Package, completed: false },
      { status: 'Delivered', date: '2024-01-18', icon: CheckCircle, completed: false }
    ];

  if (isLoading) {
    return (
      <div className="pt-20 p-4 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 p-4 max-w-7xl mx-auto">
      {offlineUsed && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-2">
          You are viewing cached tracking data (offline).
        </div>
      )}

      {/* Recent history */}
      {recent?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((id) => (
              <Button key={id} size="sm" variant="outline" onClick={() => handleQuickSelect(id)} aria-label={`Use tracking ${id}`}>
                {id}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="mb-8">
        <div className="max-w-md mx-auto">
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter Tracking ID" 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Track</Button>
          </div>
        </div>
      </div>

      {parcel ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Parcel Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Parcel Details</span>
                  <Badge className={getStatusColor(parcel.status)}>
                    {parcel.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tracking ID</p>
                    <p className="font-semibold">{parcel.tracking_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold">{new Date(parcel.estimated_delivery).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Delivery Progress</p>
                  <Progress value={getProgressValue(parcel.status)} className="h-2" />
                  {etaText && (
                    <div className="text-sm text-muted-foreground mt-2">Estimated arrival: <span className="font-semibold text-foreground">{etaText}</span></div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sender</p>
                    <p className="font-semibold">{parcel.sender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Receiver</p>
                    <p className="font-semibold">{parcel.receiver}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.status}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`w-full h-0.5 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Live Location</CardTitle>
              </CardHeader>
              <CardContent>
                {parcel?.location?.lat && parcel?.location?.lng ? (
                  <MapContainer 
                    center={[parcel.location.lat, parcel.location.lng]} 
                    zoom={13} 
                    style={{ height: '400px', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {polylinePoints && (
                      <Polyline positions={polylinePoints} pathOptions={{ color: '#1E3A8A', weight: 4, opacity: 0.7 }} />
                    )}
                    <Marker position={[parcel.location.lat, parcel.location.lng]}>
                      <Popup>
                        <div>
                          <p className="font-semibold">{parcel.status}</p>
                          <p className="text-sm">{parcel.location.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                    {parcel?.destination?.lat && parcel?.destination?.lng && (
                      <Marker position={[parcel.destination.lat, parcel.destination.lng]}>
                        <Popup>
                          <div>
                            <p className="font-semibold">Destination</p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                ) : (
                  <div className="h-40 flex items-center justify-center text-muted-foreground">
                    Location unavailable
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <Button 
                      variant={notificationsEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    >
                      {notificationsEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS Notifications</span>
                    <Button variant="outline" size="sm">Disabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push Notifications</span>
                    <Button variant="outline" size="sm">Disabled</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleShare} aria-label="Share tracking link">Share Tracking</Button>
                <Button variant="outline" className="w-full">Report Issue</Button>
                <Button variant="outline" className="w-full">Contact Support</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{parcel.receiver}</p>
                  <p className="text-sm text-gray-600">
                    123 Main Street, Apt 4B<br />
                    New York, NY 10001
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Parcel Found</h3>
            <p className="text-gray-600 mb-4">
              Enter a tracking ID above to view parcel details
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tracking;
