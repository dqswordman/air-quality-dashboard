import { useQuery } from '@tanstack/react-query';
import Gauge from './Gauge';
import Chart from './Chart';
import { fetchAqi } from '../services/api';

interface Props {
  uid: number | null;
}

export default function Panel({ uid }: Props) {
  const { data, refetch } = useQuery(['aqi', uid], () => fetchAqi(uid!), {
    enabled: uid !== null,
    refetchInterval: 600000,
  });
  return (
    <div className="flex-1 p-4" data-testid="panel">
      <button type="button" onClick={() => refetch()} className="mb-4">
        Refresh
      </button>
      {data && (
        <>
          <Gauge aqi={data.data.aqi} />
          <Chart history={data.data.forecast.daily.pm25} />
        </>
      )}
    </div>
  );
}
