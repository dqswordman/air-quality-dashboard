import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import router from './routes/aqi';

// 直接设置环境变量，不依赖 .env 文件
process.env.WAQI_TOKEN = '40895e9c682c990d2f0911d5ca26c8eb1d3005d0';
process.env.PORT = '4321';

const TOKEN = process.env.WAQI_TOKEN;
console.log(`Using token: ${TOKEN.substring(0, 4)}...`);

const app = express();
app.use(cors());

const limiter = rateLimit({ windowMs: 1000, max: 1 });
app.use(limiter);

app.use('/api', router);

// 添加一个简单的健康检查端点
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    token: TOKEN ? 'set' : 'not set',
    tokenLength: TOKEN?.length || 0
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  if (axios.isAxiosError(err) && err.response) {
    return res.status(502).json({ message: err.response.data ?? err.message });
  }
  return res.status(500).json({ message: (err as Error).message });
});

const PORT = process.env.PORT || 4321;

if (process.env.NODE_ENV !== 'test') {
  app.listen(Number(PORT));
  console.log(`Server listening on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
}

export default app;
