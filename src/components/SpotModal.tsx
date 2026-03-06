import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import { X, Upload, Loader2 } from "lucide-react";
import { uploadImage, addSpot } from "@/lib/db";
import { analyzeLocation } from "@/app/actions/analyze";

interface SpotModalProps {
    location: { lat: number; lng: number };
    onClose: () => void;
    onSuccess: () => void;
}

export default function SpotModal({ location, onClose, onSuccess }: SpotModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [spotType, setSpotType] = useState<"resource" | "issue">("resource");
    const [urgency, setUrgency] = useState<"high" | "medium" | "low">("medium");
    const [loadingStep, setLoadingStep] = useState<string | null>(null);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !description) {
            setError("写真とコメント（説明文）は必須です。");
            return;
        }

        setLoadingStep("画像を準備中...");
        setError("");

        try {
            // 1. Image Compression (Firestore 1MB limit -> target ~300KB)
            const options = { maxSizeMB: 0.3, maxWidthOrHeight: 800, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

            // 2. AI Analysis (Server Action)
            setLoadingStep("AIで写真と地域課題を解析中...");
            const aiResult = await analyzeLocation(base64, description, spotType);

            // 3. Skip Firebase Storage, use Base64 string directly
            // Firebase Storage requires Blaze plan, so we save small images to Firestore directly as a workaround
            const imageUrl = base64;

            // 4. Save to Firestore
            setLoadingStep("マップにスポットを登録中...");
            await addSpot({
                location,
                type: spotType,
                category: aiResult.category,
                imageUrl,
                description,
                ai_analysis: aiResult.ai_analysis,
                ...(spotType === "issue" && { urgency }),
            });

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "投稿中にエラーが発生しました。");
        } finally {
            setLoadingStep(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">新しいスポットを投稿</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                    {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">投稿タイプ (必須)</label>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setSpotType("resource")}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${spotType === "resource" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                地域資源（魅力・歴史など）
                            </button>
                            <button
                                type="button"
                                onClick={() => setSpotType("issue")}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${spotType === "issue" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                地域課題（危険箇所など）
                            </button>
                        </div>
                    </div>

                    {spotType === "issue" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-medium text-gray-700 mb-2">緊急度</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setUrgency("high")}
                                    className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-all ${urgency === "high" ? "bg-red-50 border-red-500 text-red-700" : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500"}`}
                                >
                                    高 (High)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUrgency("medium")}
                                    className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-all ${urgency === "medium" ? "bg-orange-50 border-orange-500 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-200 hover:text-orange-500"}`}
                                >
                                    中 (Medium)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUrgency("low")}
                                    className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-all ${urgency === "low" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-emerald-200 hover:text-emerald-500"}`}
                                >
                                    低 (Low)
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">写真 (必須)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                            {file ? (
                                <div className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload size={24} className="text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">クリックして画像を選択</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                </>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">写真は自動でリサイズされAI解析されます。</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">コメント (必須)</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none h-24 text-gray-800"
                            placeholder="ここが危険！、新しいカフェができました！ など"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loadingStep !== null}
                        className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loadingStep ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                {loadingStep}
                            </>
                        ) : (
                            "AIに解析させて投稿する"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
