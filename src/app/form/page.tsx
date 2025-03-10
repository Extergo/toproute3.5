// src/app/form/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Use dynamic import with no SSR for Map component
const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function FormPage() {
  const router = useRouter();

  // User prefs with more detailed options
  const [minSeats, setMinSeats] = useState<number>(5);
  const [hasKids, setHasKids] = useState<boolean>(false);
  const [trunkPreference, setTrunkPreference] = useState<boolean>(false);
  const [preferredType, setPreferredType] = useState<string>("any");

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Store the 3 locations
  const [house, setHouse] = useState<{ lat: number; lng: number } | null>(null);
  const [workplace, setWorkplace] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [holiday, setHoliday] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const [allLocationsSet, setAllLocationsSet] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);

  const handleLocationsSelect = (locations: {
    house: { lat: number; lng: number };
    workplace: { lat: number; lng: number };
    holiday: { lat: number; lng: number };
  }) => {
    setHouse(locations.house);
    setWorkplace(locations.workplace);
    setHoliday(locations.holiday);
    setAllLocationsSet(true);
  };

  const handleSubmit = () => {
    setFormError(null);

    if (!house || !workplace || !holiday) {
      setFormError("Please set Home, Workplace, and Holiday points on the map");
      return;
    }

    setIsLoading(true);

    // Build query string for results
    try {
      const query = new URLSearchParams({
        houseLat: house.lat.toString(),
        houseLng: house.lng.toString(),
        workplaceLat: workplace.lat.toString(),
        workplaceLng: workplace.lng.toString(),
        holidayLat: holiday.lat.toString(),
        holidayLng: holiday.lng.toString(),
        minSeats: minSeats.toString(),
        hasKids: hasKids ? "1" : "0",
        trunk: trunkPreference ? "1" : "0",
        preferredType: preferredType,
      });

      router.push(`/results?${query.toString()}`);
    } catch (error) {
      setFormError(
        "An error occurred while submitting your preferences. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 p-6">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <Link
          href="/"
          className="inline-block text-blue-600 hover:text-blue-800 mb-6"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-center mb-6">
          Find Your Ideal Vehicle
        </h1>

        <p className="text-gray-600 text-center mb-8">
          Tell us about your needs and locations, and we'll recommend the
          perfect vehicle for you.
        </p>

        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-600">
            {formError}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Your Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Minimum Seats
              </label>
              <select
                value={minSeats}
                onChange={(e) => setMinSeats(parseInt(e.target.value, 10))}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              >
                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} seats
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Select the minimum number of seats you need
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Vehicle Type Preference
              </label>
              <select
                value={preferredType}
                onChange={(e) => setPreferredType(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
              >
                <option value="any">Any Type</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
                <option value="suv">SUV</option>
                <option value="sedan">Sedan</option>
                <option value="minivan">Minivan</option>
                <option value="compact">Compact</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Optional: Select your preferred vehicle type
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasKids"
                checked={hasKids}
                onChange={(e) => setHasKids(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasKids" className="ml-2 block text-gray-700">
                I have children
              </label>
              <div className="ml-2 group relative">
                <span className="text-gray-400 cursor-help">ⓘ</span>
                <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg w-48">
                  We'll prioritize vehicles with higher safety ratings and
                  family-friendly features
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="trunkSpace"
                checked={trunkPreference}
                onChange={(e) => setTrunkPreference(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="trunkSpace" className="ml-2 block text-gray-700">
                I need significant trunk space
              </label>
              <div className="ml-2 group relative">
                <span className="text-gray-400 cursor-help">ⓘ</span>
                <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg w-48">
                  We'll prioritize vehicles with larger cargo capacity
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Your Locations</h2>
          <p className="mb-4 text-gray-600">
            Click on the map to set your home, workplace, and holiday
            destination in that order. We'll use these locations to calculate
            your typical commute and travel needs.
          </p>

          <div className="bg-gray-50 p-4 rounded mb-4">
            <ul className="flex flex-col sm:flex-row sm:justify-between text-sm">
              <li
                className={`flex items-center mb-2 sm:mb-0 ${
                  house ? "text-green-600" : "text-gray-500"
                }`}
              >
                <span className="w-5 h-5 inline-block bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-2">
                  1
                </span>
                Home: {house ? "Set ✓" : "Click on map"}
              </li>
              <li
                className={`flex items-center mb-2 sm:mb-0 ${
                  workplace ? "text-green-600" : "text-gray-500"
                }`}
              >
                <span className="w-5 h-5 inline-block bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-2">
                  2
                </span>
                Workplace: {workplace ? "Set ✓" : "Click on map"}
              </li>
              <li
                className={`flex items-center ${
                  holiday ? "text-green-600" : "text-gray-500"
                }`}
              >
                <span className="w-5 h-5 inline-block bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-2">
                  3
                </span>
                Holiday: {holiday ? "Set ✓" : "Click on map"}
              </li>
            </ul>
          </div>

          <Map onLocationsSelect={handleLocationsSelect} />
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !allLocationsSet}
            className={`px-8 py-3 rounded-md text-white font-medium transition-all ${
              allLocationsSet
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Get Recommendation"
            )}
          </button>
          <p className="mt-2 text-sm text-gray-500">
            {allLocationsSet
              ? "Ready to find your perfect vehicle!"
              : "Please select all three locations on the map"}
          </p>
        </div>
      </div>
    </main>
  );
}
