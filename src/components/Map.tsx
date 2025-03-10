// src/components/Map.tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

interface Point {
  lat: number;
  lng: number;
}

interface MapProps {
  onLocationsSelect: (locations: {
    house: Point;
    workplace: Point;
    holiday: Point;
  }) => void;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 37.7749, // Default center (San Francisco)
  lng: -122.4194,
};

// Define libraries outside component to prevent unnecessary re-renders
const libraries: (
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization"
)[] = ["places"];

export default function Map({ onLocationsSelect }: MapProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [evStations, setEvStations] = useState<
    google.maps.places.PlaceResult[]
  >([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Use a ref to store the map instance
  const mapRef = useRef<google.maps.Map | null>(null);

  // Use useJsApiLoader for more reliable loading
  const { isLoaded, loadError: apiLoadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    if (apiLoadError) {
      setLoadError(
        "Failed to load Google Maps API. Please check your internet connection and try again."
      );
      console.error("Google Maps API load error:", apiLoadError);
    }
  }, [apiLoadError]);

  // Called when the map finishes loading
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Handle user clicks to set up to 3 points
  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const newPoint: Point = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      if (points.length < 3) {
        const updatedPoints = [...points, newPoint];
        setPoints(updatedPoints);

        // Once we have 3 points, pass them to the parent
        if (updatedPoints.length === 3) {
          onLocationsSelect({
            house: updatedPoints[0],
            workplace: updatedPoints[1],
            holiday: updatedPoints[2],
          });
        }
      }
    },
    [points, onLocationsSelect]
  );

  // Whenever 'points' changes, attempt route + EV station search
  useEffect(() => {
    // We only do route + station search if we have at least 2 points (House, Work)
    if (points.length < 2 || !isLoaded) {
      setDirections(null);
      setEvStations([]);
      return;
    }

    // Ensure the map is loaded
    if (!mapRef.current) {
      console.warn("Map not loaded yet; skipping directions & station search.");
      return;
    }

    // Directions from House -> Work
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: points[0],
        destination: points[1],
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);

          // Find midpoint of the first leg, then PlacesService for EV stations
          if (result.routes[0]?.legs.length > 0) {
            const leg = result.routes[0].legs[0];
            const midLat =
              (leg.start_location.lat() + leg.end_location.lat()) / 2;
            const midLng =
              (leg.start_location.lng() + leg.end_location.lng()) / 2;
            const midpoint = new google.maps.LatLng(midLat, midLng);

            // Null check for the map again
            if (!mapRef.current) {
              console.error("Map ref disappeared. Aborting station search.");
              return;
            }

            try {
              const service = new google.maps.places.PlacesService(
                mapRef.current
              );
              const request: google.maps.places.PlaceSearchRequest = {
                location: midpoint,
                radius: 15000, // 15 km
                type: "electric_vehicle_charging_station", // single string version
              };

              service.nearbySearch(request, (results, status) => {
                if (
                  status === google.maps.places.PlacesServiceStatus.OK &&
                  results
                ) {
                  setEvStations(results);
                } else {
                  console.warn(
                    "No EV stations found or PlacesService error:",
                    status
                  );
                  setEvStations([]);
                }
              });
            } catch (error) {
              console.error("Error searching for EV stations:", error);
              setEvStations([]);
            }
          }
        } else {
          console.error("Directions request failed:", status);
          setDirections(null);
          setEvStations([]);
        }
      }
    );
  }, [points, isLoaded]);

  // Reset everything
  const resetPoints = useCallback(() => {
    setPoints([]);
    setDirections(null);
    setEvStations([]);
  }, []);

  // If map fails to load, show an error message with retry button
  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
        <p className="text-red-600 mb-2">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry Loading Map
        </button>
      </div>
    );
  }

  // Show loading indicator when map is not loaded yet
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-[400px] bg-gray-100 rounded">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p>Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onMapLoad}
        onClick={handleMapClick}
      >
        {points.map((point, index) => (
          <Marker
            key={index}
            position={point}
            label={index === 0 ? "House" : index === 1 ? "Work" : "Holiday"}
          />
        ))}

        {directions && <DirectionsRenderer directions={directions} />}

        {evStations.map((station, idx) => (
          <Marker
            key={`ev-${idx}`}
            position={station.geometry?.location as google.maps.LatLng}
            icon={{
              url: "https://maps.google.com/mapfiles/kml/paddle/ltblu-circle.png",
            }}
          />
        ))}
      </GoogleMap>

      <div className="mt-2 text-center">
        <p className="text-sm text-gray-500">
          {points.length === 0 && "Click on the map to set your home location"}
          {points.length === 1 && "Now click to set your workplace location"}
          {points.length === 2 &&
            "Finally, click to set your holiday destination"}
          {points.length === 3 &&
            "All locations set! You can proceed or reset to try again."}
        </p>
      </div>

      {points.length > 0 && (
        <button
          onClick={resetPoints}
          className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded shadow"
        >
          Reset Points
        </button>
      )}
    </div>
  );
}
