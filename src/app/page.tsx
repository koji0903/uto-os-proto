"use client";

import React, { useState, useEffect, useCallback } from "react";
import MapComponent from "@/components/MapComponent";
import SpotModal from "@/components/SpotModal";
import SpotCard from "@/components/SpotCard";
import { getSpots, Spot } from "@/lib/db";
import { MapPin, Map as MapIcon, Layers, RefreshCw } from "lucide-react";

export default function Home() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filter, setFilter] = useState<"all" | "resource" | "issue">("all");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSpots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSpots();
      setSpots(data);
    } catch (error) {
      console.error("Failed to load spots:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  const handleMapClick = useCallback((location: { lat: number; lng: number }) => {
    setSelectedSpot(null);
    setSelectedLocation(location);
  }, []);

  const handleMarkerClick = useCallback((spot: Spot) => {
    setSelectedLocation(null);
    setSelectedSpot(spot);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  const handleUploadSuccess = useCallback(() => {
    setSelectedLocation(null);
    loadSpots();
  }, [loadSpots]);

  const handleCardClose = useCallback(() => {
    setSelectedSpot(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-emerald-700">
          <MapIcon size={24} className="text-emerald-600" />
          <h1 className="text-xl font-bold tracking-tight">まちかどAIマップ宇土</h1>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl items-center shadow-inner">
          <Layers size={16} className="text-gray-400 mx-2" />
          {(["all", "resource", "issue"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === f
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {f === "all" ? "すべて" : f === "resource" ? "地域資源" : "地域課題"}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full relative">
        {/* Left Side: Map */}
        <div className="flex-1 flex flex-col gap-4 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-600 font-medium flex items-center gap-2">
              <MapPin size={18} /> 地図をクリックして新しいスポットを登録
            </h2>
            <button
              onClick={loadSpots}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
              title="データを更新"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <MapComponent
            spots={spots}
            filter={filter}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Right Side: Overlay or Dashboard */}
        <div className="md:w-96 flex flex-col gap-4 z-20 md:sticky md:top-24 h-fit">
          {selectedSpot ? (
            <SpotCard spot={selectedSpot} onClose={handleCardClose} />
          ) : (
            <div className="hidden md:flex bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 p-8 h-full flex-col items-center text-center shadow-sm justify-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <MapPin size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">スポットを探す</h3>
              <p className="text-sm text-gray-500">
                地図上のピンをクリックすると、AIが分析した地域の魅力や課題の詳細が表示されます。
              </p>
              <div className="mt-8 border-t border-gray-100 pt-6 w-full text-left">
                <h4 className="text-sm font-bold text-gray-700 mb-3">色の見方</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-4 h-4 rounded-full bg-blue-500 shadow-sm border border-blue-600 flex-shrink-0"></span>
                    地域資源（魅力、歴史、グルメ）
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-4 h-4 rounded-full bg-red-500 shadow-sm border border-red-600 flex-shrink-0"></span>
                    地域課題（危険箇所、インフラ異常）
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedLocation && (
        <SpotModal
          location={selectedLocation}
          onClose={handleModalClose}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
