'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from '@react-google-maps/api';
import type { Lead } from '../types/lead';

export type MapViewProps = {
  center: google.maps.LatLngLiteral;
  leads: Lead[];
  selectedLeadId?: string;
  onSelectLead?: (lead: Lead | null) => void;
  onCenterChanged?: (center: google.maps.LatLngLiteral) => void;
};

const DEFAULT_ZOOM = 13;

export function MapView({ center, leads, selectedLeadId, onSelectLead, onCenterChanged }: MapViewProps) {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'lead-finder-google-map',
    googleMapsApiKey: apiKey ?? '',
    libraries: ['places']
  });

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.placeId === selectedLeadId) ?? null,
    [leads, selectedLeadId]
  );

  const handleOnLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const handleOnUnmount = useCallback(() => {
    setMapInstance(null);
  }, []);

  const handleCenterChanged = useCallback(() => {
    if (!mapInstance || !onCenterChanged) {
      return;
    }
    const newCenter = mapInstance.getCenter();
    if (!newCenter) {
      return;
    }
    onCenterChanged({ lat: newCenter.lat(), lng: newCenter.lng() });
  }, [mapInstance, onCenterChanged]);

  if (!apiKey) {
    return (
      <div className="map-placeholder">
        <strong>Missing Google Maps API key.</strong>
        <p>Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to render the map.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="map-placeholder">
        <strong>Failed to load Google Maps.</strong>
        <p>{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="map-placeholder">
        <p>Loading map…</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="map-container"
      center={center}
      zoom={DEFAULT_ZOOM}
      options={{ streetViewControl: false, fullscreenControl: false, mapTypeControl: false }}
      onLoad={handleOnLoad}
      onUnmount={handleOnUnmount}
      onDragEnd={handleCenterChanged}
      onZoomChanged={handleCenterChanged}
    >
      {leads.map((lead) => (
        <Marker
          key={lead.placeId}
          position={lead.location}
          onClick={() => onSelectLead?.(lead)}
          label={lead.name[0]?.toUpperCase() ?? ''}
        />
      ))}
      {selectedLead && (
        <InfoWindow
          position={selectedLead.location}
          onCloseClick={() => onSelectLead?.(null)}
        >
          <div className="map-infowindow">
            <h3>{selectedLead.name}</h3>
            <p>{selectedLead.address}</p>
            {selectedLead.phoneNumber && <p>{selectedLead.phoneNumber}</p>}
            {selectedLead.website && (
              <a href={selectedLead.website} target="_blank" rel="noreferrer">
                Visit website
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
