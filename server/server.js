import express from "express";
import cors from "cors";
import "dotenv/config";

import { generateRoast } from "./services/geminiService.js";

const app = express();

const PORT = 3000;
const MAX_JSON_BODY = "50kb";
const MAX_TABS = 40;
const MAX_DUPLICATES = 10;
const MAX_DOMAINS = 20;
const MAX_TITLE_LENGTH = 120;
const MAX_DOMAIN_LENGTH = 253;

app.use(cors());
app.use(express.json({ limit: MAX_JSON_BODY }));

console.log(
    "Gemini API key loaded:",
    Boolean(process.env.GEMINI_API_KEY)
);

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
        value.length <= MAX_TITLE_LENGTH + 1 && // allow trailing ellipsis
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
    if (!domainCounts || typeof domainCounts !== "object" || Array.isArray(domainCounts)) {
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

function validateRoastContext(context) {
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

    if (!Array.isArray(context.duplicateTabs) || context.duplicateTabs.length > MAX_DUPLICATES) {
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

app.get("/", (req, res) => {
    res.json({
        message: "Taboo backend is alive 🔥"
    });
});

app.post("/api/roast", async (req, res) => {
    try {
        // Log safe metadata only — never titles, domains, or full context.
        console.log("Received roast request:", {
            totalTabs: req.body?.totalTabs,
            uniqueDomains: req.body?.uniqueDomains,
            tabEntries: Array.isArray(req.body?.tabs) ? req.body.tabs.length : 0,
            duplicateGroups: Array.isArray(req.body?.duplicateTabs)
                ? req.body.duplicateTabs.length
                : 0
        });

        if (!validateRoastContext(req.body)) {
            return res.status(400).json({
                error: "Invalid roast context"
            });
        }

        const roast = await generateRoast(req.body);

        console.log("Roast generated successfully:", {
            length: typeof roast === "string" ? roast.length : 0
        });

        res.json({
            roast
        });

    } catch (error) {
        // Body too large from express.json limit
        if (error?.type === "entity.too.large") {
            return res.status(413).json({
                error: "Roast context too large"
            });
        }

        console.error("Gemini error:", error.message || error);

        res.status(500).json({
            error: "Failed to generate roast"
        });
    }
});

// Express JSON size-limit errors can also arrive via this middleware path.
app.use((error, req, res, next) => {
    if (error?.type === "entity.too.large") {
        return res.status(413).json({
            error: "Roast context too large"
        });
    }

    next(error);
});

app.listen(PORT, () => {
    console.log(`Taboo server running on http://localhost:${PORT}`);
});
