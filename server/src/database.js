import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../sedona.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let db;

const initDatabase = () => {
    try {
        db = new Database(dbPath);
        console.log('Connected to the SQLite database.');

        const schema = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schema);
        console.log('Database schema initialized successfully.');
    } catch (err) {
        console.error('Error initializing database:', err.message);
        throw err;
    }
};

const getDatabase = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};

const closeDatabase = () => {
    if (db) {
        try {
            db.close();
            console.log('Database connection closed.');
        } catch (err) {
            console.error('Error closing database:', err.message);
        }
    }
};

export {
    initDatabase,
    getDatabase,
    closeDatabase
};
