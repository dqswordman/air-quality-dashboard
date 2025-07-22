import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchStations, Station } from '../services/api';
import 'leaflet/dist/leaflet.css';

interface Props {
  onSelect: (uid: number) => void;
}

const colorByAqi = (aqi: number): string => {
  if (aqi <= 50) return '#009966';
  if (aqi <= 100) return '#ffde33';
  if (aqi <= 150) return '#ff9933';
  if (aqi <= 200) return '#cc0033';
  if (aqi <= 300) return '#660099';
  return '#7e0023';
};

export default function Map({ onSelect }: Props) {
  const { data } = useQuery(['nearby'], fetchStations, { refetchInterval: 600000 });
  return (
    <MapContainer center={[13.736717, 100.523186]} zoom={6} className="h-full" data-testid="map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {data?.map((s: Station) => (
        <CircleMarker
          key={s.uid}
          center={[s.lat, s.lon]}
          pathOptions={{ color: colorByAqi(Number(s.aqi)) }}
          radius={8}
          eventHandlers={{ click: () => onSelect(s.uid) }}
        />
      ))}
    </MapContainer>
  );
}
