const VAPI_BASE_URL = 'https://api.vapi.ai'; // Or your VAPI base URL

let previousMessageTimes = new Set();
let callEnded = false;

export async function pollCall(callId, broadcast) {
  try {
    const response = await fetch(`${VAPI_BASE_URL}/calls/${callId}`, {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`, // Replace with your VAPI API key
      },
    });

    const callData = response.data;

    // Check for new messages
    if (callData.messages && Array.isArray(callData.messages)) {
      const newMessages = callData.messages.filter(msg => !previousMessageTimes.has(msg.time));
      newMessages.forEach((msg) => {
        previousMessageTimes.add(msg.time);
        broadcast({ type: 'message', text: msg.message });
      });
    }

    // Check if the call has ended
    if (!callEnded && callData.status === 'ended') {
      callEnded = true;
      broadcast({ type: 'call_ended', payload: { callId: CALL_ID } });
      clearInterval(polling); // stop polling
    }
  } catch (err) {
    console.error("Polling error:", err.response?.data || err.message);
  }
}

