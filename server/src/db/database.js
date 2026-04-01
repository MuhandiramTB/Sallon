import Database from 'better-sqlite3';
import { DB_PATH } from '../config.js';

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
