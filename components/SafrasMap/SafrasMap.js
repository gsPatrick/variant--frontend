'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './SafrasMap.module.css';

function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson) return;
    map.invalidateSize();
    const layer = L.geoJSON(geojson);
    map.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 15 });
  }, [geojson, map]);
  return null;
}

function resColor(mpa) {
  if (mpa == null) return null;
  if (mpa < 1.2) return '#22c55e';
  if (mpa < 2) return '#eab308';
  if (mpa < 2.8) return '#f97316';
  return '#ef4444';
}
function resLabel(mpa) {
  if (mpa == null) return '';
  if (mpa < 1.2) return 'Baixa';
  if (mpa < 2) return 'Moderada';
  if (mpa < 2.8) return 'Alta';
  return 'Crítica';
}

export default function SafrasMap({ geojson, center, color, marker, info }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'variant-pin-wrap',
        html: `<div class="variant-pin" style="--pin:${color}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      }),
    [color]
  );

  // Contorno amarelo vibrante pulsante; o preenchimento mantém o tom da cultura.
  const style = useMemo(
    () => ({ color: '#facc15', weight: 3, opacity: 1, fillColor: color, fillOpacity: 0.1, className: 'talhao-pulse' }),
    [color]
  );

  const peak = info?.resistancePeak;

  return (
    <MapContainer center={center} zoom={14} className={styles.map} scrollWheelZoom>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri — World Imagery"
        maxZoom={21}
        maxNativeZoom={17}
      />
      <GeoJSON
        key={JSON.stringify(geojson)}
        data={geojson}
        style={style}
        onEachFeature={(feature, layer) => {
          layer.on('mouseover', () => layer.setStyle({ weight: 4, fillOpacity: 0.22 }));
          layer.on('mouseout', () => layer.setStyle({ weight: 3, fillOpacity: 0.1 }));
        }}
      >
        {info && (
          <Tooltip sticky className="variant-tip">
            {info.name && <span className={styles.tipTitle}>{info.name}</span>}
            {info.areaHa != null && <span className={styles.tipLine}>Área: {Number(info.areaHa).toFixed(2)} ha</span>}
            {info.cropLabel && (
              <span className={styles.tipLine}>{info.cropLabel}{info.variety ? ` · ${info.variety}` : ''}</span>
            )}
            {peak != null && (
              <span className={styles.tipLine}>
                <span className={styles.tipDot} style={{ background: resColor(peak) }} />
                Resistência (pico): {Number(peak).toFixed(1)} MPa · {resLabel(peak)}
              </span>
            )}
          </Tooltip>
        )}
      </GeoJSON>
      {marker && (
        <Marker position={center} icon={icon}>
          <Tooltip permanent direction="top" offset={[0, -10]} className="variant-tip">
            {marker.variety}
          </Tooltip>
          <Popup className="variant-popup">
            <strong>{marker.cropLabel}</strong>
            <br />
            Variedade: {marker.variety}
          </Popup>
        </Marker>
      )}
      <FitBounds geojson={geojson} />
    </MapContainer>
  );
}
