import type { EmailInput, PlannerInput } from "./types";

export function validateEmail(i: EmailInput) {
  const e: Record<string, string> = {};
  if (!i.relationship) e.relationship = "Choose who you're writing to.";
  if (!i.purpose.trim()) e.purpose = "Add the purpose of your email.";
  if (!i.tone) e.tone = "Choose a tone.";
  return e;
}

export function validateMeeting(notes: string) {
  const e: Record<string, string> = {};
  if (notes.trim().length < 20) e.notes = "Add your meeting notes (at least a couple of sentences).";
  return e;
}

export function validatePlanner(i: PlannerInput) {
  const e: Record<string, string> = {};
  if (!i.dates.trim()) e.dates = "Add the date or date range you're planning for.";
  if (!i.hours.trim()) e.hours = "Add your available working hours.";
  const tasks = i.tasks.filter((t) => t.name.trim());
  if (tasks.length === 0) e.tasks = "Add at least one task.";
  i.tasks.forEach((t, idx) => {
    if (t.name.trim() && !t.duration.trim())
      e[`duration-${idx}`] = "Add a time estimate. Your best guess is fine.";
  });
  return e;
}
