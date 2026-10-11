// Firebase configuration (v9.22.0)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Initialize Firebase with your configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzj5Yl-o7KKnD8D0LVrLBfcpfZhOoW7ns",
  authDomain: "ledelinvoice.firebaseapp.com",
  projectId: "ledelinvoice",
  storageBucket: "ledelinvoice.firebasestorage.app",
  messagingSenderId: "704397199001",
  appId: "1:704397199001:web:420812803e13ffd1fc9a08",
  measurementId: "G-8BB7HD80QP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// Log initialization
console.log('Firebase initialized successfully');

// Export the services
export { db, auth };
export default app;
