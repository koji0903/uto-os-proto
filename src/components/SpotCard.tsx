import React from "react";
import { X, MapPin, Tag, Sparkles } from "lucide-react";
import { Spot } from "@/lib/db";

interface SpotCardProps {
    spot: Spot;
    onClose: () => void;
}

export default function SpotCard({ spot, onClose }: SpotCardProps) {
    const isResource = spot.type === "resource";

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col w-full max-w-sm animate-in slide-in-from-bottom flex-shrink-0">
            <div className="relative h-48 w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={spot.imageUrl} alt="Spot" className="object-cover w-full h-full" />
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors backdrop-blur-sm"
                >
                    <X size={18} />
                </button>
                <div className="absolute top-2 left-2">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${isResource ? "bg-blue-500/90 text-white" : "bg-red-500/90 text-white"
                            }`}
                    >
                        {isResource ? "地域資源" : "地域課題"}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-4">
                <div>
                    <h3 className="text-gray-800 font-medium mb-1 line-clamp-2">{spot.description}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <MapPin size={12} /> {spot.location.lat.toFixed(4)}, {spot.location.lng.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Tag size={12} /> {spot.category}
                        </span>
                    </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-2">
                        <Sparkles size={16} />
                        AI 分析インサイト
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {spot.ai_analysis}
                    </p>
                </div>
            </div>
        </div>
    );
}
