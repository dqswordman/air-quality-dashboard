import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import router from './routes/aqi';

dotenv.config();
const TOKEN = process.env.WAQI_TOKEN?.trim();
if (!TOKEN) {
  // eslint-disable-next-line no-console
  console.error('WAQI_TOKEN missing');
  process.exit(1);
}
process.env.WAQI_TOKEN = TOKEN;

const app = express();
app.use(cors());

const limiter = rateLimit({ windowMs: 1000, max: 1 });
app.use(limiter);

app.use('/api', router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (axios.isAxiosError(err) && err.response) {
    return res.status(502).json({ message: err.response.data ?? err.message });
  }
  return res.status(500).json({ message: (err as Error).message });
});

const PORT = process.env.PORT || 4321;

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT));
}

export default app;
