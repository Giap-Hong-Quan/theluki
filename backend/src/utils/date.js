import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

const FORMATS = ["DD/MM/YYYY", "DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY"];

export const parseFilterDate = (date, isEnd = false) => {
    if (!date) return null;
    const d = dayjs(date, FORMATS);
    if (!d.isValid()) return null;
    return isEnd ? d.endOf("day").toDate() : d.startOf("day").toDate();
};

export const buildDateFilter = (fromDate, toDate) => {
    const filter = {};
    const start = parseFilterDate(fromDate, false);
    const end = parseFilterDate(toDate, true);

    if (start) filter.$gte = start;
    if (end) filter.$lte = end;

    return Object.keys(filter).length ? filter : null;
};
