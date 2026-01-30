'use client';

import { useCallback, useMemo, useState } from 'react';
import { MapView } from '../components/MapView';
import { LeadList } from '../components/LeadList';
import { SearchPanel, type SearchParams } from '../components/SearchPanel';
import type { Lead, LeadsResponse } from '../types/lead';

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };

async function getDeviceLocation(): Promise<GeolocationCoordinates | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

export default function LeadFinderPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [center, setCenter] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | undefined>();

  const activeLead = useMemo(
    () => leads.find((lead) => lead.placeId === selectedLeadId),
    [leads, selectedLeadId]
  );

  const handleSearch = useCallback(
    async ({ query, type, radius, location, useDeviceLocation }: SearchParams) => {
      setLoading(true);
      setError(null);

      try {
        let coordinates: { lat: number; lng: number } | undefined;

        if (useDeviceLocation) {
          const coords = await getDeviceLocation();
          if (coords) {
            coordinates = { lat: coords.latitude, lng: coords.longitude };
          }
        }

        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            type,
            radius,
            location,
            coordinates
          })
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Failed to load leads');
        }

        const data = (await response.json()) as LeadsResponse;
        setLeads(data.leads);
        setCenter(data.center);
        setSelectedLeadId(data.leads[0]?.placeId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSelectLead = useCallback((lead: Lead | null) => {
    setSelectedLeadId(lead?.placeId ?? undefined);
    if (lead) {
      setCenter(lead.location);
    }
  }, []);

  return (
    <main className="page">
      <header className="page__header">
        <div>
          <h1>Lead Finder</h1>
          <p>Find high-intent local leads with an interactive Google Map and business insights.</p>
        </div>
        <span className="page__badge">Maps powered by Google</span>
      </header>
      <section className="page__content">
        <div className="page__sidebar">
          <SearchPanel loading={loading} onSearch={handleSearch} />
          {error && <div className="page__error">{error}</div>}
          <LeadList leads={leads} onSelectLead={(lead) => handleSelectLead(lead)} selectedLeadId={selectedLeadId} />
        </div>
        <div className="page__map">
          <MapView
            center={activeLead?.location ?? center}
            leads={leads}
            selectedLeadId={selectedLeadId}
            onSelectLead={handleSelectLead}
            onCenterChanged={(newCenter) => setCenter(newCenter)}
          />
        </div>
      </section>
    </main>
  );
}
