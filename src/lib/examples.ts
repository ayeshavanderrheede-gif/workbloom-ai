import type { EmailInput, PlannerInput } from "./types";

export const emailExamples: Record<string, EmailInput> = {
  manager: {
    recipientName: "Priya (sample)",
    relationship: "manager",
    purpose: "Ask my manager for help prioritising two overlapping tasks",
    details:
      "I'm working on the Q3 supplier report and the onboarding slides. Both were mentioned as urgent. I'm not sure which to finish first. I'd like 15 minutes to talk about it.",
    tone: "friendly",
    senderName: "Sam (sample)",
  },
  followup: {
    recipientName: "Jordan (sample)",
    relationship: "colleague",
    purpose: "Follow up on the budget figures I need for my report",
    details:
      "I asked for the Q3 marketing budget figures last week. I need them to finish my section of the report. Ask if they can share them, or tell me who else to ask.",
    tone: "formal",
    senderName: "Sam (sample)",
  },
};

export const meetingExample = {
  title: "Website refresh weekly check-in (sample)",
  notes: `Attendees: Lindiwe, Marco, Aisha, Tom (fictional)
- Lindiwe: homepage draft nearly done, needs final images
- Agreed: launch moves to the second week of next month
- Marco suggested adding a FAQ page - no decision yet, cost to be checked
- Aisha will collect customer quotes by Friday
- Someone needs to update the style guide
- Tom to book user testing sessions, date tbc
- Question about whether legal needs to review the new terms page`,
};

export const plannerExample: PlannerInput = {
  mode: "daily",
  dates: "Tuesday (sample day)",
  hours: "08:30 – 17:00",
  commitments: "Team stand-up 09:00–09:15\nLunch 12:30–13:15\nTraining session 15:00–16:00",
  tasks: [
    { name: "Draft client update report", deadline: "Today 16:30", duration: "2 hours", priority: "high" },
    { name: "Reply to supplier emails", deadline: "", duration: "45 minutes", priority: "medium" },
    { name: "Prepare slides for Thursday meeting", deadline: "Thursday", duration: "2.5 hours", priority: "medium" },
    { name: "Update shared tracker", deadline: "", duration: "30 minutes", priority: "low" },
  ],
};
