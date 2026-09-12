const roastButton = document.getElementById("roastButton");
const tabCount = document.getElementById("tabCount");

roastButton.addEventListener("click", async () => {
    const tabs = await chrome.tabs.query({});

    tabCount.textContent = `You have ${tabs.length} tabs open.`;
});