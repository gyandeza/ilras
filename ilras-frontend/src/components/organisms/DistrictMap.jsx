import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { getBandColor } from '../../lib/ilri.js';

function markerIcon(color, size = 26) {
  return L.divIcon({
    className: 'district-marker',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};
      border:3px solid #fff;box-shadow:0 2px 6px rgba(16,24,40,0.35);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ districts }) {
  const map = useMap();
  useEffect(() => {
    if (districts.length > 1) {
      const bounds = districts.map((d) => [d.lat, d.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [districts, map]);
  return null;
}

/**
 * @param {Array} districts - districts with {id, name, lat, lng, score, band, geo_precision}
 * @param {Function} onMarkerClick - optional, called with district id on marker click
 * @param {number} zoom - initial zoom when only one district present
 */
export default function DistrictMap({ districts, onMarkerClick, zoom = 11, height = 260 }) {
  const valid = districts.filter((d) => d.lat != null && d.lng != null);
  if (valid.length === 0) {
    return (
      <div className="district-map__empty" style={{ height }}>
        Lokasi tidak tersedia
      </div>
    );
  }

  const center = [valid[0].lat, valid[0].lng];
  const hasApproximate = valid.some((d) => d.geo_precision !== 'surveyed');

  return (
    <div className="district-map">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height, width: '100%', borderRadius: 'var(--radius-card)' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {valid.length > 1 && <FitBounds districts={valid} />}
        {valid.map((d) => (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={markerIcon(getBandColor(d.band))}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(d.id) } : undefined}
          >
            <Popup>
              <strong>{d.name}</strong>
              <br />
              Skor ILRI: {d.score?.toFixed(1)} ({d.band})
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {hasApproximate && (
        <div className="district-map__disclaimer">
          Lokasi bersifat perkiraan (titik pusat), bukan batas administratif hasil survei.
        </div>
      )}
    </div>
  );
}
