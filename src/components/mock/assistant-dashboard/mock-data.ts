export type CallStatus = "answered" | "ai-handled" | "forwarded" | "missed";

export type Sentiment = "positive" | "neutral" | "negative";

export interface MockCall {
  id: string;
  callerName: string;
  fromNumber: string;
  toNumber: string;
  startedAt: string; // human readable time label
  duration: string; // e.g. "3m 24s"
  status: CallStatus;
  summary: string;
  sentiment: Sentiment;
  tags: string[];
}

export interface AssistantPreset {
  id: string;
  name: string;
  description: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  description: string;
  includedMinutes: number;
  overagePerMinute: number;
}

export interface BillingSnapshot {
  currentPlanId: string;
  minutesUsedThisPeriod: number;
  nextInvoiceDate: string;
  currency: string;
}

export interface TwilioStatus {
  phoneNumber: string;
  friendlyName: string;
  status: "connected" | "degraded" | "disconnected";
  lastWebhookPingMinutesAgo: number;
  voiceWebhookUrl: string;
  messagingWebhookUrl: string;
}

export const ASSISTANT_PRESETS: AssistantPreset[] = [
  {
    id: "concierge",
    name: "Friendly concierge",
    description: "Warm, human-like assistant that welcomes callers and routes them smoothly."
  },
  {
    id: "operator",
    name: "Efficient operator",
    description: "Fast, no-nonsense routing with short confirmations and clear questions."
  },
  {
    id: "support",
    name: "Technical support",
    description: "More detailed answers and diagnostics before escalating to a human agent."
  }
];

export const DEFAULT_PROMPT =
  "You are Dialarme's AI phone assistant. Greet callers calmly, identify their intent in one or two questions, " +
  "and either resolve simple issues or route them to the correct team. Always summarise the call outcome in one concise sentence.";

export const BILLING_PLANS: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    pricePerMonth: 39,
    description: "For small teams testing the AI assistant.",
    includedMinutes: 1000,
    overagePerMinute: 0.09
  },
  {
    id: "growth",
    name: "Growth",
    pricePerMonth: 99,
    description: "For teams running AI on most inbound calls.",
    includedMinutes: 5000,
    overagePerMinute: 0.06
  },
  {
    id: "scale",
    name: "Scale",
    pricePerMonth: 249,
    description: "For high‑volume, multi-number deployments.",
    includedMinutes: 20000,
    overagePerMinute: 0.04
  }
];

export const BILLING_SNAPSHOT: BillingSnapshot = {
  currentPlanId: "growth",
  minutesUsedThisPeriod: 3120,
  nextInvoiceDate: "2026-01-01",
  currency: "CHF"
};

export const MOCK_CALLS: MockCall[] = [
  {
    id: "c1",
    callerName: "Martin Keller",
    fromNumber: "+41 79 555 01 23",
    toNumber: "+41 21 555 00 10",
    startedAt: "Today • 09:21",
    duration: "3m 24s",
    status: "ai-handled",
    summary: "Caller reported a motion sensor false alarm. AI verified event history and reassured the caller.",
    sentiment: "positive",
    tags: ["alarm", "false-alarm", "reassured"]
  },
  {
    id: "c2",
    callerName: "Unknown caller",
    fromNumber: "+41 76 888 45 90",
    toNumber: "+41 21 555 00 10",
    startedAt: "Today • 08:02",
    duration: "1m 02s",
    status: "forwarded",
    summary: "Suspicious caller asking about access codes. AI declined to share and forwarded to human agent.",
    sentiment: "neutral",
    tags: ["security", "escalated"]
  },
  {
    id: "c3",
    callerName: "Boutique Lumen",
    fromNumber: "+41 22 444 77 11",
    toNumber: "+41 21 555 00 11",
    startedAt: "Yesterday • 17:46",
    duration: "6m 12s",
    status: "answered",
    summary: "Store requested temporary schedule change for alarm arming. AI collected details and created a task.",
    sentiment: "positive",
    tags: ["schedule", "b2b"]
  },
  {
    id: "c4",
    callerName: "Delivery driver",
    fromNumber: "+41 79 333 09 45",
    toNumber: "+41 21 555 00 11",
    startedAt: "Yesterday • 11:03",
    duration: "0m 48s",
    status: "missed",
    summary: "Short missed call before AI greeting finished. SMS follow-up suggested a callback.",
    sentiment: "neutral",
    tags: ["missed", "logistics"]
  },
  {
    id: "c5",
    callerName: "Sophie Bernard",
    fromNumber: "+41 76 222 88 67",
    toNumber: "+41 21 555 00 10",
    startedAt: "Yesterday • 09:15",
    duration: "2m 34s",
    status: "ai-handled",
    summary: "Caller inquired about system maintenance schedule. AI provided next visit date and sent confirmation SMS.",
    sentiment: "positive",
    tags: ["maintenance", "info"]
  }
];

export const TWILIO_STATUS: TwilioStatus = {
  phoneNumber: "+1 (415) 555‑0142",
  friendlyName: "AI Reception – Main Line",
  status: "connected",
  lastWebhookPingMinutesAgo: 3,
  voiceWebhookUrl: "https://mock.dialarme.ai/twilio/voice",
  messagingWebhookUrl: "https://mock.dialarme.ai/twilio/sms"
};

export const CURRENT_PLAN_ID = BILLING_SNAPSHOT.currentPlanId;
