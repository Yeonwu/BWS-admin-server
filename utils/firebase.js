import firebaseConf from "../config/firebaseConf.js";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = firebaseConf.serviceAccountKeyPath;

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

export { db };
