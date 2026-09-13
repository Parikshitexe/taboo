const MAX_TABS_IN_CONTEXT = 40;
const MAX_DOMAINS_IN_CONTEXT = 20;
const MAX_DUPLICATES_IN_CONTEXT = 10;
const MAX_TITLE_LENGTH = 120;

function sanitizeTitle(title) {
    if (!title) {
        return "";
    }

    // Remove email addresses from tab titles.
    let cleaned = title.replace(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
        "[email]"
    );

    // Strip characters that could break prompt wrappers or look like markup/instructions.
    cleaned = cleaned
        .replace(/[<>]/g, "")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return cleaned;
}

function truncateTitle(title) {
    const cleaned = sanitizeTitle(title);

    if (cleaned.length <= MAX_TITLE_LENGTH) {
        return cleaned;
    }

    return `${cleaned.slice(0, MAX_TITLE_LENGTH)}…`;
}

function sanitizeDomain(domain) {
    if (!domain || typeof domain !== "string") {
        return null;
    }

    const cleaned = domain
        .replace(/[<>]/g, "")
        .replace(/[\u0000-\u001F]/g, "")
        .trim()
        .toLowerCase()
        .slice(0, 253);

    return cleaned || null;
}

function topDomainCounts(domainCounts, limit) {
    return Object.fromEntries(
        Object.entries(domainCounts || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([domain, count]) => [sanitizeDomain(domain) || "unknown", count])
    );
}

function selectTabsForContext(tabs, limit) {
    const list = tabs || [];

    // Keep pinned tabs first — they are strong habit signals.
    const pinned = list.filter(tab => tab.pinned);
    const unpinned = list.filter(tab => !tab.pinned);

    return [...pinned, ...unpinned].slice(0, limit);
}

export function buildRoastContext(analysis) {
    const trimmedDomainCounts = topDomainCounts(
        analysis.domainCounts,
        MAX_DOMAINS_IN_CONTEXT
    );

    const selectedTabs = selectTabsForContext(
        analysis.tabs,
        MAX_TABS_IN_CONTEXT
    );

    const selectedDuplicates = (analysis.duplicateTabs || [])
        .slice(0, MAX_DUPLICATES_IN_CONTEXT)
        .map(group => ({
            domain: sanitizeDomain(group.domain),
            title: truncateTitle(group.title),
            count: group.count
        }));

    return {
        // True totals — even if we only send a sample of tabs.
        totalTabs: analysis.totalTabs,
        pinnedTabs: analysis.pinnedTabs,
        uniqueDomains: analysis.uniqueDomains,

        domainCounts: trimmedDomainCounts,

        duplicateTabs: selectedDuplicates,

        tabs: selectedTabs.map(tab => ({
            title: truncateTitle(tab.title),
            domain: sanitizeDomain(tab.domain),
            pinned: Boolean(tab.pinned)
        }))
    };
}
