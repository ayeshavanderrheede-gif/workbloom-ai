import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, NotebookPen, CalendarClock, ArrowRight } from "lucide-react";
import { AsterLogo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkBloom AI — A little support. Room to grow." },
      { name: "description", content: "Write with confidence, make sense of meetings, and plan your workday." },
      { property: "og:title", content: "WorkBloom AI" },
      { property: "og:description", content: "Write with confidence, make sense of meetings, and plan your workday." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const tools = [
  { to: "/email", title: "Write an email", text: "Find the right words.", icon: Mail },
  { to: "/meeting", title: "Summarise a meeting", text: "Turn notes into clear next steps.", icon: NotebookPen },
  { to: "/planner", title: "Plan my work", text: "Make your workload manageable.", icon: CalendarClock },
] as const;

const starters = [
  { label: "Ask my manager for help.", to: "/email", starter: "manager" },
  { label: "Follow up on a task.", to: "/email", starter: "followup" },
  { label: "Understand my meeting notes.", to: "/meeting", starter: "notes" },
  { label: "Organise a busy day.", to: "/planner", starter: "busy" },
] as const;

function Index() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-lavender p-6 sm:p-10">
        <AsterLogo className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 opacity-40 sm:h-56 sm:w-56" />
        <h1 className="relative max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">A little support. Room to grow.</h1>
        <p className="relative mt-3 max-w-lg text-lg">Write with confidence, make sense of meetings, and plan your workday.</p>
      </section>

      <section aria-labelledby="tools-h">
        <h2 id="tools-h" className="sr-only">Tools</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {tools.map(({ to, title, text, icon: Icon }) => (
            <Link key={to} to={to} className="card-soft group p-5 transition-shadow hover:shadow-lift">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage text-sage-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-muted-foreground">{text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="start-h" className="card-soft p-5 sm:p-6">
        <h2 id="start-h" className="text-xl font-semibold">Not sure where to start?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a situation. We'll open the right tool with sample details you can replace.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {starters.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              search={{ starter: s.starter }}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 font-medium hover:border-primary hover:bg-lavender"
            >
              {s.label} <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
