import { isDate, querySnapshotToArr, SECOND_PER_DAY } from "../utils/utils.js";
import { db } from "../utils/firebase.js";

const Seasons = { getQuaterOfDate };
const col = db.collection("seasons");

async function getQuaterOfDate(date) {
    if (!isDate(date)) {
        throw TypeError("date must be Date object");
    }
    const snapshot = await col.get();
    const seasons = querySnapshotToArr(snapshot, (season) => {
        season = season.data();

        season.from = season.from.toDate();
        season.to = season.to.toDate();
        return season;
    });

    return seasons.filter(
        (season) =>
            // 밀리세컨드 단위에서 오차가 발생함. 하루 기준으로 판단하기 위해 다음과 같이 비교.
            (season.from.getTime() - date.getTime()) / SECOND_PER_DAY <= 1 &&
            (season.to.getTime() - date.getTime()) / SECOND_PER_DAY >= 1
    )[0];
}

export { Seasons };
