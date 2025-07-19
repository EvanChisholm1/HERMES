import { BusinessResult } from '@/types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface SearchRequest {
  goal: string;
}

export interface SearchResponse {
  results?: BusinessResult[];
  error?: string;
}

export async function searchPlaces(query: string): Promise<BusinessResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        name: item.name || '',
        phone: item.phone || '',
        address: item.address || '',
        rating: item.rating || 0,
        agentReasoning: item.reasoning || item.agentReasoning || '',
        website: item.website || '',
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}