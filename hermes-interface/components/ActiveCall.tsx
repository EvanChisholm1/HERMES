import type React from "react";
import { Button } from "@/components/ui/button";
import { PhoneCall, Volume2, VolumeX } from "lucide-react";
import { BusinessResult } from "@/types/types";

interface ActiveCallProps {
  currentBusiness: BusinessResult;
  query: string;
  callDuration: number;
  callTranscript: string[];
  isMuted: boolean;
  showListenModal: boolean;
  setShowListenModal: (show: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  setIsOnCall: (onCall: boolean) => void;
  formatDuration: (seconds: number) => string;
  listenToCall: () => void;
}

export function ActiveCall({
  currentBusiness,
  query,
  callDuration,
  callTranscript,
  isMuted,
  showListenModal,
  setShowListenModal,
  setIsMuted,
  setIsOnCall,
  formatDuration,
  listenToCall,
}: ActiveCallProps) {
  return (
    <div className="min-h-screen bg-gray-950">
      {showListenModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-xl border border-gray-700">
            <h2 className="text-xl text-white font-semibold mb-4">Listen In</h2>
            <p className="text-gray-300 text-sm mb-6">
              You are currently listening to this conversation.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowListenModal(false)}
                className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-800">
          <h1 className="text-2xl font-light text-white">hermes</h1>
          <div className="flex-1">
            <div className="text-gray-400 text-sm">Agent is on call</div>
          </div>
          <div className="text-gray-300 font-mono">
            {formatDuration(callDuration)}
          </div>
        </div>

        {/* Call Status */}
        <div className="mb-8 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <PhoneCall className="h-8 w-8 text-green-400" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">
                Calling {currentBusiness.name}
              </h2>
              <p className="text-gray-400 text-sm">{currentBusiness.phone}</p>
            </div>
          </div>
          <div className="text-gray-300 text-sm">
            Agent is handling your request: "{query}"
          </div>
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
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {isMuted ? "Unmute" : "Mute"}
              </Button>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {callTranscript.map((line, index) => (
              <div
                key={index}
                className="text-sm text-gray-300 p-2 bg-gray-800/50 rounded"
              >
                {line}
              </div>
            ))}
            {callTranscript.length === 0 && (
              <div className="text-sm text-gray-500 italic">Connecting...</div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant="ghost"
            className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            onClick={() => listenToCall()}
            // onClick={() => console.log("we here lol")}
          >
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
  );
}
