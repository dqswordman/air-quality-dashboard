# Air Quality Dashboard

A React and Node.js application for monitoring air quality in Thailand. The frontend uses Vite, Tailwind, and Leaflet, while the backend is built with Express. All code is written in strict TypeScript. A valid `WAQI_TOKEN` is required to access the WAQI API. Free token rate limits: **1 request/second, 1000 requests/day**.

## Features

- Interactive map with real-time air quality data visualization
- Detailed station information and pollutant measurements
- Historical data viewing (daily, weekly, monthly)
- Multiple pollutant tracking (PM2.5, PM10, O₃, NO₂, SO₂, CO)
- Anomaly detection and alerts for unhealthy air quality levels
- Multiple base map options (Street, Satellite, Hybrid, Terrain)
- Responsive design for desktop and mobile devices
- Comprehensive air quality health information

## Dependencies

- Node.js 18+
- pnpm
- React 18
- Express 4

## Quick Start

```bash
pnpm install
cp server/.env.example server/.env
# Get a 48-character token from https://aqicn.org/data-platform/token/
# Open server/.env and fill in WAQI_TOKEN and PORT (port mapping 5174 ↔ 4321)
pnpm run dev
```
The frontend runs on `http://localhost:5174` by default, and the backend listens on `http://localhost:4321`. They are connected via proxy. Visit `http://localhost:5174` to preview the interface.

## Scripts

- `pnpm run dev`: Start both frontend and backend simultaneously
- `pnpm run lint`: Run ESLint checks
- `pnpm run test`: Run Vitest unit tests

### CI Example

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm run lint && pnpm run test
```

## Directory Structure

- `client/` Frontend source code
- `server/` Backend source code
- `tests/`  Unit tests

## User Guide

### Map Features
- Use the Day/Week/Month buttons at the top of the map to view different time periods of air quality data
- Click on any station marker to view detailed information
- Select different base maps using the layers control in the top-right corner
- Anomalous stations (AQI > 150) are highlighted with larger markers and warning indicators

### Data Panel
- View current air quality data with color-coded indicators
- Check forecast trends for various pollutants
- Access health recommendations based on current air quality levels
- Review detailed sensor information and status

## Contribution Guidelines

Pull requests are welcome. Please follow the minimum diff principle and ensure `pnpm run lint && pnpm run test` passes.

## Troubleshooting

- If the API returns a 502 error with the message `WAQI error`, check that your `WAQI_TOKEN` is correct.
- For data loading issues, check the network connectivity and API rate limits.
- Use the debug panel (accessible from the header) to check API health and test endpoints.

