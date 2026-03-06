"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function SampleMap() {
    const position = { lat: 35.681236, lng: 139.767125 }; // Tokyo Station

    if (!GOOGLE_MAPS_API_KEY) {
        return <div className="p-4 bg-red-100 text-red-800 rounded">Google Maps API Key is missing. Please check .env.local</div>;
    }

    return (
        <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                    defaultCenter={position}
                    defaultZoom={13}
                    mapId="DEMO_MAP_ID"
                    gestureHandling={"greedy"}
                    disableDefaultUI={false}
                >
                    <AdvancedMarker position={position}>
                        <Pin background={"#EF4444"} borderColor={"#B91C1C"} glyphColor={"#FFFFFF"} />
                    </AdvancedMarker>
                </Map>
            </APIProvider>
        </div>
    );
}
