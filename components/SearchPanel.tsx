'use client';

import { useState } from 'react';

export type SearchParams = {
  query: string;
  type: string;
  radius: number;
  location: string;
  useDeviceLocation: boolean;
};

export type SearchPanelProps = {
  loading: boolean;
  onSearch: (params: SearchParams) => void;
};

const COMMON_BUSINESS_TYPES = [
  { label: 'Coffee Shops', value: 'cafe' },
  { label: 'Restaurants', value: 'restaurant' },
  { label: 'Real Estate', value: 'real_estate_agency' },
  { label: 'Marketing Agencies', value: 'marketing_agency' },
  { label: 'Gyms', value: 'gym' },
  { label: 'Hotels', value: 'lodging' },
  { label: 'Law Firms', value: 'lawyer' },
  { label: 'Dentists', value: 'dentist' }
];

export function SearchPanel({ loading, onSearch }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [radius, setRadius] = useState(3000);
  const [location, setLocation] = useState('San Francisco, CA');
  const [useDeviceLocation, setUseDeviceLocation] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch({ query, type, radius, location, useDeviceLocation });
  };

  return (
    <form className="search-panel" onSubmit={handleSubmit}>
      <div className="search-panel__group">
        <label htmlFor="query">What are you looking for?</label>
        <input
          id="query"
          placeholder="e.g. plumbing, digital marketing, dentists"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="search-panel__group">
        <label htmlFor="type">Business type (optional)</label>
        <div className="search-panel__type-row">
          <select
            id="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">Any business</option>
            {COMMON_BUSINESS_TYPES.map((business) => (
              <option key={business.value} value={business.value}>
                {business.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="search-panel__clear"
            onClick={() => setType('')}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="search-panel__group">
        <label htmlFor="location">Search around</label>
        <div className="search-panel__type-row">
          <input
            id="location"
            placeholder="City, address, ZIP code"
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              setUseDeviceLocation(false);
            }}
          />
          <button
            type="button"
            className={
              useDeviceLocation
                ? 'search-panel__geo search-panel__geo--active'
                : 'search-panel__geo'
            }
            onClick={() => setUseDeviceLocation((current) => !current)}
            title="Use your current location"
          >
            📍
          </button>
        </div>
      </div>

      <div className="search-panel__group">
        <label htmlFor="radius">Search radius</label>
        <div className="search-panel__radius">
          <input
            id="radius"
            type="range"
            min={500}
            max={10000}
            step={500}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
          />
          <span>{Math.round(radius / 1000)} km</span>
        </div>
      </div>

      <button className="search-panel__submit" type="submit" disabled={loading}>
        {loading ? 'Searching…' : 'Find Leads'}
      </button>
    </form>
  );
}
