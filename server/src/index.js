import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recordsRouter from './routes/records.js';
import practiceProgressRouter from './routes/practiceProgress.js';
import eventsRouter from './routes/events.js';
import feelingsRouter from './routes/feelings.js';
import authRouter from './routes/auth.js';
import { initDatabase } from './database.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

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

function startServer() {
  try {
    initDatabase();
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
