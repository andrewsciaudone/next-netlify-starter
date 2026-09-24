"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_ISSUED,
  DEFAULT_PROFILE,
  getProduct,
  type IssuedGarment,
  type Profile,
} from "./data";

export interface IssueLine {
  key: string;
  productId: string;
  colour: string;
  size: string;
  qty: number;
}

export interface Consultation {
  name: string;
  fit: string;
  length: string;
  wear: string;
  colours: string[];
  frequency: string;
  size: string;
  height: string;
  weight: string;
  completedAt?: string;
}

export interface CompletedOrder {
  orderNo: string;
  garments: IssuedGarment[];
  total: number;
}

interface State {
  lines: IssueLine[];
  consultation: Consultation | null;
  profile: Profile;
  issued: IssuedGarment[];
  lastOrder: CompletedOrder | null;
}

interface Store extends State {
  hydrated: boolean;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addToIssue: (
    items: { productId: string; colour: string; size: string; qty?: number }[],
    opts?: { open?: boolean }
  ) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  saveConsultation: (c: Consultation) => void;
  completeIssue: () => CompletedOrder | null;
  resetPrototype: () => void;
  count: number;
  total: number;
}

const KEY = "finest-uniform:v1";

const initial: State = {
  lines: [],
  consultation: null,
  profile: DEFAULT_PROFILE,
  issued: DEFAULT_ISSUED,
  lastOrder: null,
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {
      /* private mode or corrupt data: start fresh */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const addToIssue: Store["addToIssue"] = useCallback((items, opts) => {
    setState((s) => {
      const lines = [...s.lines];
      for (const it of items) {
        const key = `${it.productId}:${it.colour}:${it.size}`;
        const i = lines.findIndex((l) => l.key === key);
        if (i >= 0) lines[i] = { ...lines[i], qty: lines[i].qty + (it.qty ?? 1) };
        else lines.push({ key, ...it, qty: it.qty ?? 1 });
      }
      return { ...s, lines };
    });
    if (opts?.open !== false) setDrawerOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setState((s) => ({
      ...s,
      lines:
        qty <= 0
          ? s.lines.filter((l) => l.key !== key)
          : s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 9) } : l)),
    }));
  }, []);

  const removeLine = useCallback((key: string) => {
    setState((s) => ({ ...s, lines: s.lines.filter((l) => l.key !== key) }));
  }, []);

  const saveConsultation = useCallback((c: Consultation) => {
    setState((s) => ({
      ...s,
      consultation: c,
      profile: {
        ...s.profile,
        name: c.name || s.profile.name,
        fit: c.fit,
        length: c.length,
        wear: c.wear,
        colours: c.colours.length ? c.colours : s.profile.colours,
        frequency: c.frequency,
        size: c.size,
        height: c.height || undefined,
        weight: c.weight || undefined,
      },
    }));
  }, []);

  const completeIssue = useCallback((): CompletedOrder | null => {
    const s = stateRef.current;
    if (!s.lines.length) return null;
    const yy = new Date().getFullYear().toString().slice(2);
    const today = new Date().toISOString().slice(0, 10);
    const orderNo = `IS-${yy}-${String(118 + Math.floor(Math.random() * 800)).padStart(4, "0")}`;
    const garments: IssuedGarment[] = [];
    let seq = 600 + s.issued.length * 7 + Math.floor(Math.random() * 90);
    for (const l of s.lines) {
      for (let n = 0; n < l.qty; n++) {
        seq += 1 + Math.floor(Math.random() * 11);
        garments.push({
          garmentNo: `${l.productId}-${yy}-${String(seq).padStart(5, "0")}`,
          productId: l.productId,
          colour: l.colour,
          size: l.size,
          issuedAt: today,
          orderNo,
          wears: 0,
        });
      }
    }
    const total = s.lines.reduce(
      (sum, l) => sum + (getProduct(l.productId)?.price ?? 0) * l.qty,
      0
    );
    const order = { orderNo, garments, total };
    setState((prev) => ({
      ...prev,
      lines: [],
      issued: [...prev.issued, ...garments],
      lastOrder: order,
    }));
    return order;
  }, []);

  const resetPrototype = useCallback(() => {
    setState(initial);
  }, []);

  const value = useMemo<Store>(() => {
    const count = state.lines.reduce((n, l) => n + l.qty, 0);
    const total = state.lines.reduce(
      (sum, l) => sum + (getProduct(l.productId)?.price ?? 0) * l.qty,
      0
    );
    return {
      ...state,
      hydrated,
      drawerOpen,
      setDrawerOpen,
      addToIssue,
      setQty,
      removeLine,
      saveConsultation,
      completeIssue,
      resetPrototype,
      count,
      total,
    };
  }, [state, hydrated, drawerOpen, addToIssue, setQty, removeLine, saveConsultation, completeIssue, resetPrototype]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
