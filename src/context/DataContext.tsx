'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Alert, AQIData, AppData } from '@/types';

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

        const [alertsResponse, aqiResponse] = await Promise.all([
          fetch('/api/campus-alerts'),
          fetch('/api/air-quality')
        ]);

        if (!alertsResponse.ok || !aqiResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [alertsData, aqiData] = await Promise.all([
          alertsResponse.json(),
          aqiResponse.json()
        ]);

        // Type guard for alerts
        if (!Array.isArray(alertsData)) {
          throw new Error('Invalid alerts data format');
        }

        // Type guard for AQI data
        if (!aqiData || typeof aqiData !== 'object' || !('current' in aqiData) || !('historical' in aqiData)) {
          throw new Error('Invalid AQI data format');
        }

        setAlerts(alertsData as Alert[]);
        setAqiData({
          current: aqiData.current as AQIData,
          historical: aqiData.historical as AQIData[]
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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