import { NextResponse } from 'next/server';

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
    // UCLA's coordinates
    const lat = '34.0689';
    const lon = '-118.4452';
    const apiKey = process.env.AIRNOW_API_KEY;

    const response = await fetch(
      `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=25&API_KEY=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch AQI data');
    }

    const data = (await response.json()) as AirQualityData[];
    
    // Process current AQI data
    const pm25 = data.find(p => p.ParameterName === 'PM2.5')?.AQI || 0;
    const pm10 = data.find(p => p.ParameterName === 'PM10')?.AQI || 0;
    const o3 = data.find(p => p.ParameterName === 'O3')?.AQI || 0;
    
    const maxAQI = Math.max(pm25, pm10, o3);
    const { category, color } = getAQICategory(maxAQI);

    // For demo purposes, generate historical data
    const historicalData = Array.from({ length: 24 }, (_, i) => {
      const baseValue = maxAQI;
      const randomVariation = Math.floor(Math.random() * 20) - 10; // +/- 10
      const value = Math.max(0, Math.min(500, baseValue + randomVariation));
      const { category, color } = getAQICategory(value);
      
      return {
        value,
        category,
        color,
        timestamp: new Date(Date.now() - (23 - i) * 3600000),
        pollutants: {
          pm25: Math.max(0, pm25 + Math.floor(Math.random() * 10) - 5),
          pm10: Math.max(0, pm10 + Math.floor(Math.random() * 10) - 5),
          o3: Math.max(0, o3 + Math.floor(Math.random() * 10) - 5)
        }
      };
    });

    return NextResponse.json({
      current: {
        value: maxAQI,
        category,
        color,
        timestamp: new Date(),
        pollutants: {
          pm25,
          pm10,
          o3
        }
      },
      historical: historicalData
    });
  } catch (error) {
    console.error('AQI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
} 