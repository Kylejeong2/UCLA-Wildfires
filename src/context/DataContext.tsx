'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Alert, AQIData, AppData } from '@/types';

interface CombinedData {
  airQuality: {
    current: AQIData;
    historical: AQIData[];
  };
  campusAlerts: Alert[];
}

const DataContext = createContext<AppData>({
  alerts: [],
  aqiData: {
    current: null,
    historical: []
  },
  isLoading: true,
  error: null
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aqiData, setAqiData] = useState<{ current: AQIData | null; historical: AQIData[] }>({
    current: null,
    historical: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/combined-data');

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json() as CombinedData;

        // Type guards
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format');
        }

        const { airQuality, campusAlerts } = data;

        if (!Array.isArray(campusAlerts)) {
          throw new Error('Invalid alerts data format');
        }

        if (!airQuality || typeof airQuality !== 'object' || !('current' in airQuality) || !('historical' in airQuality)) {
          throw new Error('Invalid AQI data format');
        }

        setAlerts(campusAlerts);
        setAqiData({
          current: airQuality.current,
          historical: airQuality.historical
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up polling every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ alerts, aqiData, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 