import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Responsible AI — WorkBloom AI" },
      { name: "description", content: "How WorkBloom AI works, its limits, and how your information is handled." },
      { property: "og:title", content: "Help & Responsible AI — WorkBloom AI" },
      { property: "og:description", content: "How WorkBloom AI works and how to use it responsibly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Help,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-soft space-y-2 p-5 leading-relaxed">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Help() {
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Help & Responsible AI</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">What WorkBloom AI does, what it can't do, and how your information is handled.</p>
      </header>
      <Section title="What WorkBloom AI is for">
        <p>WorkBloom AI supports people building workplace skills — graduates, interns, new starters and anyone else — with everyday tasks, and helps you learn as you go through optional "Learn as you grow" tips.</p>
      </Section>
      <Section title="How each tool works">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong>Email Writer:</strong> you describe who you're writing to, why, and the tone. The AI drafts a subject and email. Nothing is sent — you copy it into your own email app.</li>
          <li><strong>Meeting Notes:</strong> you paste notes. The AI returns a summary, discussion points, confirmed decisions, suggestions, action items and open questions. Missing owners or deadlines are marked "Not specified".</li>
          <li><strong>Task Planner:</strong> you list tasks, time estimates and availability. The AI proposes time blocks and flags anything that doesn't fit. It doesn't add events to any calendar.</li>
          <li><strong>Connected workflow:</strong> from a meeting summary you can choose action items to plan, or details to include in a follow-up email. Your edited content is carried across in this browser tab only.</li>
        </ul>
      </Section>
      <Section title="AI limitations, mistakes and bias">
        <p>AI can misread notes, get details wrong, sound overconfident, or reflect biases in the data it learned from — for example in assumptions about people, roles or tone. It doesn't know your workplace, your colleagues or your organisation's policies.</p>
      </Section>
      <Section title="Check before you use it">
        <ul className="list-disc space-y-1 pl-5">
          <li>Check facts, names, dates, numbers and deadlines.</li>
          <li>Replace any [placeholders].</li>
          <li>Read the tone as the recipient would.</li>
          <li>Make sure plans are realistic for you.</li>
        </ul>
        <p>You remain responsible for what you send and for your final decisions.</p>
      </Section>
      <Section title="How your information is processed and stored">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>When you select Generate, the details you entered are sent to this app's server and then to an AI model through Lovable AI (the AI service this app uses) to create the result.</li>
          <li>WorkBloom AI does not save your inputs or results in a database, and there are no accounts. Results stay in your browser tab and disappear when you refresh or close it.</li>
          <li>The AI request is made with storage turned off at the provider. However, the AI service and its model provider may process and briefly keep requests under their own terms (for example, for security or abuse monitoring). Technical logs may record that a request happened.</li>
          <li>Because of this, use fictional or anonymised details and avoid confidential workplace information or sensitive personal data.</li>
        </ul>
      </Section>
      <Section title="How we keep the AI on track">
        <p>Each tool gives the AI separate, structured instructions: never invent names, dates, promises or facts; use placeholders instead; separate suggestions from decisions; don't overlap time blocks or exceed your working hours; and be honest when a workload doesn't fit. Anything you paste is treated as information to work with — not as instructions that change these rules.</p>
      </Section>
    </div>
  );
}
