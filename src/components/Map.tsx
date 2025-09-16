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
  type: 'hospital' | 'blood_bank' | 'clinic' | 'emergency_center';
  address: string;
  phone: string;
  coordinates: [number, number];
  isOpen24h: boolean;
  services?: string[];
}

interface BloodCamp {
  id: string;
  name: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  coordinates: [number, number];
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  expected_units: number;
  contact_phone: string;
  organizer_name: string;
}

interface MapProps {
  donors: Donor[];
  emergencyLocations: EmergencyLocation[];
  bloodCamps: BloodCamp[];
  userLocation?: [number, number] | null;
  center?: [number, number];
  zoom?: number;
}

const Map: React.FC<MapProps> = ({
  donors,
  emergencyLocations,
  bloodCamps,
  userLocation,
  center = [20.5937, 78.9629],
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

    // User location marker (blue with pulsing animation)
    if (userLocation) {
      const userMarker = L.marker(userLocation, {
        title: 'Your Location',
        icon: L.divIcon({
          className: 'user-location-icon',
          html: `<div style="background:#3b82f6;border-radius:50%;width:20px;height:20px;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;animation:pulse 2s infinite">📍</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        }),
      });
      const userHtml = `
        <div style="min-width:180px">
          <h3 style="margin:0;font-weight:600;font-size:0.9rem;color:#3b82f6">📍 Your Location</h3>
          <p style="margin:4px 0;color:#555;font-size:0.75rem">You are here</p>
        </div>
      `;
      userMarker.bindPopup(userHtml);
      userMarker.addTo(layer);
    }

    // Donor markers (minimal popup with essential info)
    donors.forEach((donor) => {
      const marker = L.marker(donor.coordinates, {
        title: `${donor.name} (${donor.bloodGroup})`,
        icon: L.divIcon({
          className: 'donor-icon',
          html: `
            <div style="
              background: ${donor.available ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6b7280, #4b5563)'};
              border-radius: 50%;
              width: 24px;
              height: 24px;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 2px ${donor.available ? 'rgba(16,185,129,0.2)' : 'rgba(107,114,128,0.2)'};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
              position: relative;
            ">
              ${donor.bloodGroup}
              ${donor.verified ? '<div style="position:absolute;top:-2px;right:-2px;background:#fbbf24;border-radius:50%;width:8px;height:8px;border:1px solid white;"></div>' : ''}
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      });
      const html = `
        <div style="min-width:200px">
          <h3 style="margin:0;font-weight:600;font-size:0.95rem">${donor.name}</h3>
          <div style="display:flex;align-items:center;gap:8px;margin:6px 0">
            <span style="padding:2px 6px;border-radius:6px;background:#ef4444;color:white;font-size:0.75rem;font-weight:600">${donor.bloodGroup}</span>
            ${donor.verified ? '<span style="color:#16a34a;font-size:0.7rem">✓ Verified</span>' : ''}
          </div>
          ${donor.phone ? `<p style=\"margin:0;color:#555;font-size:0.8rem\">📞 ${donor.phone}</p>` : ''}
        </div>
      `;
      marker.bindPopup(html);
      marker.addTo(layer);
    });

    // Blood camp markers (enhanced with better styling)
    bloodCamps.forEach((camp) => {
      const isUpcoming = camp.status === 'upcoming';
      const isOngoing = camp.status === 'ongoing';
      const campColor = isOngoing ? '#f59e0b' : isUpcoming ? '#3b82f6' : '#6b7280';
      const campGradient = isOngoing ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                           isUpcoming ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                           'linear-gradient(135deg, #6b7280, #4b5563)';
      
      const marker = L.marker(camp.coordinates, {
        title: `${camp.name}`,
        icon: L.divIcon({
          className: 'camp-icon',
          html: `
            <div style="
              background: ${campGradient};
              border-radius: 6px;
              width: 28px;
              height: 28px;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 2px ${campColor}33;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              position: relative;
              transform: rotate(-15deg);
            ">
              🏥
              <div style="
                position: absolute;
                top: -4px;
                right: -4px;
                background: ${campColor};
                border-radius: 50%;
                width: 10px;
                height: 10px;
                border: 2px solid white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 6px;
                font-weight: bold;
              ">
                ${isOngoing ? '●' : '○'}
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      });
      
      const startDate = new Date(camp.start_date).toLocaleDateString();
      const endDate = new Date(camp.end_date).toLocaleDateString();
      
      const html = `
        <div style="min-width:220px">
          <h3 style="margin:0;font-weight:600;font-size:0.9rem">${camp.name}</h3>
          <p style="margin:4px 0;color:#555;font-size:0.75rem">🏥 Blood Donation Camp</p>
          <p style="margin:0 0 6px 0;color:#555;font-size:0.75rem">${camp.venue}, ${camp.city}</p>
          <p style="margin:0 0 4px 0;color:#555;font-size:0.75rem">📅 ${startDate} - ${endDate}</p>
          <p style="margin:0 0 4px 0;color:#555;font-size:0.75rem">🎯 Expected: ${camp.expected_units} units</p>
          <p style="margin:0 0 4px 0;color:#555;font-size:0.75rem">📞 ${camp.contact_phone}</p>
          <p style="margin:0;color:${campColor};font-size:0.75rem;font-weight:600">${camp.status.toUpperCase()}</p>
        </div>
      `;
      marker.bindPopup(html);
      marker.addTo(layer);
    });

    // Emergency markers (enhanced with pulsing animation)
    emergencyLocations.forEach((loc) => {
      const marker = L.marker(loc.coordinates, {
        title: `${loc.name}`,
        icon: L.divIcon({
          className: 'emergency-icon',
          html: `
            <div style="
              background: linear-gradient(135deg, #ef4444, #dc2626);
              border-radius: 50%;
              width: 26px;
              height: 26px;
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(239,68,68,0.3), 0 0 0 3px rgba(239,68,68,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
              position: relative;
              animation: pulse 1.5s infinite;
            ">
              ${loc.type === 'hospital' ? '🏥' : 
                loc.type === 'blood_bank' ? '🩸' : 
                loc.type === 'clinic' ? '🏥' : '🚨'}
              <div style="
                position: absolute;
                top: -2px;
                right: -2px;
                background: #fbbf24;
                border-radius: 50%;
                width: 8px;
                height: 8px;
                border: 1px solid white;
                animation: blink 1s infinite;
              "></div>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        }),
      });
      
      const typeIcon = loc.type === 'hospital' ? '🏥' : 
                      loc.type === 'blood_bank' ? '🩸' : 
                      loc.type === 'clinic' ? '🏥' : '🚨';
      
      const html = `
        <div style="min-width:200px">
          <h3 style="margin:0;font-weight:600;font-size:0.9rem">${loc.name}</h3>
          <p style="margin:4px 0;color:#555;font-size:0.75rem">${typeIcon} ${loc.type.replace('_', ' ').toUpperCase()}</p>
          <p style="margin:0 0 6px 0;color:#555;font-size:0.75rem">${loc.address}</p>
          <p style="margin:0 0 4px 0;color:#555;font-size:0.75rem">📞 ${loc.phone}</p>
          <p style="margin:0;color:${loc.isOpen24h ? '#16a34a' : '#ea580c'};font-size:0.75rem">${
            loc.isOpen24h ? '24/7 Open' : 'Limited Hours'
          }</p>
          ${loc.services && loc.services.length > 0 ? `<p style="margin:4px 0;color:#555;font-size:0.7rem">Services: ${loc.services.join(', ')}</p>` : ''}
        </div>
      `;
      marker.bindPopup(html);
      marker.addTo(layer);
    });

    markersLayerRef.current = layer;
  }, [donors, emergencyLocations, bloodCamps, userLocation]);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-96 rounded-lg overflow-hidden shadow-lg" />;
};

export default Map;