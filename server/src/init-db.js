import initSqlJs from 'sql.js';
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

// 创建数据库连接
const SQL = await initSqlJs();

let sqlJsDb;
if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlJsDb = new SQL.Database(fileBuffer);
} else {
    sqlJsDb = new SQL.Database();
}

console.log('Connected to the SQLite database.');

// 执行schema
try {
    sqlJsDb.run(schema);
    const data = sqlJsDb.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log('Database schema initialized successfully.');
} catch (err) {
    console.error('Error executing schema:', err.message);
    process.exit(1);
}

sqlJsDb.close();
