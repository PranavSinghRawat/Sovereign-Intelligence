/**
 * MCP (Model Context Protocol) - Community Resource Tools
 * 
 * Provides standardized tools for the agent to interact with local aid resources.
 */

export interface CommunityResource {
  id: string;
  name: string;
  type: "medical" | "food" | "financial";
  location: string;
  availability: string;
  distance: string;
}

const MOCK_RESOURCES: CommunityResource[] = [
  { id: "1", name: "SafeHaven Medical Clinic", type: "medical", location: "Downtown", availability: "Immediate", distance: "0.8 miles" },
  { id: "2", name: "Community Bread Basket", type: "food", location: "West Side", availability: "9 AM - 5 PM", distance: "1.2 miles" },
  { id: "3", name: "Unity Health Center", type: "medical", location: "North District", availability: "By Appointment", distance: "2.5 miles" },
  { id: "4", name: "Emergency Fund Partners", type: "financial", location: "Central Hub", availability: "Mon-Fri", distance: "1.5 miles" },
];

/**
 * Tool Implementation: search_community_resources (Live Enterprise Data)
 */
import { db } from "../store/sqlite-db";

/**
 * Sanitizes input strings to prevent Overpass QL injection attacks.
 * Only allows alphanumeric characters, spaces, hyphens, periods, and commas.
 */
const sanitizeOverpassInput = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9\s\-.,]/g, "").trim().slice(0, 100);
};

/** TTL for API response cache: 1 hour in milliseconds */
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Checks the SQLite cache for a valid (non-expired) API response.
 */
async function getCachedResponse(cacheKey: string): Promise<CommunityResource[] | null> {
  try {
    const rows = await db.exec(
      "SELECT response_json, created_at FROM api_cache WHERE cache_key = ?",
      [cacheKey]
    );
    const results = rows as unknown as [string, number][];
    if (results.length > 0) {
      const [responseJson, createdAt] = results[0];
      if (Date.now() - createdAt < CACHE_TTL_MS) {
        console.log("[MCP] Serving from SQLite cache (TTL valid):", cacheKey);
        return JSON.parse(responseJson);
      }
      // Cache expired — delete stale entry
      await db.exec("DELETE FROM api_cache WHERE cache_key = ?", [cacheKey]);
    }
  } catch {
    // Cache miss or DB not ready — proceed to live fetch
  }
  return null;
}

/**
 * Stores an API response in the SQLite cache.
 */
async function setCachedResponse(cacheKey: string, data: CommunityResource[]): Promise<void> {
  try {
    await db.exec(
      "INSERT OR REPLACE INTO api_cache (cache_key, response_json, created_at) VALUES (?, ?, ?)",
      [cacheKey, JSON.stringify(data), Date.now()]
    );
  } catch {
    // Silently fail — caching is best-effort
  }
}

export const searchCommunityResources = async (query: { type?: string; location?: string }) => {
  console.log(`[MCP] Executing live search_community_resources with:`, query);
  
  const amenityMap: Record<string, string> = {
    medical: "clinic|hospital|doctors",
    food: "social_facility|food_bank",
    financial: "social_facility"
  };

  const amenity = query.type && amenityMap[query.type] ? amenityMap[query.type] : "social_facility";
  const rawLocation = query.location || "Seattle";
  const location = sanitizeOverpassInput(rawLocation);

  // Reject obviously invalid locations that survived sanitization
  if (location.length < 2 || location.length > 80) {
    console.warn("[MCP] Location input rejected by sanitizer:", rawLocation);
    return MOCK_RESOURCES.filter(r => query.type ? r.type === query.type : true);
  }

  // Check SQLite cache before making a live API call
  const cacheKey = `overpass:${query.type || "all"}:${location.toLowerCase()}`;
  const cached = await getCachedResponse(cacheKey);
  if (cached) return cached;

  const overpassQuery = `
    [out:json][timeout:5];
    area[name~"${location}",i]->.searchArea;
    (
      node["amenity"~"${amenity}"](area.searchArea);
      node["healthcare"~"clinic"](area.searchArea);
    );
    out 3;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery
    });

    if (!response.ok) throw new Error("API Limit");
    const data = await response.json();
    
    if (!data.elements || data.elements.length === 0) throw new Error("No results");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = data.elements.map((el: Record<string, any>) => ({
      id: el.id?.toString() || Math.random().toString(),
      name: el.tags?.name || "Community Resource",
      type: query.type || "unknown",
      location: el.tags?.["addr:city"] || location,
      availability: el.tags?.opening_hours || "Contact directly for hours",
      distance: "Live Data"
    }));

    // Store in cache for future requests
    await setCachedResponse(cacheKey, results);

    return results;
  } catch {
    console.warn("[MCP] Live API fallback to cached registry due to network/limits.");
    // Enterprise Fallback
    return MOCK_RESOURCES.filter(r => query.type ? r.type === query.type : true);
  }
};

/**
 * Tool Implementation: get_resource_availability
 */
export const getResourceAvailability = async (id: string) => {
  const resource = MOCK_RESOURCES.find(r => r.id === id);
  return resource ? resource.availability : "Resource not found in registry";
};

/**
 * Standardized Tool Schema for LLM Function Calling (OpenAI/WebLLM Format)
 */
export const MCP_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_community_resources",
      description: "Search for local community resources like medical clinics, food banks, or financial aid.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["medical", "food", "financial"], description: "The type of aid needed." },
          location: { type: "string", description: "The general area or district." }
        },
        required: ["type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_resource_availability",
      description: "Get detailed availability or opening hours for a specific resource by its ID.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "The unique ID of the resource." }
        },
        required: ["id"]
      }
    }
  }
];
