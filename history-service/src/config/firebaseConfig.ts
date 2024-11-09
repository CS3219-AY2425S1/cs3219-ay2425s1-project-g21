import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import dotenv from "dotenv";

dotenv.config();

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.API_KEY || "",
  authDomain: process.env.AUTH_DOMAIN || "",
  databaseURL: process.env.DATABASE_URL || "",
  projectId: process.env.PROJECT_ID || "",
  storageBucket: process.env.STORAGE_BUCKET || "",
  messagingSenderId: process.env.MESSAGING_SENDER_ID || "",
  appId: process.env.APP_ID || "",
  measurementId: process.env.MEASUREMENT_ID || "",
};

for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value) {
    console.warn("Warning: Firebase config for '${key}' not found.");
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize the Realtime Database object
const database = getDatabase(app);

export default database;
