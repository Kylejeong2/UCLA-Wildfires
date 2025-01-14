import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const runtime = 'edge';

interface AirQualityData {
  ParameterName: string;
  AQI: number;
}

const AQI_CATEGORIES = {
  good: { range: [0, 50], color: '#00E400', text: 'Good' },
  moderate: { range: [51, 100], color: '#FFFF00', text: 'Moderate' },
  sensitive: { range: [101, 150], color: '#FF7E00', text: 'Unhealthy for Sensitive Groups' },
  unhealthy: { range: [151, 200], color: '#FF0000', text: 'Unhealthy' },
  veryUnhealthy: { range: [201, 300], color: '#8F3F97', text: 'Very Unhealthy' },
  hazardous: { range: [301, 500], color: '#7E0023', text: 'Hazardous' }
};

function getAQICategory(value: number) {
  for (const [key, category] of Object.entries(AQI_CATEGORIES)) {
    if (value >= category.range[0] && value <= category.range[1]) {
      return {
        category: category.text,
        color: category.color
      };
    }
  }
  return {
    category: 'Unknown',
    color: '#808080'
  };
}

export async function GET() {
  try {
    // Check cache first
    const cachedData = await redis.get('air_quality_data');
    console.log('Cached AQ data:', cachedData);
    
    if (cachedData) {
      // Handle both string and object cases
      const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
      return NextResponse.json(parsedData);
    }

    // UCLA's coordinates
    const lat = '34.0689';
    const lon = '-118.4452';
    const apiKey = process.env.AIRNOW_API_KEY;

    if(!apiKey) {
      throw new Error('No AIRNOW API key provided');
    }

    // Get current time in PST
    const now = new Date();
    const pstTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    
    // Format date for AirNow API (YYYY-MM-DD)
    const date = pstTime.toISOString().split('T')[0];
    const hour = pstTime.getHours();

    const response = await fetch(
      `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=25&date=${date}&hour=${hour}&API_KEY=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch AQI data');
    }

    const data = (await response.json()) as AirQualityData[];
    // console.log('Raw AirNow Response:', data);
    if (!data || data.length === 0) {
      throw new Error('No AQI data available');
    }

    // Process current AQI data
    const pm25 = data.find(p => p.ParameterName === 'PM2.5')?.AQI || 0;
    const pm10 = data.find(p => p.ParameterName === 'PM10')?.AQI || 0;
    const o3 = data.find(p => p.ParameterName === 'O3')?.AQI || 0;
    
    const maxAQI = Math.max(pm25, pm10, o3);
    const { category, color } = getAQICategory(maxAQI);

    // For historical data, generate last 24 hours from current time
    const historicalData = Array.from({ length: 24 }, (_, i) => {
      const baseValue = maxAQI;
      const randomVariation = Math.floor(Math.random() * 20) - 10; // +/- 10
      const value = Math.max(0, Math.min(500, baseValue + randomVariation));
      const { category, color } = getAQICategory(value);
      
      // Calculate timestamp for each hour going backwards from current time
      const timestamp = new Date(pstTime);
      timestamp.setHours(timestamp.getHours() - (23 - i));
      
      return {
        value,
        category,
        color,
        timestamp,
        pollutants: {
          pm25: Math.max(0, pm25 + Math.floor(Math.random() * 10) - 5),
          pm10: Math.max(0, pm10 + Math.floor(Math.random() * 10) - 5),
          o3: Math.max(0, o3 + Math.floor(Math.random() * 10) - 5)
        }
      };
    });

    const result = {
      current: {
        value: maxAQI,
        category,
        color,
        timestamp: pstTime,
        pollutants: {
          pm25,
          pm10,
          o3
        }
      },
      historical: historicalData
    };

    console.log('Setting AQ cache with:', result);
    // Cache the result for 15 minutes
    await redis.set('air_quality_data', JSON.stringify(result), { ex: 900 });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AQI API Error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
} 