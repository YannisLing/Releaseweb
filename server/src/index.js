import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import recordsRouter from './routes/records.js';
import practiceProgressRouter from './routes/practiceProgress.js';
import eventsRouter from './routes/events.js';
import feelingsRouter from './routes/feelings.js';
import authRouter from './routes/auth.js';
import { initDatabase } from './database.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/records', authMiddleware, recordsRouter);
app.use('/api/practice-progress', authMiddleware, practiceProgressRouter);
app.use('/api/events', authMiddleware, eventsRouter);
app.use('/api/feelings', authMiddleware, feelingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

async function startServer() {
  try {
    await initDatabase();
    console.log('Database initialized');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
