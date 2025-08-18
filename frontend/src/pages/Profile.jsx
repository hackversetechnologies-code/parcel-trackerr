import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { auth, db } from '@/firebase';
import { updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function getUid() {
  const u = auth.currentUser?.uid;
  if (u) return u;
  const t = localStorage.getItem('token');
  const payload = t ? decodeJwt(t) : null;
  return payload?.uid || null;
}

export default function Profile() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [addresses, setAddresses] = useState([{ label: 'Home', address: '' }]);
  const [defaultIdx, setDefaultIdx] = useState(0);
  const [prefs, setPrefs] = useState({ email: true, push: false, sms: false });
  const [history, setHistory] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [pushStatus, setPushStatus] = useState({ permission: 'default', tokens: 0 });
  const { toast } = useToast();

  useEffect(() => {
    try {
      const prev = JSON.parse(localStorage.getItem('tracking_history') || '[]');
      setHistory(prev);
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const uid = getUid();
        if (!uid) { setLoadingProfile(false); return; }
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.name) setName(d.name);
          if (Array.isArray(d.addresses) && d.addresses.length) setAddresses(d.addresses);
          if (typeof d.default_address_index === 'number') setDefaultIdx(d.default_address_index);
          if (d.prefs) setPrefs({ email: true, push: false, sms: false, ...d.prefs });
          setPushStatus({ permission: (typeof Notification !== 'undefined' ? Notification.permission : 'default'), tokens: Array.isArray(d.fcm_tokens) ? d.fcm_tokens.length : 0 });
        } else {
          setPushStatus({ permission: (typeof Notification !== 'undefined' ? Notification.permission : 'default'), tokens: 0 });
        }
      } catch (e) {
        setPushStatus({ permission: (typeof Notification !== 'undefined' ? Notification.permission : 'default'), tokens: 0 });
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  const handleUpdatePassword = async () => {
    try {
      if (!password) { toast({ title: 'Error', description: 'Enter a new password' }); return; }
      await updatePassword(auth.currentUser, password);
      setPassword('');
      toast({ title: 'Success', description: 'Password updated' });
    } catch (e) {
      toast({ title: 'Error', description: e.message });
    }
  };

  const savePersonal = async () => {
    try {
      const uid = getUid();
      if (!uid) { toast({ title: 'Not logged in', description: 'Please log in to save your profile.' }); return; }
      const cleaned = addresses.filter(a => (a.label?.trim() || a.address?.trim()));
      await setDoc(doc(db, 'users', uid), { name, addresses: cleaned, default_address_index: defaultIdx }, { merge: true });
      toast({ title: 'Profile saved', description: 'Personal info updated.' });
    } catch (e) {
      toast({ title: 'Save failed', description: e.message });
    }
  };

  const savePrefsImmediate = async (nextPrefs) => {
    try {
      const uid = getUid();
      if (!uid) { toast({ title: 'Not logged in', description: 'Log in to save preferences.' }); return; }
      await setDoc(doc(db, 'users', uid), { prefs: nextPrefs }, { merge: true });
      toast({ title: 'Preferences updated' });
    } catch (e) {
      toast({ title: 'Save failed', description: e.message });
    }
  };

  const togglePref = async (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await savePrefsImmediate(next);
  };

  const addAddress = () => {
    setAddresses(prev => [...prev, { label: '', address: '' }]);
  };

  const updateAddress = (index, field, value) => {
    setAddresses(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  const removeAddress = (index) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
    if (defaultIdx >= addresses.length - 1 && defaultIdx === index) setDefaultIdx(0);
  };

  const pushReady = pushStatus.permission === 'granted' && pushStatus.tokens > 0;

  return (
    <div className="pt-20 p-4 max-w-7xl mx-auto">
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Personal Info</TabsTrigger>
          <TabsTrigger value="history">Tracking History</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProfile ? (
                <div className="text-sm text-muted-foreground">Loading profile…</div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Saved Addresses</Label>
                      <Button size="sm" variant="outline" onClick={addAddress}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                    </div>
                    <div className="space-y-3">
                      {addresses.map((addr, idx) => (
                        <div key={idx} className="border rounded-md p-3 grid md:grid-cols-7 gap-2 items-end">
                          <div className="md:col-span-1 flex items-center gap-2">
                            <input type="radio" name="defaultAddress" checked={defaultIdx === idx} onChange={()=>setDefaultIdx(idx)} aria-label={`Default address ${idx+1}`} />
                            <span className="text-xs text-muted-foreground">Default</span>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm">Label</Label>
                            <Input value={addr.label} onChange={(e)=>updateAddress(idx, 'label', e.target.value)} placeholder="Home / Office" />
                          </div>
                          <div className="md:col-span-3">
                            <Label className="text-sm">Address</Label>
                            <Input value={addr.address} onChange={(e)=>updateAddress(idx, 'address', e.target.value)} placeholder="123 Main St, City" />
                          </div>
                          <div className="md:col-span-1 flex justify-end">
                            <Button variant="ghost" size="icon" aria-label="Remove address" onClick={()=>removeAddress(idx)}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={savePersonal}>Save</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Tracking History</CardTitle>
            </CardHeader>
            <CardContent>
              {history?.length ? (
                <div className="flex flex-wrap gap-2">
                  {history.map((id) => (
                    <Badge key={id} className="cursor-pointer" onClick={()=> window.location.href = `/tracking?trackingId=${id}`}>{id}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No history yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleUpdatePassword}>Update Password</Button>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-2"><Bell className="h-4 w-4" /><span>Email</span></div>
                  <Input type="checkbox" checked={prefs.email} onChange={()=>togglePref('email')} aria-label="Email alerts" />
                </div>
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-2"><Bell className="h-4 w-4" /><span>Push</span></div>
                  <Input type="checkbox" checked={prefs.push} onChange={()=>togglePref('push')} aria-label="Push alerts" />
                </div>
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center gap-2"><Bell className="h-4 w-4" /><span>SMS</span></div>
                  <Input type="checkbox" checked={prefs.sms} onChange={()=>togglePref('sms')} aria-label="SMS alerts" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Preferences are saved automatically when toggled.</p>

              <div className="border rounded-md p-3 grid md:grid-cols-3 gap-3 items-center">
                <div className="md:col-span-2">
                  <div className="text-sm">Push Readiness</div>
                  <div className="text-xs text-muted-foreground">Permission: <strong>{pushStatus.permission}</strong> • Tokens: <strong>{pushStatus.tokens}</strong></div>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <Button asChild variant={pushReady ? 'outline' : 'default'}>
                    <a href="/notifications">{pushReady ? 'Manage Notifications' : 'Enable Push'}</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
