from openai import OpenAI
from typing import Optional, List
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class BusinessResult(BaseModel):
    name: str
    address: Optional[str] = None
    phone: str
    agentReasoning: str
    rating: Optional[float] = None
    website: Optional[str] = None

class BusinessSearchResults(BaseModel):
    businesses: List[BusinessResult]

client = OpenAI()

def openai_websearch_places(search_query: str, city: str, province: str, country: str = "CA"): 
    completion = client.chat.completions.parse(
        # model="gpt-4o-2024-08-06",
        model="gpt-4o-search-preview",
        messages=[{
            "role": "user", 
            "content": (
                f"Search for businesses that match this request: {search_query} "
                # "if the user provides a number to call, don't run a search, just return a list with one result that matches the number, don't run a web search. it doesn't need to be a business, could be a loved one or a friend. the name should be the person's name if provided, don't mention anything about a business or serivce in the reasoning, ratings and website should probably be null if not provided "
                f"in {city}, {province}, {country}. "
                "Find real businesses with accurate contact information. "
                "In agentReasoning, explain why each business was selected and how it matches the request."
                # "In general keep the reasoning pretty short and concise."
            )
        }],
        web_search_options={
            "user_location": {
                "type": "approximate",
                "approximate": {
                    "country": "CA",
                    "city": "Toronto",
                    "region": "Ontario",
                }
            }
        },
        response_format=BusinessSearchResults
    )

    # The parsed response is guaranteed to match our schema
    result = completion.choices[0].message.parsed
    
    if result and result.businesses:
        # Convert to list of dicts for compatibility with existing code
        return [business.model_dump() for business in result.businesses]
    
    return []

