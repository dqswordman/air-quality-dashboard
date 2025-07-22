import { LineChart as RCLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useState, useEffect } from 'react';

interface Point {
  avg: number;
  day: string;
}

interface Props {
  history: Point[];
  pollutantType?: 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co';
  additionalData?: {
    [key: string]: Point[];
  };
}

// Format date from "2023-07-23" to "7/23"
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  } catch (e) {
    return dateStr;
  }
};

// Get color based on pollutant type
const getPollutantColor = (pollutantType: string): string => {
  switch (pollutantType) {
    case 'pm25': return '#3b82f6'; // blue
    case 'pm10': return '#ef4444'; // red
    case 'o3': return '#8b5cf6';   // purple
    case 'no2': return '#f59e0b';  // amber
    case 'so2': return '#10b981';  // emerald
    case 'co': return '#6b7280';   // gray
    default: return '#3b82f6';     // default blue
  }
};

// Get color based on PM2.5 value
const getPM25Color = (value: number): string => {
  if (value <= 12) return '#009966'; // Good
  if (value <= 35.4) return '#ffde33'; // Moderate
  if (value <= 55.4) return '#ff9933'; // Unhealthy for Sensitive Groups
  if (value <= 150.4) return '#cc0033'; // Unhealthy
  if (value <= 250.4) return '#660099'; // Very Unhealthy
  return '#7e0023'; // Hazardous
};

// Get pollutant display name
const getPollutantName = (pollutantType: string): string => {
  switch (pollutantType) {
    case 'pm25': return 'PM2.5';
    case 'pm10': return 'PM10';
    case 'o3': return 'Ozone (O₃)';
    case 'no2': return 'Nitrogen Dioxide (NO₂)';
    case 'so2': return 'Sulfur Dioxide (SO₂)';
    case 'co': return 'Carbon Monoxide (CO)';
    default: return 'PM2.5';
  }
};

// Get pollutant unit
const getPollutantUnit = (pollutantType: string): string => {
  switch (pollutantType) {
    case 'pm25': return 'μg/m³';
    case 'pm10': return 'μg/m³';
    case 'o3': return 'ppb';
    case 'no2': return 'ppb';
    case 'so2': return 'ppb';
    case 'co': return 'ppm';
    default: return 'μg/m³';
  }
};

// Generate mock data for weekly and monthly views
const generateMockData = (baseData: Point[], timeRange: 'daily' | 'weekly' | 'monthly', pollutantType: string) => {
  if (!baseData || baseData.length === 0) return [];
  
  // Use the base data for daily view
  if (timeRange === 'daily') return baseData;
  
  const now = new Date();
  const result: Point[] = [];
  
  if (timeRange === 'weekly') {
    // Generate data for the past 12 weeks
    for (let i = 12; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const dayStr = date.toISOString().split('T')[0];
      
      // Use some values from base data, or generate random ones
      const baseIndex = i % baseData.length;
      const randomFactor = 0.7 + Math.random() * 0.6; // 70-130% of original value
      const avgValue = Math.round(baseData[baseIndex].avg * randomFactor);
      
      result.push({
        day: dayStr,
        avg: avgValue
      });
    }
  } else if (timeRange === 'monthly') {
    // Generate data for the past 12 months
    for (let i = 12; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      
      // Use some values from base data, or generate random ones
      const baseIndex = i % baseData.length;
      const randomFactor = 0.6 + Math.random() * 0.8; // 60-140% of original value
      const avgValue = Math.round(baseData[baseIndex].avg * randomFactor);
      
      result.push({
        day: monthStr,
        avg: avgValue
      });
    }
  }
  
  return result;
};

// Generate mock data for other pollutants if not provided
const generateAdditionalMockData = (baseData: Point[], pollutantType: string) => {
  if (!baseData || baseData.length === 0) return {};
  
  const result: { [key: string]: Point[] } = {};
  const pollutants = ['pm25', 'pm10', 'o3', 'no2', 'so2', 'co'];
  
  // Remove current pollutant from the list
  const otherPollutants = pollutants.filter(p => p !== pollutantType);
  
  // Generate data for each pollutant
  otherPollutants.forEach(pollutant => {
    const pollutantData: Point[] = [];
    
    baseData.forEach(point => {
      let factor = 1;
      
      // Different scaling factors for different pollutants
      switch (pollutant) {
        case 'pm10': factor = 1.5 + Math.random() * 0.5; break; // PM10 is typically higher than PM2.5
        case 'o3': factor = 0.8 + Math.random() * 0.4; break;
        case 'no2': factor = 0.6 + Math.random() * 0.3; break;
        case 'so2': factor = 0.4 + Math.random() * 0.2; break;
        case 'co': factor = 0.1 + Math.random() * 0.05; break; // CO is measured in different units
      }
      
      pollutantData.push({
        day: point.day,
        avg: Math.round(point.avg * factor * (0.9 + Math.random() * 0.2)) // Add some randomness
      });
    });
    
    result[pollutant] = pollutantData;
  });
  
  return result;
};

// Format date based on time range
const formatDateByRange = (dateStr: string, timeRange: 'daily' | 'weekly' | 'monthly') => {
  try {
    const date = new Date(dateStr);
    
    if (timeRange === 'daily') {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } else if (timeRange === 'weekly') {
      return `Week ${Math.ceil((date.getDate() + date.getDay()) / 7)} (${date.getMonth() + 1}/${date.getDate()})`;
    } else if (timeRange === 'monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

export default function Chart({ history, pollutantType = 'pm25', additionalData = {} }: Props) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activePollutant, setActivePollutant] = useState<string>(pollutantType);
  
  // Update active pollutant when pollutantType prop changes
  useEffect(() => {
    setActivePollutant(pollutantType);
  }, [pollutantType]);
  
  // Ensure we don't have duplicate pollutant data
  const cleanedAdditionalData = { ...additionalData };
  
  // If the main pollutant is already in additionalData, remove it to avoid duplication
  if (pollutantType in cleanedAdditionalData) {
    delete cleanedAdditionalData[pollutantType];
  }
  
  // Generate additional data if not provided
  const allPollutantData = {
    ...generateAdditionalMockData(history, pollutantType),
    [pollutantType]: history,
    ...cleanedAdditionalData
  };
  
  // Get data for active pollutant
  const currentPollutantData = allPollutantData[activePollutant] || history;
  
  // Get data based on selected time range
  const dataForSelectedRange = generateMockData(currentPollutantData, timeRange, activePollutant);
  
  // Process data, add formatted date and color
  const processedData = dataForSelectedRange.map(point => ({
    ...point,
    formattedDay: formatDateByRange(point.day, timeRange),
    color: activePollutant === 'pm25' ? getPM25Color(point.avg) : getPollutantColor(activePollutant)
  }));

  // Calculate pollutant max and min values
  const maxValue = Math.max(...processedData.map(d => d.avg));
  const minValue = Math.min(...processedData.map(d => d.avg));
  
  // Set Y-axis range, ensure enough space
  const yAxisDomain = [
    Math.max(0, Math.floor(minValue * 0.8)), 
    Math.ceil(maxValue * 1.2)
  ];

  // Get current pollutant name and unit
  const pollutantName = getPollutantName(activePollutant);
  const pollutantUnit = getPollutantUnit(activePollutant);

  return (
    <div className="w-full bg-white rounded-md border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700">{pollutantName} Concentration Trend ({pollutantUnit})</h4>
        <div className="flex space-x-1 text-xs">
          <button 
            onClick={() => setTimeRange('daily')}
            className={`px-3 py-1 rounded ${timeRange === 'daily' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Day
          </button>
          <button 
            onClick={() => setTimeRange('weekly')}
            className={`px-3 py-1 rounded ${timeRange === 'weekly' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setTimeRange('monthly')}
            className={`px-3 py-1 rounded ${timeRange === 'monthly' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Month
          </button>
        </div>
      </div>
      
      {/* Pollutant selector */}
      <div className="px-4 pt-4 flex flex-wrap gap-2">
        {Object.keys(allPollutantData).map(pollutant => (
          <button
            key={pollutant}
            onClick={() => setActivePollutant(pollutant)}
            className={`px-3 py-1 text-xs rounded-full ${
              activePollutant === pollutant
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {getPollutantName(pollutant)}
          </button>
        ))}
      </div>
      
      <div className="p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RCLineChart data={processedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="formattedDay" 
              stroke="#888"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={yAxisDomain}
              stroke="#888"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number) => [`${value} ${pollutantUnit}`, pollutantName]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line 
              type="monotone" 
              dataKey="avg" 
              stroke={getPollutantColor(activePollutant)} 
              strokeWidth={2}
              name={pollutantName}
              dot={{ 
                stroke: getPollutantColor(activePollutant), 
                strokeWidth: 2, 
                r: 4,
                fill: 'white' 
              }}
              activeDot={{ 
                stroke: getPollutantColor(activePollutant), 
                strokeWidth: 2, 
                r: 6,
                fill: getPollutantColor(activePollutant) 
              }}
            />
          </RCLineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Trend Analysis */}
      <div className="p-4 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Trend Analysis</h5>
        <div className="text-xs text-gray-600">
          {(() => {
            const lastValue = processedData[processedData.length - 1]?.avg || 0;
            const firstValue = processedData[0]?.avg || 0;
            const change = lastValue - firstValue;
            const percentChange = firstValue ? Math.round((change / firstValue) * 100) : 0;
            
            if (change > 0) {
              return (
                <div className="flex items-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {pollutantName} levels have increased by {Math.abs(percentChange)}% over this period. Air quality is trending worse.
                </div>
              );
            } else if (change < 0) {
              return (
                <div className="flex items-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                  </svg>
                  {pollutantName} levels have decreased by {Math.abs(percentChange)}% over this period. Air quality is improving.
                </div>
              );
            } else {
              return (
                <div className="flex items-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                  </svg>
                  {pollutantName} levels have remained stable over this period.
                </div>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
