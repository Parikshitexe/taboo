import { analyzeTabs } from "./js/tabAnalyzer.js";

const roastButton = document.getElementById("roastButton");
const tabCount = document.getElementById("tabCount");

roastButton.addEventListener("click", async () => {

    const tabs = await chrome.tabs.query({});

    const analysis = analyzeTabs(tabs);

    console.log(analysis);

    tabCount.textContent =
        `You have ${analysis.totalTabs} tabs open.`;
});