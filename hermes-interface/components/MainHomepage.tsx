import type React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Zap } from "lucide-react";

interface MainHomepageProps {
  query: string;
  setQuery: (query: string) => void;
  handleExecute: () => void;
  handleYoloMode: () => void;
  handleSuggestionClick: (suggestion: string) => void;
  isProcessing: boolean;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

const suggestions = [
  "Order me a large pepperoni pizza for delivery tonight",
  "Book me a haircut appointment for this weekend",
  "Get me dinner reservations for 2 people tomorrow at 7pm",
  "Find and call a plumber to fix my kitchen sink leak",
  "Schedule my car for an oil change next week",
  "Book me a 60-minute massage for stress relief",
];

export function MainHomepage({
  query,
  setQuery,
  handleExecute,
  handleYoloMode,
  handleSuggestionClick,
  isProcessing,
  handleKeyPress,
}: MainHomepageProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="text-center my-12">
            <h1 className="text-6xl font-light text-white mb-3">hermes</h1>
            <p className="text-lg text-gray-400 mb-2">
              {/* AI agent that handles your calls */}
              Tell me what you need done. I'll research, call, book, and update
              you.
            </p>
            {/* <p className="text-sm text-gray-500"> */}
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
            <h2 className="text-center text-gray-300 text-base font-medium">
              Suggested tasks
            </h2>
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
                Agent researches → picks best option → makes call → books
                appointment → adds to calendar → sends you summary
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
  );
}
