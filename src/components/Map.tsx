import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in React Leaflet
const fixLeafletIcons = () => {
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

// Custom icons for different marker types
const donorIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNkYzI2MjYiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0yMC44NCA0LjYxYTUuNSA1LjUgMCAwIDAtNy43OCAwTDEyIDUuNjdsLTEuMDYtMS4wNmE1LjUgNS41IDAgMCAwLTcuNzggNy43OGwxLjA2IDEuMDZMMTIgMjEuMjNsNy43OC03Ljc4IDEuMDYtMS4wNmE1LjUgNS41IDAgMCAwIDAtNy43OHoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const emergencyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNlZjQ0NDQiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Im0xMiAyIDMuMDkgNi4yNkwyMSA5bC00Ljk1IDQuOTVMMTggMjBsLTYtMy4yN0w2IDIwbDEuMDUtNi4wNUwzIDlsNS45MS0uNzRMMTIgMnoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Map: React.FC<MapProps> = ({ 
  donors, 
  emergencyLocations, 
  center = [40.7128, -74.0060], // Default to NYC coordinates
  zoom = 12 
}) => {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {donors.map((donor) => (
          <Marker
            key={`donor-${donor.id}`}
            position={donor.coordinates}
            icon={donorIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{donor.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{donor.location}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                    donor.available ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {donor.bloodGroup}
                  </span>
                  <span className={`text-xs ${
                    donor.available ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {donor.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{donor.distance} away</p>
                <p className="text-xs text-gray-600">Last donation: {donor.lastDonation}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {emergencyLocations.map((location) => (
          <Marker
            key={`emergency-${location.id}`}
            position={location.coordinates}
            icon={emergencyIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{location.name}</h3>
                <p className="text-xs text-gray-600 mb-1">
                  {location.type === 'hospital' ? '🏥 Hospital' : '🩸 Blood Bank'}
                </p>
                <p className="text-xs text-gray-600 mb-2">{location.address}</p>
                <p className="text-xs text-gray-600 mb-1">📞 {location.phone}</p>
                <p className={`text-xs ${location.isOpen24h ? 'text-green-600' : 'text-orange-600'}`}>
                  {location.isOpen24h ? '24/7 Open' : 'Limited Hours'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;