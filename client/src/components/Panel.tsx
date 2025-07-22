import { useQuery } from '@tanstack/react-query';
import Gauge from './Gauge';
import Chart from './Chart';
import { fetchAqi } from '../services/api';
import { useState } from 'react';

interface Props {
  uid: number | null;
}

// AQI level information
const aqiLevels = [
  { range: [0, 50], label: 'Good', description: 'Air quality is satisfactory, and air pollution poses little or no risk', color: '#009966', advice: 'All groups can engage in normal activities' },
  { range: [51, 100], label: 'Moderate', description: 'Air quality is acceptable; however, some pollutants may be a concern for a small number of individuals', color: '#ffde33', advice: 'Unusually sensitive people should consider reducing prolonged outdoor exertion' },
  { range: [101, 150], label: 'Unhealthy for Sensitive Groups', description: 'Members of sensitive groups may experience health effects, but the general public is less likely to be affected', color: '#ff9933', advice: 'Children, elderly, and individuals with respiratory or heart disease should reduce prolonged outdoor exertion' },
  { range: [151, 200], label: 'Unhealthy', description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects', color: '#cc0033', advice: 'Children, elderly, and individuals with respiratory or heart disease should avoid prolonged outdoor exertion; everyone else should reduce outdoor activities' },
  { range: [201, 300], label: 'Very Unhealthy', description: 'Health alert: everyone may experience more serious health effects', color: '#660099', advice: 'Children, elderly, and individuals with respiratory or heart disease should remain indoors; everyone else should avoid outdoor activities' },
  { range: [301, Infinity], label: 'Hazardous', description: 'Health warnings of emergency conditions; the entire population is more likely to be affected', color: '#7e0023', advice: 'Everyone should avoid all outdoor exertion' }
];

// Get AQI level based on AQI value
const getAqiLevel = (aqi: number) => {
  return aqiLevels.find(level => aqi >= level.range[0] && aqi <= level.range[1]) || aqiLevels[5];
};

// Check if AQI value is anomalous
const isAnomalous = (aqi: number): boolean => {
  return aqi > 150; // Consider AQI > 150 as anomalous
};

// Generate sensor metadata (mock data)
const generateSensorMetadata = (uid: number) => {
  return {
    id: `WAQI-${uid}`,
    model: `Air Quality Monitor ${Math.floor(uid / 100)}`,
    manufacturer: 'World Air Quality Index Project',
    installationDate: new Date(2020, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    lastCalibration: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    firmwareVersion: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    batteryStatus: `${Math.floor(Math.random() * 40) + 60}%`,
    signalStrength: `${Math.floor(Math.random() * 30) + 70}%`,
    maintenanceStatus: Math.random() > 0.8 ? 'Maintenance Required' : 'Normal',
  };
};

// Extract forecast data for all pollutants
const extractForecastData = (data: any) => {
  if (!data || !data.data || !data.data.forecast || !data.data.forecast.daily) {
    return {};
  }

  const forecastData: { [key: string]: any[] } = {};
  const daily = data.data.forecast.daily;

  // Extract all available pollutant forecasts
  Object.keys(daily).forEach(pollutant => {
    if (Array.isArray(daily[pollutant]) && daily[pollutant].length > 0) {
      forecastData[pollutant] = daily[pollutant];
    }
  });

  return forecastData;
};

// Check if forecast data is available
const hasForecastData = (forecastData: { [key: string]: any[] }): boolean => {
  return Object.keys(forecastData).length > 0;
};

// Get the primary pollutant type from forecast data
const getPrimaryPollutantType = (forecastData: { [key: string]: any[] }): string => {
  const pollutants = Object.keys(forecastData);
  
  // Prefer PM2.5 if available
  if (pollutants.includes('pm25')) {
    return 'pm25';
  }
  
  // Otherwise, return the first available pollutant
  return pollutants[0] || 'pm25';
};

export default function Panel({ uid }: Props) {
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'info' | 'sensor'>('current');
  
  const { data, isLoading, isError, error, refetch } = useQuery(['aqi', uid], () => fetchAqi(uid!), {
    enabled: uid !== null,
    refetchInterval: 600000,
    retry: 3,
    onError: (err) => console.error(`AQI data loading failed (uid=${uid}):`, err)
  });

  // If no station is selected, show prompt
  if (uid === null) {
    return (
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-gray-500 h-full" data-testid="panel">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-lg font-medium">Please select a monitoring station from the map</p>
        <p className="text-sm mt-2">Click on a colored dot on the map to view detailed air quality data</p>
      </div>
    );
  }

  // Get AQI level information
  const aqiLevel = data?.data?.aqi ? getAqiLevel(data.data.aqi) : null;
  const anomalous = data?.data?.aqi ? isAnomalous(data.data.aqi) : false;
  
  // Get sensor metadata
  const sensorMetadata = generateSensorMetadata(uid);
  
  // Extract forecast data for all pollutants
  const forecastData = extractForecastData(data);
  const hasForecast = hasForecastData(forecastData);
  
  // Get the primary pollutant type to display
  const primaryPollutantType = getPrimaryPollutantType(forecastData);

  // Organize pollutant data for the current tab
  const pollutantData = [];
  
  // Add AQI as the first item
  pollutantData.push({
    name: 'Air Quality Index',
    value: data?.data?.aqi || 0
  });
  
  // Add other pollutants if available
  if (data?.data?.iaqi) {
    const iaqi = data.data.iaqi;
    
    // Add PM2.5 next if available
    if (iaqi.pm25) {
      pollutantData.push({
        name: 'PM2.5',
        value: iaqi.pm25.v
      });
    }
    
    // Add remaining pollutants
    const remainingPollutants = [
      { key: 'pm10', name: 'PM10' },
      { key: 'o3', name: 'Ozone (O₃)' },
      { key: 'no2', name: 'Nitrogen Dioxide (NO₂)' },
      { key: 'so2', name: 'Sulfur Dioxide (SO₂)' },
      { key: 'co', name: 'Carbon Monoxide (CO)' }
    ];
    
    remainingPollutants.forEach(pollutant => {
      if (iaqi[pollutant.key]) {
        pollutantData.push({
          name: pollutant.name,
          value: iaqi[pollutant.key].v
        });
      }
    });
  }

  return (
    <div className="flex flex-col h-full" data-testid="panel">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Air Quality Data</h2>
          <button 
            type="button" 
            onClick={() => refetch()} 
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading
              </>
            ) : (
              <>
                <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Station ID: {uid}</p>
          {anomalous && (
            <div className="animate-pulse bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Anomaly Detected
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-gray-600">Loading air quality data...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <h3 className="font-bold mb-2 flex items-center">
              <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Loading Failed
            </h3>
            <p>{(error as Error)?.message || 'Unknown error'}</p>
          </div>
        </div>
      )}

      {/* Data content */}
      {data && !isLoading && !isError && data.data && (
        <div className="flex-1 overflow-y-auto">
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button 
              className={`flex-1 min-w-[80px] py-2 px-4 text-center ${activeTab === 'current' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('current')}
            >
              Current
            </button>
            <button 
              className={`flex-1 min-w-[80px] py-2 px-4 text-center ${activeTab === 'forecast' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('forecast')}
            >
              Forecast
            </button>
            <button 
              className={`flex-1 min-w-[80px] py-2 px-4 text-center ${activeTab === 'info' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('info')}
            >
              Health
            </button>
            <button 
              className={`flex-1 min-w-[80px] py-2 px-4 text-center ${activeTab === 'sensor' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
              onClick={() => setActiveTab('sensor')}
            >
              Sensor
            </button>
          </div>

          {/* Current data tab */}
          {activeTab === 'current' && (
            <div className="p-4">
              {anomalous && (
                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="font-bold">Air Quality Alert</h3>
                  </div>
                  <p className="mt-2">Current air quality levels are unhealthy. Consider limiting outdoor activities.</p>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <Gauge aqi={data.data.aqi} />
                </div>
                
                {aqiLevel && (
                  <div className={`p-4 rounded-md text-white text-center mb-4`} style={{ backgroundColor: aqiLevel.color }}>
                    <h3 className="font-bold text-lg">{aqiLevel.label}</h3>
                    <p>{aqiLevel.description}</p>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="font-medium mb-2 text-gray-700">Detailed Data</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {pollutantData.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-gray-200">
                        <p className="text-xs text-gray-500">{item.name}</p>
                        <p className="font-bold text-lg">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Forecast tab */}
          {activeTab === 'forecast' && (
            <div className="p-4">
              {hasForecast ? (
                <div>
                  {Object.keys(forecastData).length > 0 && (
                    <Chart 
                      history={forecastData[primaryPollutantType]} 
                      pollutantType={primaryPollutantType as any}
                      additionalData={forecastData}
                    />
                  )}
                  
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
                    <h3 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      About Forecast Data
                    </h3>
                    <p className="text-xs text-blue-700">
                      Forecast data is provided by the World Air Quality Index Project. The forecast shows predicted pollutant 
                      levels for the coming days. Use the buttons above to view different pollutants and time ranges.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center p-8 bg-gray-50 rounded-md border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="font-medium">No forecast data available</p>
                  <p className="text-sm mt-1">This station has no air quality forecast information</p>
                </div>
              )}
            </div>
          )}

          {/* Health info tab */}
          {activeTab === 'info' && (
            <div className="p-4">
              {aqiLevel && (
                <div className="mb-4">
                  <div className={`p-4 rounded-t-md text-white`} style={{ backgroundColor: aqiLevel.color }}>
                    <h3 className="font-bold text-lg">{aqiLevel.label}</h3>
                    <p className="text-sm">{aqiLevel.description}</p>
                  </div>
                  <div className="p-4 bg-white border-x border-b rounded-b-md border-gray-200">
                    <h4 className="font-medium mb-2">Health Recommendations</h4>
                    <p>{aqiLevel.advice}</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
                <h3 className="font-medium p-3 bg-gray-100 border-b border-gray-200">Air Quality Index Level Description</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="py-2 px-3 text-left">AQI</th>
                        <th className="py-2 px-3 text-left">Level</th>
                        <th className="py-2 px-3 text-left">Health Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {aqiLevels.map((level, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="inline-block w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: level.color }}></span>
                            {level.range[0]}-{level.range[1] === Infinity ? '+' : level.range[1]}
                          </td>
                          <td className="py-2 px-3">{level.label}</td>
                          <td className="py-2 px-3 text-sm">{level.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Sensor info tab */}
          {activeTab === 'sensor' && (
            <div className="p-4">
              <div className="bg-white rounded-md border border-gray-200 overflow-hidden mb-4">
                <h3 className="font-medium p-3 bg-gray-100 border-b border-gray-200">Sensor Information</h3>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Sensor ID</p>
                      <p className="font-medium">{sensorMetadata.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Model</p>
                      <p className="font-medium">{sensorMetadata.model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Manufacturer</p>
                      <p className="font-medium">{sensorMetadata.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Installation Date</p>
                      <p className="font-medium">{sensorMetadata.installationDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Calibration</p>
                      <p className="font-medium">{sensorMetadata.lastCalibration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Firmware Version</p>
                      <p className="font-medium">{sensorMetadata.firmwareVersion}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <h3 className="font-medium p-3 bg-gray-100 border-b border-gray-200">Sensor Status</h3>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Battery Status</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: sensorMetadata.batteryStatus }}></div>
                        </div>
                        <p className="text-sm font-medium">{sensorMetadata.batteryStatus}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Signal Strength</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: sensorMetadata.signalStrength }}></div>
                        </div>
                        <p className="text-sm font-medium">{sensorMetadata.signalStrength}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Maintenance Status</p>
                      <p className={`font-medium ${sensorMetadata.maintenanceStatus === 'Normal' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {sensorMetadata.maintenanceStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Data Quality</p>
                      <p className="font-medium text-green-600">Good</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Sensor Information
                </h3>
                <p className="text-xs text-blue-700">
                  This sensor is part of the World Air Quality Index monitoring network. It measures particulate matter (PM2.5, PM10) 
                  and various gases to calculate the Air Quality Index (AQI) according to US EPA standards.
                </p>
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="p-4 mt-auto border-t border-gray-200 text-xs text-gray-500">
            <p>Data Source: World Air Quality Index Project</p>
            <p>Last Updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
