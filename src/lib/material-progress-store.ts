import { useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();
let completed = new Set<string>();

function emit() { listeners.forEach((l) => l()); }

export function toggleCompleted(id: string) {
  const next = new Set(completed);
  if (next.has(id)) next.delete(id); else next.add(id);
  completed = next;
  emit();
}

export function markCompleted(id: string) {
  if (completed.has(id)) return;
  const next = new Set(completed);
  next.add(id);
  completed = next;
  emit();
}

export function isCompleted(id: string): boolean {
  return completed.has(id);
}

export function useCompletion(): Set<string> {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => completed,
    () => completed,
  );
}
