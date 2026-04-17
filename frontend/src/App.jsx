import { useState } from "react";
import InputPanel from "./components/InputPanel";
import MapView from "./components/MapView";

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8000";
const ANALYZE_API_URL = `${BACKEND_BASE_URL}/analyze`;

async function fetchRiskAnalysis(latitude, longitude) {
  const response = await fetch(ANALYZE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      latitude,
      longitude,
    }),
  });

  if (!response.ok) {
    throw new Error("Analyze API returned a non-200 response");
  }

  const payload = await response.json();
  return {
    riskLevel:
      typeof payload.risk_level === "string" && payload.risk_level.trim()
        ? payload.risk_level.toUpperCase()
        : "UNKNOWN",
    explanation:
      typeof payload.explanation === "string" && payload.explanation.trim()
        ? payload.explanation
        : "No explanation provided.",
    distances:
      payload.distances && typeof payload.distances === "object"
        ? payload.distances
        : {},
  };
}

function App() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [position, setPosition] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState("Enter coordinates and click Check Risk.");

  const handleCheckRisk = async () => {
    const parsedLat = Number(latitude);
    const parsedLon = Number(longitude);

    if (
      Number.isNaN(parsedLat) ||
      Number.isNaN(parsedLon) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLon < -180 ||
      parsedLon > 180
    ) {
      setStatus("Please enter valid latitude and longitude values.");
      return;
    }

    setStatus("Checking risk level...");
    setPosition({ lat: parsedLat, lon: parsedLon });
    setAnalysis(null);

    try {
      const nextAnalysis = await fetchRiskAnalysis(parsedLat, parsedLon);
      setAnalysis(nextAnalysis);
      setStatus(`Risk check complete: ${nextAnalysis.riskLevel}`);
    } catch (error) {
      setAnalysis({
        riskLevel: "ERROR",
        explanation: "Unable to fetch risk from backend.",
        distances: {},
      });
      setStatus("Request failed. Please make sure backend is running.");
    }
  };

  return (
    <main className="app-shell">
      <h1 className="title">GIS Risk Checker</h1>
      <InputPanel
        latitude={latitude}
        longitude={longitude}
        onLatitudeChange={setLatitude}
        onLongitudeChange={setLongitude}
        onCheckRisk={handleCheckRisk}
      />
      <p className="status">{status}</p>
      <MapView position={position} analysis={analysis} />
    </main>
  );
}

export default App;
