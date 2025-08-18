/* Firebase Messaging Service Worker for Rush Delivery */
/* Uses compat libraries for broad support */

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase inside the Service Worker (must duplicate minimal config)
firebase.initializeApp({
  apiKey: 'AIzaSyBGOURrtKTzHJGb2_gC77TrQefAH09lskE',
  authDomain: 'delivery-website-1c9b3.firebaseapp.com',
  projectId: 'delivery-website-1c9b3',
  storageBucket: 'delivery-website-1c9b3.firebasestorage.app',
  messagingSenderId: '591934926495',
  appId: '1:591934926495:web:1dbd03ea2ca8bee81bfcaa',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  // Customize a notification here
  const notificationTitle = payload.notification?.title || 'Rush Delivery';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/logo.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification?.data?.url || '/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
