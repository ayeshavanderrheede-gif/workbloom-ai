WorkBloom AI 🌸
Build confidence. Grow at work.

Overview and target users

WorkBloom AI helps graduates, interns, first-time employees and anyone developing workplace skills to write professional emails, understand meeting notes and organise their workload — and to learn while doing it, through optional “Learn as you grow” tips.

Features
- Home: Three tool cards and “Not sure where to start?” situation starters that open a tool with clearly labelled, fictional sample details.
- Email Writer: Recipient, relationship, purpose, details, tone and sender → editable subject and body, “Before you use this” checks and a learning tip. Controls include Generate, Regenerate, Copy subject, Copy email and Clear. Drafts only; nothing is sent.
- Meeting Notes: Title and notes → summary, key points, confirmed decisions, unconfirmed suggestions, an editable action-item table (task / responsible / deadline, with “Not specified” when absent), questions to clarify and a learning tip. Includes Copy all.
- Task Planner: Daily/weekly plans, dates, tasks with deadlines, estimates and priorities, working hours and commitments → editable time blocks, priorities with reasons, smaller steps, tasks that do not fit with suggested next steps, conflict warnings and a learning tip.
- Help & Responsible AI: Purpose, how the tools work, limitations, bias and data handling.
  
Connected workflow

After generating a meeting summary, users can select:
- Plan these action items: Choose items to transfer to Task Planner. Time estimates and availability are required before generating a plan.
- Draft a follow-up email: Choose the summary, decisions or action items to transfer to Email Writer. The user selects the recipient and tone.
Edited content is carried in memory, so nothing needs to be pasted again.

Shared experience
- Guided steps: Add details → Generate → Review and edit.
- “Try an example” options.
- Required-field validation and loading states.
- Duplicate-submit protection.
- Retryable errors that preserve input.
- Confirmation before replacing an edited result or clearing work.
- Responsible AI notices near inputs and outputs.
- Keyboard access and visible focus states.
- Collapsible mobile menu.
  
Technologies
- TanStack Start: React 19, Vite and server functions.
- Tailwind CSS v4: Styling.
- Lucide: Icons.
- Sonner: Notifications.
- Zod: Input validation.
- Lovable AI Gateway: OpenAI Responses API, model openai/gpt-6-astra, and strict JSON schema output.
  
Setup and AI configuration

Install dependencies:
bun install

Start the development server:
bun run dev

AI calls run only on the server in src/lib/ai.server.ts, using the LOVABLE_API_KEY environment variable, which Lovable provisions automatically. The key is never sent to the browser or stored in the repository.

AI usage is billed per request against the workspace’s Lovable AI balance. If credits run out, the application shows a clear message.

Prompt design and responsible AI

Each tool has its own structured prompt in src/lib/ai.functions.ts, covering its role, task, constraints and output format, alongside shared rules.
User content is wrapped in <user_data> tags, and the model is instructed to treat it as data rather than instructions.

Prompt rules include:

- Do not invent names, dates, promises, attachments or facts; use placeholders instead.
- Distinguish suggestions from confirmed decisions.
- Use “Not specified” for missing owners or deadlines.
- Do not silently interpret ambiguous dates.
- Do not overlap time blocks or exceed available hours.
- Clearly explain scheduling conflicts.
- Label estimated durations as estimates.
  
Strict JSON schemas keep outputs predictable. Inputs are length-limited and validated with Zod.

There are no accounts or database: inputs and outputs are not persistently stored by the application. Requests are sent with provider storage disabled (store: false), but the AI service may still process or retain requests under its own terms.

Known limitations

- Results are lost on refresh, by design for version 1.
- AI can still make mistakes. Time-block validity is guided by the prompt rather than checked by code.
- Dates are free text, so the planner relies on the user’s wording.
- There is no calendar or email integration; nothing is sent or scheduled.
  
Creator

Aiesha Van Der Rheede.

Github Link: https://workbloom-buddy.lovable.app/
