import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import Map from './components/Map';
import Panel from './components/Panel';
import axios from 'axios';
import { fetchStations, Station } from './services/api';

const queryClient = new QueryClient();

// Function to check for anomalies in stations data
const getAnomalousStations = (stations: Station[] | undefined): Station[] => {
  if (!stations) return [];
  return stations.filter(station => Number(station.aqi) > 150);
};

function Dashboard() {
  const [uid, setUid] = useState<number | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  
  // Fetch stations data
  const { data: stations } = useQuery(['nearby'], fetchStations, {
    refetchInterval: 600000,
    retry: 3,
    staleTime: 300000,
    onError: (err) => console.error('Failed to fetch stations:', err)
  });
  
  // Get anomalous stations
  const anomalousStations = getAnomalousStations(stations);
  const hasAnomalies = anomalousStations.length > 0;

  // Check API health status
  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/health');
      setHealthStatus(response.data);
      console.log('Health check:', response.data);
    } catch (err) {
      console.error('Health check failed:', err);
      setError('Health check failed');
    } finally {
      setLoading(false);
    }
  };

  // Test API
  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/test');
      setTestStatus(response.data);
      console.log('API test:', response.data);
    } catch (err) {
      console.error('API test failed:', err);
      setError('API test failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto check health status when component loads
  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <h1 className="text-xl font-bold">Thailand Air Quality Monitor</h1>
          </div>
          <div className="flex items-center space-x-4">
            {hasAnomalies && (
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="animate-pulse bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {anomalousStations.length} Alert{anomalousStations.length !== 1 ? 's' : ''}
              </button>
            )}
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="px-3 py-1 text-sm bg-blue-700 hover:bg-blue-600 rounded"
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
            <a 
              href="https://aqicn.org/map/thailand/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Data Source
            </a>
          </div>
        </div>
      </header>

      {/* Alerts Panel */}
      {showAlerts && hasAnomalies && (
        <div className="bg-red-50 p-4 border-b border-red-200">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-red-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Air Quality Alerts
              </h2>
              <button 
                onClick={() => setShowAlerts(false)}
                className="text-red-700 hover:text-red-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anomalousStations.map(station => (
                <div 
                  key={station.uid} 
                  className="bg-white p-3 rounded shadow-sm border border-red-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setUid(station.uid);
                    setShowAlerts(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{station.station.name}</h3>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      AQI: {station.aqi}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Location: {station.lat.toFixed(4)}, {station.lon.toFixed(4)}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Warning: Air quality levels are unhealthy at this location
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-700">Debug Panel</h2>
              <div className="space-x-2">
                <button 
                  onClick={checkHealth} 
                  disabled={loading}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Check Health
                </button>
                <button 
                  onClick={testApi} 
                  disabled={loading}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                >
                  Test API
                </button>
              </div>
            </div>
            
            {loading && <p className="text-gray-600 text-sm">Loading...</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthStatus && (
                <div className="mb-2">
                  <h3 className="font-semibold text-sm text-gray-600">Health Status:</h3>
                  <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto max-h-20">
                    {JSON.stringify(healthStatus, null, 2)}
                  </pre>
                </div>
              )}
              
              {testStatus && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">API Test Result:</h3>
                  <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto max-h-20">
                    {JSON.stringify(testStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main App */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 min-h-[300px] md:min-h-0 relative">
          <Map onSelect={setUid} />
        </div>
        <div className="w-full md:w-[400px] border-t md:border-t-0 md:border-l border-gray-200 overflow-y-auto">
          <Panel uid={uid} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-xs py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <p>© {new Date().getFullYear()} Air Quality Dashboard</p>
          <p>Data Source: <a href="https://aqicn.org" target="_blank" rel="noopener noreferrer" className="underline">World Air Quality Index Project</a></p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
