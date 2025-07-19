"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Phone,
  Zap,
  MapPin,
  Clock,
  Star,
  Calendar,
  MessageSquare,
  PhoneCall,
  Volume2,
  VolumeX,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

interface BusinessResult {
  id: string
  name: string
  phone: string
  address: string
  rating: number
  hours: string
  category: string
  agentReasoning: string
}

interface CallResult {
  success: boolean
  business: BusinessResult
  summary: string
  details: string[]
  appointmentDetails?: {
    date: string
    time: string
    confirmationNumber: string
  }
  nextSteps: string[]
  callDuration: string
}

const suggestions = [
  "Order me a large pepperoni pizza for delivery tonight",
  "Book me a haircut appointment for this weekend",
  "Get me dinner reservations for 2 people tomorrow at 7pm",
  "Find and call a plumber to fix my kitchen sink leak",
  "Schedule my car for an oil change next week",
  "Book me a 60-minute massage for stress relief",
]

const mockResults: BusinessResult[] = [
  {
    id: "1",
    name: "Mario's Pizza Palace",
    phone: "(555) 123-4567",
    address: "123 Main St, Downtown",
    rating: 4.5,
    hours: "Open until 11 PM",
    category: "Pizza",
    agentReasoning: "Best rated pizza place within 2 miles, accepts delivery orders, has pepperoni available",
  },
  {
    id: "2",
    name: "Tony's Authentic Italian",
    phone: "(555) 987-6543",
    address: "456 Oak Ave, Little Italy",
    rating: 4.8,
    hours: "Open until 10 PM",
    category: "Pizza",
    agentReasoning: "Highest rated option, slightly further but excellent reviews for pepperoni pizza",
  },
  {
    id: "3",
    name: "Slice Heaven",
    phone: "(555) 456-7890",
    address: "789 Pine St, Midtown",
    rating: 4.2,
    hours: "Open until 12 AM",
    category: "Pizza",
    agentReasoning: "Open latest, good backup option if others are busy",
  },
]

const mockCallResult: CallResult = {
  success: true,
  business: mockResults[0],
  summary: "Successfully ordered a large pepperoni pizza for delivery. Order confirmed and payment processed.",
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
}

export default function HermesInterface() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<BusinessResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isOnCall, setIsOnCall] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [currentBusiness, setCurrentBusiness] = useState<BusinessResult | null>(null)
  const [callTranscript, setCallTranscript] = useState<string[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [showCallResults, setShowCallResults] = useState(false)
  const [callResult, setCallResult] = useState<CallResult | null>(null)

  const handleExecute = async () => {
    if (!query.trim()) return

    setIsProcessing(true)
    setShowResults(false)

    // Simulate AI agent processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setResults(mockResults)
    setIsProcessing(false)
    setShowResults(true)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
  }

  const handleExecuteCall = async (business: BusinessResult) => {
    setCurrentBusiness(business)
    setIsOnCall(true)
    setShowResults(false)
    setCallDuration(0)
    setCallTranscript([])

    // Simulate call progression
    const transcript = [
      "Dialing " + business.name + "...",
      "Call connected",
      "Agent: Hi, I'd like to place an order for delivery",
      "Restaurant: What can I get for you?",
      "Agent: I'd like a large pepperoni pizza",
      "Restaurant: Perfect! Can I get your delivery address?",
      "Agent: Yes, it's 123 Your Street",
      "Restaurant: Great! Your total is $21.99. How would you like to pay?",
      "Agent: I'll pay with the card on file",
      "Restaurant: Perfect! Your order will be ready in 35-45 minutes",
      "Agent: Thank you! Have a great evening",
      "Call completed successfully",
    ]

    for (let i = 0; i < transcript.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setCallTranscript((prev) => [...prev, transcript[i]])
    }

    // End call and show results
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsOnCall(false)
    setCallResult(mockCallResult)
    setShowCallResults(true)
  }

  const handleYoloMode = () => {
    if (!query.trim()) return
    // For demo, just execute with first result
    if (mockResults.length > 0) {
      handleExecuteCall(mockResults[0])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExecute()
    }
  }

  const handleNewTask = () => {
    setShowResults(false)
    setShowCallResults(false)
    setIsOnCall(false)
    setQuery("")
    setResults([])
    setCallResult(null)
    setCurrentBusiness(null)
  }

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isOnCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isOnCall])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Call Results Page
  if (showCallResults && callResult) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-800">
            <h1 className="text-2xl font-light text-white">hermes</h1>
            <div className="flex-1">
              <div className="text-gray-400 text-sm">Task completed</div>
            </div>
            <Button
              onClick={handleNewTask}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600"
            >
              New Task
            </Button>
          </div>

          {/* Success Banner */}
          <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-xl font-medium text-white mb-2">Task Completed Successfully</h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{callResult.summary}</p>
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Called {callResult.business.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {callResult.callDuration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          {callResult.appointmentDetails && (
            <div className="mb-8 p-6 bg-gray-900/30 border border-gray-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Delivery Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">DATE</div>
                  <div className="text-gray-300">{callResult.appointmentDetails.date}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">TIME</div>
                  <div className="text-gray-300">{callResult.appointmentDetails.time}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">CONFIRMATION</div>
                  <div className="text-gray-300 font-mono">{callResult.appointmentDetails.confirmationNumber}</div>
                </div>
              </div>
            </div>
          )}

          {/* Call Details */}
          <div className="mb-8 p-6 bg-gray-900/30 border border-gray-800 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Call Summary</h3>
            <div className="space-y-2">
              {callResult.details.map((detail, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <ArrowRight className="h-3 w-3 text-gray-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8 p-6 bg-gray-900/30 border border-gray-800 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Next Steps</h3>
            <div className="space-y-2">
              {callResult.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleNewTask}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600"
            >
              Start New Task
            </Button>
            <Button variant="ghost" className="px-8 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
              View Call History
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Active Call Page
  if (isOnCall && currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-800">
            <h1 className="text-2xl font-light text-white">hermes</h1>
            <div className="flex-1">
              <div className="text-gray-400 text-sm">Agent is on call</div>
            </div>
            <div className="text-gray-300 font-mono">{formatDuration(callDuration)}</div>
          </div>

          {/* Call Status */}
          <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <PhoneCall className="h-8 w-8 text-green-400" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-xl font-medium text-white">Calling {currentBusiness.name}</h2>
                <p className="text-gray-400 text-sm">{currentBusiness.phone}</p>
              </div>
            </div>
            <div className="text-gray-300 text-sm">Agent is handling your request: "{query}"</div>
          </div>

          {/* Live Transcript */}
          <div className="mb-8 p-6 bg-gray-900/30 border border-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Live Transcript</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-gray-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isMuted ? "Unmute" : "Mute"}
                </Button>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {callTranscript.map((line, index) => (
                <div key={index} className="text-sm text-gray-300 p-2 bg-gray-800/50 rounded">
                  {line}
                </div>
              ))}
              {callTranscript.length === 0 && <div className="text-sm text-gray-500 italic">Connecting...</div>}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center gap-4">
            <Button variant="ghost" className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
              Listen In
            </Button>
            <Button
              variant="destructive"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              onClick={() => setIsOnCall(false)}
            >
              End Call
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Results Selection Page
  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-800">
            <h1 className="text-2xl font-light text-white">hermes</h1>
            <div className="flex-1 relative">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me what you need done... Be as detailed as you'd like."
                className="w-full pl-10 pr-4 py-3 text-base bg-gray-900 border-gray-700 text-white placeholder-gray-500 rounded-lg focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
              <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            </div>
            <Button
              onClick={handleExecute}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600"
            >
              {isProcessing ? "Processing..." : "Execute"}
            </Button>
          </div>

          {/* Agent Analysis */}
          <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <Zap className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-2">Agent Analysis</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  I found {results.length} suitable options for your request: "{query}". I've ranked them by relevance,
                  rating, and availability. Choose one for me to call, or let me pick the best option automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleYoloMode}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                Auto-Execute Best Option
              </Button>
              <div className="text-xs text-gray-500 flex items-center">
                Agent will call, book, add to calendar, and send you a summary
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-1">
            <div className="text-sm text-gray-400 mb-6">Agent recommendations ranked by suitability</div>

            {results.map((business, index) => (
              <div
                key={business.id}
                className={`group hover:bg-gray-900/50 transition-colors ${
                  index !== results.length - 1 ? "border-b border-gray-800" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                            #{index + 1} CHOICE
                          </span>
                          <h3 className="text-lg font-medium text-white">{business.name}</h3>
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{business.category}</span>
                      </div>

                      <div className="mb-3 p-3 bg-gray-900/30 rounded border-l-2 border-gray-700">
                        <div className="text-xs text-gray-500 mb-1">AGENT REASONING</div>
                        <div className="text-sm text-gray-300">{business.agentReasoning}</div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          <span className="truncate">{business.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span>{business.hours}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 text-gray-500" />
                          <span>{business.rating} rating</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-6">
                      <div className="text-right">
                        <div className="text-base font-mono text-gray-300">{business.phone}</div>
                      </div>

                      <Button
                        onClick={() => handleExecuteCall(business)}
                        size="sm"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-4 py-2"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Execute Call
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Will add to calendar</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>Will send confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-800 text-center">
            <Button
              variant="ghost"
              onClick={handleNewTask}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              ← New Task
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Main Homepage
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-light text-white mb-3">hermes</h1>
            <p className="text-lg text-gray-400 mb-2">AI agent that handles your calls</p>
            <p className="text-sm text-gray-500">
              Tell me what you need done. I'll research, call, book, and update you.
            </p>
          </div>

          {/* Input box */}
          <div className="relative mb-10">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me what you need done... Be as detailed as you'd like - the more context you provide, the better I can help you."
              className="w-full pl-12 pr-4 py-4 text-base bg-gray-900 border-gray-700 text-white placeholder-gray-500 rounded-lg focus:ring-1 focus:ring-gray-600 focus:border-gray-600 transition-all resize-none min-h-[120px]"
              rows={4}
            />
            <Zap className="absolute left-4 top-4 text-gray-500 h-5 w-5" />
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mb-16">
            <Button
              onClick={handleExecute}
              disabled={isProcessing || !query.trim()}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-gray-600"
            >
              {isProcessing ? "Agent Working..." : "Execute Task"}
            </Button>
            <Button
              onClick={handleYoloMode}
              disabled={!query.trim()}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              YOLO Mode
            </Button>
          </div>

          {/* Suggestions */}
          <div className="space-y-6 mb-12">
            <h2 className="text-center text-gray-300 text-base font-medium">Suggested tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-4 text-left text-gray-200 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition-all text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Feature callout */}
          <div className="p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">YOLO Mode</div>
              <div className="text-xs text-gray-500">
                Agent researches → picks best option → makes call → books appointment → adds to calendar → sends you
                summary
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="py-8 text-center text-xs text-gray-500 border-t border-gray-800">
        <div className="space-x-8">
          <a href="#" className="hover:text-gray-300 transition-colors">
            About
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-gray-300 transition-colors">
            Terms
          </a>
        </div>
      </footer>
    </div>
  )
}
