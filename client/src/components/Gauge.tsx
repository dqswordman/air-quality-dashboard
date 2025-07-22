import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Props {
  aqi: number;
}

// AQI 颜色映射
const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) return '#009966';
  if (aqi <= 100) return '#ffde33';
  if (aqi <= 150) return '#ff9933';
  if (aqi <= 200) return '#cc0033';
  if (aqi <= 300) return '#660099';
  return '#7e0023';
};

// AQI 级别映射
const getAqiLevel = (aqi: number): string => {
  if (aqi <= 50) return '良好';
  if (aqi <= 100) return '中等';
  if (aqi <= 150) return '对敏感人群不健康';
  if (aqi <= 200) return '不健康';
  if (aqi <= 300) return '非常不健康';
  return '危险';
};

export default function Gauge({ aqi }: Props) {
  const aqiColor = getAqiColor(aqi);
  const aqiLevel = getAqiLevel(aqi);
  
  // 计算进度条百分比，最大值为500
  const percentage = Math.min(aqi / 500 * 100, 100);
  
  return (
    <div className="w-48 h-48 mx-auto relative">
      <CircularProgressbar
        value={percentage}
        text={`${aqi}`}
        circleRatio={0.75}
        styles={buildStyles({
          rotation: 1 / 2 + 1 / 8,
          strokeLinecap: 'round',
          textSize: '24px',
          pathColor: aqiColor,
          textColor: aqiColor,
          trailColor: '#eee',
        })}
      />
      <div className="absolute inset-0 flex items-center justify-center mt-12">
        <span className="text-sm font-medium" style={{ color: aqiColor }}>
          {aqiLevel}
        </span>
      </div>
    </div>
  );
}
