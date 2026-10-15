import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { EmailResult, MeetingResult, PlannerResult } from "./types";

const str = (max: number) => z.string().max(max);

async function safe<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    const { AiError } = await import("./ai.server");
    console.error(e);
    return { ok: false, error: e instanceof AiError ? e.message : "Something went wrong. Please try again." };
  }
}

/* ---------------- Email Writer ---------------- */
const EMAIL_PROMPT = `Role: You are a supportive workplace writing coach inside WorkBloom AI.
Task: Draft one email (do not send anything) from the details provided.
Constraints:
- Match the audience (recipient relationship), purpose and chosen tone (formal, friendly or persuasive).
- Preserve the user's meaning. Do not add commitments, deadlines, attachments or facts they did not give.
- If the recipient or sender name is missing, use [Recipient name] or [Your name].
- Persuasive emails must stay respectful, honest and free of pressure tactics.
- Keep it concise and easy to scan.
Output format (JSON):
- subject: a clear subject line.
- body: the full email with greeting and sign-off, using \\n for line breaks.
- tip: one short "learn as you grow" tip explaining a specific writing choice made in this email (2-3 sentences).
- checks: short items the user should confirm before sending (placeholders to fill, dates, names, claims). Empty array if nothing needs checking.`;

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        recipientName: str(100),
        relationship: z.enum(["manager", "colleague", "client", "other"]),
        purpose: str(1000).min(1),
        details: str(6000),
        tone: z.enum(["formal", "friendly", "persuasive"]),
        senderName: str(100),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    safe(async () => {
      const { runStructured, wrap } = await import("./ai.server");
      return runStructured<EmailResult>({
        name: "email_draft",
        instructions: EMAIL_PROMPT,
        input: [
          wrap("recipient_name", data.recipientName),
          wrap("recipient_relationship", data.relationship),
          wrap("purpose", data.purpose),
          wrap("key_details", data.details),
          wrap("tone", data.tone),
          wrap("sender_name", data.senderName),
        ].join("\n"),
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["subject", "body", "tip", "checks"],
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
            tip: { type: "string" },
            checks: { type: "array", items: { type: "string" } },
          },
        },
      });
    }),
  );

/* ---------------- Meeting Notes ---------------- */
const MEETING_PROMPT = `Role: You are a careful meeting-notes assistant inside WorkBloom AI.
Task: Turn the user's raw meeting notes into a clear, structured summary.
Constraints:
- Use only what is in the notes. Do not add facts, people or dates.
- Separate confirmed decisions (clearly agreed) from suggestions or ideas that were only raised.
- For each action item, if no owner is stated write "Not specified"; if no deadline is stated write "Not specified".
- Do not convert vague or relative dates (e.g. "next Friday", "end of month") into exact dates. Keep the wording from the notes and add any ambiguity to questions.
- If there are no action items, return an empty actionItems array.
- If the notes are not meeting notes, summarise what is there and say so in questions.
Output format (JSON):
- summary: 2-4 sentence plain-language summary.
- keyPoints: main discussion points.
- decisions: confirmed decisions only (empty array if none).
- suggestions: ideas raised but not confirmed (empty array if none).
- actionItems: {task, owner, deadline}.
- questions: missing details or ambiguities worth clarifying.
- tip: one short "learn as you grow" tip about reading or acting on meeting notes, tied to these notes.`;

export const summariseMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ title: str(200), notes: str(20000).min(20) }).parse(d))
  .handler(async ({ data }) =>
    safe(async () => {
      const { runStructured, wrap } = await import("./ai.server");
      const arr = { type: "array", items: { type: "string" } };
      return runStructured<MeetingResult>({
        name: "meeting_summary",
        instructions: MEETING_PROMPT,
        input: [wrap("meeting_title", data.title), wrap("meeting_notes", data.notes)].join("\n"),
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["summary", "keyPoints", "decisions", "suggestions", "actionItems", "questions", "tip"],
          properties: {
            summary: { type: "string" },
            keyPoints: arr,
            decisions: arr,
            suggestions: arr,
            actionItems: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["task", "owner", "deadline"],
                properties: { task: { type: "string" }, owner: { type: "string" }, deadline: { type: "string" } },
              },
            },
            questions: arr,
            tip: { type: "string" },
          },
        },
      });
    }),
  );

/* ---------------- Task Planner ---------------- */
const PLANNER_PROMPT = `Role: You are a realistic, supportive work-planning assistant inside WorkBloom AI.
Task: Propose a daily or weekly schedule from the user's tasks, availability and commitments. This is a suggestion only; it does not create calendar events.
Constraints:
- Prioritise by deadline, urgency and importance.
- Place fixed commitments and breaks exactly as given; never move or overlap them.
- Time blocks must never overlap and must stay within the stated working hours.
- Use the user's time estimates. If you split or adjust a duration, say "estimate" in the block note.
- If the workload does not fit, do not squeeze it in. Put leftover tasks in unscheduled with a reason and a practical next step (e.g. move to another day, ask a manager to re-prioritise, delegate).
- Never claim every deadline is met if it is not. Explain any conflict honestly in conflict; use an empty string if there is none.
- Include short buffer time where reasonable.
Output format (JSON):
- blocks: chronological {day (e.g. "Monday 3 Nov" or the given date; use the user's wording), start "HH:MM", end "HH:MM", activity, kind ("task" | "commitment" | "break" | "buffer"), note}.
- priorities: {task, reason} in suggested order with brief explanations.
- breakdowns: {task, steps[]} for larger tasks (over about 90 minutes or complex); empty array if none.
- unscheduled: {task, reason, nextStep}; empty array if everything fits.
- conflict: explanation of any workload conflict, or "".
- tip: one short "learn as you grow" tip about planning or prioritising, tied to this plan.`;

export const planWork = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        mode: z.enum(["daily", "weekly"]),
        dates: str(200).min(1),
        hours: str(500).min(1),
        commitments: str(3000),
        tasks: z
          .array(
            z.object({
              name: str(300).min(1),
              deadline: str(100),
              duration: str(100).min(1),
              priority: z.enum(["high", "medium", "low"]),
            }),
          )
          .min(1)
          .max(30),
      })
      .parse(d),
  )
  .handler(async ({ data }) =>
    safe(async () => {
      const { runStructured, wrap } = await import("./ai.server");
      const taskText = data.tasks
        .map((t, i) => `${i + 1}. ${t.name} | deadline: ${t.deadline || "none given"} | estimate: ${t.duration} | priority: ${t.priority}`)
        .join("\n");
      return runStructured<PlannerResult>({
        name: "work_plan",
        instructions: PLANNER_PROMPT,
        input: [
          wrap("plan_type", data.mode),
          wrap("dates", data.dates),
          wrap("working_hours", data.hours),
          wrap("commitments_and_breaks", data.commitments),
          wrap("tasks", taskText),
        ].join("\n"),
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["blocks", "priorities", "breakdowns", "unscheduled", "conflict", "tip"],
          properties: {
            blocks: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["day", "start", "end", "activity", "kind", "note"],
                properties: {
                  day: { type: "string" },
                  start: { type: "string" },
                  end: { type: "string" },
                  activity: { type: "string" },
                  kind: { type: "string", enum: ["task", "commitment", "break", "buffer"] },
                  note: { type: "string" },
                },
              },
            },
            priorities: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["task", "reason"],
                properties: { task: { type: "string" }, reason: { type: "string" } },
              },
            },
            breakdowns: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["task", "steps"],
                properties: { task: { type: "string" }, steps: { type: "array", items: { type: "string" } } },
              },
            },
            unscheduled: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["task", "reason", "nextStep"],
                properties: { task: { type: "string" }, reason: { type: "string" }, nextStep: { type: "string" } },
              },
            },
            conflict: { type: "string" },
            tip: { type: "string" },
          },
        },
      });
    }),
  );
