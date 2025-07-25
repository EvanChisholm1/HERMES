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

class AppointmentDetails(BaseModel): 
    date: str
    time: str
    confirmationNumber: str

class CallResult(BaseModel): 
    sucesss: bool
    business: BusinessResult
    summary: str
    details: List[str]
    appointmentDetails: Optional[AppointmentDetails] = None
    nextSteps: List[str] = []
    callDuration: str

client = OpenAI()

def openai_websearch_places(search_query: str, city: str, province: str, country: str = "CA"): 
    completion = client.chat.completions.parse(
        model="gpt-4o-search-preview",
        messages=[{
            "role": "user", 
            "content": (
                f"Search for businesses that match this request: {search_query} "
                "if the user provides a number to call, don't run a search, just return a list with one result that matches the number, don't run a web search. it doesn't need to be a business, could be a loved one or a friend. the name should be the person's name if provided, don't mention anything about a business or serivce in the reasoning, ratings and website should probably be null if not provided "
                f"in {city}, {province}, {country}. "
                "Find real businesses with accurate contact information. "
                "In agentReasoning, explain why each business was selected and how it matches the request."
                "In general keep the reasoning pretty short and concise."
            )
        }],
        web_search_options={
            "user_location": {
                "type": "approximate",
                "approximate": {
                    "country": country,
                    "city": city,
                    "region": province,
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

def summarize_call(conversation_messages: List[dict]): 
    completion = client.chat.completions.parse(
        # model="gpt-4o-2024-08-06",
        model="gpt-4o",
        messages=[{
            "role": "user", 
            "content": (
                f"The user just had this phone call conversation with a business: {conversation_messages}"
                # "if the user provides a number to call, don't run a search, just return a list with one result that matches the number, don't run a web search. it doesn't need to be a business, could be a loved one or a friend. the name should be the person's name if provided, don't mention anything about a business or serivce in the reasoning, ratings and website should probably be null if not provided "
                f"Summarize the call and extract key details related to their booking if they made one. Success will be true if booking was made, false if not."
                "Next steps should be a list of actions the user should take next, like 'Pizza will be delivered to your address', 'Receipt emailed to your account', 'wait for confirmation email', 'call back if no email received in 24 hours', etc. "
                # "In general keep the reasoning pretty short and concise."
            )
        }],
        response_format=CallResult
    )

    result = completion.choices[0].message.parsed
    if result: 
        return result.model_dump()

    return None

