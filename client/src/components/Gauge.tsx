import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Props {
  aqi: number;
}

export default function Gauge({ aqi }: Props) {
  return (
    <CircularProgressbar
      value={aqi}
      maxValue={500}
      text={`${aqi}`}
      styles={buildStyles({ textColor: '#000' })}
    />
  );
}
