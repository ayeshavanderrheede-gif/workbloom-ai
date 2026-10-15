# WorkBloom AI

**Build confidence. Grow at work.**

## Overview and target users
WorkBloom AI helps graduates, interns, first-time employees and anyone developing workplace skills to write professional emails, understand meeting notes and organise their workload — and to learn while doing it, through optional "Learn as you grow" tips.

## Features
- **Home** – three tool cards and "Not sure where to start?" situation starters that open a tool with clearly labelled, fictional sample details.
- **Email Writer** – recipient, relationship, purpose, details, tone, sender → editable subject and body, "Before you use this" checks, learning tip. Generate, Regenerate, Copy subject, Copy email, Clear. Drafts only; nothing is sent.
- **Meeting Notes** – title + notes → summary, key points, confirmed decisions, unconfirmed suggestions, editable action-item table (task / responsible / deadline, "Not specified" when absent), questions to clarify, tip. Copy all.
- **Task Planner** – daily/weekly, dates, tasks with deadline, estimate and priority, hours, commitments → editable time blocks, priorities with reasons, smaller steps, tasks that don't fit with next steps, conflict warning, tip.
- **Help & Responsible AI** – purpose, how tools work, limitations, bias, data handling.

### Connected workflow
After a meeting summary: **Plan these action items** (choose items → Task Planner; time estimates and availability are required before generating) or **Draft a follow-up email** (choose summary/decisions/action items → Email Writer; the user picks recipient and tone). Edited content is carried in memory, so nothing needs to be pasted again.

### Shared experience
Steps (Add details → Generate → Review and edit), Try an example, required-field validation, loading states, duplicate-submit protection, retryable errors that keep input, confirmation before replacing an edited result or clearing work, responsible-AI notices near inputs and outputs, keyboard access and visible focus states, collapsible mobile menu.

## Technologies
TanStack Start (React 19, Vite, server functions), Tailwind CSS v4, lucide icons, sonner, zod, Lovable AI Gateway (OpenAI Responses API, model `openai/gpt-6-astra`, strict JSON schema output).

## Setup and AI configuration
- `bun install`, then `bun run dev`.
- AI calls run only on the server (`src/lib/ai.server.ts`) using the `LOVABLE_API_KEY` environment variable, which Lovable provisions automatically. It is never sent to the browser or stored in the repo.
- AI usage is billed per request against the workspace's Lovable AI balance; if credits run out the app shows a clear message.

## Prompt design and responsible AI
- Each tool has its own structured prompt in `src/lib/ai.functions.ts` (role, task, constraints, output format) plus shared rules.
- User content is wrapped in `<user_data>` tags and the model is told to treat it as data, never as instructions.
- Rules: no invented names, dates, promises, attachments or facts; placeholders instead; suggestions vs decisions; "Not specified" for missing owners/deadlines; no silent date interpretation; no overlapping blocks or exceeding hours; honest conflicts; estimates labelled.
- Strict JSON schemas keep outputs predictable; inputs are length-limited and validated with zod.
- No accounts and no database: inputs and outputs are not stored by the app. Requests are sent with provider storage disabled (`store: false`), but the AI service may still process/retain requests under its own terms.

## Known limitations
- Results are lost on refresh (by design for v1).
- The AI can still make mistakes; time-block validity is guided by the prompt, not checked by code.
- Dates are free text, so the planner relies on the user's wording.
- No calendar or email integration; nothing is sent or scheduled.
