import { analyzeTabs } from "./js/tabAnalyzer.js";
import { buildRoastContext } from "./js/contextBuilder.js";

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

        const response = await fetch("http://localhost:3000/api/roast", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(roastContext)
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();

        if (!data.roast || typeof data.roast !== "string") {
            throw new Error("Empty roast response");
        }

        setRoastState("ready", "Gotcha", data.roast, ">:)");
    } catch (error) {
        console.error("Roast failed:", error);

        setRoastState(
            "error",
            "Oof",
            "The roast flopped. Is the server awake?",
            "x_x"
        );
    } finally {
        roastButton.disabled = false;
        roastButtonText.textContent = "Roast me";
    }
});
