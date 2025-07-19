import type React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Zap,
  MapPin,
  Clock,
  Star,
  Calendar,
  MessageSquare,
  Phone,
} from "lucide-react";
import { BusinessResult } from "@/types/types";

interface ResultsSelectionProps {
  query: string;
  setQuery: (query: string) => void;
  results: BusinessResult[];
  handleExecute: () => void;
  handleYoloMode: () => void;
  handleExecuteCall: (business: BusinessResult) => void;
  handleNewTask: () => void;
  isProcessing: boolean;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  error: string | null;
}

export function ResultsSelection({
  query,
  setQuery,
  results,
  handleExecute,
  handleYoloMode,
  handleExecuteCall,
  handleNewTask,
  isProcessing,
  handleKeyPress,
  error,
}: ResultsSelectionProps) {
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

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-5 w-5 text-red-400 mt-0.5">⚠</div>
              <div>
                <h3 className="text-red-300 font-medium mb-2">Notice</h3>
                <p className="text-red-200 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mock Mode Indicator */}
        {process.env.NEXT_PUBLIC_USE_MOCK_SEARCH === "true" && (
          <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-200 text-sm font-medium">
                Mock Mode Active - Using test data (no API costs)
              </span>
            </div>
          </div>
        )}

        {/* Agent Analysis */}
        <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <Zap className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <h3 className="text-white font-medium mb-2">Agent Analysis</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                I found {results.length} suitable options for your request: "
                {query}". I've ranked them by relevance, rating, and
                availability. Choose one for me to call, or let me pick the best
                option automatically.
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
          <div className="text-sm text-gray-400 mb-6">
            Agent recommendations ranked by suitability
          </div>

          {results.map((business, index) => (
            <div
              key={index}
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
                        <h3 className="text-lg font-medium text-white">
                          {business.name}
                        </h3>
                      </div>
                    </div>

                    <div className="mb-3 p-3 bg-gray-900/30 rounded border-l-2 border-gray-700">
                      <div className="text-xs text-gray-500 mb-1">
                        AGENT REASONING
                      </div>
                      <div className="text-sm text-gray-300">
                        {business.agentReasoning}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                      {business.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-gray-500" />
                          <span className="truncate">{business.address}</span>
                        </div>
                      )}

                      {business.rating ? (
                        <div className="flex items-center gap-2">
                          <Star className="h-3.5 w-3.5 text-gray-500" />
                          <span>{business.rating} rating</span>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-6">
                    <div className="text-right">
                      <div className="text-base font-mono text-gray-300">
                        {business.phone}
                      </div>
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
  );
}
