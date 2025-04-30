import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Rectangle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapDisplayProps {
  center: { lat: number; lng: number };
  markers: { lat: number; lng: number; id: string; name: string }[];
  height?: string;
  zoom?: number;
  boundary?: [number, number, number, number] | null; // [south, west, north, east]
  onClick?: (lat: number, lng: number) => void;
}

function ChangeView({ center, zoom }: { center: { lat: number; lng: number }, zoom: number }) {
  const map = useMap();
  const isMounted = useRef(true);
  
  useEffect(() => {
    if (isMounted.current) {
      map.setView(center, zoom, { animate: true });
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [center, zoom, map]);
  
  return null;
}

function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  const isMounted = useRef(true);
  
  const map = useMapEvents({
    click: (e: any) => {
      if (onClick && isMounted.current) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return null;
}

export default function MapDisplay({ center, markers = [], height = "400px", zoom = 10, boundary, onClick }: MapDisplayProps) {
  // Rectangle bounds: [[south, west], [north, east]]
  const bounds = boundary ? [
    [boundary[0], boundary[1]],
    [boundary[2], boundary[3]]
  ] : null;

  // Create a stable center prop object to prevent unnecessary re-renders
  const stableCenter = {
    lat: center?.lat || 0,
    lng: center?.lng || 0
  };

  // Ensure we have valid coordinates
  if (isNaN(stableCenter.lat) || isNaN(stableCenter.lng)) {
    stableCenter.lat = 0;
    stableCenter.lng = 0;
  }

  return (
    <div style={{ height }}>
      <MapContainer
        center={[stableCenter.lat, stableCenter.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        {...({} as any)}
      >
        <ChangeView center={stableCenter} zoom={zoom} />
        {onClick && <MapClickHandler onClick={onClick} />}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          {...({} as any)}
        />
        {markers.map(marker => {
          // Ensure we have valid marker coordinates
          const lat = isNaN(marker.lat) ? 0 : marker.lat;
          const lng = isNaN(marker.lng) ? 0 : marker.lng;
          
          return (
            <Marker key={marker.id} position={[lat, lng]}>
              <Popup>{marker.name}</Popup>
            </Marker>
          );
        })}
        {bounds && (
          <Rectangle bounds={bounds as [[number, number], [number, number]]} pathOptions={{ color: 'blue', weight: 2 }} />
        )}
      </MapContainer>
    </div>
  );
}