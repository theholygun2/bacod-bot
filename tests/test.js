import { db } from "../database/connection.ts";

const rows = db.prepare("SELECT * FROM episode LIMIT 2;").all();
console.log(rows);
