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
import { ErrorBoundary } from 'react-error-boundary';

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

function MapErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg border">
      <div className="text-center p-6">
        <div className="text-gray-400 mb-3">
          <MapPin className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-500 font-medium">Map unavailable</p>
        <p className="text-gray-400 text-sm mt-1">Tracking information will display without map visualization</p>
      </div>
    </div>
  );
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
            className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-4 py-3"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
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
          <p className="text-sm text-muted-foreground mb-3">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((id) => (
              <Button 
                key={id} 
                size="sm" 
                variant="outline" 
                onClick={() => handleQuickSelect(id)}
                className="rounded-full btn-hover"
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
              className="h-12 rounded-full border px-4"
            />
            <Button 
              onClick={handleSearch}
              className="h-12 px-6 rounded-full btn-hover"
            >
              Track
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {parcel ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Parcel Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="card-hover shadow-lg rounded-xl border">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span>Parcel Details</span>
                    <Badge className={`${getStatusColor(parcel.status)} text-white rounded-full px-3 py-1`}>
                      {parcel.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 py-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tracking ID</p>
                      <p className="font-semibold">{parcel.tracking_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                      <p className="font-semibold">{new Date(parcel.estimated_delivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Delivery Progress</p>
                    <div className="space-y-2">
                      <Progress value={getProgressValue(parcel.status)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Order Placed</span>
                        <span>In Transit</span>
                        <span>Out for Delivery</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sender</p>
                      <p className="font-semibold">{parcel.sender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Receiver</p>
                      <p className="font-semibold">{parcel.receiver}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="card-hover shadow-lg rounded-xl border">
                <CardHeader className="border-b pb-4">
                  <CardTitle>Delivery Timeline</CardTitle>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="space-y-4">
                    {timeline.map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                          item.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 pb-4 border-l-2 border-gray-200 pl-4 -ml-5">
                          <div className={`font-semibold ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {item.status}
                          </div>
                          <div className="text-sm text-muted-foreground">{item.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="card-hover shadow-lg rounded-xl border">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span>Live Location</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowMap(!showMap)}
                      className="rounded-full"
                    >
                      {showMap ? 'Hide Map' : 'Show Map'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-6">
                  {showMap ? (
                    <ErrorBoundary
                      FallbackComponent={MapErrorFallback}
                      onReset={() => {
                        // Reset the map component if needed
                      }}
                    >
                      <div className="h-96 rounded-lg overflow-hidden">
                        {parcel?.location?.lat && parcel?.location?.lng ? (
                          <MapWithLiveTracking parcel={parcel} />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                            <div className="text-center p-6">
                              <div className="text-gray-400 mb-3">
                                <MapPin className="w-16 h-16 mx-auto" />
                              </div>
                              <p className="text-gray-500 font-medium">Location data unavailable</p>
                              <p className="text-gray-400 text-sm mt-1">Tracking information will update when location is available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ErrorBoundary>
                  ) : (
                    <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-muted-foreground">Map hidden. Click "Show Map" to view.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="card-hover shadow-lg rounded-xl border">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 py-6">
                  <div className="flex items-center justify-between">
                    <span>Email Notifications</span>
                    <Button 
                      variant={notificationsEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className="rounded-full"
                    >
                      {notificationsEnabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS Notifications</span>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Disabled
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push Notifications</span>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Disabled
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-hover shadow-lg rounded-xl border">
                <CardHeader className="border-b pb-4">
                  <CardTitle className="flex items-center">
                    <Share2 className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 py-6">
                  <Button
                    variant="outline"
                    className="w-full btn-hover rounded-full"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Tracking
                  </Button>
                  <Button variant="outline" className="w-full btn-hover rounded-full">
                    Report Issue
                  </Button>
                  <Button variant="outline" className="w-full btn-hover rounded-full">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover shadow-lg rounded-xl border">
                <CardHeader className="border-b pb-4">
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="space-y-2">
                    <p className="font-semibold">{parcel.receiver}</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
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