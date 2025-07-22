# Repository Documentation

## Environment Requirements
- Node.js 18 or higher
- pnpm for workspace management (pnpm workspaces)

## Installation
```bash
pnpm install
```
Copy `server/.env.example` to `server/.env` and fill in `WAQI_TOKEN` and `PORT`.
`WAQI_TOKEN` can be obtained from <https://aqicn.org/data-platform/token/>, it's a 48-character token with free tier limits of 1 request/second and 1000 requests/day.

## Quality Checks
```bash
pnpm run lint && pnpm run test
```

## Local Development
```bash
pnpm run dev
```
This command starts both the backend (`ts-node-dev --project tsconfig.json --respawn ...`) and frontend (`vite`) simultaneously, with port mapping 5174 ↔ 4321.

## Technical Architecture

### Frontend
- React 18 with TypeScript
- State management with React Query (@tanstack/react-query)
- UI components with Tailwind CSS
- Interactive maps with Leaflet.js
- Data visualization with Recharts and react-circular-progressbar
- Vite for fast development and optimized builds

### Backend
- Express.js with TypeScript
- API rate limiting and caching
- Geospatial filtering for Thailand stations
- Error handling with Axios interceptors
- NodeCache for efficient data caching

### Key Features Implementation
- **Historical Data Views**: Implemented time-based data visualization (daily/weekly/monthly) with simulated data generation for extended time periods
- **Multiple Pollutant Tracking**: Dynamic pollutant selection and visualization for PM2.5, PM10, O₃, NO₂, SO₂, and CO
- **Map Visualization**: Interactive map with color-coded markers, tooltips, and multiple base map options
- **Anomaly Detection**: Automatic detection and highlighting of stations with unhealthy air quality levels (AQI > 150)
- **Responsive Design**: Adaptive layout for both desktop and mobile devices

## Minimum Diff Principle
When submitting code, follow the minimum diff-patch principle.

## Fix Strategy
When issues arise, first write or improve related tests to reproduce the bug, then make minimal changes while ensuring `pnpm run lint && pnpm run test` passes.

## Performance Considerations
- Frontend uses React Query for efficient data fetching and caching
- Backend implements NodeCache to reduce external API calls
- API rate limiting is handled to prevent exceeding WAQI API limits
- Lazy loading and conditional rendering for optimal UI performance

