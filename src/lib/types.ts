export type EmailInput = {
  recipientName: string;
  relationship: "manager" | "colleague" | "client" | "other" | "";
  purpose: string;
  details: string;
  tone: "formal" | "friendly" | "persuasive" | "";
  senderName: string;
};
export type EmailResult = { subject: string; body: string; tip: string; checks: string[] };

export type ActionItem = { task: string; owner: string; deadline: string };
export type MeetingResult = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  suggestions: string[];
  actionItems: ActionItem[];
  questions: string[];
  tip: string;
};

export type PlannerTask = { name: string; deadline: string; duration: string; priority: "high" | "medium" | "low" };
export type PlannerInput = {
  mode: "daily" | "weekly";
  dates: string;
  tasks: PlannerTask[];
  hours: string;
  commitments: string;
};
export type TimeBlock = { day: string; start: string; end: string; activity: string; kind: string; note: string };
export type PlannerResult = {
  blocks: TimeBlock[];
  priorities: { task: string; reason: string }[];
  breakdowns: { task: string; steps: string[] }[];
  unscheduled: { task: string; reason: string; nextStep: string }[];
  conflict: string;
  tip: string;
};
