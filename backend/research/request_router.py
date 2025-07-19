from openai import OpenAI
from typing import Optional, List, Literal
from pydantic import BaseModel
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DirectCallRequest(BaseModel):
    request_type: Literal["direct_call"]
    phone_number: str
    contact_name: Optional[str] = None
    purpose: str

class BusinessSearchRequest(BaseModel):
    request_type: Literal["business_search"]
    search_query: str
    location_preference: Optional[str] = None

class RequestClassification(BaseModel):
    classification: DirectCallRequest | BusinessSearchRequest
    
    class Config:
        # This allows for the union type to work properly
        discriminator = 'request_type'

client = OpenAI()

def extract_phone_number(text: str) -> Optional[str]:
    """Extract phone number from text using regex patterns"""
    # Common phone number patterns
    patterns = [
        r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US format
        r'\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # Basic format
        r'([0-9]{3})[-.]?([0-9]{3})[-.]?([0-9]{4})',  # No spaces
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            # Clean up the phone number
            digits = re.sub(r'[^\d]', '', match.group(0))
            if len(digits) == 10:
                return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
            elif len(digits) == 11 and digits[0] == '1':
                return f"({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    
    return None

def classify_request(user_input: str):
    """Classify user input as either a direct call or business search request"""
    
    # First, check if there's a phone number in the input
    phone_number = extract_phone_number(user_input)
    
    if phone_number:
        # If we found a phone number, create a direct call request
        # Extract contact name if mentioned
        contact_name = None
        purpose = user_input
        
        # Simple name extraction (look for common patterns)
        name_patterns = [
            r'call\s+(?:my\s+)?(friend\s+)?(\w+)',
            r'(\w+)\s+at\s+[\d\-\(\)\s]+',
            r'call\s+(\w+)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, user_input.lower())
            if match:
                potential_name = match.group(1)
                if potential_name not in ['my', 'the', 'a', 'an', 'friend']:
                    contact_name = potential_name.title()
                    break
        
        return DirectCallRequest(
            request_type="direct_call",
            phone_number=phone_number,
            contact_name=contact_name,
            purpose=purpose
        )
    
    # If no phone number found, classify as business search
    return BusinessSearchRequest(
        request_type="business_search",
        search_query=user_input,
        location_preference=None
    )

def create_direct_call_business_result(phone_number: str, contact_name: Optional[str], purpose: str) -> dict:
    """Create a business result for direct phone calls"""
    display_name = contact_name if contact_name else "Direct Contact"
    
    return {
        "name": display_name,
        "phone": phone_number,
        "address": "Direct phone call",
        "rating": None,
        "agentReasoning": f"Direct call requested to {display_name} for: {purpose}",
        "website": None
    }