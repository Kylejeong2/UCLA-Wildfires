# UCLA Wildfire Watch Dashboard

A real-time wildfire monitoring and emergency response dashboard for the UCLA campus and surrounding areas.

## Features

- **Live Fire Map**: Interactive map showing active fires, fire perimeters, thermal hotspots, and evacuation zones around UCLA using ArcGIS
- **Air Quality Monitoring**: Real-time AQI data with historical trends and pollutant breakdowns
- **Campus Alerts**: Emergency notifications and updates from UCLA Emergency Management
- **Live Camera Feeds**: Access to AlertCalifornia camera feeds monitoring fire-prone areas
- **Emergency Resources**: Quick access to emergency services, evacuation centers, and medical facilities

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- TailwindCSS
- ArcGIS JavaScript API
- Chart.js
- Cloudflare Pages for deployment

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with required API keys:

```bash
AIRNOW_API_KEY=your_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/src/app`: Next.js app router pages and API routes
- `/src/components`: React components including FireMap, AirQuality, and CampusAlerts
- `/public`: Static assets and images

## API Endpoints

- `/api/air-quality`: Fetches real-time AQI data for UCLA area
- `/api/alerts`: Manages campus emergency alerts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT

## Credits

- Fire data provided by [fire.ca.gov](https://www.fire.ca.gov/)
- Camera feeds from [AlertCalifornia](https://cameras.alertcalifornia.org)
- Air quality data from [AirNow API](https://www.airnowapi.org/)