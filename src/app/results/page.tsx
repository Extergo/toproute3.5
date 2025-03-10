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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"primary" | "runnerUp">("primary");

  useEffect(() => {
    setIsLoading(true);

    try {
      const houseLat = parseFloat(params.get("houseLat") || "");
      const houseLng = parseFloat(params.get("houseLng") || "");
      const workplaceLat = parseFloat(params.get("workplaceLat") || "");
      const workplaceLng = parseFloat(params.get("workplaceLng") || "");
      const holidayLat = parseFloat(params.get("holidayLat") || "");
      const holidayLng = parseFloat(params.get("holidayLng") || "");
      const minSeats = parseInt(params.get("minSeats") || "5", 10);
      const hasKids = params.get("hasKids") === "1";
      const trunk = params.get("trunk") === "1";
      const preferredType = params.get("preferredType") || "any";

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
        setIsLoading(false);
        return;
      }

      const recommendation = recommendVehicles({
        house: { lat: houseLat, lng: houseLng },
        workplace: { lat: workplaceLat, lng: workplaceLng },
        holiday: { lat: holidayLat, lng: holidayLng },
        minSeats,
        habits: {
          hasKids,
          trunkPreference: trunk,
        },
        preferredType: preferredType, // Pass the preferred vehicle type
      });

      setError("");
      setResult(recommendation);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  // Function to determine car type icon
  const getCarTypeIcon = (type: string) => {
    switch (type) {
      case "electric":
        return "⚡";
      case "hybrid":
        return "🔋";
      case "suv":
        return "🚙";
      case "minivan":
        return "🚐";
      case "sedan":
        return "🚗";
      case "compact":
        return "🏎️";
      default:
        return "🚗";
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 p-6">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <Link
          href="/form"
          className="inline-block text-blue-600 hover:text-blue-800 mb-6"
        >
          &larr; Back to Form
        </Link>

        <h1 className="text-3xl font-bold text-center mb-4">
          Your Vehicle Recommendations
        </h1>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">
                Analyzing your needs and finding the perfect vehicle...
              </p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <Link
              href="/form"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go Back and Try Again
            </Link>
          </div>
        )}

        {result && !isLoading && (
          <>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-3">Analysis Summary</h2>
              <p className="text-gray-700 leading-relaxed">{result.summary}</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Daily Commute</p>
                  <p className="text-lg font-semibold">
                    {result.metrics.commuteDistance.toFixed(1)} km
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Holiday Distance</p>
                  <p className="text-lg font-semibold">
                    {result.metrics.holidayDistance.toFixed(1)} km
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">
                    Environmental Rating
                  </p>
                  <p className="text-lg">
                    <span className="text-yellow-500">
                      {"\u2605".repeat(result.carbonRating)}
                    </span>
                    <span className="text-gray-300">
                      {"\u2605".repeat(5 - result.carbonRating)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Car recommendation tabs */}
            <div className="mb-6">
              <div className="flex border-b">
                <button
                  className={`flex-1 py-3 font-medium text-center ${
                    activeTab === "primary"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("primary")}
                >
                  Primary Recommendation
                </button>
                <button
                  className={`flex-1 py-3 font-medium text-center ${
                    activeTab === "runnerUp"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("runnerUp")}
                >
                  Alternative Option
                </button>
              </div>

              {/* Primary car details */}
              <div
                className={`mt-6 ${
                  activeTab === "primary" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">
                        {getCarTypeIcon(result.primary.type)}{" "}
                        {result.primary.name}
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {result.primary.type.charAt(0).toUpperCase() +
                          result.primary.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold mb-4">
                          Specifications
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Range:</span>
                            <span className="font-medium">
                              {result.primary.range} km
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Seats:</span>
                            <span className="font-medium">
                              {result.primary.seats}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Trunk Space:</span>
                            <span className="font-medium">
                              {result.primary.trunk} liters
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Efficiency:</span>
                            <span className="font-medium">
                              {result.primary.type === "electric"
                                ? `${result.primary.efficiency} km/kWh`
                                : `${result.primary.efficiency} km/L`}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold mb-4">
                          Cost Analysis
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Base Price:</span>
                            <span className="font-medium">
                              ${result.primary.price},000
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Monthly Commute Cost:
                            </span>
                            <span className="font-medium">
                              ${(result.priceBreakdown.primary / 2).toFixed(2)}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Family Friendly Rating:
                            </span>
                            <span className="font-medium">
                              {result.primary.familyFriendly}/10
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Environmental Rating:
                            </span>
                            <span className="text-yellow-500 font-medium">
                              {"\u2605".repeat(result.carbonRating)}
                              <span className="text-gray-300">
                                {"\u2605".repeat(5 - result.carbonRating)}
                              </span>
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">
                        Terrain Performance
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-xl font-bold">
                            {result.primary.terrain.city}/10
                          </div>
                          <div className="text-sm text-gray-500">City</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-xl font-bold">
                            {result.primary.terrain.highway}/10
                          </div>
                          <div className="text-sm text-gray-500">Highway</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-xl font-bold">
                            {result.primary.terrain.offroad}/10
                          </div>
                          <div className="text-sm text-gray-500">Off-road</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Runner-up car details */}
              <div
                className={`mt-6 ${
                  activeTab === "runnerUp" ? "block" : "hidden"
                }`}
              >
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">
                        {getCarTypeIcon(result.runnerUp.type)}{" "}
                        {result.runnerUp.name}
                      </h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {result.runnerUp.type.charAt(0).toUpperCase() +
                          result.runnerUp.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold mb-4">
                          Specifications
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Range:</span>
                            <span className="font-medium">
                              {result.runnerUp.range} km
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Seats:</span>
                            <span className="font-medium">
                              {result.runnerUp.seats}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Trunk Space:</span>
                            <span className="font-medium">
                              {result.runnerUp.trunk} liters
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">Efficiency:</span>
                            <span className="font-medium">
                              {result.runnerUp.type === "electric"
                                ? `${result.runnerUp.efficiency} km/kWh`
                                : `${result.runnerUp.efficiency} km/L`}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold mb-4">
                          Cost Analysis
                        </h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between">
                            <span className="text-gray-600">Base Price:</span>
                            <span className="font-medium">
                              ${result.runnerUp.price},000
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Monthly Commute Cost:
                            </span>
                            <span className="font-medium">
                              ${(result.priceBreakdown.runnerUp / 2).toFixed(2)}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Family Friendly Rating:
                            </span>
                            <span className="font-medium">
                              {result.runnerUp.familyFriendly}/10
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-gray-600">
                              Environmental Rating:
                            </span>
                            <span className="text-yellow-500 font-medium">
                              {result.runnerUp.type === "electric"
                                ? "★★★★★"
                                : result.runnerUp.type === "hybrid"
                                ? "★★★☆☆"
                                : "★★☆☆☆"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-2">
                        Terrain Performance
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-xl font-bold">
                            {result.runnerUp.terrain.city}/10
                          </div>
                          <div className="text-sm text-gray-500">City</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-xl font-bold">
                            {result.runnerUp.terrain.highway}/10
                          </div>
                          <div className="text-sm text-gray-500">Highway</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <div className="text-xl font-bold">
                            {result.runnerUp.terrain.offroad}/10
                          </div>
                          <div className="text-sm text-gray-500">Off-road</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Vehicle Comparison</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left bg-gray-50">
                        Feature
                      </th>
                      <th className="py-2 px-4 border-b text-left bg-blue-50">
                        {result.primary.name}
                      </th>
                      <th className="py-2 px-4 border-b text-left bg-green-50">
                        {result.runnerUp.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Type</td>
                      <td className="py-2 px-4 border-b">
                        {result.primary.type}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.runnerUp.type}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Price</td>
                      <td className="py-2 px-4 border-b">
                        ${result.primary.price},000
                      </td>
                      <td className="py-2 px-4 border-b">
                        ${result.runnerUp.price},000
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">
                        Operating Cost
                      </td>
                      <td className="py-2 px-4 border-b">
                        ${result.priceBreakdown.primary.toFixed(2)}/month
                      </td>
                      <td className="py-2 px-4 border-b">
                        ${result.priceBreakdown.runnerUp.toFixed(2)}/month
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">Range</td>
                      <td className="py-2 px-4 border-b">
                        {result.primary.range} km
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.runnerUp.range} km
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">
                        Cargo Space
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.primary.trunk} L
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.runnerUp.trunk} L
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">
                        Family Rating
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.primary.familyFriendly}/10
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.runnerUp.familyFriendly}/10
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">
                        City Performance
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.primary.terrain.city}/10
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.runnerUp.terrain.city}/10
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border-b font-medium">
                        Highway Performance
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.primary.terrain.highway}/10
                      </td>
                      <td className="py-2 px-4 border-b">
                        {result.runnerUp.terrain.highway}/10
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="text-center mt-10">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/form"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Adjust Preferences
            </Link>
            <Link
              href="/"
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Start Over
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
