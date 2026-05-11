import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface NacexMapProps {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

// Component to handle map view updates
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  map.setView(center, 16);
  return null;
};

export const NacexMap: React.FC<NacexMapProps> = ({ lat, lng, name, address }) => {
  if (!lat || !lng) return null;

  const position: [number, number] = [lat, lng];

  return (
    <div className="h-[250px] w-full rounded-3xl overflow-hidden border-2 border-primary/20 shadow-inner mt-4 animate-in fade-in zoom-in-95 duration-500 relative z-10">
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="p-1">
              <p className="text-[10px] font-black uppercase tracking-tight m-0">{name}</p>
              <p className="text-[9px] text-gray-500 uppercase m-0 mt-1">{address}</p>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} 
                target="_blank" 
                rel="noreferrer"
                className="text-[9px] text-primary font-bold uppercase mt-2 block hover:underline"
              >
                Cómo llegar
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};
