import type React from "react";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { BusinessResult, CallResult, Message } from "@/types/types";

interface CallResultsProps {
  callResult: CallResult;
  messages: Message[];
  handleNewTask: () => void;
}

export function CallResults({ callResult, messages, handleNewTask }: CallResultsProps) {
  const [showChat, setShowChat] = useState(false);
  
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
              <h2 className="text-xl font-medium text-white mb-2">
                Task Completed Successfully
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {callResult.summary}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Called {callResult.business.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {callResult.callDuration}</span>
                </div>
              </div>

              <button
                onClick={() => setShowChat(!showChat)}
                className="text-sm text-blue-400 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" />
                {showChat ? 'Hide Transcript' : 'View Transcript'}
              </button>

              {showChat && (
                <div className="mt-4 space-y-2 bg-gray-800 p-4 rounded-lg max-h-64 overflow-y-auto">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg?.role === 'user' ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-lg text-sm max-w-xs ${
                          msg?.role === 'user'
                            ? 'bg-gray-700 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {msg?.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        {callResult.appointmentDetails && (
          <div className="mb-8 p-6 bg-gray-900/30 border border-gray-800 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">DATE</div>
                <div className="text-gray-300">
                  {callResult.appointmentDetails.date}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">TIME</div>
                <div className="text-gray-300">
                  {callResult.appointmentDetails.time}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">CONFIRMATION</div>
                <div className="text-gray-300 font-mono">
                  {callResult.appointmentDetails.confirmationNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Call Details */}
        <div className="mb-8 p-6 bg-gray-900/30 border border-gray-800 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Call Summary</h3>
          <div className="space-y-2">
            {callResult.details?.map((detail, index) => (
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
          <Button
            variant="ghost"
            className="px-8 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            View Call History
          </Button>
        </div>
      </div>
    </div>
  );
}
