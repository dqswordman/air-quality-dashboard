import axios from 'axios';

export interface Station {
  uid: number;
  lat: number;
  lon: number;
  aqi: string;
  station: { name: string };
}

export interface AQIResponse {
  status: string;
  data: {
    aqi: number;
    forecast: { daily: { pm25: { avg: number; day: string }[] } };
  };
}

const base = import.meta.env.VITE_API_BASE ?? '';

export const fetchStations = async (): Promise<Station[]> => {
  const res = await axios.get<{ status: string; data: Station[] }>(`${base}/api/nearby`);
  return res.data.data;
};

export const fetchAqi = async (uid: number): Promise<AQIResponse> => {
  const res = await axios.get<AQIResponse>(`${base}/api/aqi/${uid}`);
  return res.data;
};
