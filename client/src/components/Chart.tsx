import { LineChart as RCLineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface Point {
  avg: number;
  day: string;
}

interface Props {
  history: Point[];
}

export default function Chart({ history }: Props) {
  return (
    <RCLineChart width={300} height={200} data={history} className="mt-4">
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="avg" stroke="#8884d8" />
    </RCLineChart>
  );
}
