import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const key = process.env.GEMINI_API_KEY?.trim().replace(/^"|"$/g, '');
if (!key) {
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
fetch(url)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            const names = data.models.map(m => m.name).join('\n');
            fs.writeFileSync("models_output.txt", names, "utf8");
        } else {
            fs.writeFileSync("models_output.txt", JSON.stringify(data), "utf8");
        }
    })
    .catch(err => console.error(err));
