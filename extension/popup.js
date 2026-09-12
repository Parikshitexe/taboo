import { analyzeTabs } from "./js/tabAnalyzer.js";
import { buildRoastContext } from "./js/contextBuilder.js";

const roastButton = document.getElementById("roastButton");
const roastText = document.getElementById("roastText");
const roastLabel = document.getElementById("roastLabel");

roastButton.addEventListener("click", async () => {
    try {
        roastButton.disabled = true;
        roastButton.textContent = "🔥 Roasting...";

        roastLabel.textContent = "TABOO IS THINKING";
        roastText.textContent = "Analyzing your questionable life choices...";

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

        roastLabel.textContent = "TABOO SAYS";
        roastText.textContent = data.roast;

    } catch (error) {
        console.error("Roast failed:", error);

        roastLabel.textContent = "TABOO FAILED";
        roastText.textContent =
            "Oops. Even Taboo couldn't handle your tabs. 💀";

    } finally {
        roastButton.disabled = false;
        roastButton.textContent = "🔥 Roast Me";
    }
});