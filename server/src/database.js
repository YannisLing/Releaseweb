import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../sedona.db');
const schemaPath = path.join(__dirname, 'schema.sql');

let sqlJsDb = null;

// Persist the in-memory sql.js database to disk
const persistDb = () => {
    if (sqlJsDb) {
        const data = sqlJsDb.export();
        fs.writeFileSync(dbPath, Buffer.from(data));
    }
};

// Wrap the synchronous sql.js API in a compatibility shim that matches
// the sqlite3 callback-based API used throughout the route files.
const createDbShim = (sqlJsInstance) => {
    return {
        run(sql, params, callback) {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            try {
                sqlJsInstance.run(sql, params || []);
                // Retrieve last inserted row id
                const lastIdResult = sqlJsInstance.exec('SELECT last_insert_rowid()');
                const lastID = lastIdResult.length > 0 ? lastIdResult[0].values[0][0] : 0;
                persistDb();
                if (callback) callback.call({ lastID, changes: 1 }, null);
            } catch (err) {
                if (callback) callback.call({ lastID: 0, changes: 0 }, err);
            }
        },

        get(sql, params, callback) {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            try {
                const results = sqlJsInstance.exec(sql, params || []);
                if (results.length === 0 || results[0].values.length === 0) {
                    if (callback) callback(null, undefined);
                    return;
                }
                const { columns, values } = results[0];
                const row = {};
                columns.forEach((col, i) => { row[col] = values[0][i]; });
                if (callback) callback(null, row);
            } catch (err) {
                if (callback) callback(err, undefined);
            }
        },

        all(sql, params, callback) {
            if (typeof params === 'function') {
                callback = params;
                params = [];
            }
            try {
                const results = sqlJsInstance.exec(sql, params || []);
                if (results.length === 0) {
                    if (callback) callback(null, []);
                    return;
                }
                const { columns, values } = results[0];
                const rows = values.map(row => {
                    const obj = {};
                    columns.forEach((col, i) => { obj[col] = row[i]; });
                    return obj;
                });
                if (callback) callback(null, rows);
            } catch (err) {
                if (callback) callback(err, []);
            }
        },

        exec(sql, callback) {
            try {
                sqlJsInstance.run(sql);
                persistDb();
                if (callback) callback(null);
            } catch (err) {
                if (callback) callback(err);
            }
        },

        close(callback) {
            try {
                persistDb();
                sqlJsInstance.close();
                sqlJsDb = null;
                if (callback) callback(null);
            } catch (err) {
                if (callback) callback(err);
            }
        }
    };
};

let db;

const initDatabase = async () => {
    const SQL = await initSqlJs();

    // Load existing database from disk if it exists, otherwise create new
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        sqlJsDb = new SQL.Database(fileBuffer);
    } else {
        sqlJsDb = new SQL.Database();
    }

    console.log('Connected to the SQLite database.');

    const schema = fs.readFileSync(schemaPath, 'utf8');
    sqlJsDb.run(schema);
    persistDb();
    console.log('Database schema initialized successfully.');

    db = createDbShim(sqlJsDb);
    return db;
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
