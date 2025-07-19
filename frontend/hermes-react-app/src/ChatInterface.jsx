import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PhoneCallInterface() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/research-places/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.results)) {
        throw new Error('Invalid response format');
      }

      setResults(data.results);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch call targets. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">What do you want to do over a phone call?</h1>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Order a pizza near York University"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Submit'}
        </Button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-4">
        {results.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-4 space-y-2">
              <div className="text-lg font-bold">{item.name}</div>
              <div className="text-sm text-gray-600">{item.address}</div>
              {item.rating != null && (
                <div className="text-sm text-yellow-600">Rating: {item.rating}</div>
              )}
              {item.phone ? (
                <a href={`tel:${item.phone}`}>
                  <Button variant="outline">Call</Button>
                </a>
              ) : (
                <div className="text-sm text-gray-400">Phone number not available</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
