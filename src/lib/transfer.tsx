import { createContext, useContext, useState, type ReactNode } from "react";
import type { EmailInput, PlannerTask } from "./types";

// In-memory only (lost on refresh). Carries edited meeting content into other tools.
type Ctx = {
  plannerTasks: PlannerTask[] | null;
  setPlannerTasks: (t: PlannerTask[] | null) => void;
  emailDraft: Partial<EmailInput> | null;
  setEmailDraft: (e: Partial<EmailInput> | null) => void;
};
const TransferCtx = createContext<Ctx | null>(null);

export function TransferProvider({ children }: { children: ReactNode }) {
  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[] | null>(null);
  const [emailDraft, setEmailDraft] = useState<Partial<EmailInput> | null>(null);
  return (
    <TransferCtx.Provider value={{ plannerTasks, setPlannerTasks, emailDraft, setEmailDraft }}>
      {children}
    </TransferCtx.Provider>
  );
}

export function useTransfer() {
  const c = useContext(TransferCtx);
  if (!c) throw new Error("TransferProvider missing");
  return c;
}
