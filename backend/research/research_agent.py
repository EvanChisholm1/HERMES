from openai import OpenAI
import json
from typing import Optional
from pydantic import BaseModel
import re

class Place(BaseModel):
    name: str
    address: str
    phone: str
    rating: Optional[float]
    website: Optional[str]

client = OpenAI()

def openai_websearch_places(city: str, province: str, country: str = "CA"): 
  completion = client.chat.completions.create(
      model="gpt-4o-search-preview",
      web_search_options={
          "user_location": {
              "type": "approximate",
              "approximate": {
                  "country": country,
                  "city": city,
                  "region": province,
              }
          },
      },
      messages=[{
          "role": "user",
          "content": (
              "What are the 3 best places to get a haircut in Collingwood, Ontario? "
              "Return the result as JSON array with this schema: "
              "[{name: string, address: string, phone: string, rating: float (optional), website: string (optional)}]"
          )
      }],
  )

  # Parse and validate the structured JSON response
  response = completion.choices[0].message.content
  pattern = r"\[\s*\{.*?\}\s*(,\s*\{.*?\}\s*)*\]"
  match = re.search(pattern, response, re.DOTALL)

  validated = []

  if match: 
    places = json.loads(match.group(0))
    for place in places: 
      try: 
        if place.get("name") and place.get("address") and place.get("phone"):
            validated.append(Place(**place).model_dump())
      except Exception as e:
        print(f"Error validating place: {place}. Error: {e}")
  
  return validated

