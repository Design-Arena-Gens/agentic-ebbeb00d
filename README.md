# Lead Finder with Google Maps

A Next.js application for sourcing local business leads with an interactive Google Map, configurable search filters, and enriched contact details powered by the Google Places API.

## Features

- Search for businesses by keyword, category, and radius
- Toggle between typed locations and the visitor's current device location
- Visualize leads on a Google Map with interactive markers
- Inspect lead details including address, phone, website, rating, and review volume
- Responsive layout optimized for desktop and tablet usage

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file and supply Google Maps API credentials. The same key can be used for both values if it has Places, Geocoding, and Maps JavaScript API access.

```
GOOGLE_MAPS_API_KEY=your_server_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_client_key
```

> `GOOGLE_MAPS_API_KEY` is used server-side for Places and Geocoding requests. `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is exposed to the browser for rendering the map.

### 3. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000` to explore the app.

### Production build

```bash
npm run build
npm start
```

## Project Structure

```
app/                  # App Router pages and API routes
components/           # UI building blocks
lib/                  # Shared utilities
public/               # Static assets
styles/               # Global styling assets
```

## Deployment

The project is optimized for Vercel. Ensure the environment variables above are configured in the Vercel dashboard before deploying.

## Notes

- Google Maps APIs incur usage costs. Monitor quota and permissions for your API keys.
- The Places Details endpoint is called for the top results to enrich the lead list; adjust the limit in `app/api/leads/route.ts` as needed.

Enjoy finding high-intent local leads!
