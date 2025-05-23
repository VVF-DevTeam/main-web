// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth"
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJiXek4nGovAFA6z5YGMXutlDgdexP7DI",
  authDomain: "test-af7b1.firebaseapp.com",
  projectId: "test-af7b1",
  storageBucket: "test-af7b1.firebasestorage.app",
  messagingSenderId: "562766862337",
  appId: "1:562766862337:web:ddea7dcd18bedcfa6ac800",
  measurementId: "G-WN5WLVZE4W"
};

// const analytics = getAnalytics(app);

//Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();

export { auth }