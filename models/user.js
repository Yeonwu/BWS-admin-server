import { db } from "../utils/firebase.js";
import { querySnapshotToArr } from "../utils/utils.js";
import { getAuth } from "firebase-admin/auth";
import { typeCheck } from "type-check";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

const User = { getAll, update, add, remove };
const userCol = db.collection("users");
const auth = getAuth();

async function getAll(year) {
    const snapshot = await userCol.get();

    const users = (await auth.listUsers(1000)).users;

    const newOneFirst = (a, b) => b.createdAt.seconds - a.createdAt.seconds;
    const userAdditionalInfo = querySnapshotToArr(snapshot, (user) => {
        // Get uid from document path
        let ref = user.ref._path.segments[1];
        user = user.data();
        user.uid = ref;

        // Create user.adviser and user.grade if exists
        if (user.history) {
            user.history.sort(newOneFirst);

            const currentHistory = user.history.find(
                (history) => history.year == year
            );
            if (currentHistory) {
                user.adviser = currentHistory.adviser;
                user.grade = currentHistory.grade;
            }
        }

        delete user.history;

        return user;
    });

    // Join Firebase user & Firestore user.
    return users.map((user) => {
        let newUser = {};

        // Pick required info.
        newUser.uid = user.uid;
        newUser.displayName = user.displayName;
        newUser.email = user.email;

        // Join
        const info = userAdditionalInfo.find((info) => {
            return info.uid == user.uid;
        });

        newUser.auth = info?.auth;
        newUser.adviser = info?.adviser;
        newUser.grade = info?.grade;

        return newUser;
    });
}

async function update(users) {
    const batch = db.batch();
    const snapshot = await userCol.get();
    const firebaseUsers = querySnapshotToArr(snapshot, (user) => {
        user.uid = user.ref._path.segments[1];
        return user;
    });

    let errors = [];

    users.forEach((user) => {
        try {
            let ref = userCol.doc(user.uid);
            let updateInfo = {};
            let isTypeOk = typeCheck(
                `{
                uid: String,
                email: Maybe String,
                name: Maybe String,
                type: Maybe String,
                history: Maybe Array[{
                    adviser: Maybe Object{uid: String, name: String},
                    grade: Maybe String,
                    year: String
                }],
            }`,
                user
            );

            if (isTypeOk) {
                if (user.email) {
                    updateInfo.email = user.email;
                }
                if (user.name) {
                    updateInfo.displayName = user.name;
                }
                auth.updateUser(user.uid, updateInfo);

                if (user.type) {
                    updateInfo.auth = user.type;
                }
                if (user.history) {
                    let timestamp = Timestamp.fromDate(new Date());
                    user.history.forEach((val) => {
                        val.adviser.ref = userCol.doc(val.adviser.uid);
                        val.createdAt = timestamp;

                        delete val.adviser.uid;
                    });
                    updateInfo.history = FieldValue.arrayUnion(...user.history);
                }

                let userHasHistory = firebaseUsers.find(
                    (firebaseUser) => firebaseUser.uid == user.uid
                )?.history;

                if (userHasHistory) {
                    batch.update(ref, updateInfo);
                } else {
                    batch.set(ref, updateInfo);
                }
            } else {
                throw {
                    uid: user.uid,
                    message: "Incorrect user info type.",
                };
            }
        } catch (error) {
            errors.push(error);
        }
    });

    await batch.commit();

    if (errors.length) {
        throw errors;
    }

    return {
        message: "success",
    };
}

/**
 *
 * @param {Array} user
 */
async function add(users) {
    var failedUsers = [];
    const batch = db.batch();
    const adviserUids = [];
    (await userCol.get()).forEach((user) => {
        if (user.data().auth == "교사") {
            adviserUids.push({ uid: user.ref.id });
        }
    });

    const advisers = (await auth.getUsers(adviserUids)).users;

    for (let i = 0; i < users.length; i++) {
        try {
            let user = users[i];

            // Create User in firebase
            let userRecord = await auth.createUser({
                email: user.email,
                displayName: user.name,
            });

            // set user info in firestore
            if (user.history) {
                user.history.forEach((val) => {
                    let adviser = advisers.filter(
                        (adviser) => adviser.email == val.adviserEmail
                    );
                    if (adviser.length) {
                        val.adviser = {};
                        val.adviser.ref = userCol.doc(adviser[0].uid);
                        val.adviser.name = adviser[0].displayName;
                        val.createdAt = Timestamp.now();
                        val.year = new Date().getFullYear();
                        delete val.adviserEmail;
                    }
                });
            }

            let formattedUserInfo = {
                auth: user.type ? user.type : "other",
            };

            if (user.history) {
                formattedUserInfo.history = user.history;
            }

            console.log(formattedUserInfo);
            batch.set(userCol.doc(userRecord.uid), formattedUserInfo);
        } catch (error) {
            failedUsers.push({
                user: users[i],
                error,
            });
        }
    }

    await batch.commit();

    if (failedUsers.length) {
        throw failedUsers;
    }

    return {
        message: "success",
    };
}

async function remove(uids) {
    let deleteUsersResult = await auth.deleteUsers(uids);
    let returnVal = {
        success: deleteUsersResult.successCount,
        failed: deleteUsersResult.failureCount,
    };

    if (deleteUsersResult.failureCount > 0) {
        returnVal.failedUsers = [];
        deleteUsersResult.errors.forEach((error) => {
            returnVal.failedUsers.push(error.error.toJSON());
            console.log(error.index);
        });
    }

    const batch = db.batch();
    uids.forEach((uid) => {
        let ref = userCol.doc(uid);
        batch.delete(ref);
    });
    await batch.commit();

    return returnVal;
}

export { User };
