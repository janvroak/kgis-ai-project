import { useEffect, useState } from "react";
import {
  GeoJSON,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultCenter = [20.5937, 78.9629];
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8000";
const WATER_GEOJSON_URL =
  import.meta.env.VITE_WATER_GEOJSON_URL ??
  `${BACKEND_BASE_URL}/data/water_clean.geojson`;
const FOREST_GEOJSON_URL =
  import.meta.env.VITE_FOREST_GEOJSON_URL ??
  `${BACKEND_BASE_URL}/data/forest_clean.geojson`;
const RESTRICTED_GEOJSON_URL =
  import.meta.env.VITE_RESTRICTED_GEOJSON_URL ??
  `${BACKEND_BASE_URL}/data/restricted_clean.geojson`;

const locationIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ center }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

function createLayerStyle(color) {
  return {
    color,
    weight: 2,
    fillColor: color,
    fillOpacity: 0.3,
  };
}

async function loadGeoJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load layer: ${url}`);
  }
  return response.json();
}

function MapView({ position, analysis }) {
  const center = position ? [position.lat, position.lon] : defaultCenter;
  const distanceItems = analysis ? Object.entries(analysis.distances) : [];
  const [waterLayer, setWaterLayer] = useState(null);
  const [forestLayer, setForestLayer] = useState(null);
  const [restrictedLayer, setRestrictedLayer] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLayers() {
      const [waterResult, forestResult, restrictedResult] = await Promise.allSettled([
        loadGeoJson(WATER_GEOJSON_URL),
        loadGeoJson(FOREST_GEOJSON_URL),
        loadGeoJson(RESTRICTED_GEOJSON_URL),
      ]);

      if (!isMounted) {
        return;
      }

      if (waterResult.status === "fulfilled") {
        setWaterLayer(waterResult.value);
      }

      if (forestResult.status === "fulfilled") {
        setForestLayer(forestResult.value);
      }

      if (restrictedResult.status === "fulfilled") {
        setRestrictedLayer(restrictedResult.value);
      }
    }

    loadLayers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="map-wrapper">
      <MapContainer center={center} zoom={5} className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        <LayersControl position="topright">
          {waterLayer && (
            <LayersControl.Overlay checked name="Water Bodies">
              <GeoJSON data={waterLayer} style={createLayerStyle("#1565c0")} />
            </LayersControl.Overlay>
          )}

          {forestLayer && (
            <LayersControl.Overlay checked name="Forest Areas">
              <GeoJSON data={forestLayer} style={createLayerStyle("#2e7d32")} />
            </LayersControl.Overlay>
          )}

          {restrictedLayer && (
            <LayersControl.Overlay checked name="Restricted Areas">
              <GeoJSON data={restrictedLayer} style={createLayerStyle("#c62828")} />
            </LayersControl.Overlay>
          )}
        </LayersControl>

        {position && (
          <Marker position={center} icon={locationIcon}>
            <Popup>
              {analysis ? (
                <div>
                  <div>
                    Risk Level: <strong>{analysis.riskLevel}</strong>
                  </div>
                  <div>{analysis.explanation}</div>
                  {distanceItems.length > 0 && (
                    <div>
                      {distanceItems.map(([key, value]) => (
                        <div key={key}>
                          {key}: {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>Checking risk...</div>
              )}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </section>
  );
}

export default MapView;
