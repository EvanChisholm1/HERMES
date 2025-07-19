class SessionManager {
    constructor() {
        this.sessionId = null;
        this.baseUrl = 'http://localhost:5000';
    }

    // Get existing session or create new one
    async getOrCreateSession() {
        // First, try to get from localStorage
        this.sessionId = localStorage.getItem('user_session_id');
        
        if (this.sessionId) {
            // Verify session still exists on server
            const isValid = await this.validateSession(this.sessionId);
            if (isValid) {
                console.log('Using existing session:', this.sessionId);
                return this.sessionId;
            } else {
                // Session expired or doesn't exist, remove from localStorage
                localStorage.removeItem('user_session_id');
                this.sessionId = null;
            }
        }
        
        // Create new session
        return await this.createNewSession();
    }

    // Create new session on server
    async createNewSession() {
        try {
            const response = await fetch(`${this.baseUrl}/init-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to create session');
            }
            
            const data = await response.json();
            this.sessionId = data.session_id;
            
            // Persist to localStorage
            localStorage.setItem('user_session_id', this.sessionId);
            
            console.log('Created new session:', this.sessionId);
            return this.sessionId;
            
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    // Validate session exists on server
    async validateSession(sessionId) {
        try {
            const response = await fetch(`${this.baseUrl}/user-context/${sessionId}`);
            return response.ok; // Returns true if session exists (200), false if not found (404)
        } catch (error) {
            console.error('Error validating session:', error);
            return false;
        }
    }

    // Store user context
    async storeContext(contextData) {
        const sessionId = await this.getOrCreateSession();
        
        try {
            const response = await fetch(`${this.baseUrl}/user-context/${sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contextData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to store context');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Error storing context:', error);
            throw error;
        }
    }

    // Perform search with context
    async search(query) {
        const sessionId = await this.getOrCreateSession();
        
        try {
            const response = await fetch(`${this.baseUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    query: query
                })
            });
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Error performing search:', error);
            throw error;
        }
    }

    // Get current session context
    async getContext() {
        if (!this.sessionId) {
            await this.getOrCreateSession();
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/user-context/${this.sessionId}`);
            
            if (!response.ok) {
                throw new Error('Failed to get context');
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Error getting context:', error);
            throw error;
        }
    }

    // Clear session (logout)
    clearSession() {
        localStorage.removeItem('user_session_id');
        this.sessionId = null;
        console.log('Session cleared');
    }

    // Get current session ID
    getCurrentSessionId() {
        return this.sessionId || localStorage.getItem('user_session_id');
    }
}

// Usage example
const sessionManager = new SessionManager();

// Example usage functions
async function initializeApp() {
    try {
        // This will either restore existing session or create new one
        const sessionId = await sessionManager.getOrCreateSession();
        console.log('App initialized with session:', sessionId);
        
        // Update UI to show session status
        document.getElementById('session-status').textContent = `Session: ${sessionId}`;
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

async function storeUserLocation() {
    try {
        const result = await sessionManager.storeContext({
            current_location: "123 Main St, Toronto, ON",
            city: "Toronto",
            state: "Ontario",
            country: "Canada",
            latitude: 43.6532,
            longitude: -79.3832
        });
        
        console.log('Context stored:', result);
        
    } catch (error) {
        console.error('Failed to store location:', error);
    }
}

async function performSearch() {
    const query = document.getElementById('search-input').value;
    
    try {
        const results = await sessionManager.search(query);
        console.log('Search results:', results);
        
        // Display results in UI
        displaySearchResults(results);
        
    } catch (error) {
        console.error('Search failed:', error);
    }
}

function displaySearchResults(results) {
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = `
        <h3>Search Results:</h3>
        <pre>${JSON.stringify(results, null, 2)}</pre>
    `;
}

// Initialize when page loads
window.addEventListener('load', initializeApp);