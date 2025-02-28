// src/components/Map.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
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

export default function Map({ onLocationsSelect }: MapProps) {
  const [points, setPoints] = useState<Point[]>([]);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [evStations, setEvStations] = useState<
    google.maps.places.PlaceResult[]
  >([]);

  // Use a ref to store the map instance
  const mapRef = useRef<google.maps.Map | null>(null);

  // Called when the map finishes loading
  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  // Handle user clicks to set up to 3 points
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
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
  };

  // Whenever 'points' changes, attempt route + EV station search
  useEffect(() => {
    // We only do route + station search if we have at least 2 points (House, Work)
    if (points.length < 2) {
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
          }
        } else {
          console.error("Directions request failed:", status);
          setDirections(null);
          setEvStations([]);
        }
      }
    );
  }, [points]);

  // Reset everything
  const resetPoints = () => {
    setPoints([]);
    setDirections(null);
    setEvStations([]);
  };

  return (
    <div className="relative">
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        libraries={["places"]} // Must include places for EV station lookup
      >
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
      </LoadScript>

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
