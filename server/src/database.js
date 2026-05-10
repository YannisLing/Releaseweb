import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../sedona.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let db;

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
                return;
            }
            console.log('Connected to the SQLite database.');

            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema, (err) => {
                if (err) {
                    console.error('Error executing schema:', err.message);
                } else {
                    console.log('Database schema initialized successfully.');
                }
                resolve(db);
            });
        });
    });
};

const getDatabase = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};

const closeDatabase = () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
};

export {
    initDatabase,
    getDatabase,
    closeDatabase
};