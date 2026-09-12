function sanitizeTitle(title) {
    if (!title) {
        return "";
    }

    // Remove email addresses from tab titles.
    return title.replace(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
        "[email]"
    );
}


export function buildRoastContext(analysis) {

    return {
        totalTabs: analysis.totalTabs,

        pinnedTabs: analysis.pinnedTabs,

        uniqueDomains: analysis.uniqueDomains,

        domainCounts: analysis.domainCounts,

        duplicateTabs: analysis.duplicateTabs,

        tabs: analysis.tabs.map(tab => ({
            title: sanitizeTitle(tab.title),
            domain: tab.domain,
            pinned: tab.pinned
        }))
    };
}