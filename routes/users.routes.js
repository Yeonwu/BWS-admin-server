import express from "express";
import {
    addUser,
    deleteUser,
    getUser,
    updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();
const isAdmin = (req, res, next) => {
    if (req.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: "Unauthorized request" });
        throw Error({ message: "Unauthorized request" });
    }
};

// API가 복잡하지 않아 REST API를 사용하지 않았음.

router.get("/get", getUser);
router.post("/update", isAdmin, updateUser);
router.post("/add", isAdmin, addUser);
router.post("/delete", isAdmin, deleteUser);

export { router };
