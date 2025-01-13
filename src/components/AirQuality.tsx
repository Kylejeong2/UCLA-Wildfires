"use client"

import { Line } from 'react-chartjs-2';
import { useData } from '@/context/DataContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AQI_CATEGORIES = {
  good: { range: [0, 50], color: '#00E400', text: 'Good' },
  moderate: { range: [51, 100], color: '#FFFF00', text: 'Moderate' },
  sensitive: { range: [101, 150], color: '#FF7E00', text: 'Unhealthy for Sensitive Groups' },
  unhealthy: { range: [151, 200], color: '#FF0000', text: 'Unhealthy' },
  veryUnhealthy: { range: [201, 300], color: '#8F3F97', text: 'Very Unhealthy' },
  hazardous: { range: [301, 500], color: '#7E0023', text: 'Hazardous' }
};

export default function AirQuality() {
  const { aqiData: { current, historical }, isLoading, error } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-pulse text-gray-500">Loading air quality data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-black">{error}</div>
      </div>
    );
  }

  if (!current || historical.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-black">No air quality data available</div>
      </div>
    );
  }

  const getHealthRecommendation = (aqi: number) => {
    if (aqi <= 50) {
      return "Air quality is satisfactory. Outdoor activities are safe.";
    } else if (aqi <= 100) {
      return "Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exposure.";
    } else if (aqi <= 150) {
      return "Members of sensitive groups may experience health effects. Limit outdoor activities.";
    } else if (aqi <= 200) {
      return "Everyone may begin to experience health effects. Avoid prolonged outdoor exposure.";
    } else if (aqi <= 300) {
      return "Health alert: Risk of health effects is increased for everyone. Stay indoors.";
    } else {
      return "Health warning: Everyone may experience serious health effects. Avoid all outdoor activities.";
    }
  };

  const chartData = {
    labels: historical.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'AQI',
        data: historical.map(d => d.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="space-y-3">
      {/* Current AQI and Health Recommendation Combined */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-black">Current AQI</h3>
              <p className="text-xs text-gray-500">via AirNow</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              {new Date(current.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold" style={{ color: current.color }}>
              {current.value}
            </span>
            <span className="text-sm text-gray-700">{current.category}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Health Advisory</h4>
          <p className="text-xs text-gray-600 line-clamp-2">{getHealthRecommendation(current.value)}</p>
        </div>
      </div>

      {/* Pollutant Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <p className="text-xs text-gray-600">PM2.5</p>
          <p className="text-sm font-semibold text-black">{current.pollutants.pm25}</p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <p className="text-xs text-gray-600">PM10</p>
          <p className="text-sm font-semibold text-black">{current.pollutants.pm10}</p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <p className="text-xs text-gray-600">Ozone</p>
          <p className="text-sm font-semibold text-black">{current.pollutants.o3}</p>
        </div>
      </div>

      {/* Historical Trend */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-1">24-Hour Trend</h4>
        <div className="h-32">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  enabled: true,
                  mode: 'index',
                  intersect: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 500,
                  ticks: {
                    font: {
                      size: 10
                    }
                  }
                },
                x: {
                  ticks: {
                    font: {
                      size: 10
                    },
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 