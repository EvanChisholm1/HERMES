import { BusinessResult } from "@/types/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const CALLING_SERVICE_URL =
  process.env.NEXT_PUBLIC_CALLING_SERVICE_URL || "http://localhost:3001";
const USE_MOCK_SEARCH = process.env.NEXT_PUBLIC_USE_MOCK_SEARCH === "true";

export interface SearchRequest {
  goal: string;
}

export interface SearchResponse {
  results?: BusinessResult[];
  error?: string;
}

export interface CallRequest {
  number: string;
  prompt: string;
}

// Mock data for testing without burning API credits
const mockSearchResults: BusinessResult[] = [
  {
    name: "Mario's Pizza Palace",
    phone: "(555) 123-4567",
    address: "123 Main St, Downtown",
    rating: 4.5,
    agentReasoning:
      "Best rated pizza place within 2 miles, accepts delivery orders, has pepperoni available",
    website: "https://mariospizza.com",
  },
  {
    name: "Tony's Authentic Italian",
    phone: "(555) 987-6543",
    address: "456 Oak Ave, Little Italy",
    rating: 4.8,
    agentReasoning:
      "Highest rated option, slightly further but excellent reviews for pepperoni pizza",
    website: "https://tonysitalian.com",
  },
  {
    name: "Slice Heaven",
    phone: "(555) 456-7890",
    address: "789 Pine St, Midtown",
    rating: 4.2,
    agentReasoning: "Open latest, good backup option if others are busy",
  },
];

export async function searchPlaces(query: string): Promise<BusinessResult[]> {
  // Use mock data if the flag is set (for testing without API costs)
  if (USE_MOCK_SEARCH) {
    console.log("🔄 Using mock search data for:", query);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Filter mock results based on query for more realistic behavior
    const filteredResults = mockSearchResults.filter(
      (business) =>
        business.name.toLowerCase().includes(query.toLowerCase()) ||
        business.agentReasoning.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes("pizza") ||
        query.toLowerCase().includes("food") ||
        query.toLowerCase().includes("delivery")
    );

    return filteredResults.length > 0 ? filteredResults : mockSearchResults;
  }

  try {
    console.log("🌐 Using real API search for:", query);
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal: query,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // The Flask API returns the results directly, so we need to map them to our BusinessResult format
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        name: item.name || "",
        phone: item.phone || "",
        address: item.address || "",
        rating: item.rating || 0,
        agentReasoning: item.reasoning || item.agentReasoning || "",
        website: item.website || "",
      }));
    }

    return [];
  } catch (error) {
    console.error("Error searching places:", error);
    throw error;
  }
}

export function generateCallPrompt(
  userQuery: string,
  business: BusinessResult,
  userName: string = "Evan",
  userPhone: string = "705-606-0865",
  userAddress?: string
): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `You are a helpful, witty, and friendly AI assistant. Act like a human and never let on that you are an AI. Your voice and personality should be warm and engaging, with a lively and playful tone. Talk quickly and keep responses short and conversational.

Today's date is ${currentDate}.

You are ${userName}'s personal assistant calling ${
    business.name
  }. Here's the context:

${userName}'S REQUEST: "${userQuery}"
BUSINESS: ${business.name}
BUSINESS PHONE: ${business.phone}
BUSINESS ADDRESS: ${business.address}
${business.rating ? `RATING: ${business.rating}/5` : ""}
${userAddress ? `USER'S ADDRESS: ${userAddress}` : ""}

YOUR GOAL: Help ${userName} with their request by speaking to this business. Be specific about what ${userName} needs.

IMPORTANT INSTRUCTIONS:
- YOU ARE CURRENTLY ON THE PHONE WITH ${
    business.name
  } on BEHALF OF ${userName}, communicate ${userName}'s GOAL IMMEDIATELY.
- Start by politely introducing yourself as ${userName}'s assistant
- Clearly explain what ${userName} is looking for based on their request
- ${userName}'s callback number is ${userPhone}
- Be conversational and friendly, not robotic
- Try to get specific details like availability, pricing, or booking information
- If they can help, try to schedule something or get next steps
- Keep the conversation focused and efficient
- DO NOT disclose any information unless asked directly

- If they ask for ${userName}'s name, say "${userName}" but do not give out the phone number unless they ask for it directly.
- You have access to the ${userName}'s google calendar, use this tool to check if certain times are okay for ${userName}. Before confirming any appointment ever consult the calendar.

- You also have access to a tool that can add to the calendar, so if you book an appointment, make sure to add it to the calendar.

- keep your responsese short and to the point, don't yap about information that isn't asked by the business.
- do not ask unnesessary questions or random follow ups, get to the point quickly.

When the conversation starts, let them know you're calling about ${userName}'s request and what specifically you need help with.`;
}

export async function makeCall(
  business: BusinessResult,
  userQuery: string,
  setCallId: (callId: string) => void,
  setListenUrl: (listenUrl: string) => void,
  userName?: string,
  userPhone?: string,
  userAddress?: string,
): Promise<void> {
  try {
    const prompt = generateCallPrompt(
      userQuery,
      business,
      userName,
      userPhone,
      userAddress
    );

    const response = await fetch(`${CALLING_SERVICE_URL}/call`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: business.phone,
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setCallId(data.callId);
    console.log("Listen url", data.listenUrl);
    setListenUrl(data.listenUrl);

    console.log("Call initiated successfully");
  } catch (error) {
    console.error("Error making call:", error);
    throw error;
  }
}
