"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { MainHomepage } from "@/components/MainHomepage";
import { ResultsSelection } from "@/components/ResultsSelection";
import { ActiveCall } from "@/components/ActiveCall";
import {
  BusinessResult,
  CallResult,
  Message,
  UserSettings,
} from "@/types/types";
import { CallResults } from "@/components/CallResults";
import { searchPlaces, makeCall, generateCallPrompt } from "@/services/api";
import { getUserSettings } from "@/utils/userSettings";
import { useRef } from "react";
import { buffer } from "stream/consumers";
import PCMPlayer from "pcm-player";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(() =>
    getUserSettings()
  );
  const wsRef = useRef<WebSocket | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [listenUrl, setListenUrl] = useState<string | null>(null);
  const [showListenModal, setShowListenModal] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);

  const handleExecute = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setShowResults(false);
    setError(null);
    setCallId(null);
    setListenUrl(null);

    try {
      // Call the Flask API to search for places
      const searchResults = 
        await searchPlaces(query, userSettings.city, userSettings.province, userSettings.country);
      if (searchResults.length === 0) {
        setError(
          "No businesses found for your request. Please try a different search."
        );
        setResults([]); // Show mock data as fallback
      } else {
        setResults(searchResults);
      }
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Unable to connect to search service. Showing sample results.");
      // Fallback to mock data if API fails
      setResults([]);
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
    setCallId(null);
    setListenUrl(null);

    try {
      setCallTranscript(["Initiating call to " + business.name + "..."]);
      // Make the actual call using the calling service
      await makeCall(
        business,
        query,
        setCallId,
        setListenUrl,
        userSettings.name,
        userSettings.phone,
        userSettings.address
      );

      // Update transcript to show call was initiated
      setCallTranscript((prev) => [
        ...prev,
        "Call initiated successfully",
        "AI agent is now speaking with " + business.name,
      ]);

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
      console.error("Failed to initiate call:", error);
      setError("Failed to initiate call. Please try again.");
      setCallTranscript((prev) => [...prev, "Error: Failed to initiate call"]);
    }
  };
  
  const listenToCall = (listenUrl: string) => {
    if (!listenUrl) {
      console.error("Listen URL is not set. Cannot listen to call.");
      setError("Listen URL is not available. Cannot listen to call.");
      return;
    }

    console.log("Starting to listen to call", listenUrl);
    setShowListenModal(true);
    const audioContext = new window.AudioContext();
    const socket = new WebSocket(listenUrl);
    socket.binaryType = "blob"; // default, but good to set explicitly

    const player = new PCMPlayer({
      inputCodec: "Int16",
      channels: 2, // ✅ Match the server's channel count
      sampleRate: 16000,
      flushTime: 500,
      fftSize: 512,
    });

    player.volume(1);

    socket.onmessage = async (event: MessageEvent<Blob | string>) => {
      if (typeof event.data === "string") {
        // Handle initial metadata JSON
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        if (message.type === "start") {
          // Optionally adjust player config based on message.encoding/channels
          console.log("Audio stream starting...");
        }
      } else if (event.data instanceof Blob) {
        // Convert Blob to ArrayBuffer
        const arrayBuffer = await event.data.arrayBuffer();

      // Feed the raw PCM data to the player
      player.feed(arrayBuffer);
    } else {
      console.warn("Unknown event data type:", typeof event.data);
    }};
  }

  const handleYoloMode = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Call the Flask API to search for places
      const searchResults = 
        await searchPlaces(query, userSettings.city, userSettings.province, userSettings.country);
      console.log(searchResults);

      if (searchResults.length > 0) {
        handleExecuteCall(searchResults[0]);
      } else {
        setError("No businesses found for your request.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      setError("Unable to connect to search service. Using fallback option.");
      // Fallback to mock data if API fails
      if (mockResults.length > 0) {
        // handleExecuteCall(mockResults[0]);
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
    setMessages([]);
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
        // if (data.type === "agent_spoke" || data.type === "user_spoke") {
        if (data.type === "message") {
          setCallTranscript((prev) => [...prev, data.text || ""]);
        }

        if (data.type === 'ringing') { 
          console.log("Call is ringing");
          setCallTranscript((prev) => [...prev, "Call is ringing..."]);
          setIsCallConnected(false);
        } else if (data.type === 'in-progress') { 
          // setCallTranscript((prev) => [...prev, `Call is in progress with ${currentBusiness?.name}`]);
          setCallTranscript((prev) => {
            const message = `Call is in progress with ${currentBusiness?.name}`;
            if (!prev.includes(message)) {
              return [...prev, message];
            }
            return prev;
          });
          setIsCallConnected(true);
        }

        if (data.type === 'call_ended') { 
          console.log("Call ended"); 
          setCallTranscript((prev) => [...prev, "Call completed - processing results..."]);
          setIsCallConnected(false);
        }

        if (data.type === "summary_ready") {
          setIsOnCall(false); 
          setCallResult(data.summary);
          setMessages(data.messages || []);
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

  const endCall = async () => { 
    try { 
      const response = await fetch(`${process.env.NEXT_PUBLIC_CALLING_SERVICE_URL}/end-call/${callId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) { 
      console.error("Failed to end call:", error);
      setError("Failed to end call. Please try again.");
    }
  }

  // Call Results Page
  if (showCallResults && callResult) {
    return (
      <CallResults
        callResult={callResult}
        handleNewTask={handleNewTask}
        messages={messages}
      />
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
        isCallConnected={isCallConnected}
        isMuted={isMuted}
        showListenModal={showListenModal}
        setShowListenModal={setShowListenModal}
        setIsMuted={setIsMuted}
        endCall={endCall}
        formatDuration={formatDuration}
        listenToCall={() => listenToCall(listenUrl || "")}
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
