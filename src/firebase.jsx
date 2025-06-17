// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBMuvjFbxLvkOi1ytIB2Dv00NmB7-HGZO0",
    authDomain: "vashudharabrand.firebaseapp.com",
    databaseURL: "https://vashudharabrand-default-rtdb.firebaseio.com",
    projectId: "vashudharabrand",
    storageBucket: "vashudharabrand.appspot.com",
    messagingSenderId: "649638470801",
    appId: "1:649638470801:web:8487068d41560a0d0c8b30",
    measurementId: "G-M11WY452RS"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app); // Export auth

export { app, database, storage, auth };