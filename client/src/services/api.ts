import axios from 'axios';

export interface Station {
  uid: number;
  lat: number;
  lon: number;
  aqi: string;
  station: { name: string };
}

// Update AQIResponse interface, add iaqi field
export interface AQIResponse {
  status: string;
  data: {
    aqi: number;
    forecast: { daily: { pm25: { avg: number; day: string }[] } };
    iaqi?: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
      [key: string]: { v: number } | undefined;
    };
  };
}

// Create an axios instance with common configuration
const apiClient = axios.create({
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add request interceptor to log request information
apiClient.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    if (error.response) {
      // Server returned error status code
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Request was sent but no response received
      console.error('API Error: No response received', error.request);
    } else {
      // Error setting up request
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const base = '';

export const fetchStations = async (): Promise<Station[]> => {
  try {
    console.log('Fetching stations...');
    const res = await apiClient.get<{ status: string; data: Station[] }>(`${base}/api/nearby`);
    
    if (!res.data) {
      throw new Error('API returned empty data');
    }
    
    if (res.data.status !== 'ok') {
      throw new Error(`API returned error: ${JSON.stringify(res.data)}`);
    }
    
    if (!Array.isArray(res.data.data)) {
      console.error('API returned incorrect format:', res.data);
      throw new Error(`API returned incorrect format: expected array but received ${typeof res.data.data}`);
    }
    
    // Ensure all required fields exist
    const validStations = res.data.data.filter(station => {
      if (!station || typeof station !== 'object') return false;
      if (typeof station.uid !== 'number') return false;
      if (typeof station.lat !== 'number' || typeof station.lon !== 'number') return false;
      if (!station.station || typeof station.station !== 'object') return false;
      if (typeof station.station.name !== 'string') return false;
      return true;
    });
    
    console.log(`Retrieved ${validStations.length} stations`);
    return validStations;
  } catch (error) {
    console.error('Failed to fetch station data:', error);
    throw error;
  }
};

export const fetchAqi = async (uid: number): Promise<AQIResponse> => {
  try {
    console.log(`Fetching AQI for station ${uid}...`);
    const res = await apiClient.get<AQIResponse>(`${base}/api/aqi/${uid}`);
    
    if (!res.data) {
      throw new Error('API returned empty data');
    }
    
    if (res.data.status !== 'ok') {
      throw new Error(`API returned error: ${JSON.stringify(res.data)}`);
    }
    
    // Ensure data format is correct
    if (!res.data.data || typeof res.data.data !== 'object') {
      throw new Error('API returned incorrect data format: missing data field');
    }
    
    if (typeof res.data.data.aqi !== 'number') {
      throw new Error('API returned incorrect data format: missing aqi field');
    }
    
    if (!res.data.data.forecast || 
        !res.data.data.forecast.daily || 
        !Array.isArray(res.data.data.forecast.daily.pm25)) {
      // If no forecast data, add an empty array
      res.data.data.forecast = { daily: { pm25: [] } };
    }
    
    // Ensure iaqi field exists
    if (!res.data.data.iaqi) {
      res.data.data.iaqi = {};
    }
    
    console.log(`Retrieved AQI data for station ${uid}`);
    return res.data;
  } catch (error) {
    console.error(`Failed to fetch AQI data (uid=${uid}):`, error);
    throw error;
  }
};
