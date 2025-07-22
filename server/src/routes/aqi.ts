import { Router } from 'express';
import axios from 'axios';
import { cache } from '../cache';
import { isThaiStation } from '../utils/isThailand';

const router = Router();

// 直接硬编码 API 令牌，确保它能工作
const HARDCODED_TOKEN = '40895e9c682c990d2f0911d5ca26c8eb1d3005d0';

// 添加请求队列和限制
const requestQueue: (() => void)[] = [];
let isProcessingQueue = false;
const REQUEST_DELAY = 1100; // 1.1秒，略大于1秒的限制

// 处理请求队列
const processQueue = () => {
  if (requestQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;
  const nextRequest = requestQueue.shift();
  if (nextRequest) {
    nextRequest();
    setTimeout(processQueue, REQUEST_DELAY);
  } else {
    isProcessingQueue = false;
  }
};

// 添加请求到队列
const enqueueRequest = (request: () => void): Promise<void> => {
  return new Promise((resolve) => {
    const wrappedRequest = () => {
      request();
      resolve();
    };
    
    requestQueue.push(wrappedRequest);
    
    if (!isProcessingQueue) {
      processQueue();
    }
  });
};

// 带限制的 axios 请求
const limitedAxiosGet = async (url: string, config = {}) => {
  let response;
  try {
    // 检查缓存
    const cacheKey = `axios_${url}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`Using cached response for ${url}`);
      return cached;
    }
    
    // 添加到队列
    await enqueueRequest(async () => {
      try {
        response = await axios.get(url, config);
        // 缓存响应
        cache.set(cacheKey, response, 300); // 缓存5分钟
      } catch (error) {
        console.error(`Error in limitedAxiosGet: ${error}`);
        throw error;
      }
    });
    
    return response;
  } catch (error) {
    console.error(`Error in limitedAxiosGet: ${error}`);
    throw error;
  }
};

interface BoundsStation {
  uid: number;
  lat: number;
  lon: number;
  aqi: string;
  station: { name: string };
}

const cacheWrap = async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
  const cached = cache.get<T>(key);
  if (cached) return cached;
  const val = await fn();
  cache.set(key, val);
  return val;
};

// 添加一个简单的健康检查端点
router.get('/health', (_req, res) => {
  const TOKEN = process.env.WAQI_TOKEN || HARDCODED_TOKEN;
  res.json({
    status: 'ok',
    tokenSet: !!TOKEN,
    tokenLength: TOKEN?.length || 0,
    cacheKeys: cache.keys(),
    hardcodedTokenLength: HARDCODED_TOKEN.length,
    queueLength: requestQueue.length,
    isProcessingQueue
  });
});

// 添加一个测试端点，使用实际令牌
router.get('/test', async (_req, res) => {
  try {
    // 使用硬编码令牌
    const TOKEN = HARDCODED_TOKEN;
    
    const url = `https://api.waqi.info/feed/here/?token=${TOKEN}`;
    
    console.log(`Testing API with token: ${TOKEN.substring(0, 4)}...`);
    
    const response = await limitedAxiosGet(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'AirQualityDashboard/1.0'
      }
    });
    
    const { data } = response;
    console.log('Test API Response:', data);
    
    return res.json(data);
  } catch (err) {
    console.error('Error testing API:', err);
    return res.status(502).json({
      message: 'API test error',
      error: err instanceof Error ? err.message : String(err)
    });
  }
});

router.get('/nearby', async (_req, res) => {
  try {
    // 检查缓存
    const cacheKey = 'nearby_stations';
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Using cached nearby stations');
      return res.json(cached);
    }
    
    // 使用硬编码令牌
    const TOKEN = HARDCODED_TOKEN;
    console.log(`Using hardcoded token for nearby: ${TOKEN.substring(0, 4)}...`);

    const url = `https://api.waqi.info/map/bounds/?latlng=5.613,97.343,20.465,105.637&token=${encodeURIComponent(TOKEN)}`;
    
    console.log(`Requesting: ${url.replace(TOKEN, 'HIDDEN')}`);
    
    const response = await limitedAxiosGet(url, { 
      timeout: 15000,
      headers: {
        'User-Agent': 'AirQualityDashboard/1.0'
      }
    });
    
    const { data } = response;
    console.log('API Response status:', data.status);
    console.log('API Response data:', JSON.stringify(data).substring(0, 200) + '...');
    
    if (data.status !== 'ok') {
      console.error('WAQI API error:', data);
      return res.status(502).json({ message: 'WAQI error', detail: data });
    }
    
    // 确保data.data是数组
    if (!Array.isArray(data.data)) {
      console.error('Unexpected API response format:', data);
      return res.status(502).json({ message: 'Unexpected API response format', detail: data });
    }
    
    const list = (data.data as BoundsStation[]).filter((s) =>
      isThaiStation(s.station.name, s.lat, s.lon),
    );
    
    console.log(`Filtered stations: ${list.length} (from ${data.data.length})`);
    
    // 缓存结果
    const result = { status: 'ok', data: list };
    cache.set(cacheKey, result, 300); // 缓存5分钟
    
    return res.json(result);
  } catch (err: unknown) {
    console.error('Error fetching nearby stations:', err);
    
    const detail = axios.isAxiosError(err)
      ? err.response?.data ?? err.message
      : (err as Error).message;
    
    console.error('Error details:', detail);
    return res.status(502).json({
      message: 'WAQI error',
      detail,
    });
  }
});

router.get('/aqi/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    
    // 检查缓存
    const cacheKey = `aqi_${uid}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`Using cached AQI data for uid ${uid}`);
      return res.json(cached);
    }
    
    // 使用硬编码令牌
    const TOKEN = HARDCODED_TOKEN;
    console.log(`Using hardcoded token for AQI: ${TOKEN.substring(0, 4)}...`);

    const url = `https://api.waqi.info/feed/@${uid}/?token=${encodeURIComponent(TOKEN)}`;
    
    console.log(`Requesting AQI for uid ${uid}`);
    
    const response = await limitedAxiosGet(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'AirQualityDashboard/1.0'
      }
    });
    
    const { data } = response;
    console.log(`AQI Response for uid ${uid} status:`, data.status);
    
    if (data.status !== 'ok') {
      console.error('WAQI API error:', data);
      return res.status(502).json({ message: 'WAQI error', detail: data });
    }
    
    // 缓存结果
    cache.set(cacheKey, data, 300); // 缓存5分钟
    
    return res.json(data);
  } catch (err) {
    console.error('Error fetching AQI data:', err);
    return next(err);
  }
});

export default router;
