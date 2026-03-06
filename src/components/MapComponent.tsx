"use client";

import React, { memo, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { Spot } from "@/lib/db";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const UTO_CITY_CENTER = { lat: 32.6945, lng: 130.6640 };

interface MapComponentProps {
    spots: Spot[];
    filter: "all" | "resource" | "issue";
    centerLocation?: { lat: number; lng: number };
    onMapClick: (location: { lat: number; lng: number }) => void;
    onMarkerClick: (spot: Spot) => void;
}

// Map Updater Component to handle panning without making the Map strictly controlled
function MapUpdater({ center }: { center?: { lat: number; lng: number } }) {
    const map = useMap();
    useEffect(() => {
        if (map && center) {
            map.panTo(center);
            map.setZoom(16); // Zoom in closer when user gets their location
        }
    }, [map, center]);
    return null;
}

const MapComponent = memo(function MapComponent({ spots, filter, centerLocation, onMapClick, onMarkerClick }: MapComponentProps) {
    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="flex items-center justify-center w-full h-[600px] bg-red-50 text-red-600 rounded-xl border border-red-200 shadow-sm p-4">
                Google Maps API Key is missing. Check your .env.local file.
            </div>
        );
    }

    const filteredSpots = spots.filter(spot => filter === "all" || spot.type === filter);

    return (
        <div className="w-full h-[60vh] md:h-[70vh] rounded-2xl overflow-hidden shadow-lg border border-gray-100 relative">
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={UTO_CITY_CENTER}
                    defaultZoom={14}
                    mapId="UTO_MAP_ID"
                    gestureHandling={"greedy"}
                    disableDefaultUI={false}
                    onClick={(e) => {
                        if (e.detail.latLng) {
                            onMapClick({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
                        }
                    }}
                >
                    <MapUpdater center={centerLocation} />
                    {filteredSpots.map((spot) => (
                        <AdvancedMarker
                            key={spot.id}
                            position={spot.location}
                            onClick={() => onMarkerClick(spot)}
                        >
                            {spot.type === "resource" ? (
                                // Blue pin for resources (natural/tourist spots)
                                <Pin background={"#3B82F6"} borderColor={"#1D4ED8"} glyphColor={"#FFFFFF"} />
                            ) : (
                                // Red pin for issues (danger/problems)
                                <Pin background={"#EF4444"} borderColor={"#B91C1C"} glyphColor={"#FFFFFF"} />
                            )}
                        </AdvancedMarker>
                    ))}
                </Map>
            </APIProvider>
        </div>
    );
});

export default MapComponent;
