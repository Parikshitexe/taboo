import express from "express";
import cors from "cors";
import "dotenv/config";

import { generateRoast } from "./services/geminiService.js";

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

console.log(
    "Gemini API key loaded:",
    Boolean(process.env.GEMINI_API_KEY)
);

function validateRoastContext(context) {
    if (!context || typeof context !== "object") {
        return false;
    }

    if (typeof context.totalTabs !== "number") {
        return false;
    }

    if (typeof context.pinnedTabs !== "number") {
        return false;
    }

    if (typeof context.uniqueDomains !== "number") {
        return false;
    }

    if (!Array.isArray(context.tabs)) {
        return false;
    }

    if (!Array.isArray(context.duplicateTabs)) {
        return false;
    }

    if (!context.domainCounts || typeof context.domainCounts !== "object") {
        return false;
    }

    return true;
}

app.get("/", (req, res) => {
    res.json({
        message: "Taboo backend is alive 🔥"
    });
});

app.post("/api/roast", async (req, res) => {
    try {
        console.log("Received roast request:");
        console.log(req.body);

        if (!validateRoastContext(req.body)) {
            return res.status(400).json({
                error: "Invalid roast context"
            });
        }   

        const roast = await generateRoast(req.body);

        console.log("Generated roast:", roast);

        res.json({
            roast
        });

    } catch (error) {
        console.error("Gemini error:", error);

        res.status(500).json({
            error: "Failed to generate roast"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Taboo server running on http://localhost:${PORT}`);
});