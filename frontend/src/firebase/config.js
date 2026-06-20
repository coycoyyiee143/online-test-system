import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGBrNKo2GEQFfKLrKihoc27uUsyjqBYwU",
  authDomain: "online-test-system-5632d.firebaseapp.com",
  projectId: "online-test-system-5632d",
  storageBucket: "online-test-system-5632d.firebasestorage.app",
  messagingSenderId: "832019958456",
  appId: "1:832019958456:web:7e5304d9cba5a1319d824d",
  measurementId: "G-73S6NJQHR1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;