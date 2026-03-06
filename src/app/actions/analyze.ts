"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// サーバーアクションのタイムアウトやAbortionを回避するため、fetchをラップする
const customFetch = (url: RequestInfo | URL, init?: RequestInit) => {
    // Next.jsのServerActionが勝手にリクエストをAbortするのを防ぐため、signalを外すか、新しいAbortControllerを渡す
    const newInit = { ...init };
    if (newInit.signal) {
        delete newInit.signal;
    }
    return fetch(url, newInit);
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// customFetchを各モデルに設定してAbortを回避
genAI.getGenerativeModel = function (modelParams: any, requestOptions?: any) {
    const opts = requestOptions || {};
    opts.customHeaders = opts.customHeaders || new Headers();
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "").getGenerativeModel(modelParams, { ...opts, customFetch });
}

export async function analyzeLocation(base64Image: string, description: string, spotType: 'resource' | 'issue') {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined in .env.local");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
あなたは熊本県宇土市の地域課題・地域資源を分析するAIアシスタントです。
提供された写真とユーザーのコメント（説明文）をもとに、以下のJSON形式でのみ回答してください。余計な文字列やマークダウンは含めないでください。

【入力情報】
ユーザーコメント: "${description}"
指定されたタイプ: ${spotType === 'resource' ? '地域資源（魅力、歴史、グルメなど）' : '地域課題（危険箇所、インフラ異常など）'}

【出力JSONフォーマット】
{
  "category": "テキスト", // ${spotType === 'resource' ? '歴史、グルメ、風景' : '危険箇所、インフラ異常'} などの具体的なタグを1つ
  "ai_analysis": "テキスト" // 写真とコメントから読み取れる分析結果、あるいは地域課題の場合は解決に向けたヒントや重要度を簡潔に記載（1〜3文程度）
}
  `;

    // Provide the image data. Base64 usually comes as `data:image/jpeg;base64,...`
    const base64Data = base64Image.split(",")[1] || base64Image;
    const mimeType = base64Image.match(/data:(.*?);/)?.[1] || "image/jpeg";

    const imageParts = [
        {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        },
    ];

    try {
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        let text = response.text();

        // Remove markdown code blocks if the AI includes them
        text = text.replace(/```json/gi, "").replace(/```/gi, "").trim();

        const parsed = JSON.parse(text);

        // Explicitly set the type returned back to the UI based on user's choice
        parsed.type = spotType;

        return parsed;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("AIによる解析に失敗しました。");
    }
}
