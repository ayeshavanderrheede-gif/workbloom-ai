import { useState, type ReactNode } from "react";
import { ShieldCheck, AlertTriangle, Sprout, Copy, Check, ChevronDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PageHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{intro}</p>
      <ol className="mt-4 flex flex-wrap items-center gap-2 text-sm" aria-label="Steps">
        {["Add your details", "Generate", "Review and edit"].map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-lavender px-3 py-1 font-medium text-secondary-foreground">
              <span className="font-bold">{i + 1}</span> {s}
            </span>
            {i < 2 && <span aria-hidden>→</span>}
          </li>
        ))}
      </ol>
    </header>
  );
}

export function InputNotice() {
  return (
    <p className="flex gap-2 rounded-xl bg-sage p-3 text-sm text-sage-foreground">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      Use fictional or anonymised details. Avoid entering confidential workplace information or sensitive personal data.
    </p>
  );
}

export function OutputNotice() {
  return (
    <p className="flex gap-2 rounded-xl border border-border bg-muted p-3 text-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      AI can make mistakes. Review and edit this content before using it.
    </p>
  );
}

export function SampleBanner({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-primary/40 bg-lavender p-3 text-sm">
      <span>
        <strong>Sample details loaded.</strong> These are fictional — replace them with your own.
      </span>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear sample
      </Button>
    </div>
  );
}

export function LearnTip({ tip }: { tip: string }) {
  const [open, setOpen] = useState(false);
  if (!tip) return null;
  return (
    <div className="rounded-xl bg-sage">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl p-3 text-left text-sm font-semibold text-sage-foreground"
      >
        <span className="flex items-center gap-2">
          <Sprout className="h-4 w-4" aria-hidden /> Learn as you grow
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <p className="px-3 pb-3 text-sm leading-relaxed">{tip}</p>}
    </div>
  );
}

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Couldn't copy. Select the text and copy it manually.");
        }
      }}
    >
      {done ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {label}
    </Button>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-4 text-sm">
      <p className="font-semibold text-destructive">That didn't work</p>
      <p className="mt-1">{message} Your details are still here.</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        <RotateCcw className="h-4 w-4" /> Try again
      </Button>
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label} {required ? <span className="text-primary">*</span> : <span className="font-normal text-muted-foreground">(optional)</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive";

export function confirmReplace(edited: boolean, msg = "You've edited this result. Replace it with a new one?") {
  return !edited || window.confirm(msg);
}
