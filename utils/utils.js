export const SECOND_PER_DAY = 86400;

export function isString(val) {
    return typeof val === "string" || val instanceof String;
}

export function isDate(val) {
    return val instanceof Date;
}

/**
 *
 * @param {*} querySnapshot
 * @param {function=} formatter
 * @returns
 */
export function querySnapshotToArr(querySnapshot, formatter) {
    let arr = [];
    if (formatter) {
        querySnapshot.forEach((docSnapshot) => {
            arr.push(formatter(docSnapshot));
        });
    } else {
        querySnapshot.forEach((docSnapshot) => {
            arr.push(docSnapshot.data());
        });
    }

    return arr;
}
