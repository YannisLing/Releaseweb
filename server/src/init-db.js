import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库文件路径
const dbPath = path.join(__dirname, '../../sedona.db');

// 读取SQL schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// 创建数据库连接并执行schema
try {
    const db = new Database(dbPath);
    console.log('Connected to the SQLite database.');

    db.exec(schema);
    console.log('Database schema initialized successfully.');

    db.close();
} catch (err) {
    console.error('Error initializing database:', err.message);
    process.exit(1);
}
