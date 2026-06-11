'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import styles from './AdminMap.module.css';

const EARTH = 6378137;
const rad = (d) => (d * Math.PI) / 180;
const DEFAULT_CENTER = [-13.0, -55.9];

function ringAreaM2(ring) {
  if (ring.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[(i + 1) % ring.length];
    total += (rad(lng2) - rad(lng1)) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((total * EARTH * EARTH) / 2);
}
const toHa = (m2) => m2 / 10000;

function circleRing(center, radius, n = 64) {
  const [lat, lng] = center;
  const ring = [];
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * 2 * Math.PI;
    ring.push([lng + (radius * Math.cos(a)) / (111320 * Math.cos(rad(lat))), lat + (radius * Math.sin(a)) / 110540]);
  }
  return ring;
}
function ringCentroid(ring) {
  const sum = ring.reduce((acc, [lng, lat]) => ({ x: acc.x + lng, y: acc.y + lat }), { x: 0, y: 0 });
  return { lng: sum.x / ring.length, lat: sum.y / ring.length };
}
function featureCollection(ring) {
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }] };
}
function firstRing(geojson) {
  let ring = null;
  const handle = (g) => {
    if (ring || !g) return;
    if (g.type === 'Polygon') ring = g.coordinates[0];
    else if (g.type === 'MultiPolygon') ring = g.coordinates[0][0];
  };
  if (geojson?.type === 'FeatureCollection') (geojson.features || []).forEach((f) => handle(f.geometry));
  else if (geojson?.type === 'Feature') handle(geojson.geometry);
  else handle(geojson);
  return ring;
}
function boundsOfGeoJSON(geojson) {
  const ring = firstRing(geojson);
  if (!ring) return null;
  let a = 90;
  let b = 180;
  let c = -90;
  let d = -180;
  ring.forEach(([lng, lat]) => {
    a = Math.min(a, lat);
    c = Math.max(c, lat);
    b = Math.min(b, lng);
    d = Math.max(d, lng);
  });
  return [[a, b], [c, d]];
}
function layerToRing(layer) {
  if (layer instanceof L.Circle) {
    const c = layer.getLatLng();
    return circleRing([c.lat, c.lng], layer.getRadius());
  }
  let latlngs = layer.getLatLngs ? layer.getLatLngs() : null;
  if (!latlngs) return null;
  while (Array.isArray(latlngs[0]) && !(latlngs[0] instanceof L.LatLng) && latlngs[0].lat === undefined) latlngs = latlngs[0];
  const arr = Array.isArray(latlngs) ? latlngs : [latlngs];
  const ring = arr.map((ll) => [ll.lng, ll.lat]);
  if (ring.length >= 1) ring.push([...ring[0]]);
  return ring;
}

function heatColor(mpa) {
  if (mpa < 1.2) return '#22c55e';
  if (mpa < 2) return '#eab308';
  if (mpa < 2.8) return '#f97316';
  return '#ef4444';
}

function MapView({ geojson, center, drawActive }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (drawActive) return;
    const bounds = boundsOfGeoJSON(geojson);
    if (bounds) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    else map.setView(center, 13);
  }, [geojson, center, map, drawActive]);
  return null;
}

const DRAW_STYLE = { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.12, weight: 2 };

function Geoman({ plot, center, drawActive, drawTool, drawMode, drawCmd, onArea, onSaveDraw }) {
  const map = useMap();
  const layerRef = useRef(null);

  function clearLayer() {
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
  }
  function reportArea() {
    const ring = layerRef.current ? layerToRing(layerRef.current) : null;
    onArea(ring ? toHa(ringAreaM2(ring)) : 0);
  }

  // Setup / teardown do modo de desenho.
  useEffect(() => {
    if (!drawActive || !map.pm) return undefined;
    map.pm.setGlobalOptions({ pathOptions: DRAW_STYLE, templineStyle: { color: '#22c55e' }, hintlineStyle: { color: '#22c55e', dashArray: '5,5' } });

    const ring = plot?.geometry ? firstRing(plot.geometry) : null;
    if (ring) {
      const latlngs = ring.map(([lng, lat]) => [lat, lng]);
      const poly = L.polygon(latlngs, DRAW_STYLE);
      poly.addTo(map);
      layerRef.current = poly;
      map.fitBounds(poly.getBounds(), { padding: [60, 60], maxZoom: 15 });
      reportArea();
    } else if (center) {
      // Sem contorno ainda: começa o desenho centrado na região da fazenda.
      map.setView(center, 14);
    }

    const onCreate = (e) => {
      if (layerRef.current && layerRef.current !== e.layer) map.removeLayer(layerRef.current);
      layerRef.current = e.layer;
      e.layer.on('pm:edit', reportArea);
      e.layer.on('pm:dragend', reportArea);
      reportArea();
    };
    map.on('pm:create', onCreate);
    if (layerRef.current) {
      layerRef.current.on('pm:edit', reportArea);
      layerRef.current.on('pm:dragend', reportArea);
    }

    return () => {
      map.off('pm:create', onCreate);
      map.pm.disableDraw();
      if (map.pm.disableGlobalEditMode) map.pm.disableGlobalEditMode();
      if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
      clearLayer();
      onArea(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawActive, plot]);

  // Aplica a interação ativa (desenhar / mover / editar).
  useEffect(() => {
    if (!drawActive || !map.pm) return;
    map.pm.disableDraw();
    if (map.pm.disableGlobalEditMode) map.pm.disableGlobalEditMode();
    if (map.pm.disableGlobalDragMode) map.pm.disableGlobalDragMode();
    if (drawMode === 'drag') map.pm.enableGlobalDragMode();
    else if (drawMode === 'edit') map.pm.enableGlobalEditMode();
    else map.pm.enableDraw(drawTool === 'circle' ? 'Circle' : 'Polygon', { finishOn: 'dblclick' });
  }, [drawActive, drawTool, drawMode, map]);

  // Comandos (limpar / salvar).
  useEffect(() => {
    if (!drawCmd || !drawActive) return;
    if (drawCmd.name === 'clear') {
      clearLayer();
      onArea(0);
    } else if (drawCmd.name === 'save') {
      const ring = layerRef.current ? layerToRing(layerRef.current) : null;
      if (ring && ring.length >= 4) {
        onSaveDraw({ geometry: featureCollection(ring), centroid: ringCentroid(ring), area: toHa(ringAreaM2(ring)) });
      } else {
        onSaveDraw(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawCmd]);

  return null;
}

function pickCenter(plot) {
  if (!plot) return DEFAULT_CENTER;
  if (plot.centroidLat != null && plot.centroidLng != null) return [Number(plot.centroidLat), Number(plot.centroidLng)];
  if (plot.farmCentroidLat != null && plot.farmCentroidLng != null) return [Number(plot.farmCentroidLat), Number(plot.farmCentroidLng)];
  return DEFAULT_CENTER;
}

export default function AdminMap({ plot, drawActive, drawTool, drawMode, drawCmd, heat, onArea, onSaveDraw }) {
  const center = pickCenter(plot);
  const geojson = plot?.geometry && (plot.geometry.features?.length || plot.geometry.type) ? plot.geometry : null;

  return (
    <div className={styles.wrap}>
      <MapContainer center={center} zoom={13} className={styles.map} scrollWheelZoom>
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri — World Imagery"
          maxZoom={21}
          maxNativeZoom={17}
        />

        {geojson && !drawActive && (
          <GeoJSON
            key={JSON.stringify(geojson)}
            data={geojson}
            style={{ color: '#facc15', weight: 3, fillColor: '#facc15', fillOpacity: 0.08, className: 'talhao-pulse' }}
            onEachFeature={(feature, layer) => {
              layer.on('mouseover', () => layer.setStyle({ color: '#fde047', weight: 4, fillOpacity: 0.22 }));
              layer.on('mouseout', () => layer.setStyle({ color: '#facc15', weight: 3, fillOpacity: 0.08 }));
            }}
          >
            <Tooltip sticky className="variant-tip">
              <span className={styles.tipTitle}>{plot?.name}</span>
              {plot?.farmName && <span className={styles.tipLine}>{plot.farmName}</span>}
              {plot?.areaHa != null && <span className={styles.tipLine}>Área: {Number(plot.areaHa).toFixed(2)} ha</span>}
              {heat && (
                <span className={styles.tipLine}>Resistência {heat.depthCm} cm: {Number(heat.mpa).toFixed(1)} MPa</span>
              )}
              <span className={styles.tipHint}>Clique no lápis na lista para editar o contorno</span>
            </Tooltip>
          </GeoJSON>
        )}

        {heat && geojson && !drawActive && (
          <GeoJSON
            key={`heat-${heat.depthCm}-${heat.mpa}`}
            data={geojson}
            interactive={false}
            style={{ stroke: false, fillColor: heatColor(heat.mpa), fillOpacity: 0.4 + Math.min(0.35, heat.mpa / 10) }}
          />
        )}

        <Geoman
          plot={plot}
          center={center}
          drawActive={drawActive}
          drawTool={drawTool}
          drawMode={drawMode}
          drawCmd={drawCmd}
          onArea={onArea}
          onSaveDraw={onSaveDraw}
        />

        <MapView geojson={geojson} center={center} drawActive={drawActive} />
      </MapContainer>

      {plot && !geojson && !drawActive && (
        <div className={styles.noGeo}>
          <p className={styles.noGeoTitle}>Talhão sem contorno</p>
          <p className={styles.noGeoText}>Clique no lápis do talhão para desenhar o limite.</p>
        </div>
      )}

      {drawActive && (
        <div className={styles.hint}>
          {drawMode === 'drag' ? 'Arraste o desenho para reposicioná-lo' : drawMode === 'edit' ? 'Arraste os pontos para ajustar o contorno' : drawTool === 'circle' ? 'Clique no centro e arraste para o raio' : 'Clique para adicionar vértices · duplo-clique finaliza'}
        </div>
      )}
    </div>
  );
}
