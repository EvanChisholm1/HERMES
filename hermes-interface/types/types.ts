export interface BusinessResult {
  name: string;
  phone: string;
  address: string;
  rating?: number;
  agentReasoning: string;
  website?: string;
}

export interface CallResult {
  success: boolean;
  business: BusinessResult;
  summary: string;
  details: string[];
  appointmentDetails?: {
    date: string;
    time: string;
    confirmationNumber: string;
  };
  nextSteps: string[];
  callDuration: string;
}

export interface UserSettings {
  name: string;
  phone: string;
  address: string;
}
