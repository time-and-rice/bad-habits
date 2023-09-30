import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const app = initializeApp({
  apiKey: "AIzaSyB1Oq1k4nDGG9GjSZ-iAf4X73Hd-jR2Y4Y",
  authDomain: "bad-habits-51477.firebaseapp.com",
  projectId: "bad-habits-51477",
  storageBucket: "bad-habits-51477.appspot.com",
  messagingSenderId: "873871829029",
  appId: "1:873871829029:web:885de5c855fedfa902f7cc",
  measurementId: "G-775HE9138L",
});

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "asia-northeast1");

if (process.env.NODE_ENV != "production") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export { auth, db, functions };
