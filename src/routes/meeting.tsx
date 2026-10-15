import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Wand2, RefreshCw, Trash2, FlaskConical, CalendarClock, Mail, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { summariseMeeting } from "@/lib/ai.functions";
import { meetingExample } from "@/lib/examples";
import { useTransfer } from "@/lib/transfer";
import { validateMeeting } from "@/lib/validation";
import type { MeetingResult } from "@/lib/types";
import {
  PageHeader, InputNotice, OutputNotice, SampleBanner, LearnTip, CopyButton, ErrorBox, Field, inputCls, confirmReplace,
} from "@/components/shared";

export const Route = createFileRoute("/meeting")({
  validateSearch: (s: Record<string, unknown>) => ({ starter: typeof s.starter === "string" ? s.starter : undefined }),
  head: () => ({
    meta: [
      { title: "Meeting Notes — WorkBloom AI" },
      { name: "description", content: "Turn meeting notes into a clear summary, decisions and action items." },
      { property: "og:title", content: "Meeting Notes — WorkBloom AI" },
      { property: "og:description", content: "Turn notes into clear next steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MeetingPage,
});

const lines = (a: string[]) => a.join("\n");
const split = (s: string) => s.split("\n");

function toText(title: string, r: MeetingResult) {
  const list = (h: string, a: string[]) => (a.filter(Boolean).length ? `${h}\n${a.filter(Boolean).map((x) => `- ${x}`).join("\n")}\n\n` : "");
  const actions = r.actionItems.length
    ? `Action items\n${r.actionItems.map((a) => `- ${a.task} — Owner: ${a.owner} — Deadline: ${a.deadline}`).join("\n")}\n\n`
    : "Action items\n- No action items were identified.\n\n";
  return `${title ? title + "\n\n" : ""}Summary\n${r.summary}\n\n${list("Key discussion points", r.keyPoints)}${list("Confirmed decisions", r.decisions)}${list("Suggestions (not confirmed)", r.suggestions)}${actions}${list("Questions to clarify", r.questions)}`.trim();
}

function ListEditor({ id, label, value, onChange }: { id: string; label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <Field id={id} label={label} hint="One item per line" required>
      <textarea id={id} rows={Math.max(2, value.length + 1)} className={inputCls} value={lines(value)} onChange={(e) => onChange(split(e.target.value))} placeholder="None" />
    </Field>
  );
}

function MeetingPage() {
  const { starter } = Route.useSearch();
  const navigate = useNavigate();
  const { setPlannerTasks, setEmailDraft } = useTransfer();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [sample, setSample] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<MeetingResult | null>(null);
  const [edited, setEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [transfer, setTransfer] = useState<null | "plan" | "email">(null);
  const [picked, setPicked] = useState<boolean[]>([]);
  const [inc, setInc] = useState({ summary: true, decisions: true, actions: true });
  const busy = useRef(false);

  useEffect(() => {
    if (starter === "notes") loadExample();
  }, [starter]);

  function loadExample() {
    setTitle(meetingExample.title);
    setNotes(meetingExample.notes);
    setSample(true);
  }

  function update(r: MeetingResult) {
    setResult(r);
    setEdited(true);
  }

  async function run() {
    if (busy.current) return;
    const v = validateMeeting(notes);
    setErrors(v);
    if (Object.keys(v).length) {
      document.getElementById("notes")?.focus();
      return;
    }
    if (!confirmReplace(edited)) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setTransfer(null);
    try {
      const r = await summariseMeeting({ data: { title, notes } });
      if (r.ok) {
        setResult(r.data);
        setEdited(false);
      } else setError(r.error);
    } catch {
      setError("We couldn't reach the AI service. Check your connection.");
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  function clearAll() {
    if ((result || notes) && !window.confirm("Clear your notes and the summary? This can't be undone.")) return;
    setTitle(""); setNotes(""); setResult(null); setErrors({}); setError(""); setSample(false); setTransfer(null);
  }

  function openTransfer(kind: "plan" | "email") {
    if (!result) return;
    setPicked(result.actionItems.map(() => true));
    setTransfer(kind);
  }

  function confirmTransfer() {
    if (!result) return;
    const chosen = result.actionItems.filter((_, i) => picked[i]);
    if (transfer === "plan") {
      setPlannerTasks(
        chosen.map((a) => ({
          name: a.owner && a.owner !== "Not specified" ? `${a.task} (owner: ${a.owner})` : a.task,
          deadline: a.deadline === "Not specified" ? "" : a.deadline,
          duration: "",
          priority: "medium",
        })),
      );
      navigate({ to: "/planner", search: { starter: undefined } });
    } else {
      const parts: string[] = [];
      if (inc.summary && result.summary) parts.push(`Summary: ${result.summary}`);
      if (inc.decisions && result.decisions.filter(Boolean).length) parts.push(`Decisions:\n${result.decisions.filter(Boolean).map((d) => `- ${d}`).join("\n")}`);
      if (inc.actions && chosen.length) parts.push(`Action items:\n${chosen.map((a) => `- ${a.task} (owner: ${a.owner}; deadline: ${a.deadline})`).join("\n")}`);
      setEmailDraft({ purpose: `Follow up on the meeting${title ? `: ${title}` : ""}`, details: parts.join("\n\n") });
      navigate({ to: "/email", search: { starter: undefined } });
    }
  }

  return (
    <div>
      <PageHeader title="Meeting Notes" intro="Paste or type your notes. You'll get a summary, decisions and action items you can check and edit." />
      <div className="space-y-6">
        <form className="card-soft space-y-4 p-5" onSubmit={(e) => { e.preventDefault(); run(); }} noValidate>
          <InputNotice />
          {sample && <SampleBanner onClear={() => { setTitle(""); setNotes(""); setSample(false); }} />}
          <Field id="title" label="Meeting title">
            <input id="title" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field id="notes" label="Meeting notes" required error={errors.notes}>
            <textarea id="notes" rows={10} className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} {loading ? "Summarising…" : "Generate"}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={loadExample}><FlaskConical className="h-4 w-4" /> Try an example</Button>
            <Button type="button" variant="ghost" disabled={loading} onClick={clearAll}><Trash2 className="h-4 w-4" /> Clear</Button>
          </div>
        </form>

        <section aria-live="polite" aria-busy={loading} className="space-y-4">
          {error && <ErrorBox message={error} onRetry={run} />}
          {loading && !result && (
            <div className="card-soft flex items-center justify-center gap-2 p-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Reading your notes…</div>
          )}
          {result && (
            <div className="card-soft space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Your meeting summary</h2>
                <div className="flex flex-wrap gap-2">
                  <CopyButton text={toText(title, result)} label="Copy all" />
                  <Button variant="outline" size="sm" disabled={loading} onClick={run}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Regenerate
                  </Button>
                </div>
              </div>
              <OutputNotice />
              <Field id="o-summary" label="Summary" required>
                <textarea id="o-summary" rows={4} className={inputCls} value={result.summary} onChange={(e) => update({ ...result, summary: e.target.value })} />
              </Field>
              <ListEditor id="o-points" label="Key discussion points" value={result.keyPoints} onChange={(v) => update({ ...result, keyPoints: v })} />
              <div className="grid gap-4 md:grid-cols-2">
                <ListEditor id="o-decisions" label="Confirmed decisions" value={result.decisions} onChange={(v) => update({ ...result, decisions: v })} />
                <ListEditor id="o-sugg" label="Suggestions (not confirmed)" value={result.suggestions} onChange={(v) => update({ ...result, suggestions: v })} />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">Action items</h3>
                {result.actionItems.length === 0 && <p className="text-sm text-muted-foreground">No action items were identified in these notes.</p>}
                {result.actionItems.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead><tr className="text-left text-muted-foreground"><th className="p-2">Task</th><th className="p-2">Responsible</th><th className="p-2">Deadline</th><th className="sr-only">Remove</th></tr></thead>
                      <tbody>
                        {result.actionItems.map((a, i) => (
                          <tr key={i} className="border-t border-border">
                            {(["task", "owner", "deadline"] as const).map((k) => (
                              <td key={k} className="p-1.5">
                                <input aria-label={`${k} for action ${i + 1}`} className={inputCls + " py-1.5 text-sm"} value={a[k]} onChange={(e) => { const items = [...result.actionItems]; items[i] = { ...a, [k]: e.target.value }; update({ ...result, actionItems: items }); }} />
                              </td>
                            ))}
                            <td className="p-1.5">
                              <button type="button" aria-label={`Remove action ${i + 1}`} className="rounded p-1.5 hover:bg-lavender" onClick={() => update({ ...result, actionItems: result.actionItems.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => update({ ...result, actionItems: [...result.actionItems, { task: "", owner: "Not specified", deadline: "Not specified" }] })}>
                  <Plus className="h-4 w-4" /> Add action item
                </Button>
              </div>

              <ListEditor id="o-q" label="Questions or missing details to clarify" value={result.questions} onChange={(v) => update({ ...result, questions: v })} />
              <LearnTip tip={result.tip} />

              <div className="rounded-xl bg-lavender p-4">
                <h3 className="font-semibold">What's next?</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={() => openTransfer("plan")} disabled={result.actionItems.length === 0}><CalendarClock className="h-4 w-4" /> Plan these action items</Button>
                  <Button variant="outline" onClick={() => openTransfer("email")}><Mail className="h-4 w-4" /> Draft a follow-up email</Button>
                </div>
                {transfer && (
                  <div className="mt-4 space-y-3 rounded-xl bg-card p-4">
                    <p className="text-sm font-semibold">Review what to bring across{transfer === "plan" ? " to the Task Planner" : " to the Email Writer"}:</p>
                    {transfer === "email" && (
                      <div className="flex flex-wrap gap-4 text-sm">
                        {(["summary", "decisions", "actions"] as const).map((k) => (
                          <label key={k} className="flex items-center gap-2">
                            <input type="checkbox" checked={inc[k]} onChange={(e) => setInc({ ...inc, [k]: e.target.checked })} className="h-4 w-4 accent-primary" />
                            {k === "actions" ? "Action items" : k[0].toUpperCase() + k.slice(1)}
                          </label>
                        ))}
                      </div>
                    )}
                    {(transfer === "plan" || inc.actions) && result.actionItems.length > 0 && (
                      <ul className="space-y-1.5 text-sm">
                        {result.actionItems.map((a, i) => (
                          <li key={i}>
                            <label className="flex items-start gap-2">
                              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" checked={!!picked[i]} onChange={(e) => { const p = [...picked]; p[i] = e.target.checked; setPicked(p); }} />
                              <span>{a.task || "(untitled)"} <span className="text-muted-foreground">— {a.owner}, {a.deadline}</span></span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                    {transfer === "plan" && <p className="text-xs text-muted-foreground">You'll add time estimates and your availability next.</p>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={confirmTransfer} disabled={transfer === "plan" && !picked.some(Boolean)}>Continue</Button>
                      <Button size="sm" variant="ghost" onClick={() => setTransfer(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
