const MAX_TABS = 40;
const MAX_DUPLICATES = 10;
const MAX_DOMAINS = 20;
const MAX_TITLE_LENGTH = 120;
const MAX_DOMAIN_LENGTH = 253;

function isNonNegativeInteger(value) {
    return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        Number.isInteger(value) &&
        value >= 0
    );
}

function isValidDomain(value) {
    if (value === null) {
        return true;
    }

    return (
        typeof value === "string" &&
        value.length > 0 &&
        value.length <= MAX_DOMAIN_LENGTH &&
        !/[<>]/.test(value)
    );
}

function isValidTitle(value) {
    return (
        typeof value === "string" &&
        value.length <= MAX_TITLE_LENGTH + 1 &&
        !/[<>]/.test(value)
    );
}

function isValidTab(tab) {
    if (!tab || typeof tab !== "object" || Array.isArray(tab)) {
        return false;
    }

    return (
        isValidTitle(tab.title) &&
        isValidDomain(tab.domain) &&
        typeof tab.pinned === "boolean"
    );
}

function isValidDuplicate(group) {
    if (!group || typeof group !== "object" || Array.isArray(group)) {
        return false;
    }

    return (
        isValidTitle(group.title) &&
        isValidDomain(group.domain) &&
        isNonNegativeInteger(group.count) &&
        group.count >= 2
    );
}

function isValidDomainCounts(domainCounts) {
    if (
        !domainCounts ||
        typeof domainCounts !== "object" ||
        Array.isArray(domainCounts)
    ) {
        return false;
    }

    const entries = Object.entries(domainCounts);

    if (entries.length > MAX_DOMAINS) {
        return false;
    }

    for (const [domain, count] of entries) {
        if (!isValidDomain(domain) || domain === null) {
            return false;
        }

        if (!isNonNegativeInteger(count) || count < 1) {
            return false;
        }
    }

    return true;
}

export function validateRoastContext(context) {
    if (!context || typeof context !== "object" || Array.isArray(context)) {
        return false;
    }

    if (!isNonNegativeInteger(context.totalTabs)) {
        return false;
    }

    if (!isNonNegativeInteger(context.pinnedTabs)) {
        return false;
    }

    if (!isNonNegativeInteger(context.uniqueDomains)) {
        return false;
    }

    if (context.pinnedTabs > context.totalTabs) {
        return false;
    }

    if (!Array.isArray(context.tabs) || context.tabs.length > MAX_TABS) {
        return false;
    }

    if (
        !Array.isArray(context.duplicateTabs) ||
        context.duplicateTabs.length > MAX_DUPLICATES
    ) {
        return false;
    }

    if (!context.tabs.every(isValidTab)) {
        return false;
    }

    if (!context.duplicateTabs.every(isValidDuplicate)) {
        return false;
    }

    if (!isValidDomainCounts(context.domainCounts)) {
        return false;
    }

    return true;
}
