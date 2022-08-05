import firebaseConf from "../config/firebaseConf.js";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";

const serviceAccount = firebaseConf.serviceAccountKeyFileName;
const accountPath = path.resolve(`./config/${serviceAccount}`);

const app = admin.initializeApp({
    credential: admin.credential.cert(accountPath),
});

const db = getFirestore();

export { db };
