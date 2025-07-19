import { config } from "dotenv";
// import { VapiClient } from "@vapi/server-sdk";
import { VapiClient } from "@vapi-ai/server-sdk";
config();

const callId = "0aa2890e-d2ef-4891-892d-ba3eae3a6b82";

const client = new VapiClient({ token: process.env.VAPI_KEY });

async function main() {
  const call = await client.calls.get(callId);
  client.console.log(call);
}

main();
