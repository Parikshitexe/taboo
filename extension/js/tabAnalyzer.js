function getDomain(url) {
    if (!url) {
        return null;
    }

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.replace(/^www\./, "");
    } catch {
        return null;
    }
}

export function analyzeTabs(tabs) {
    const analyzedTabs = tabs.map(tab => ({
        title: tab.title,
        url: tab.url,
        domain: getDomain(tab.url),
        pinned: tab.pinned
    }));

    const domainCounts = {};

    for (const tab of analyzedTabs) {

        if (!tab.domain) {
            continue;
        }

        if (!domainCounts[tab.domain]) {
            domainCounts[tab.domain] = 0;
        }

        domainCounts[tab.domain]++;
    } 

    function findDuplicateTabs(tabs) {
        const urlCounts = new Map();
    
        for (const tab of tabs) {
            if (!tab.url) {
                continue;
            }
    
            const currentCount = urlCounts.get(tab.url) || 0;
    
            urlCounts.set(tab.url, currentCount + 1);
        }
    
        const duplicateGroups = [];
    
        for (const [url, count] of urlCounts) {
            if (count > 1) {
                duplicateGroups.push({
                    url,
                    count
                });
            }
        }
    
        return duplicateGroups;
    }

    return {
        totalTabs: analyzedTabs.length,
        pinnedTabs: analyzedTabs.filter(tab => tab.pinned).length,
        tabs: analyzedTabs,
        domainCounts,
        duplicateTabs: findDuplicateTabs(analyzedTabs)
    };
}