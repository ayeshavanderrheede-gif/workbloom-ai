import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Wand2, RefreshCw, Trash2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateEmail } from "@/lib/ai.functions";
import { emailExamples } from "@/lib/examples";
import { useTransfer } from "@/lib/transfer";
import { validateEmail } from "@/lib/validation";
import type { EmailInput, EmailResult } from "@/lib/types";
import {
  PageHeader, InputNotice, OutputNotice, SampleBanner, LearnTip, CopyButton, ErrorBox, Field, inputCls, confirmReplace,
} from "@/components/shared";

export const Route = createFileRoute("/email")({
  validateSearch: (s: Record<string, unknown>) => ({ starter: typeof s["starter"] === "string" ? s["starter"] : undefined }),
  head: () => ({
    meta: [
      { title: "Email Writer — WorkBloom AI" },
      { name: "description", content: "Draft clear, professional emails for managers, colleagues and clients." },
      { property: "og:title", content: "Email Writer — WorkBloom AI" },
      { property: "og:description", content: "Find the right words for your workplace emails." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailPage,
});

const empty: EmailInput = { recipientName: "", relationship: "", purpose: "", details: "", tone: "", senderName: "" };

function EmailPage() {
  const { starter } = Route.useSearch();
  const { emailDraft, setEmailDraft } = useTransfer();
  const [input, setInput] = useState<EmailInput>(empty);
  const [sample, setSample] = useState(false);
  const [fromMeeting, setFromMeeting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EmailResult | null>(null);
  const [edited, setEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    if (emailDraft) {
      setInput({ ...empty, ...emailDraft });
      setFromMeeting(true);
      setEmailDraft(null);
    } else if (starter && emailExamples[starter]) {
      setInput(emailExamples[starter]);
      setSample(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starter]);

  const set = <K extends keyof EmailInput>(k: K, v: EmailInput[K]) => setInput((p) => ({ ...p, [k]: v }));

  async function run() {
    if (busy.current) return;
    const v = validateEmail(input);
    setErrors(v);
    if (Object.keys(v).length) {
      document.getElementById(Object.keys(v)[0] ?? "")?.focus();
      return;
    }
    if (!confirmReplace(edited)) return;
    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const r = await generateEmail({ data: input as Required<EmailInput> & { relationship: "manager"; tone: "formal" } });
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
    if ((result || input.purpose) && !window.confirm("Clear your details and the draft? This can't be undone.")) return;
    setInput(empty);
    setResult(null);
    setErrors({});
    setError("");
    setSample(false);
    setFromMeeting(false);
  }

  const err = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  return (
    <div>
      <PageHeader title="Email Writer" intro="Tell us who you're writing to and why. You'll get a draft to review and edit — nothing is sent." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="card-soft space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            run();
          }}
          noValidate
        >
          <InputNotice />
          {sample && <SampleBanner onClear={() => { setInput(empty); setSample(false); }} />}
          {fromMeeting && (
            <p className="rounded-xl bg-lavender p-3 text-sm">
              <strong>Carried over from your meeting summary.</strong> Choose who you're writing to and a tone, then review the details.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="recipientName" label="Recipient name">
              <input id="recipientName" className={inputCls} value={input.recipientName} onChange={(e) => set("recipientName", e.target.value)} />
            </Field>
            <Field id="relationship" label="Recipient relationship" required error={errors["relationship"]}>
              <select id="relationship" className={inputCls} value={input.relationship} onChange={(e) => set("relationship", e.target.value as EmailInput["relationship"])} {...err("relationship")}>
                <option value="">Choose…</option>
                <option value="manager">Manager</option>
                <option value="colleague">Colleague</option>
                <option value="client">Client</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
          <Field id="purpose" label="Purpose of the email" required error={errors["purpose"]} hint="e.g. Ask for feedback on my report">
            <input id="purpose" className={inputCls} value={input.purpose} onChange={(e) => set("purpose", e.target.value)} {...err("purpose")} />
          </Field>
          <Field id="details" label="Key details to include">
            <textarea id="details" rows={6} className={inputCls} value={input.details} onChange={(e) => set("details", e.target.value)} />
          </Field>
          <fieldset className="space-y-1.5" aria-describedby={errors["tone"] ? "tone-error" : undefined}>
            <legend className="text-sm font-semibold">Tone <span className="text-primary">*</span></legend>
            <div className="flex flex-wrap gap-2">
              {(["formal", "friendly", "persuasive"] as const).map((t, i) => (
                <label key={t} className={`cursor-pointer rounded-full border px-4 py-2 text-sm capitalize has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring ${input.tone === t ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card"}`}>
                  <input id={i === 0 ? "tone" : undefined} type="radio" name="tone" value={t} checked={input.tone === t} onChange={() => set("tone", t)} className="sr-only" />
                  {t}
                </label>
              ))}
            </div>
            {errors["tone"] && <p id="tone-error" className="text-sm font-medium text-destructive">{errors["tone"]}</p>}
          </fieldset>
          <Field id="senderName" label="Your name">
            <input id="senderName" className={inputCls} value={input.senderName} onChange={(e) => set("senderName", e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} {loading ? "Writing…" : "Generate"}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => { setInput(emailExamples["manager"]!); setSample(true); }}>
              <FlaskConical className="h-4 w-4" /> Try an example
            </Button>
            <Button type="button" variant="ghost" disabled={loading} onClick={clearAll}>
              <Trash2 className="h-4 w-4" /> Clear
            </Button>
          </div>
        </form>

        <section aria-live="polite" aria-busy={loading} className="space-y-4">
          {error && <ErrorBox message={error} onRetry={run} />}
          {!result && !error && (
            <div className="card-soft flex min-h-48 items-center justify-center p-6 text-center text-muted-foreground">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Drafting your email…</span> : "Your draft will appear here."}
            </div>
          )}
          {result && (
            <div className="card-soft space-y-4 p-5">
              <h2 className="text-lg font-semibold">Your draft</h2>
              <OutputNotice />
              <Field id="out-subject" label="Subject" required>
                <input id="out-subject" className={inputCls} value={result.subject} onChange={(e) => { setResult({ ...result, subject: e.target.value }); setEdited(true); }} />
              </Field>
              <Field id="out-body" label="Email" required>
                <textarea id="out-body" rows={14} className={inputCls} value={result.body} onChange={(e) => { setResult({ ...result, body: e.target.value }); setEdited(true); }} />
              </Field>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={result.subject} label="Copy subject" />
                <CopyButton text={result.body} label="Copy email" />
                <Button variant="outline" size="sm" disabled={loading} onClick={run}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Regenerate
                </Button>
              </div>
              {result.checks.length > 0 && (
                <div className="rounded-xl border border-border p-3 text-sm">
                  <p className="font-semibold">Before you use this</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">{result.checks.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>
              )}
              <LearnTip tip={result.tip} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
