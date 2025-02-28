// src/app/form/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("../../components/Map"), { ssr: false });

export default function FormPage() {
  const router = useRouter();

  // User prefs
  const [minSeats, setMinSeats] = useState<number>(5);
  const [hasKids, setHasKids] = useState<boolean>(false);
  const [trunkPreference, setTrunkPreference] = useState<boolean>(false);

  // Store the 3 locations
  const [house, setHouse] = useState<{ lat: number; lng: number } | null>(null);
  const [workplace, setWorkplace] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [holiday, setHoliday] = useState<{ lat: number; lng: number } | null>(
    null
  );

  const handleLocationsSelect = (locations: {
    house: { lat: number; lng: number };
    workplace: { lat: number; lng: number };
    holiday: { lat: number; lng: number };
  }) => {
    setHouse(locations.house);
    setWorkplace(locations.workplace);
    setHoliday(locations.holiday);
  };

  const handleSubmit = () => {
    if (!house || !workplace || !holiday) {
      alert("Please set House, Workplace, and Holiday points on the map");
      return;
    }
    // Build query string for results
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
    });
    router.push(`/results?${query.toString()}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-green-100 p-6">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Form Page</h1>

        {/* Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Minimum Seats
            </label>
            <input
              type="number"
              min={1}
              value={minSeats}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                setMinSeats(isNaN(parsed) ? 1 : parsed);
              }}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={hasKids}
                onChange={(e) => setHasKids(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2">I have kids</span>
            </label>
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center text-gray-700">
              <input
                type="checkbox"
                checked={trunkPreference}
                onChange={(e) => setTrunkPreference(e.target.checked)}
                className="form-checkbox"
              />
              <span className="ml-2">Need trunk space</span>
            </label>
          </div>
        </div>

        <p className="mb-2 text-center text-gray-600">
          Click on the map to set House, Workplace, and Holiday in that order:
        </p>
        <Map onLocationsSelect={handleLocationsSelect} />

        <div className="text-center mt-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Get Recommendation
          </button>
        </div>
      </div>
    </main>
  );
}
