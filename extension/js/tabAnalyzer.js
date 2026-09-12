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

function findDuplicateTabs(tabs) {
    const urlGroups = new Map();

    for (const tab of tabs) {
        if (!tab.url) {
            continue;
        }

        if (!urlGroups.has(tab.url)) {
            urlGroups.set(tab.url, []);
        }

        urlGroups.get(tab.url).push(tab);
    }

    const duplicateGroups = [];

    for (const [url, matchingTabs] of urlGroups) {
        if (matchingTabs.length > 1) {

            const firstTab = matchingTabs[0];

            duplicateGroups.push({
                domain: firstTab.domain,
                title: firstTab.title,
                count: matchingTabs.length
            });
        }
    }

    return duplicateGroups;
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


    return {
        totalTabs: analyzedTabs.length,
        pinnedTabs: analyzedTabs.filter(tab => tab.pinned).length,
        uniqueDomains: Object.keys(domainCounts).length,
        tabs: analyzedTabs,
        domainCounts,
        duplicateTabs: findDuplicateTabs(analyzedTabs)
    };
}