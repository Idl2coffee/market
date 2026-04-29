import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
import { getFirestore }  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUwSJ2Gmwo8QaNLRqxvJ75XCzjE4ihNtc",
  authDomain: "marketshare-62147.firebaseapp.com",
  projectId: "marketshare-62147",
  storageBucket: "marketshare-62147.firebasestorage.app",
  messagingSenderId: "999928839748",
  appId: "1:999928839748:web:0a34e8215ad07a48954611",
  measurementId: "G-LJTKC07ZB1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);
