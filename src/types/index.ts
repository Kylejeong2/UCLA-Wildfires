export interface Alert {
  id: string;
  title: string;
  date: string;
  type: 'emergency' | 'warning' | 'info';
  link: string;
  categories: string[];
  summary: string;
}

export interface AQIData {
  value: number;
  category: string;
  color: string;
  timestamp: Date;
  pollutants: {
    pm25: number;
    pm10: number;
    o3: number;
  };
}

export interface AppData {
  alerts: Alert[];
  aqiData: {
    current: AQIData | null;
    historical: AQIData[];
  };
  isLoading: boolean;
  error: string | null;
} 