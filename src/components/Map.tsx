import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  useJsApiLoader,
  type Libraries,
  Marker,
} from "@react-google-maps/api";

// Define interface for point/location
interface Point {
  lat: number;
  lng: number;
  name?: string;
}

// Define map container style
const containerStyle = {
  width: "100%",
  height: "400px",
};

// Default center (you can change this)
const defaultCenter = {
  lat: 40.7128, // New York City coordinates
  lng: -74.006,
};

// Define prop types for the Map component
interface MapProps {
  onLocationsSelect?: (locations: {
    house: Point;
    workplace: Point;
    holiday: Point;
  }) => void;
}

export default function Map({ onLocationsSelect }: MapProps) {
  // Configure libraries you want to use
  const libraries: Libraries = ["places", "geometry"];

  // Load Google Maps API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // State for map and directions
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  // State for location markers
  const [houseMarker, setHouseMarker] = useState<Point | null>(null);
  const [workplaceMarker, setWorkplaceMarker] = useState<Point | null>(null);
  const [holidayMarker, setHolidayMarker] = useState<Point | null>(null);

  // Refs for origin and destination inputs
  const originRef = useRef<HTMLInputElement>(null);
  const destiantionRef = useRef<HTMLInputElement>(null);

  // Trigger location selection callback when all markers are set
  useEffect(() => {
    if (houseMarker && workplaceMarker && holidayMarker && onLocationsSelect) {
      onLocationsSelect({
        house: houseMarker,
        workplace: workplaceMarker,
        holiday: holidayMarker,
      });
    }
  }, [houseMarker, workplaceMarker, holidayMarker, onLocationsSelect]);

  // Calculate route function
  const calculateRoute = async () => {
    if (!originRef.current?.value || !destiantionRef.current?.value) {
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destiantionRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(results);

    // Set distance and duration
    if (results.routes[0].legs[0]) {
      setDistance(results.routes[0].legs[0].distance?.text || "");
      setDuration(results.routes[0].legs[0].duration?.text || "");
    }
  };

  // Clear route function
  const clearRoute = () => {
    setDirectionsResponse(null);
    setDistance("");
    setDuration("");

    if (originRef.current) originRef.current.value = "";
    if (destiantionRef.current) destiantionRef.current.value = "";
  };

  // Callback for map load
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Callback for map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle map click to set markers
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // Cycle through marker types
    if (!houseMarker) {
      setHouseMarker({ lat, lng });
    } else if (!workplaceMarker) {
      setWorkplaceMarker({ lat, lng });
    } else if (!holidayMarker) {
      setHolidayMarker({ lat, lng });
    } else {
      // Reset if all markers are set
      setHouseMarker(null);
      setWorkplaceMarker(null);
      setHolidayMarker(null);
    }
  };

  // Render loading state if map is not loaded
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="map-container">
      <div className="route-inputs flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Origin"
          ref={originRef}
          className="border p-2 flex-grow"
        />
        <input
          type="text"
          placeholder="Destination"
          ref={destiantionRef}
          className="border p-2 flex-grow"
        />
        <button
          onClick={calculateRoute}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Calculate Route
        </button>
        <button
          onClick={clearRoute}
          className="bg-red-500 text-white px-4 py-2"
        >
          Clear
        </button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {/* Render directions if available */}
        {directionsResponse && (
          <DirectionsRenderer
            directions={directionsResponse}
            options={{
              polylineOptions: {
                strokeColor: "#1E90FF",
                strokeOpacity: 0.8,
                strokeWeight: 6,
              },
            }}
          />
        )}

        {/* Render markers */}
        {houseMarker && (
          <Marker
            position={houseMarker}
            title="House"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}
        {workplaceMarker && (
          <Marker
            position={workplaceMarker}
            title="Workplace"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
          />
        )}
        {holidayMarker && (
          <Marker
            position={holidayMarker}
            title="Holiday"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        )}
      </GoogleMap>

      {/* Display route information */}
      <div className="route-info mt-4">
        {distance && <p>Distance: {distance}</p>}
        {duration && <p>Duration: {duration}</p>}

        {/* Display marker information */}
        <div>
          <p>Markers:</p>
          {houseMarker && (
            <p>
              House: {houseMarker.lat}, {houseMarker.lng}
            </p>
          )}
          {workplaceMarker && (
            <p>
              Workplace: {workplaceMarker.lat}, {workplaceMarker.lng}
            </p>
          )}
          {holidayMarker && (
            <p>
              Holiday: {holidayMarker.lat}, {holidayMarker.lng}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
