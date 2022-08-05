import { User } from "../models/user.js";

async function getUser(req, res, next) {
    try {
        let year = req.query.year;

        if (!year) {
            year = new Date().getFullYear();
        }

        const users = await User.getAll(year);
        res.send(users);
    } catch (err) {
        next(err);
    }
}

async function addUser(req, res, next) {
    try {
        const newUsers = req.body;
        const result = await User.add(newUsers);

        res.status(201).send(result);
    } catch (err) {
        next(err);
    }
}

async function updateUser(req, res, next) {
    try {
        const updatedUsers = req.body.updatedUsers;
        const result = await User.update(updatedUsers);

        res.send(result);
    } catch (err) {
        next(err);
    }
}

async function deleteUser(req, res, next) {
    try {
        const uids = req.body.uids;
        const result = await User.remove(uids);

        res.send(result);
    } catch (err) {
        next(err);
    }
}

export { getUser, updateUser, addUser, deleteUser };
