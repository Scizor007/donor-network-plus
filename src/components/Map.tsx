import React, { useEffect, useRef } from 'react';
import L, { Map as LeafletMap, LayerGroup } from 'leaflet';

// Ensure default marker icons work
const ensureLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  location: string;
  distance: string;
  lastDonation: string;
  verified: boolean;
  available: boolean;
  phone: string;
  coordinates: [number, number];
}

interface EmergencyLocation {
  id: string;
  name: string;
  type: 'hospital' | 'blood_bank';
  address: string;
  phone: string;
  coordinates: [number, number];
  isOpen24h: boolean;
}

interface MapProps {
  donors: Donor[];
  emergencyLocations: EmergencyLocation[];
  center?: [number, number];
  zoom?: number;
}

const Map: React.FC<MapProps> = ({
  donors,
  emergencyLocations,
  center = [40.7128, -74.0060],
  zoom = 12,
}) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    ensureLeafletIcons();

    if (containerRef.current && !mapRef.current) {
      // Initialize map
      mapRef.current = L.map(containerRef.current).setView(center, zoom);

      // OSM tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
    };
    // We only want to run this once on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center/zoom when props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Render markers whenever data changes
  useEffect(() => {
    if (!mapRef.current) return;

    const layer = markersLayerRef.current ?? L.layerGroup().addTo(mapRef.current);
    // Clear existing markers
    layer.clearLayers();

    // Donor markers
    donors.forEach((donor) => {
      const marker = L.marker(donor.coordinates, {
        title: `${donor.name} (${donor.bloodGroup})`,
      });
      const html = `
        <div style="min-width:180px">
          <h3 style="margin:0;font-weight:600;font-size:0.9rem">${donor.name}</h3>
          <p style="margin:4px 0;color:#555;font-size:0.75rem">${donor.location}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0">
            <span style="padding:2px 6px;border-radius:6px;background:${donor.available ? '#16a34a' : '#6b7280'};color:white;font-size:0.7rem">${donor.bloodGroup}</span>
            <span style="font-size:0.7rem;color:${donor.available ? '#16a34a' : '#6b7280'}">${
              donor.available ? 'Available' : 'Unavailable'
            }</span>
          </div>
          <p style="margin:0;color:#555;font-size:0.75rem">${donor.distance} away</p>
          <p style="margin:0;color:#555;font-size:0.75rem">Last donation: ${donor.lastDonation}</p>
        </div>
      `;
      marker.bindPopup(html);
      marker.addTo(layer);
    });

    // Emergency markers
    emergencyLocations.forEach((loc) => {
      const marker = L.marker(loc.coordinates, {
        title: `${loc.name}`,
        icon: L.divIcon({
          className: 'emergency-icon',
          html: `<div style="background:#ef4444;border-radius:50%;width:18px;height:18px;border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.1)"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      });
      const html = `
        <div style="min-width:180px">
          <h3 style="margin:0;font-weight:600;font-size:0.9rem">${loc.name}</h3>
          <p style="margin:4px 0;color:#555;font-size:0.75rem">${
            loc.type === 'hospital' ? '🏥 Hospital' : '🩸 Blood Bank'
          }</p>
          <p style="margin:0 0 6px 0;color:#555;font-size:0.75rem">${loc.address}</p>
          <p style="margin:0 0 4px 0;color:#555;font-size:0.75rem">📞 ${loc.phone}</p>
          <p style="margin:0;color:${loc.isOpen24h ? '#16a34a' : '#ea580c'};font-size:0.75rem">${
            loc.isOpen24h ? '24/7 Open' : 'Limited Hours'
          }</p>
        </div>
      `;
      marker.bindPopup(html);
      marker.addTo(layer);
    });

    markersLayerRef.current = layer;
  }, [donors, emergencyLocations]);

  return <div ref={containerRef} className="w-full h-96 rounded-lg overflow-hidden shadow-lg" />;
};

export default Map;