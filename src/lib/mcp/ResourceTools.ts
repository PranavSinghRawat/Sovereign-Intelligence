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
 * Tool Definition: search_community_resources
 */
export const searchCommunityResources = (query: { type?: string; location?: string }) => {
  console.log(`[MCP] Executing search_community_resources with:`, query);
  
  return MOCK_RESOURCES.filter(r => {
    const matchType = query.type ? r.type === query.type : true;
    const matchLocation = query.location ? r.location.toLowerCase().includes(query.location.toLowerCase()) : true;
    return matchType && matchLocation;
  });
};

/**
 * Tool Definition: get_resource_availability
 */
export const getResourceAvailability = (id: string) => {
  const resource = MOCK_RESOURCES.find(r => r.id === id);
  return resource ? resource.availability : "Resource not found";
};

/**
 * Standardized Tool Schema for LLM Function Calling
 */
export const MCP_TOOLS = [
  {
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
  },
  {
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
];
