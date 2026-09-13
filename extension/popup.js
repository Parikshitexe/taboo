import { analyzeTabs } from "./js/tabAnalyzer.js";
import { buildRoastContext } from "./js/contextBuilder.js";

const API_URL = "http://localhost:3000/api/roast";
const REQUEST_TIMEOUT_MS = 30000;

const roastButton = document.getElementById("roastButton");
const roastButtonText = roastButton.querySelector(".cta-text");
const roastText = document.getElementById("roastText");
const roastLabel = document.getElementById("roastLabel");
const roastCard = document.getElementById("roastCard");
const face = document.querySelector(".face");

function setRoastState(state, label, text, faceGlyph) {
    roastCard.dataset.state = state;
    roastLabel.textContent = label;
    roastText.textContent = text;
    if (face) {
        face.textContent = faceGlyph;
    }
}

function getFriendlyErrorMessage(error) {
    if (error?.name === "AbortError") {
        return "That took too long. Try again in a moment.";
    }

    if (error?.message === "Failed to fetch" || error?.name === "TypeError") {
        return "Can't reach the Taboo server. Is it running on localhost:3000?";
    }

    if (typeof error?.status === "number") {
        if (error.status === 400 || error.status === 413) {
            return "Your tab data looked invalid or too large to roast.";
        }

        if (error.status >= 500) {
            return "The server stumbled while talking to Gemini. Try again.";
        }

        return `Server said no (${error.status}). Try again.`;
    }

    if (error?.message === "Empty roast response") {
        return "Gemini returned an empty roast. Try once more.";
    }

    return "The roast flopped. Check the server, then try again.";
}

async function requestRoast(roastContext) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(roastContext),
            signal: controller.signal
        });

        if (!response.ok) {
            const err = new Error(`Server returned ${response.status}`);
            err.status = response.status;
            throw err;
        }

        const data = await response.json();

        if (!data.roast || typeof data.roast !== "string") {
            throw new Error("Empty roast response");
        }

        return data.roast;
    } finally {
        clearTimeout(timeoutId);
    }
}

roastButton.addEventListener("click", async () => {
    try {
        roastButton.disabled = true;
        roastButtonText.textContent = "Cooking…";

        setRoastState(
            "loading",
            "Snooping",
            "Scrolling your chaos… looking for the joke you accidentally wrote.",
            "..."
        );

        const tabs = await chrome.tabs.query({});
        const analysis = analyzeTabs(tabs);
        const roastContext = buildRoastContext(analysis);
        const roast = await requestRoast(roastContext);

        setRoastState("ready", "Gotcha", roast, ">:)");
    } catch (error) {
        console.error("Roast failed:", error);

        setRoastState(
            "error",
            "Oof",
            getFriendlyErrorMessage(error),
            "x_x"
        );
    } finally {
        roastButton.disabled = false;
        roastButtonText.textContent = "Roast me";
    }
});
