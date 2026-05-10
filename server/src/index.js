import express from 'express';
import cors from 'cors';
import recordsRouter from './routes/records.js';
import practiceProgressRouter from './routes/practiceProgress.js';
import eventsRouter from './routes/events.js';
import feelingsRouter from './routes/feelings.js';
import { initDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/records', recordsRouter);
app.use('/api/practice-progress', practiceProgressRouter);
app.use('/api/events', eventsRouter);
app.use('/api/feelings', feelingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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