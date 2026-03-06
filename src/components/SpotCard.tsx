import React from "react";
import { X, MapPin, Tag, Sparkles, Trash2 } from "lucide-react";
import { Spot } from "@/lib/db";

interface SpotCardProps {
    spot: Spot;
    onClose: () => void;
    isAdmin?: boolean;
    onDelete?: () => void;
}

export default function SpotCard({ spot, onClose, isAdmin, onDelete }: SpotCardProps) {
    const isResource = spot.type === "resource";

    // 画面下部からせり上がるボトムシートスタイルのデザイン（モバイル時）
    return (
        <div className="md:relative fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl md:rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] md:shadow-xl overflow-hidden border-t md:border border-gray-100 flex flex-col w-full md:max-w-sm animate-in slide-in-from-bottom flex-shrink-0 pt-2 md:pt-0 pb-safe">
            <div className="relative h-48 w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={spot.imageUrl} alt="Spot" className="object-cover w-full h-full" />
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors backdrop-blur-sm"
                >
                    <X size={18} />
                </button>
                <div className="absolute top-2 left-2 flex gap-2">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${isResource ? "bg-blue-500/90 text-white" : "bg-red-500/90 text-white"
                            }`}
                    >
                        {isResource ? "地域資源" : "地域課題"}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={onDelete}
                            className="px-2 py-1 bg-red-600/90 text-white rounded-full text-xs font-bold shadow-sm backdrop-blur-md hover:bg-red-700 flex items-center gap-1 transition-colors"
                            title="この投稿を削除する"
                        >
                            <Trash2 size={12} /> <span>削除</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[50vh] md:max-h-none mb-6 md:mb-0">
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
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {spot.ai_analysis}
                    </p>
                </div>
            </div>
        </div>
    );
}
