import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Map from './components/Map';
import Panel from './components/Panel';

const queryClient = new QueryClient();

export default function App() {
  const [uid, setUid] = useState<number | null>(null);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col md:flex-row h-full">
        <div className="flex-1">
          <Map onSelect={setUid} />
        </div>
        <Panel uid={uid} />
      </div>
    </QueryClientProvider>
  );
}
