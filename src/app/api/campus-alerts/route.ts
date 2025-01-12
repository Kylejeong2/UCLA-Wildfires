import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'edge';

export async function GET() {
  try {
    const response = await fetch('https://bso.ucla.edu/', {
      next: { revalidate: 900 } // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const alerts = [];

    // Find all article elements within the views-field-rendered-entity
    $('.views-field-rendered-entity article').each((_, article) => {
      const $article = $(article);
      
      // Extract title and link
      const titleElement = $article.find('.article__title a');
      const title = titleElement.find('.field--name-title').text().trim();
      const link = 'https://bso.ucla.edu' + titleElement.attr('href');

      // Extract date
      const dateElement = $article.find('.field--name-created time');
      const date = dateElement.attr('datetime') || dateElement.text().trim();

      // Extract categories
      const categories = $article.find('.category-brand__term')
        .map((_, el) => $(el).text().trim())
        .get();

      // Extract summary
      const summary = $article.find('.article__summary').text().trim();

      // Determine alert type based on content and categories
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

      alerts.push({
        id: Buffer.from(link).toString('base64'),
        title,
        date,
        link,
        type,
        categories,
        summary
      });
    });

    // If no articles found, check for emergency banner
    if (alerts.length === 0) {
      const emergencyBanner = $('.emergency-banner').text().trim();
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
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json([], { status: 500 });
  }
} 