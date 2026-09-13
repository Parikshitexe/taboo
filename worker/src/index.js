import { validateRoastContext } from "./validate.js";
import { generateRoast } from "./gemini.js";

const MAX_BODY_BYTES = 50 * 1024;

function isAllowedOrigin(origin) {
    if (!origin) {
        return true;
    }

    return (
        origin.startsWith("chrome-extension://") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
    );
}

function corsHeaders(origin) {
    const allowed = isAllowedOrigin(origin);
    const headers = {
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400"
    };

    if (allowed && origin) {
        headers["Access-Control-Allow-Origin"] = origin;
        headers.Vary = "Origin";
    }

    return headers;
}

function jsonResponse(body, status, origin) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin)
        }
    });
}

async function handleRoast(request, env, origin) {
    const contentLength = Number(request.headers.get("content-length") || 0);

    if (contentLength > MAX_BODY_BYTES) {
        return jsonResponse({ error: "Roast context too large" }, 413, origin);
    }

    let body;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400, origin);
    }

    // Safe metadata only — never log titles/domains.
    console.log("Received roast request:", {
        totalTabs: body?.totalTabs,
        uniqueDomains: body?.uniqueDomains,
        tabEntries: Array.isArray(body?.tabs) ? body.tabs.length : 0,
        duplicateGroups: Array.isArray(body?.duplicateTabs)
            ? body.duplicateTabs.length
            : 0
    });

    if (!validateRoastContext(body)) {
        return jsonResponse({ error: "Invalid roast context" }, 400, origin);
    }

    try {
        const roast = await generateRoast(body, env.GEMINI_API_KEY);

        console.log("Roast generated successfully:", {
            length: roast.length
        });

        return jsonResponse({ roast }, 200, origin);
    } catch (error) {
        console.error("Gemini error:", error?.message || error);
        return jsonResponse({ error: "Failed to generate roast" }, 500, origin);
    }
}

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin") || "";
        const url = new URL(request.url);

        if (request.method === "OPTIONS") {
            if (!isAllowedOrigin(origin)) {
                return new Response(null, { status: 403 });
            }

            return new Response(null, {
                status: 204,
                headers: corsHeaders(origin)
            });
        }

        if (request.method === "GET" && url.pathname === "/") {
            return jsonResponse(
                { message: "Taboo Worker is alive" },
                200,
                origin
            );
        }

        if (request.method === "POST" && url.pathname === "/api/roast") {
            if (origin && !isAllowedOrigin(origin)) {
                return jsonResponse({ error: "Origin not allowed" }, 403, origin);
            }

            return handleRoast(request, env, origin);
        }

        return jsonResponse({ error: "Not found" }, 404, origin);
    }
};
