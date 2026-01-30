import { NextResponse } from 'next/server';
import type { Lead } from '../../../types/lead';

const GOOGLE_BASE_URL = 'https://maps.googleapis.com/maps/api';
const MAX_RESULTS = 12;

type LeadsRequestBody = {
  query?: string;
  type?: string;
  radius?: number;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
};

type PlaceSearchResult = {
  place_id: string;
  name: string;
  formatted_address?: string;
  business_status?: string;
  geometry?: { location?: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
};

type PlaceDetailsResult = PlaceSearchResult & {
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
};

async function geocodeLocation(apiKey: string, location?: string) {
  if (!location) {
    return null;
  }

  const url = new URL(`${GOOGLE_BASE_URL}/geocode/json`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('address', location);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to geocode location');
  }

  const data = await response.json();
  if (!data.results?.length) {
    return null;
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

async function textSearch(apiKey: string, params: { query: string; radius?: number; location?: { lat: number; lng: number }; type?: string; }) {
  const url = new URL(`${GOOGLE_BASE_URL}/place/textsearch/json`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('query', params.query);
  if (params.location) {
    url.searchParams.set('location', `${params.location.lat},${params.location.lng}`);
  }
  if (params.radius) {
    url.searchParams.set('radius', String(params.radius));
  }
  if (params.type) {
    url.searchParams.set('type', params.type);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load leads');
  }

  return response.json();
}

async function nearbySearch(apiKey: string, params: { location: { lat: number; lng: number }; radius?: number; type?: string; keyword?: string; }) {
  const url = new URL(`${GOOGLE_BASE_URL}/place/nearbysearch/json`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('location', `${params.location.lat},${params.location.lng}`);
  url.searchParams.set('radius', String(params.radius ?? 3000));
  if (params.type) {
    url.searchParams.set('type', params.type);
  }
  if (params.keyword) {
    url.searchParams.set('keyword', params.keyword);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load leads');
  }

  return response.json();
}

async function fetchDetails(apiKey: string, placeId: string) {
  const url = new URL(`${GOOGLE_BASE_URL}/place/details/json`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set(
    'fields',
    [
      'formatted_address',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'business_status',
      'rating',
      'user_ratings_total',
      'geometry/location',
      'name',
      'place_id',
      'types'
    ].join(',')
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load lead details');
  }

  return response.json();
}

function toLead(result: PlaceDetailsResult): Lead {
  const location = result.geometry?.location ?? { lat: 0, lng: 0 };
  return {
    placeId: result.place_id,
    name: result.name,
    address: result.formatted_address ?? 'Address unavailable',
    phoneNumber: result.formatted_phone_number ?? result.international_phone_number,
    website: result.website,
    rating: result.rating,
    userRatingsTotal: result.user_ratings_total,
    businessStatus: result.business_status,
    types: result.types ?? [],
    primaryType: result.types?.[0],
    location
  };
}

export async function POST(request: Request) {
  try {
    const body: LeadsRequestBody = await request.json();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY is not configured' }, { status: 500 });
    }

    const radius = body.radius ? Math.min(Math.max(body.radius, 200), 50000) : 3000;

    const coordinates = body.coordinates ?? (await geocodeLocation(apiKey, body.location ?? ''));

    if (!coordinates) {
      return NextResponse.json({ error: 'Unable to determine search location' }, { status: 400 });
    }

    let searchResults: { results: PlaceSearchResult[] } = { results: [] };

    if (body.query) {
      searchResults = await textSearch(apiKey, {
        query: body.query,
        radius,
        location: coordinates,
        type: body.type
      });
    } else {
      searchResults = await nearbySearch(apiKey, {
        location: coordinates,
        radius,
        type: body.type,
        keyword: body.type ? undefined : body.location
      });
    }

    const limitedResults = (searchResults.results ?? []).slice(0, MAX_RESULTS);

    const detailedResults = await Promise.all(
      limitedResults.map(async (result) => {
        const details = await fetchDetails(apiKey, result.place_id);
        return details.result as PlaceDetailsResult;
      })
    );

    const leads = detailedResults.map(toLead).filter((lead) => Boolean(lead.placeId));

    return NextResponse.json({ leads, center: coordinates });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leads';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
