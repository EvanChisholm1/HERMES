from flask import Flask, request, jsonify
from research.research_agent import openai_websearch_places
import uuid
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS, cross_origin
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

CORS(app)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user_context.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# db = SQLAlchemy(app)

# # User Context Model
# class UserContext(db.Model):
#     __tablename__ = 'user_contexts'
    
#     id = db.Column(db.Integer, primary_key=True)
#     session_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    
#     # Location/Address fields
#     current_location = db.Column(db.String(200))
#     preferred_address = db.Column(db.Text)
#     city = db.Column(db.String(100))
#     region = db.Column(db.String(50))
#     country = db.Column(db.String(50))
    
#     # Additional context fields
#     search_preferences = db.Column(db.JSON)  # Store as JSON
#     user_agent = db.Column(db.String(500))
#     ip_address = db.Column(db.String(45))
    
#     # Timestamps
#     created_at = db.Column(db.DateTime, default=datetime.utcnow)
#     updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
#     last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    
#     def to_dict(self):
#         return {
#             'session_id': self.session_id,
#             'current_location': self.current_location,
#             'preferred_address': self.preferred_address,
#             'city': self.city,
#             'region': self.region,
#             'country': self.country,
#             'search_preferences': self.search_preferences,
#             'created_at': self.created_at.isoformat() if self.created_at else None,
#             'updated_at': self.updated_at.isoformat() if self.updated_at else None
#         }

# # Create tables
# with app.app_context():
#     db.create_all()

# # POST endpoint - Store/Update user context
# @app.route('/user-context', methods=['POST'])
# def store_user_context():
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify({"error": "No data provided"}), 400
        
#         session_id = data.get('session_id')
        
#         # Find existing context or create new one
#         if session_id:
#             context = UserContext.query.filter_by(session_id=session_id).first()
#         else:
#             context = None
            
#         if not context:
#             context = UserContext()
#             db.session.add(context)
        
#         # Update context fields
#         context.current_location = data.get('current_location', context.current_location)
#         context.preferred_address = data.get('preferred_address', context.preferred_address)
#         context.city = data.get('city', context.city)
#         context.state = data.get('state', context.state)
#         context.country = data.get('country', context.country)
#         context.postal_code = data.get('postal_code', context.postal_code)
#         context.latitude = data.get('latitude', context.latitude)
#         context.longitude = data.get('longitude', context.longitude)
#         context.search_preferences = data.get('search_preferences', context.search_preferences)
        
#         # Auto-populate from request
#         context.user_agent = request.headers.get('User-Agent')
#         context.ip_address = request.remote_addr
#         context.last_accessed = datetime.utcnow()
        
#         db.session.commit()
        
#         return jsonify({
#             "message": "Context stored successfully",
#             "session_id": context.session_id,
#             "context": context.to_dict()
#         }), 201
        
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

# def fetch_user_context(session_id): 
#   try:
#     context = UserContext.query.filter_by(session_id=session_id).first()
    
#     if not context:
#         return None
    
#     # Update last accessed time
#     context.last_accessed = datetime.now()
#     db.session.commit()
    
#     return context.to_dict()
#   except Exception as e:
#     return None

# # GET endpoint - Retrieve user context for search
# @app.route('/user-context/<session_id>', methods=['GET'])
# def get_user_context(session_id):
#     try:
#       context_data = fetch_user_context(session_id)
#       if not context_data:
#         return jsonify({"error": "Context not found"}), 404
        
#       return jsonify(context_data)  
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

@app.route('/search', methods=['POST'])
def search_places(): 
  try: 
    data = request.get_json()
    if not data:
      return jsonify({"error": "No data provided"}), 400
    
    # session_id = data.get('session_id')
    search_query = data.get('goal', '')

    # context_data = fetch_user_context(request.json.get('session_id'))
    results = openai_websearch_places(search_query, "Toronto", "Ontario", "CA")
    if results: 
      return jsonify(results), 200
    return jsonify({"error": "No results found"}), 404
  except Exception as e:
    return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)