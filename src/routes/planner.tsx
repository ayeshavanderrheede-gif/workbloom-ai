import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Wand2, RefreshCw, Trash2, FlaskConical, Plus, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planWork } from "@/lib/ai.functions";
import { plannerExample } from "@/lib/examples";
import { useTransfer } from "@/lib/transfer";
import { validatePlanner } from "@/lib/validation";
import type { PlannerInput, PlannerResult, PlannerTask } from "@/lib/types";
import {
  PageHeader, InputNotice, OutputNotice, SampleBanner, LearnTip, CopyButton, ErrorBox, Field, inputCls, confirmReplace,
} from "@/components/shared";

export const Route = createFileRoute("/planner")({
  validateSearch: (s: Record<string, unknown>) => ({ starter: typeof s.starter === "string" ? s.starter : undefined }),
  head: () => ({
    meta: [
      { title: "Task Planner — WorkBloom AI" },
      { name: "description", content: "Turn your tasks, deadlines and availability into a realistic plan." },
      { property: "og:title", content: "Task Planner — WorkBloom AI" },
      { property: "og:description", content: "Make your workload manageable." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlannerPage,
});

const blankTask = (): PlannerTask => ({ name: "", deadline: "", duration: "", priority: "medium" });
const empty: PlannerInput = { mode: "daily", dates: "", hours: "", commitments: "", tasks: [blankTask()] };

function planText(r: PlannerResult) {
  const b = r.blocks.map((x) => `${x.day ? x.day + " " : ""}${x.start}–${x.end}  ${x.activity}${x.note ? ` (${x.note})` : ""}`).join("\n");
  const u = r.unscheduled.length ? `\n\nDoesn't fit:\n${r.unscheduled.map((x) => `- ${x.task}: ${x.nextStep}`).join("\n")}` : "";
  return `Proposed plan\n${b}${u}`;
}

const kindStyle: Record<string, string> = {
  task: "bg-lavender",
  commitment: "bg-sage",
  break: "bg-muted",
  buffer: "bg-muted",
};

function PlannerPage() {
  const { starter } = Route.useSearch();
  const { plannerTasks, setPlannerTasks } = useTransfer();
  const [input, setInput] = useState<PlannerInput>(empty);
  const [sample, setSample] = useState(false);
  const [fromMeeting, setFromMeeting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [edited, setEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    if (plannerTasks) {
      setInput({ ...empty, tasks: plannerTasks.length ? plannerTasks : [blankTask()] });
      setFromMeeting(true);
      setPlannerTasks(null);
    } else if (starter === "busy") {
      setInput(plannerExample);
      setSample(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starter]);

  const set = <K extends keyof PlannerInput>(k: K, v: PlannerInput[K]) => setInput((p) => ({ ...p, [k]: v }));
  const setTask = (i: number, patch: Partial<PlannerTask>) =>
    setInput((p) => ({ ...p, tasks: p.tasks.map((t, j) => (j === i ? { ...t, ...patch } : t)) }));

  async function run() {
    if (busy.current) return;
    const v = validatePlanner(input);
    setErrors(v);
    if (Object.keys(v).length) {
      const first = Object.keys(v)[0];
      document.getElementById(first === "tasks" ? "task-name-0" : first)?.focus();
      return;
    }
    if (!confirmReplace(edited)) return;
    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const r = await planWork({ data: { ...input, tasks: input.tasks.filter((t) => t.name.trim()) } });
      if (r.ok) { setResult(r.data); setEdited(false); } else setError(r.error);
    } catch {
      setError("We couldn't reach the AI service. Check your connection.");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  function clearAll() {
    if ((result || input.tasks.some((t) => t.name)) && !window.confirm("Clear your tasks and the plan? This can't be undone.")) return;
    setInput(empty); setResult(null); setErrors({}); setError(""); setSample(false); setFromMeeting(false);
  }

  function editBlock(i: number, k: "start" | "end" | "activity" | "note", v: string) {
    if (!result) return;
    setResult({ ...result, blocks: result.blocks.map((b, j) => (j === i ? { ...b, [k]: v } : b)) });
    setEdited(true);
  }

  return (
    <div>
      <PageHeader title="Task Planner" intro="Add your tasks and the time you have. You'll get a suggested plan to adjust — it won't add anything to your calendar." />
      <div className="space-y-6">
        <form className="card-soft space-y-4 p-5" onSubmit={(e) => { e.preventDefault(); run(); }} noValidate>
          <InputNotice />
          {sample && <SampleBanner onClear={() => { setInput(empty); setSample(false); }} />}
          {fromMeeting && (
            <p className="rounded-xl bg-lavender p-3 text-sm">
              <strong>Action items carried over from your meeting.</strong> Add a time estimate for each task, plus your available hours, before generating.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">Plan type <span className="text-primary">*</span></legend>
              <div className="flex gap-2">
                {(["daily", "weekly"] as const).map((m) => (
                  <label key={m} className={`cursor-pointer rounded-full border px-4 py-2 text-sm capitalize has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${input.mode === m ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"}`}>
                    <input type="radio" name="mode" className="sr-only" checked={input.mode === m} onChange={() => set("mode", m)} /> {m}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field id="dates" label={input.mode === "daily" ? "Planning date" : "Date range"} required error={errors.dates}>
              <input id="dates" className={inputCls} placeholder={input.mode === "daily" ? "e.g. Monday 3 Nov" : "e.g. 3–7 Nov"} value={input.dates} onChange={(e) => set("dates", e.target.value)} aria-invalid={!!errors.dates} />
            </Field>
            <Field id="hours" label="Available working hours" required error={errors.hours}>
              <input id="hours" className={inputCls} placeholder="e.g. 09:00 – 17:00" value={input.hours} onChange={(e) => set("hours", e.target.value)} aria-invalid={!!errors.hours} />
            </Field>
          </div>
          <Field id="commitments" label="Existing commitments and breaks" hint="One per line, with times, e.g. Lunch 12:30–13:15">
            <textarea id="commitments" rows={3} className={inputCls} value={input.commitments} onChange={(e) => set("commitments", e.target.value)} />
          </Field>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">Tasks <span className="text-primary">*</span></legend>
            {errors.tasks && <p className="text-sm font-medium text-destructive">{errors.tasks}</p>}
            {input.tasks.map((t, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-border bg-background p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-start">
                <div>
                  <label htmlFor={`task-name-${i}`} className="text-xs font-medium">Task</label>
                  <input id={`task-name-${i}`} className={inputCls} value={t.name} onChange={(e) => setTask(i, { name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor={`task-dl-${i}`} className="text-xs font-medium">Deadline (if known)</label>
                  <input id={`task-dl-${i}`} className={inputCls} value={t.deadline} onChange={(e) => setTask(i, { deadline: e.target.value })} />
                </div>
                <div>
                  <label htmlFor={`duration-${i}`} className="text-xs font-medium">Time estimate *</label>
                  <input id={`duration-${i}`} className={inputCls} placeholder="e.g. 1 hour" value={t.duration} onChange={(e) => setTask(i, { duration: e.target.value })} aria-invalid={!!errors[`duration-${i}`]} aria-describedby={errors[`duration-${i}`] ? `duration-${i}-error` : undefined} />
                  {errors[`duration-${i}`] && <p id={`duration-${i}-error`} className="mt-1 text-xs font-medium text-destructive">{errors[`duration-${i}`]}</p>}
                </div>
                <div>
                  <label htmlFor={`task-pr-${i}`} className="text-xs font-medium">Priority</label>
                  <select id={`task-pr-${i}`} className={inputCls} value={t.priority} onChange={(e) => setTask(i, { priority: e.target.value as PlannerTask["priority"] })}>
                    <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                  </select>
                </div>
                <button type="button" aria-label={`Remove task ${i + 1}`} disabled={input.tasks.length === 1} className="self-end rounded-lg p-2.5 hover:bg-lavender disabled:opacity-40" onClick={() => set("tasks", input.tasks.filter((_, j) => j !== i))}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => set("tasks", [...input.tasks, blankTask()])}><Plus className="h-4 w-4" /> Add task</Button>
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} {loading ? "Planning…" : "Generate"}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => { setInput(plannerExample); setSample(true); }}><FlaskConical className="h-4 w-4" /> Try an example</Button>
            <Button type="button" variant="ghost" disabled={loading} onClick={clearAll}><Trash2 className="h-4 w-4" /> Clear</Button>
          </div>
        </form>

        <section aria-live="polite" aria-busy={loading} className="space-y-4">
          {error && <ErrorBox message={error} onRetry={run} />}
          {loading && !result && <div className="card-soft flex items-center justify-center gap-2 p-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Building your plan…</div>}
          {result && (
            <div className="card-soft space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Your proposed plan</h2>
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={planText(result)} label="Copy plan" />
                  <Button variant="outline" size="sm" disabled={loading} onClick={run}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Regenerate</Button>
                </div>
              </div>
              <OutputNotice />
              {result.conflict && (
                <div role="note" className="flex gap-2 rounded-xl border border-destructive/40 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
                  <p><strong>Workload conflict: </strong>{result.conflict}</p>
                </div>
              )}
              <ol className="space-y-2">
                {result.blocks.map((b, i) => (
                  <li key={i} className={`grid gap-2 rounded-xl p-3 sm:grid-cols-[auto_auto_1fr] sm:items-center ${kindStyle[b.kind] ?? "bg-muted"}`}>
                    <div className="flex items-center gap-1 text-sm">
                      {b.day && <span className="mr-1 text-xs font-semibold">{b.day}</span>}
                      <input aria-label={`Start time block ${i + 1}`} className={inputCls + " w-20 px-2 py-1 text-sm"} value={b.start} onChange={(e) => editBlock(i, "start", e.target.value)} />
                      <span aria-hidden>–</span>
                      <input aria-label={`End time block ${i + 1}`} className={inputCls + " w-20 px-2 py-1 text-sm"} value={b.end} onChange={(e) => editBlock(i, "end", e.target.value)} />
                    </div>
                    <span className="w-fit rounded-full bg-card px-2 py-0.5 text-xs font-medium capitalize">{b.kind}</span>
                    <div className="space-y-1">
                      <input aria-label={`Activity block ${i + 1}`} className={inputCls + " py-1 text-sm font-medium"} value={b.activity} onChange={(e) => editBlock(i, "activity", e.target.value)} />
                      {b.note && <input aria-label={`Note block ${i + 1}`} className={inputCls + " py-1 text-xs"} value={b.note} onChange={(e) => editBlock(i, "note", e.target.value)} />}
                    </div>
                  </li>
                ))}
              </ol>
              {result.priorities.length > 0 && (
                <div><h3 className="text-sm font-semibold">Suggested priorities</h3>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{result.priorities.map((p, i) => <li key={i}><strong>{p.task}</strong> — {p.reason}</li>)}</ol>
                </div>
              )}
              {result.breakdowns.length > 0 && (
                <div><h3 className="text-sm font-semibold">Smaller steps</h3>
                  {result.breakdowns.map((b, i) => (
                    <div key={i} className="mt-2 text-sm"><p className="font-medium">{b.task}</p><ul className="list-disc pl-5">{b.steps.map((s, j) => <li key={j}>{s}</li>)}</ul></div>
                  ))}
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold">Doesn't fit this time</h3>
                {result.unscheduled.length === 0 ? <p className="mt-1 text-sm text-muted-foreground">Everything fits within your available hours.</p> : (
                  <ul className="mt-2 space-y-2 text-sm">{result.unscheduled.map((u, i) => <li key={i} className="rounded-lg border border-border p-2"><strong>{u.task}</strong> — {u.reason}<br /><span className="text-muted-foreground">Next step: {u.nextStep}</span></li>)}</ul>
                )}
              </div>
              <LearnTip tip={result.tip} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
