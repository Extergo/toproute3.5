// src/app/results/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  recommendVehicles,
  RecommendationResult,
} from "../../utils/recommendVehicles";

export default function ResultsPage() {
  const params = useSearchParams();
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const houseLat = parseFloat(params.get("houseLat") || "");
    const houseLng = parseFloat(params.get("houseLng") || "");
    const workplaceLat = parseFloat(params.get("workplaceLat") || "");
    const workplaceLng = parseFloat(params.get("workplaceLng") || "");
    const holidayLat = parseFloat(params.get("holidayLat") || "");
    const holidayLng = parseFloat(params.get("holidayLng") || "");
    const minSeats = parseInt(params.get("minSeats") || "5", 10);
    const hasKids = params.get("hasKids") === "1";
    const trunk = params.get("trunk") === "1";

    if (
      isNaN(houseLat) ||
      isNaN(houseLng) ||
      isNaN(workplaceLat) ||
      isNaN(workplaceLng) ||
      isNaN(holidayLat) ||
      isNaN(holidayLng)
    ) {
      setError(
        "Missing or invalid location data. Please go back and try again."
      );
      return;
    }

    try {
      const recommendation = recommendVehicles({
        house: { lat: houseLat, lng: houseLng },
        workplace: { lat: workplaceLat, lng: workplaceLng },
        holiday: { lat: holidayLat, lng: holidayLng },
        minSeats,
        habits: {
          hasKids,
          trunkPreference: trunk,
        },
      });
      setError("");
      setResult(recommendation);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
      setResult(null);
    }
  }, [params]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 p-6">
      <div className="max-w-3xl w-full bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold text-center mb-4">
          Recommendation Results
        </h1>

        {error && (
          <p className="text-center text-red-600 font-semibold mb-4">{error}</p>
        )}

        {result && (
          <>
            <p className="text-gray-800 mb-4">{result.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary */}
              <div className="p-4 border rounded bg-gray-50">
                <h2 className="font-semibold text-lg mb-2 text-center">
                  Primary Option
                </h2>
                <p>
                  <strong>Name:</strong> {result.primary.name}
                </p>
                <p>
                  <strong>Type:</strong> {result.primary.type}
                </p>
                <p>
                  <strong>Range:</strong> {result.primary.range} km
                </p>
                <p>
                  <strong>Seats:</strong> {result.primary.seats}
                </p>
                <p>
                  <strong>Price Estimate:</strong> $
                  {result.priceBreakdown.primary.toFixed(2)}
                </p>
              </div>
              {/* Runner-Up */}
              <div className="p-4 border rounded bg-gray-50">
                <h2 className="font-semibold text-lg mb-2 text-center">
                  Runner-Up
                </h2>
                <p>
                  <strong>Name:</strong> {result.runnerUp.name}
                </p>
                <p>
                  <strong>Type:</strong> {result.runnerUp.type}
                </p>
                <p>
                  <strong>Range:</strong> {result.runnerUp.range} km
                </p>
                <p>
                  <strong>Seats:</strong> {result.runnerUp.seats}
                </p>
                <p>
                  <strong>Price Estimate:</strong> $
                  {result.priceBreakdown.runnerUp.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-lg font-medium">Environmental Rating:</p>
              <p className="text-2xl">
                {"★".repeat(result.carbonRating)}
                {"☆".repeat(5 - result.carbonRating)}
              </p>
            </div>
          </>
        )}

        <div className="text-center mt-6">
          <Link
            href="/"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Start Over
          </Link>
        </div>
      </div>
    </main>
  );
}
