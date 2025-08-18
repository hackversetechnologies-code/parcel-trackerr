import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapWithLiveTracking from '@/components/MapWithLiveTracking';
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
import { Package, Clock, CheckCircle, Truck, MapPin, Share2, Bell, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function TrackingEnhanced() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('trackingId') || '');
  const [parcel, setParcel] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [recent, setRecent] = useState([]);
  const [offlineUsed, setOfflineUsed] = useState(false);
  const [showMap, setShowMap] = useState(true);
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
      try { localStorage.setItem(`cached_parcel_${data.tracking_id}`, JSON.stringify(data)); } catch {}
      try {
        const id = data.tracking_id;
        const prev = JSON.parse(localStorage.getItem('tracking_history') || '[]');
        const next = [id, ...prev.filter(x => x !== id)].slice(0, 6);
        localStorage.setItem('tracking_history', JSON.stringify(next));
        setRecent(next);
      } catch {}
      try {
        const token = localStorage.getItem('token');
        const payload = token ? decodeJwt(token) : null;
        if (payload?.uid) {
          await setDoc(doc(db, 'users', payload.uid), { tracking_history: recent }, { merge: true });
        }
      } catch {}
    },
    onError: (error) => {
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
      <AnimatePresence>
        {offlineUsed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-2"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>You are viewing cached tracking data (offline).</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent history */}
      {recent?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-sm text-muted-foreground mb-3">Recent searches</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((id) => (
              <Button
                key={id}
                size="sm"
                variant="outline"
                onClick={() => handleQuickSelect(id)}
                className="hover:bg-primary/10"
              >
                {id}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="max-w-md mx-auto">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter Tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="px-6">
              <Navigation className="w-4 h-4 mr-2" />
              Track
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {parcel ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Parcel Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl">Parcel Details</span>
                    <Badge className={`${getStatusColor(parcel.status)} text-white`}>
                      {parcel.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tracking ID</p>
                      <p className="font-semibold font-mono">{parcel.tracking_id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="font-semibold">{new Date(parcel.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Delivery Progress</p>
                    <Progress value={getProgressValue(parcel.status)} className="h-2" />
                    {etaText && (
                      <div className="text-sm text-muted-foreground mt-2">
                        Estimated arrival: <span className="font-semibold text-foreground">{etaText}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Sender</p>
                      <p className="font-semibold">{parcel.sender}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Receiver</p>
                      <p className="font-semibold">{parcel.receiver}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Delivery Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timeline.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{item.status}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        {index < timeline.length - 1 && (
                          <div className={`w-full h-0.5 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Live Location
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMap(!showMap)}
                    >
                      {showMap ? 'Hide' : 'Show'} Map
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence>
                    {showMap && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <MapWithLiveTracking
                          parcel={parcel}
                          className="h-96"
                          interactive={true}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Notifications</span>
                      <Button
                        variant={notificationsEnabled ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      >
                        {notificationsEnabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SMS Notifications</span>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Push Notifications</span>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Tracking
                  </Button>
                  <Button variant="outline" className="w-full">
                    Report Issue
                  </Button>
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{parcel.receiver}</p>
                    <p className="text-sm text-muted-foreground">
                      123 Main Street, Apt 4B<br />
                      New York, NY 10001
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Parcel Found</h3>
              <p className="text-gray-600 mb-4">
                Enter a tracking ID above to view parcel details
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TrackingEnhanced;
