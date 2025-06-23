
// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmvGglRv-hnPnUuSEB4lWJjO4bUUa7D7s",
  authDomain: "namaya-8665f.firebaseapp.com",
  projectId: "namaya-8665f",
  storageBucket: "namaya-8665f.appspot.com",
  messagingSenderId: "835556477491",
  appId: "1:835556477491:web:cfeb5bfddb125bb4e3b146"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
