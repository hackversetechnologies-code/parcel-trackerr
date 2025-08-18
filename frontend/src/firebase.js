import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBGOURrtKTzHJGb2_gC77TrQefAH09lskE",
    authDomain: "delivery-website-1c9b3.firebaseapp.com",
    projectId: "delivery-website-1c9b3",
    storageBucket: "delivery-website-1c9b3.firebasestorage.app",
    messagingSenderId: "591934926495",
    appId: "1:591934926495:web:1dbd03ea2ca8bee81bfcaa",
    measurementId: "G-Z3KSJ75WEC"
};

const app = initializeApp(firebaseConfig);
(async () => {
  try {
    if (typeof window !== 'undefined' && await analyticsIsSupported()) {
      getAnalytics(app);
    }
  } catch (e) {
    // ignore analytics init errors
  }
})();
export const auth = getAuth(app);
export const db = getFirestore(app);