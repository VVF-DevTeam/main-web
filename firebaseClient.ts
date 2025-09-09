// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// const firebaseConfig = {
//   apiKey: "AIzaSyD-4dM4JT-UBhtZVABbScVMLc3CoZzupsk",
//   authDomain: "otp-demo-f84ce.firebaseapp.com",
//   projectId: "otp-demo-f84ce",
//   storageBucket: "otp-demo-f84ce.firebasestorage.app",
//   messagingSenderId: "1013556244616",
//   appId: "1:1013556244616:web:ff803f69f5661980bd6f3d",
//   measurementId: "G-PKV77EE0ZZ"
// };

// console.log("*************** FIREBASE: ",process.env.FIREBASE_PROJECT_ID)

// const analytics = getAnalytics(app);

//Initialize Firebase
const firebaseAppClient =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(firebaseAppClient)
auth.useDeviceLanguage()

export { auth, firebaseAppClient as app }
