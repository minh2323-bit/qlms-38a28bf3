import { useSyncExternalStore } from "react";

export type MaterialKind = "video" | "slide" | "doc" | "image" | "exercise" | "syllabus";

export type Material = {
  id: string;
  classRealId: string;   // "4A", "3D", ...
  subject: string;       // "Toán", "Tiếng Việt"
  unitId: string;        // KNOWLEDGE_TREE unit id (or "_misc")
  kind: MaterialKind;
  title: string;
  meta?: string;         // e.g. "24 slide", "10 câu", "12:35"
  /** where this was created from, useful for toast feedback */
  origin?: "class" | "schedule" | "seed";
};

type Listener = () => void;

let materials: Material[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- Seed ---------- */
// Mirrors MATERIALS_SEED in /index.tsx, but instantiated per (class, subject, unit) so
// the same content shows up in both the class detail page and the schedule lesson panel.
const SEED_TEMPLATES: Record<string, { kind: MaterialKind; title: string; meta?: string }[]> = {
  "u-ps": [
    { kind: "syllabus", title: "Tổng quan kiến thức phân số", meta: "1 trang" },
    { kind: "slide",    title: "Slide bài giảng – Phân số",   meta: "24 slide" },
    { kind: "doc",      title: "Phương pháp cộng, trừ phân số", meta: "8 trang" },
    { kind: "exercise", title: "Phiếu luyện tập số 12",        meta: "12 câu" },
  ],
  "u-stp": [
    { kind: "slide",    title: "Slide bài giảng – Số thập phân", meta: "18 slide" },
    { kind: "exercise", title: "Bài tập về nhà số 7",            meta: "10 câu" },
  ],
  "u-tn": [
    { kind: "slide",    title: "Slide ôn tập số tự nhiên",  meta: "20 slide" },
    { kind: "exercise", title: "Phiếu bài tập số tự nhiên", meta: "12 câu" },
    { kind: "video",    title: "Video: Giới thiệu số tự nhiên", meta: "12:35" },
  ],
  "u-lt": [
    { kind: "slide",    title: "Slide làm tròn số thập phân", meta: "12 slide" },
  ],
  "u-tsl": [
    { kind: "doc",      title: "Tài liệu: Tỉ số phần trăm",  meta: "6 trang" },
    { kind: "exercise", title: "Bài tập tỉ số phần trăm",    meta: "10 câu" },
  ],
};

// (classReal, subject, unitId) combos taken from lessons that appear in index.tsx schedule.
const SEED_COMBOS: Array<[string, string, string]> = [
  ["3A", "Toán", "u-ps"], ["3B", "Toán", "u-ps"], ["3C", "Toán", "u-ps"], ["3D", "Toán", "u-ps"],
  ["4A", "Toán", "u-tn"], ["4B", "Toán", "u-tn"], ["4C", "Toán", "u-tn"],
  ["3A", "Toán", "u-stp"], ["3B", "Toán", "u-stp"], ["3C", "Toán", "u-stp"], ["3D", "Toán", "u-sstp"],
  ["4A", "Toán", "u-lt"], ["4B", "Toán", "u-lt"], ["4C", "Toán", "u-sstp"],
  ["3A", "Toán", "u-pct"], ["3B", "Toán", "u-pct"],
  ["4A", "Toán", "u-tsl"], ["4B", "Toán", "u-dl"], ["3A", "Toán", "u-hh"],
  // Also seed Tiếng Việt for class 4A so its class detail page has content.
  ["4A", "Tiếng Việt", "u-ps"],
];

function seedOnce() {
  if (materials.length) return;
  const acc: Material[] = [];
  for (const [cls, subj, unit] of SEED_COMBOS) {
    const tpl = SEED_TEMPLATES[unit];
    if (!tpl) continue;
    for (const m of tpl) {
      acc.push({
        id: uid(),
        classRealId: cls, subject: subj, unitId: unit,
        kind: m.kind, title: m.title, meta: m.meta, origin: "seed",
      });
    }
  }
  materials = acc;
}
seedOnce();

/* ---------- Read ---------- */
export function getMaterials(): Material[] {
  return materials;
}

export function listMaterialsForClass(classRealId: string, subject: string): Material[] {
  return materials.filter((m) => m.classRealId === classRealId && m.subject === subject);
}

export function listMaterialsForUnit(
  classRealId: string, subject: string, unitId: string,
): Material[] {
  return materials.filter(
    (m) => m.classRealId === classRealId && m.subject === subject && m.unitId === unitId,
  );
}

/* ---------- Write ---------- */
export function addMaterial(m: Omit<Material, "id">): Material {
  const next: Material = { ...m, id: uid() };
  materials = [...materials, next];
  emit();
  return next;
}

export function removeMaterial(id: string) {
  const before = materials.length;
  materials = materials.filter((m) => m.id !== id);
  if (materials.length !== before) emit();
}

/* ---------- Subscribe / hook ---------- */
export function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useMaterials(): Material[] {
  return useSyncExternalStore(
    (l) => subscribe(l),
    () => materials,
    () => materials,
  );
}
