// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore


// Your Firebase configuration (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyAIrfdocyRdYB0z-orHYRUHLYoFeK7L3Ao",
  authDomain: "test-react-1cb50.firebaseapp.com",
  projectId: "test-react-1cb50",
  storageBucket: "test-react-1cb50.appspot.com",
  messagingSenderId: "421674848773",
  appId: "1:421674848773:web:a42c987729f8d0163d026c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db };
