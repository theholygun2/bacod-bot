import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "netflixdb.sqlite");
export const db = new Database(dbPath);

export function getSchema(): string {
  const rows = db.prepare(
    "SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL AND name NOT LIKE 'BATCH_%' AND name NOT LIKE 'sqlite_%' "
  ).all() as { sql: string }[];

  // Also get row counts for context
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'BATCH_%' AND name NOT LIKE 'sqlite_%' "
  ).all() as { name: string }[];

  let schema = "=== DATABASE SCHEMA ===\n\n";
  
  for (const table of tables) {
    const createStmt = rows.find(r => r.sql.includes(`CREATE TABLE ${table.name}`));
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
    
    schema += `TABLE: ${table.name} (${count.count} rows)\n`;
    schema += createStmt?.sql + "\n\n";
  }

  return schema;
}

// TABLE: movie (11830 rows)
// CREATE TABLE movie (...);

// TABLE: tv_show (450 rows)
// CREATE TABLE tv_show (...);

// console.log("DB opened at:", db.name);

// const schema = getSchema();
// console.log("\n=== SCHEMA ===\n");
// console.log(schema);