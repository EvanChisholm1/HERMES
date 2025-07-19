"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { MainHomepage } from "@/components/MainHomepage";
import { ResultsSelection } from "@/components/ResultsSelection";
import { ActiveCall } from "@/components/ActiveCall";
import { BusinessResult, CallResult, UserSettings } from "@/types/types";
import { CallResults } from "@/components/CallResults";
import { searchPlaces, makeCall } from "@/services/api";
import { getUserSettings } from "@/utils/userSettings";
import { useRef } from "react";

const mockResults: BusinessResult[] = [
  {
    name: "Mario's Pizza Palace",
    phone: "(555) 123-4567",
    address: "123 Main St, Downtown",
    rating: 4.5,
    agentReasoning:
      "Best rated pizza place within 2 miles, accepts delivery orders, has pepperoni available",
  },
  {
    name: "Tony's Authentic Italian",
    phone: "(555) 987-6543",
    address: "456 Oak Ave, Little Italy",
    rating: 4.8,
    agentReasoning:
      "Highest rated option, slightly further but excellent reviews for pepperoni pizza",
  },
  {
    name: "Slice Heaven",
    phone: "(555) 456-7890",
    address: "789 Pine St, Midtown",
    rating: 4.2,
    agentReasoning: "Open latest, good backup option if others are busy",
  },
];

const mockCallResult: CallResult = {
  success: true,
  business: mockResults[0],
  summary:
    "Successfully ordered a large pepperoni pizza for delivery. Order confirmed and payment processed.",
  details: [
    "Called Mario's Pizza Palace at 8:23 PM",
    "Spoke with Maria at the front desk",
    "Confirmed large pepperoni pizza availability",
    "Provided delivery address: 123 Your Street",
    "Payment processed: $18.99 + $3.00 delivery fee",
    "Estimated delivery time: 35-45 minutes",
  ],
  appointmentDetails: {
    date: "Today",
    time: "9:00 PM - 9:45 PM",
    confirmationNumber: "MP-2024-1847",
  },
  nextSteps: [
    "Pizza will be delivered to your address",
    "Delivery confirmation sent to your phone",
    "Receipt emailed to your account",
  ],
  callDuration: "3m 42s",
};

export default function HermesInterface() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BusinessResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentBusiness, setCurrentBusiness] = useState<BusinessResult | null>(
    null
  );
  const [callTranscript, setCallTranscript] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showCallResults, setShowCallResults] = useState(false);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(() => getUserSettings());
  const wsRef = useRef<WebSocket | null>(null);

  const handleExecute = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setShowResults(false);
    setError(null);

    try {
      // Call the Flask API to search for places
      const searchResults = await searchPlaces(query);
      if (searchResults.length === 0) {
        setError("No businesses found for your request. Please try a different search.");
        setResults(mockResults); // Show mock data as fallback
      } else {
        setResults(searchResults);
      }
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setError("Unable to connect to search service. Showing sample results.");
      // Fallback to mock data if API fails
      setResults(mockResults);
      setShowResults(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleExecuteCall = async (business: BusinessResult) => {
    setCurrentBusiness(business);
    setIsOnCall(true);
    setShowResults(false);
    setCallDuration(0);
    setCallTranscript([]);
    setError(null);

    try {
      // Add initial status
      setCallTranscript(["Initiating call to " + business.name + "..."]);
      
      // Make the actual call using the calling service
      await makeCall(business, query, userSettings.name, userSettings.phone, userSettings.address);
      
      // Update transcript to show call was initiated
      setCallTranscript((prev) => [...prev, "Call initiated successfully", "AI agent is now speaking with " + business.name]);
      
      // Simulate some call progress for demo
      // const transcript = [
      //   "Agent is introducing themselves...",
      //   "Explaining your request to the business...",
      //   "Getting information and availability...",
      //   "Call in progress - this may take a few minutes",
      // ];

      // for (let i = 0; i < transcript.length; i++) {
      //   await new Promise((resolve) => setTimeout(resolve, 3000));
      //   setCallTranscript((prev) => [...prev, transcript[i]]);
      // }
    } catch (error) {
      console.error('Failed to initiate call:', error);
      setError("Failed to initiate call. Please try again.");
      setCallTranscript((prev) => [...prev, "Error: Failed to initiate call"]);
      
      // Fall back to mock behavior
      setTimeout(() => {
        setIsOnCall(false);
        setCallResult(mockCallResult);
        setShowCallResults(true);
      }, 2000);
    }
  };

  const handleYoloMode = async () => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call the Flask API to search for places
      const searchResults = await searchPlaces(query);
      if (searchResults.length > 0) {
        handleExecuteCall(searchResults[0]);
      } else {
        setError("No businesses found for your request.");
        // Fallback to mock data if no results
        if (mockResults.length > 0) {
          handleExecuteCall(mockResults[0]);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError("Unable to connect to search service. Using fallback option.");
      // Fallback to mock data if API fails
      if (mockResults.length > 0) {
        handleExecuteCall(mockResults[0]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExecute();
    }
  };

  const handleNewTask = () => {
    setShowResults(false);
    setShowCallResults(false);
    setIsOnCall(false);
    setQuery("");
    setResults([]);
    setCallResult(null);
    setCurrentBusiness(null);
    setError(null);
  };

  const handleUserSettingsChange = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
  };

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOnCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnCall]);

  useEffect(() => {
    if (!isOnCall) return;
    // Connect to WebSocket server
    // const ws = new window.WebSocket("ws://localhost:3001/vapi-event");
    const ws = new window.WebSocket("ws://localhost:3001/vapi-event");
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "agent_spoke" || data.type === "user_spoke") {
          setCallTranscript((prev) => [...prev, data.text || JSON.stringify(data)]);
        }

        if (data.type === 'call_ended') { 
          console.log("Call ended"); 
          setCallTranscript((prev) => [...prev, "Call completed - processing results..."]);
          setIsOnCall(false);
          setCallResult(mockCallResult);
          setShowCallResults(true);
        }
      } catch (e) {
        // Ignore parse errors
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [isOnCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Call Results Page
  if (showCallResults && callResult) {
    return (
      <CallResults callResult={callResult} handleNewTask={handleNewTask} />
    );
  }

  // Active Call Page
  if (isOnCall && currentBusiness) {
    return (
      <ActiveCall
        currentBusiness={currentBusiness}
        query={query}
        callDuration={callDuration}
        callTranscript={callTranscript}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        setIsOnCall={setIsOnCall}
        formatDuration={formatDuration}
      />
    );
  }

  // Results Selection Page
  if (showResults) {
    return (
      <ResultsSelection
        query={query}
        setQuery={setQuery}
        results={results}
        handleExecute={handleExecute}
        handleYoloMode={handleYoloMode}
        handleExecuteCall={handleExecuteCall}
        handleNewTask={handleNewTask}
        isProcessing={isProcessing}
        handleKeyPress={handleKeyPress}
        error={error}
      />
    );
  }

  // Main Homepage
  return (
    <MainHomepage
      query={query}
      setQuery={setQuery}
      handleExecute={handleExecute}
      handleYoloMode={handleYoloMode}
      handleSuggestionClick={handleSuggestionClick}
      isProcessing={isProcessing}
      handleKeyPress={handleKeyPress}
      onUserSettingsChange={handleUserSettingsChange}
    />
  );
}
