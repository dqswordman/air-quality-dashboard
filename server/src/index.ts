import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import router from './routes/aqi';

dotenv.config();

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

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port);
}

export default app;
