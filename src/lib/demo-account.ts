import { useSyncExternalStore } from "react";

// Presentation-only account selection for the mockup, never authorization.
export type DemoAccount = "teacher" | "leader" | "principal" | "homeroom" | "student";
let account: DemoAccount = "teacher";
const listeners = new Set<() => void>();
export function selectDemoAccount(next: DemoAccount) {
  account = next;
  listeners.forEach((listener) => listener());
}
export function useDemoAccount() {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, () => account, () => "teacher" as DemoAccount);
}
export const DEMO_NAMES: Record<DemoAccount, string> = {
  teacher: "G/v Phùng Thúy Hằng", leader: "Tổ trưởng Nguyễn Minh Khang",
  principal: "H/t Nguyễn Thị Mai Lan", homeroom: "GVCN Trần Bích Ngọc", student: "Phí Song Ngân",
};