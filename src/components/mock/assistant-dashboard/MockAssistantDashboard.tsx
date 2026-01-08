import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Phone,
  Sparkles,
  TrendingUp,
  Zap,
  Brain,
  MessageSquare,
} from "lucide-react";
import {
  ASSISTANT_PRESETS,
  BILLING_PLANS,
  BILLING_SNAPSHOT,
  CURRENT_PLAN_ID,
  MOCK_CALLS,
  TWILIO_STATUS,
  type BillingPlan,
  type MockCall,
} from "./mock-data";

export function MockAssistantDashboard() {
  const [selectedPresetId, setSelectedPresetId] = useState(CURRENT_PLAN_ID);
  const [prompt, setPrompt] = useState<string>("" +
    "You are Dialarme's AI phone assistant. Greet callers calmly, identify their intent, and route or resolve.");
  const [selectedCall, setSelectedCall] = useState<MockCall | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(CURRENT_PLAN_ID);

  const currentPlan: BillingPlan =
    BILLING_PLANS.find((p) => p.id === selectedPlanId) ?? BILLING_PLANS[0];

  const usageRatio =
    BILLING_SNAPSHOT.minutesUsedThisPeriod / currentPlan.includedMinutes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-stretch justify-center">
      <div className="relative w-full max-w-6xl px-4 py-10 md:px-8">
        <div className="pointer-events-none absolute inset-x-0 -top-10 -z-10 mx-auto h-72 max-w-4xl rounded-3xl bg-gradient-to-br from-emerald-500/25 via-sky-500/20 to-transparent blur-3xl" />

        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-500/40 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Twilio AI phone assistant · mock dashboard</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
              Call Assistant Hub
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Configure the AI behavior, review recent calls, and keep an eye on
              Twilio connectivity and billing all in one glassy dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10 backdrop-blur-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/40">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-300">Today&apos;s AI coverage</p>
              <p className="text-sm font-medium text-slate-50">
                87% of inbound minutes handled by AI
              </p>
            </div>
          </div>
        </header>

        <main className="mt-8 space-y-6">
          {/* AI Analytics Real-Time Feed */}
          <AIAnalyticsRealtimeFeed />

          {/* Call Assistant Configuration - Full Width */}
          <CallAssistantConfigPanel
            prompt={prompt}
            onPromptChange={setPrompt}
            selectedPresetId={selectedPresetId}
            onSelectedPresetIdChange={setSelectedPresetId}
          />

          {/* 2-Column Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            <CallHistoryFeed
              calls={MOCK_CALLS}
              onCallClick={setSelectedCall}
            />

            <div className="space-y-6">
              <BillingOverview
                currentPlan={currentPlan}
                selectedPlanId={selectedPlanId}
                onSelectedPlanIdChange={setSelectedPlanId}
                usageMinutes={BILLING_SNAPSHOT.minutesUsedThisPeriod}
              />

              <TwilioStatusPanel />
            </div>
          </div>
        </main>

        {selectedCall && (
          <CallDetailsModal
            call={selectedCall}
            onClose={() => setSelectedCall(null)}
          />
        )}
      </div>
    </div>
  );
}

interface CallAssistantConfigPanelProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedPresetId: string;
  onSelectedPresetIdChange: (id: string) => void;
}

function CallAssistantConfigPanel({
  prompt,
  onPromptChange,
  selectedPresetId,
  onSelectedPresetIdChange,
}: CallAssistantConfigPanelProps) {
  const [fallbackToAgent, setFallbackToAgent] = useState(true);
  const [fallbackToVoicemail, setFallbackToVoicemail] = useState(false);
  const [fallbackToSms, setFallbackToSms] = useState(true);

  return (
    <GlassCard>
      <CardHeader className="flex flex-col gap-2 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-slate-50">
            Call assistant configuration
          </CardTitle>
          <CardDescription className="text-xs text-slate-300">
            Tune the prompt, tone and fallbacks used for Twilio-powered calls.
            This is static UI only.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/5 text-xs text-slate-100 hover:bg-white/10 hover:text-slate-50"
        >
          Preview script
          <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-4 text-sm">
        <div className="space-y-2">
          <Label className="text-xs text-slate-200">
            System prompt
          </Label>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 outline-none ring-1 ring-transparent transition focus:ring-emerald-400/60 focus:ring-offset-0 backdrop-blur placeholder:text-slate-400"
            placeholder="Describe how the AI should greet callers, verify them and route calls."
          />
          <p className="text-[11px] text-slate-400">
            The prompt is evaluated on every AI turn. In production this would be
            stored in your config backend.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-xs text-slate-200">Assistant personality</Label>
          <Tabs
            value={selectedPresetId}
            onValueChange={onSelectedPresetIdChange}
            className="w-full"
          >
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-white/5 p-1 text-xs text-slate-300">
              {ASSISTANT_PRESETS.map((preset) => (
                <TabsTrigger
                  key={preset.id}
                  value={preset.id}
                  className="rounded-xl px-2 py-2 data-[state=active]:bg-slate-900/70 data-[state=active]:text-slate-50 data-[state=active]:shadow-sm"
                >
                  {preset.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {ASSISTANT_PRESETS.map((preset) => (
              <TabsContent
                value={preset.id}
                key={preset.id}
                className="mt-3 text-[11px] text-slate-300"
              >
                {preset.description}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="space-y-3">
          <Label className="text-xs text-slate-200">Fallback behavior</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            <TogglePill
              label="Forward to on‑call agent"
              description="After 2 failed AI attempts"
              active={fallbackToAgent}
              onToggle={() => setFallbackToAgent((v) => !v)}
            />
            <TogglePill
              label="Smart voicemail"
              description="Record & summarise voicemail with AI"
              active={fallbackToVoicemail}
              onToggle={() => setFallbackToVoicemail((v) => !v)}
            />
            <TogglePill
              label="SMS recap to caller"
              description="Send short follow‑up with ticket ID"
              active={fallbackToSms}
              onToggle={() => setFallbackToSms((v) => !v)}
            />
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

interface TogglePillProps {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

function TogglePill({ label, description, active, onToggle }: TogglePillProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex flex-col items-start gap-1 rounded-2xl border px-3 py-2 text-left text-[11px] transition",
        active
          ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-50 shadow-[0_0_0_1px_rgba(34,197,94,0.25)]"
          : "border-white/10 bg-white/0 text-slate-200 hover:bg-white/5"
      )}
    >
      <span className="inline-flex items-center gap-1 text-[11px] font-medium">
        <span
          className={cn(
            "h-3 w-3 rounded-full border border-white/20",
            active ? "bg-emerald-400" : "bg-transparent"
          )}
        />
        {label}
      </span>
      <span className="text-[10px] text-slate-400">{description}</span>
    </button>
  );
}

interface CallHistoryFeedProps {
  calls: MockCall[];
  onCallClick: (call: MockCall) => void;
}

function CallHistoryFeed({ calls, onCallClick }: CallHistoryFeedProps) {
  return (
    <GlassCard>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-slate-50">
            Call history
          </CardTitle>
          <CardDescription className="text-xs text-slate-300">
            Recent calls handled by the AI assistant.
          </CardDescription>
        </div>
        <Select defaultValue="today">
          <SelectTrigger className="h-8 w-[120px] rounded-xl border-white/15 bg-slate-900/60 text-xs text-slate-200">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-slate-900/95 text-xs text-slate-100">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-[calc(100%-5rem)] px-0 pb-0">
        <div className="h-full space-y-2 overflow-y-auto px-6 pb-6 text-xs custom-scrollbar">
          {calls.map((call) => (
            <button
              key={call.id}
              type="button"
              onClick={() => onCallClick(call)}
              className="group flex w-full items-start gap-3 rounded-2xl border border-white/5 bg-white/0 px-3 py-2 text-left transition hover:border-emerald-400/60 hover:bg-emerald-500/5"
            >
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900/80 text-emerald-300 ring-1 ring-emerald-400/40">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-slate-50">
                    {call.callerName}
                  </p>
                  <span className="whitespace-nowrap text-[10px] text-slate-400">
                    {call.startedAt}
                  </span>
                </div>
                <p className="line-clamp-2 text-[11px] text-slate-300">
                  {call.summary}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={call.status} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-200">
                    <Clock3 className="h-3 w-3" />
                    {call.duration}
                  </span>
                  {call.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] text-slate-300 ring-1 ring-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </GlassCard>
  );
}

function StatusBadge({ status }: { status: MockCall["status"] }) {
  const map: Record<MockCall["status"], { label: string; cls: string }> = {
    "ai-handled": {
      label: "AI‑handled",
      cls: "bg-emerald-500/10 text-emerald-200 ring-emerald-400/40",
    },
    answered: {
      label: "Answered",
      cls: "bg-sky-500/10 text-sky-200 ring-sky-400/40",
    },
    forwarded: {
      label: "Forwarded",
      cls: "bg-amber-500/10 text-amber-100 ring-amber-400/40",
    },
    missed: {
      label: "Missed",
      cls: "bg-rose-500/10 text-rose-100 ring-rose-400/40",
    },
  };

  const cfg = map[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ring-1",
        cfg.cls
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

interface BillingOverviewProps {
  currentPlan: BillingPlan;
  selectedPlanId: string;
  onSelectedPlanIdChange: (id: string) => void;
  usageMinutes: number;
}

function BillingOverview({
  currentPlan,
  selectedPlanId,
  onSelectedPlanIdChange,
  usageMinutes,
}: BillingOverviewProps) {
  const usageRatio = usageMinutes / currentPlan.includedMinutes;
  const cappedRatio = Math.min(usageRatio, 1);

  return (
    <GlassCard>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-slate-50">
            Billing & usage
          </CardTitle>
          <CardDescription className="text-xs text-slate-300">
            Stripe-style overview powered by static data.
          </CardDescription>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 text-sky-300 ring-1 ring-sky-400/40">
          <CreditCard className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4 text-xs">
        <div className="space-y-1">
          <Label className="text-[11px] text-slate-200">Plan</Label>
          <Select
            value={selectedPlanId}
            onValueChange={onSelectedPlanIdChange}
          >
            <SelectTrigger className="h-9 rounded-2xl border-white/15 bg-slate-950/60 text-xs text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900/95 text-xs text-slate-100">
              {BILLING_PLANS.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} · {plan.pricePerMonth} CHF/mo
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-[11px] text-slate-400">
            {currentPlan.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300">Minutes this period</span>
            <span className="text-slate-100">
              {usageMinutes.toLocaleString()} / {" "}
              {currentPlan.includedMinutes.toLocaleString()} min
            </span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300"
              style={{ width: `${cappedRatio * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>
              Next invoice on {BILLING_SNAPSHOT.nextInvoiceDate}
            </span>
            <span>Overage {currentPlan.overagePerMinute.toFixed(2)} CHF/min</span>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}

function TwilioStatusPanel() {
  const statusColorMap: Record<
    typeof TWILIO_STATUS.status,
    { label: string; dot: string; chip: string }
  > = {
    connected: {
      label: "Operational",
      dot: "bg-emerald-400",
      chip: "bg-emerald-500/10 text-emerald-100 ring-emerald-400/40",
    },
    degraded: {
      label: "Degraded",
      dot: "bg-amber-400",
      chip: "bg-amber-500/10 text-amber-100 ring-amber-400/40",
    },
    disconnected: {
      label: "Disconnected",
      dot: "bg-rose-400",
      chip: "bg-rose-500/10 text-rose-100 ring-rose-400/40",
    },
  };

  const statusCfg = statusColorMap[TWILIO_STATUS.status];

  return (
    <GlassCard>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-slate-50">
            Twilio integration
          </CardTitle>
          <CardDescription className="text-xs text-slate-300">
            Mock status for connected number and webhooks.
          </CardDescription>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900/80 text-emerald-300 ring-1 ring-emerald-400/40">
          <Phone className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] text-slate-300">Connected number</p>
            <p className="text-sm font-medium text-slate-50">
              {TWILIO_STATUS.phoneNumber}
            </p>
            <p className="text-[11px] text-slate-400">
              {TWILIO_STATUS.friendlyName}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ring-1",
              statusCfg.chip
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                statusCfg.dot
              )}
            />
            {statusCfg.label}
          </span>
        </div>

        <div className="grid gap-3 rounded-2xl bg-slate-950/60 p-3 ring-1 ring-white/5">
          <WebhookRow
            label="Voice webhook"
            url={TWILIO_STATUS.voiceWebhookUrl}
            healthy
          />
          <WebhookRow
            label="Messaging webhook"
            url={TWILIO_STATUS.messagingWebhookUrl}
            healthy
          />
          <WebhookRow
            label="Failover webhook"
            url="https://mock.dialarme.ai/twilio/failover"
            healthy={false}
          />
        </div>

        <p className="flex items-center gap-1 text-[11px] text-slate-400">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          Last health ping {TWILIO_STATUS.lastWebhookPingMinutesAgo} minutes ago
        </p>
      </CardContent>
    </GlassCard>
  );
}

interface WebhookRowProps {
  label: string;
  url: string;
  healthy: boolean;
}

function WebhookRow({ label, url, healthy }: WebhookRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-slate-200">
          {label}
        </p>
        <p className="truncate text-[10px] text-slate-400">{url}</p>
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1",
          healthy
            ? "bg-emerald-500/10 text-emerald-100 ring-emerald-400/40"
            : "bg-amber-500/10 text-amber-100 ring-amber-400/40"
        )}
      >
        {healthy ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <AlertCircle className="h-3 w-3" />
        )}
        {healthy ? "Healthy" : "Degraded"}
      </span>
    </div>
  );
}

interface CallDetailsModalProps {
  call: MockCall;
  onClose: () => void;
}

function CallDetailsModal({ call, onClose }: CallDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-xs text-slate-100 shadow-[0_28px_90px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] text-slate-300">Call summary</p>
            <h2 className="mt-1 text-base font-semibold text-slate-50">
              {call.callerName}
            </h2>
            <p className="text-[11px] text-slate-400">
              {call.fromNumber} · {call.duration}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full text-slate-300 hover:bg-white/10"
            onClick={onClose}
          >
            ×
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={call.status} />
          {call.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300 ring-1 ring-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-3">
          <section className="space-y-1">
            <p className="text-[11px] font-medium text-slate-200">
              High-level summary
            </p>
            <p className="text-[11px] text-slate-300">{call.summary}</p>
          </section>

          <section className="space-y-1">
            <p className="text-[11px] font-medium text-slate-200">
              Suggested CRM note (mock)
            </p>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-[11px] text-slate-300">
              Caller reported an issue related to <strong>{call.tags[0]}</strong>.
              AI assistant verified account context, captured key details and
              either resolved the request or queued a follow-up for the
              installation team.
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            This modal is fully static and demonstrates the future call detail
            view.
          </span>
          <Button
            type="button"
            size="sm"
            className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-medium text-slate-950 hover:bg-emerald-400"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function AIAnalyticsRealtimeFeed() {
  const [pulse, setPulse] = useState(true);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-6 shadow-[0_18px_60px_rgba(15,23,42,0.85)] backdrop-blur-2xl">
      {/* Ambient animated gradient blob */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-transparent blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-emerald-500/30">
              <div className={cn("h-2 w-2 rounded-full bg-emerald-400", pulse && "animate-ping")} />
              <span>Live AI Performance</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-50">
              Real-time analytics
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              AI assistant performance metrics updating every 30 seconds
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl border border-white/10 bg-white/5 text-xs text-slate-200 hover:bg-white/10"
          >
            <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
            View detailed report
          </Button>
        </div>

        {/* Bento grid layout - modern 2024/2025 trend */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Metric card 1 - Resolution Rate */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700/20 via-slate-800/10 to-transparent p-4 transition hover:border-slate-400/40 hover:shadow-[0_0_30px_rgba(148,163,184,0.1)]">
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/40 text-slate-300 ring-1 ring-slate-600/50">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-emerald-400">↑ 12%</span>
              </div>
              <p className="text-xs text-slate-400">AI Resolution Rate</p>
              <p className="mt-1 bg-gradient-to-br from-slate-50 to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
                94.2%
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/50">
                <div className="h-full w-[94.2%] rounded-full bg-gradient-to-r from-slate-400 to-slate-500 transition-all duration-1000" />
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-slate-600/5 blur-2xl transition group-hover:bg-slate-600/10" />
          </div>

          {/* Metric card 2 - Avg Response Time */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700/20 via-slate-800/10 to-transparent p-4 transition hover:border-slate-400/40 hover:shadow-[0_0_30px_rgba(148,163,184,0.1)]">
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/40 text-slate-300 ring-1 ring-slate-600/50">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-emerald-400">↓ 0.3s</span>
              </div>
              <p className="text-xs text-slate-400">Avg Response Time</p>
              <p className="mt-1 bg-gradient-to-br from-slate-50 to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
                1.8s
              </p>
              <div className="mt-3 flex items-center gap-1">
                {[100, 85, 92, 78, 88, 95, 82].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-full bg-slate-500/40"
                    style={{ height: `${(h / 100) * 24}px` }}
                  />
                ))}
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-slate-600/5 blur-2xl transition group-hover:bg-slate-600/10" />
          </div>

          {/* Metric card 3 - Active Conversations */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700/20 via-slate-800/10 to-transparent p-4 transition hover:border-slate-400/40 hover:shadow-[0_0_30px_rgba(148,163,184,0.1)]">
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/40 text-slate-300 ring-1 ring-slate-600/50">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className={cn("h-2 w-2 rounded-full bg-slate-400", pulse && "animate-pulse")} />
              </div>
              <p className="text-xs text-slate-400">Active Conversations</p>
              <p className="mt-1 bg-gradient-to-br from-slate-50 to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
                23
              </p>
              <p className="mt-3 text-[10px] text-slate-400">
                <span className="font-medium text-slate-300">17</span> AI-handled ·{" "}
                <span className="font-medium text-slate-400">6</span> agent-assisted
              </p>
            </div>
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-slate-600/5 blur-2xl transition group-hover:bg-slate-600/10" />
          </div>

          {/* Metric card 4 - Customer Satisfaction */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700/20 via-slate-800/10 to-transparent p-4 transition hover:border-slate-400/40 hover:shadow-[0_0_30px_rgba(148,163,184,0.1)]">
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700/40 text-slate-300 ring-1 ring-slate-600/50">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-emerald-400">↑ 4%</span>
              </div>
              <p className="text-xs text-slate-400">Customer Satisfaction</p>
              <p className="mt-1 bg-gradient-to-br from-slate-50 to-slate-300 bg-clip-text text-3xl font-bold text-transparent">
                4.8
              </p>
              <div className="mt-3 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={cn(
                      "h-3 w-3 rounded-sm transition",
                      star <= 4
                        ? "bg-slate-400"
                        : "bg-slate-600/40"
                    )}
                  />
                ))}
                <span className="ml-1.5 text-[10px] text-slate-400">(2,847 ratings)</span>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-slate-600/5 blur-2xl transition group-hover:bg-slate-600/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 text-slate-50 shadow-[0_18px_60px_rgba(15,23,42,0.85)] backdrop-blur-2xl">
      {children}
    </Card>
  );
}
