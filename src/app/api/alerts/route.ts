import { NextResponse } from 'next/server';

// not currently used

export const runtime = 'edge';

interface Alert {
  id: string;
  type: 'emergency' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

interface AlertRequest {
  type: 'emergency' | 'warning' | 'info';
  message: string;
}

// In a real app, this would come from a database
let mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'emergency',
    message: 'Active fire reported near Bel Air. Stay alert and follow evacuation orders if issued.',
    timestamp: new Date()
  },
  {
    id: '2',
    type: 'warning',
    message: 'Poor air quality expected due to nearby fires. Consider limiting outdoor activities.',
    timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
  },
  {
    id: '3',
    type: 'info',
    message: 'Emergency response teams conducting fire prevention measures in North Campus.',
    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
  }
];

export async function GET() {
  try {
    // In a real app, fetch from:
    // - UCLA Emergency Management API
    // - LA County Emergency Alert System
    // - CalFire Alerts
    // For now, return mock data
    return NextResponse.json(mockAlerts);
  } catch (error) {
    console.error('Alerts API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as AlertRequest;
    
    // Validate required fields
    if (!data.type || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate alert type
    if (!['emergency', 'warning', 'info'].includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid alert type' },
        { status: 400 }
      );
    }

    // Create new alert
    const newAlert: Alert = {
      id: Date.now().toString(),
      type: data.type,
      message: data.message,
      timestamp: new Date()
    };

    // In a real app, save to database
    mockAlerts = [newAlert, ...mockAlerts].slice(0, 10); // Keep last 10 alerts

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Create Alert Error:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
} 