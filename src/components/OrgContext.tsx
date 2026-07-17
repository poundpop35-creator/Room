"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  ReactNode,
} from "react";

interface OrgContextValue {
  organization: string;
  setOrganization: (org: string) => void;
  fiscalYear: number;
  setFiscalYear: (year: number) => void;
  ready: boolean;
}

const OrgContext = createContext<OrgContextValue | null>(null);

const STORAGE_KEY = "budget-app.organization";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

function writeOrganization(org: string) {
  window.localStorage.setItem(STORAGE_KEY, org);
  listeners.forEach((l) => l());
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const organization = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [fiscalYear, setFiscalYearState] = useState(2569);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setFiscalYearState(d.fiscal_year))
      .finally(() => setReady(true));
  }, []);

  async function setFiscalYear(year: number) {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fiscal_year: year }),
    });
    const d = await res.json();
    setFiscalYearState(d.fiscal_year);
  }

  return (
    <OrgContext.Provider
      value={{
        organization,
        setOrganization: writeOrganization,
        fiscalYear,
        setFiscalYear,
        ready,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}
