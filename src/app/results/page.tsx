// src/app/results/page.tsx
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  recommendVehicles,
  RecommendationResult,
} from "@/utils/recommendVehicles";

// Separate component for search params logic
function ResultsContent() {
  const searchParams = useSearchParams();
  const [recommendation, setRecommendation] =
    useState<RecommendationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Extract parameters from URL
      const houseLat = parseFloat(searchParams.get("houseLat") || "");
      const houseLng = parseFloat(searchParams.get("houseLng") || "");
      const workplaceLat = parseFloat(searchParams.get("workplaceLat") || "");
      const workplaceLng = parseFloat(searchParams.get("workplaceLng") || "");
      const holidayLat = parseFloat(searchParams.get("holidayLat") || "");
      const holidayLng = parseFloat(searchParams.get("holidayLng") || "");
      const minSeats = parseInt(searchParams.get("minSeats") || "5", 10);
      const hasKids = searchParams.get("hasKids") === "1";
      const trunkPreference = searchParams.get("trunk") === "1";
      const preferredType = searchParams.get("preferredType") || "any";

      // Validate inputs
      if (
        isNaN(houseLat) ||
        isNaN(houseLng) ||
        isNaN(workplaceLat) ||
        isNaN(workplaceLng) ||
        isNaN(holidayLat) ||
        isNaN(holidayLng)
      ) {
        throw new Error("Invalid location coordinates");
      }

      // Generate recommendation
      const result = recommendVehicles({
        house: { lat: houseLat, lng: houseLng },
        workplace: { lat: workplaceLat, lng: workplaceLng },
        holiday: { lat: holidayLat, lng: holidayLng },
        minSeats,
        habits: {
          hasKids,
          trunkPreference,
        },
        preferredType,
      });

      setRecommendation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  }, [searchParams]);

  // Carbon rating description
  const getCarbonRatingDescription = (rating: number) => {
    switch (rating) {
      case 5:
        return "Excellent (Near Zero Emissions)";
      case 4:
        return "Very Good (Low Carbon Footprint)";
      case 3:
        return "Good (Moderate Environmental Impact)";
      case 2:
        return "Fair (Higher Carbon Emissions)";
      case 1:
        return "Poor (High Carbon Footprint)";
      default:
        return "Unknown";
    }
  };

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Recommendation Error
          </h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link
            href="/form"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go Back to Form
          </Link>
        </div>
      </main>
    );
  }

  if (!recommendation) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">
            Generating your vehicle recommendations...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-100 to-green-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <Link
          href="/form"
          className="inline-block text-blue-600 hover:text-blue-800 mb-6"
        >
          &larr; Back to Form
        </Link>

        <h1 className="text-3xl font-bold text-center mb-6">
          Your Vehicle Recommendations
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Primary Recommendation */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700">
              Primary Recommendation
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-medium">
                {recommendation.primary.name}
              </h3>
              <p className="text-gray-600">
                {recommendation.primary.type.toUpperCase()}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <p>
                <strong>Seats:</strong> {recommendation.primary.seats}
              </p>
              <p>
                <strong>Range:</strong> {recommendation.primary.range} km
              </p>
              <p>
                <strong>Trunk Space:</strong> {recommendation.primary.trunk}{" "}
                liters
              </p>
              <p>
                <strong>Efficiency:</strong>{" "}
                {recommendation.primary.type === "electric"
                  ? `${recommendation.primary.efficiency} km/kWh`
                  : `${recommendation.primary.efficiency} km/L`}
              </p>
              <p>
                <strong>Base Price:</strong> ${recommendation.primary.price},000
              </p>
            </div>

            <div className="bg-blue-100 p-4 rounded">
              <h4 className="font-semibold mb-2">Carbon Impact</h4>
              <p>
                Rating:{" "}
                {getCarbonRatingDescription(recommendation.carbonRating)}
              </p>
            </div>
          </div>

          {/* Runner-Up Recommendation */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-green-700">
              Runner-Up Option
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-medium">
                {recommendation.runnerUp.name}
              </h3>
              <p className="text-gray-600">
                {recommendation.runnerUp.type.toUpperCase()}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <p>
                <strong>Seats:</strong> {recommendation.runnerUp.seats}
              </p>
              <p>
                <strong>Range:</strong> {recommendation.runnerUp.range} km
              </p>
              <p>
                <strong>Trunk Space:</strong> {recommendation.runnerUp.trunk}{" "}
                liters
              </p>
              <p>
                <strong>Efficiency:</strong>{" "}
                {recommendation.runnerUp.type === "electric"
                  ? `${recommendation.runnerUp.efficiency} km/kWh`
                  : `${recommendation.runnerUp.efficiency} km/L`}
              </p>
              <p>
                <strong>Base Price:</strong> ${recommendation.runnerUp.price}
                ,000
              </p>
            </div>

            <div className="bg-green-100 p-4 rounded">
              <h4 className="font-semibold mb-2">Trip Details</h4>
              <p>
                <strong>Commute Distance:</strong>{" "}
                {recommendation.metrics.commuteDistance.toFixed(1)} km
              </p>
              <p>
                <strong>Holiday Distance:</strong>{" "}
                {recommendation.metrics.holidayDistance.toFixed(1)} km
              </p>
            </div>
          </div>
        </div>

        {/* Recommendation Summary */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Recommendation Summary</h3>
          <p className="text-gray-700">{recommendation.summary}</p>
        </div>

        {/* Estimated Costs */}
        <div className="mt-8 bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Cost Breakdown</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">
                {recommendation.primary.name} Estimated Cost
              </h4>
              <p>
                Monthly Commute Fuel Cost: $
                {recommendation.priceBreakdown.primary.toFixed(2)}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">
                {recommendation.runnerUp.name} Estimated Cost
              </h4>
              <p>
                Monthly Commute Fuel Cost: $
                {recommendation.priceBreakdown.runnerUp.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Wrap the content in a Suspense boundary
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700">
              Loading your vehicle recommendations...
            </p>
          </div>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
