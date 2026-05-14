import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../');
const dbPath = path.join(dbDir, 'sedona.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let db;

const initDatabase = async () => {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
                console.log(`Created database directory: ${dbDir}`);
            }

            db = new Database(dbPath, {
                verbose: process.env.NODE_ENV === 'development' ? console.log : null,
            });
            
            db.pragma('journal_mode = WAL');
            db.pragma('cache_size = -64000');
            db.pragma('synchronous = NORMAL');
            db.pragma('foreign_keys = ON');
            
            console.log(`Connected to SQLite database at: ${dbPath}`);

            const schema = fs.readFileSync(schemaPath, 'utf8');
            db.exec(schema);
            console.log('Database schema initialized successfully.');
            
            resolve(db);
        } catch (err) {
            console.error('Error opening database:', err.message);
            console.error('Error stack:', err.stack);
            reject(err);
        }
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
