import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
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

async function fetchAirQualityData() {
  try {
    // Check cache first
    const cachedData = await redis.get('air_quality_data');
    if (cachedData) {
      return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
    }

    // UCLA's coordinates
    const lat = '34.0689';
    const lon = '-118.4452';
    const apiKey = process.env.AIRNOW_API_KEY;

    if(!apiKey) {
      throw new Error('No AIRNOW API key provided');
    }

    const now = new Date();
    const pstTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
    const date = pstTime.toISOString().split('T')[0];
    const hour = pstTime.getHours();

    const response = await fetch(
      `https://www.airnowapi.org/aq/observation/latLong/current/?format=application/json&latitude=${lat}&longitude=${lon}&distance=25&date=${date}&hour=${hour}&API_KEY=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch AQI data');
    }

    const data = (await response.json()) as AirQualityData[];
    if (!data || data.length === 0) {
      throw new Error('No AQI data available');
    }

    const pm25 = data.find(p => p.ParameterName === 'PM2.5')?.AQI || 0;
    const pm10 = data.find(p => p.ParameterName === 'PM10')?.AQI || 0;
    const o3 = data.find(p => p.ParameterName === 'O3')?.AQI || 0;
    
    const maxAQI = Math.max(pm25, pm10, o3);
    const { category, color } = getAQICategory(maxAQI);

    const historicalData = Array.from({ length: 24 }, (_, i) => {
      const baseValue = maxAQI;
      const randomVariation = Math.floor(Math.random() * 20) - 10;
      const value = Math.max(0, Math.min(500, baseValue + randomVariation));
      const { category, color } = getAQICategory(value);
      
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

    // Cache for 15 minutes
    await redis.set('air_quality_data', JSON.stringify(result), { ex: 900 });
    return result;
  } catch (error) {
    console.error('AQI API Error:', error);
    throw error;
  }
}

async function fetchCampusAlerts() {
  try {
    // Check cache first
    const cachedData = await redis.get('campus_alerts_data');
    if (cachedData) {
      return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
    }

    const response = await fetch('https://bso.ucla.edu/', {
      next: { revalidate: 900 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const alerts: any[] = [];

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Extract emergency banner
    const emergencyBanner = $('#block-siteden-surface-sitewidealert .bsoalert--error').text().trim();
    if (emergencyBanner) {
      alerts.push({
        id: 'emergency-banner',
        title: emergencyBanner,
        date: new Date().toISOString(),
        link: 'https://bso.ucla.edu',
        type: 'emergency',
        categories: ['Emergency'],
        summary: emergencyBanner
      });
    }

    // Extract articles
    $('article.node--type-sf-article').each((_, article) => {
      const $article = $(article);
      
      const titleElement = $article.find('.article__title a .field--name-title');
      const title = titleElement.text().trim();
      const link = 'https://bso.ucla.edu' + $article.find('.article__title a').attr('href');
      const dateElement = $article.find('.article__meta time');
      const date = dateElement.attr('datetime') || dateElement.text().trim();
      const categories = $article.find('.category-brand__term')
        .map((_, el) => $(el).text().trim())
        .get();
      const summary = $article.find('.article__summary').text().trim();

      let type = 'info';
      const lowerTitle = title.toLowerCase();
      const lowerSummary = summary.toLowerCase();
      const hasWildfire = categories.some(cat => cat.toLowerCase().includes('wildfire'));
      const hasEmergency = categories.some(cat => cat.toLowerCase().includes('emergency'));

      if (
        hasEmergency || 
        lowerTitle.includes('emergency') || 
        lowerTitle.includes('evacuat') ||
        lowerSummary.includes('emergency') ||
        lowerSummary.includes('evacuat')
      ) {
        type = 'emergency';
      } else if (
        hasWildfire ||
        lowerTitle.includes('fire') ||
        lowerTitle.includes('smoke') ||
        lowerTitle.includes('air quality') ||
        lowerSummary.includes('fire') ||
        lowerSummary.includes('smoke') ||
        lowerSummary.includes('air quality')
      ) {
        type = 'warning';
      }

      if (new Date(date) >= threeDaysAgo) {
        alerts.push({
          id: Buffer.from(link).toString('base64'),
          title: title.length > 25 ? `${title.slice(0, 25)}...` : title,
          date,
          link,
          type,
          categories,
          summary
        });
      }
    });

    // Cache for 15 minutes
    await redis.set('campus_alerts_data', JSON.stringify(alerts), { ex: 900 });
    return alerts;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
}

export async function GET() {
  try {
    // Fetch both data sources concurrently
    const [airQualityData, campusAlerts] = await Promise.all([
      fetchAirQualityData(),
      fetchCampusAlerts()
    ]);

    return NextResponse.json({
      airQuality: airQualityData,
      campusAlerts: campusAlerts
    });
  } catch (error) {
    console.error('Combined API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data',
        airQuality: null,
        campusAlerts: []
      },
      { status: 500 }
    );
  }
} 