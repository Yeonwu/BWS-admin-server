import { getAuth } from "firebase-admin/auth";
import firebaseConfig from "../config/firebaseConf.js";

const adminUid = firebaseConfig.adminUid;

async function verifyAdmin(req, res, next) {
    try {
        const auth = getAuth();
        const token = req.header("Authorization").split(" ")[1];

        const decoded = await auth.verifyIdToken(token);
        if (decoded.uid !== adminUid) {
            req.isAdmin = false;
        }

        req.isAdmin = true;
        next();
    } catch (error) {
        req.isAdmin = false;
        next();
    }
}

export { verifyAdmin };
