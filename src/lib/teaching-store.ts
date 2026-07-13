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
  /** Hạn nộp (chỉ áp dụng cho bài tập/kiểm tra). ISO datetime string, ví dụ "2026-05-28T20:00". */
  deadline?: string;
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
// Seed theo cây kiến thức Toán Lớp 4
const SEED_TEMPLATES: Record<string, { kind: MaterialKind; title: string; meta?: string }[]> = {
  "u3-khainiem": [
    { kind: "syllabus", title: "Tổng quan kiến thức phân số",    meta: "1 trang" },
    { kind: "slide",    title: "Slide bài giảng – Khái niệm phân số", meta: "24 slide" },
    { kind: "doc",      title: "Tài liệu: Phân số và ý nghĩa",   meta: "8 trang" },
    { kind: "exercise", title: "Phiếu luyện tập phân số",        meta: "12 câu" },
  ],
  "u3-quydong": [
    { kind: "slide",    title: "Slide – Quy đồng mẫu số",        meta: "18 slide" },
    { kind: "exercise", title: "Bài tập quy đồng mẫu số",        meta: "10 câu" },
  ],
  "u1-sotunhien": [
    { kind: "slide",    title: "Slide ôn tập số tự nhiên",       meta: "20 slide" },
    { kind: "exercise", title: "Phiếu bài tập số có nhiều chữ số", meta: "12 câu" },
    { kind: "video",    title: "Video: Hàng và lớp",             meta: "12:35" },
  ],
  "u1-lamtron": [
    { kind: "slide",    title: "Slide – Làm tròn số tự nhiên",   meta: "12 slide" },
  ],
  "u2-trungbinh": [
    { kind: "doc",      title: "Tài liệu: Tìm số trung bình cộng", meta: "6 trang" },
    { kind: "exercise", title: "Bài tập trung bình cộng",        meta: "10 câu" },
  ],
};

// (classReal, subject, unitId) combos – khớp với seed lessons trong index.tsx schedule.
const SEED_COMBOS: Array<[string, string, string]> = [
  ["3A", "Toán", "u3-khainiem"], ["3B", "Toán", "u3-khainiem"],
  ["3C", "Toán", "u3-khainiem"], ["3D", "Toán", "u3-khainiem"],
  ["4A", "Toán", "u1-sotunhien"], ["4B", "Toán", "u1-sotunhien"], ["4C", "Toán", "u1-sotunhien"],
  ["3A", "Toán", "u3-quydong"], ["3B", "Toán", "u3-quydong"], ["3C", "Toán", "u3-quydong"],
  ["4A", "Toán", "u1-lamtron"], ["4B", "Toán", "u1-lamtron"],
  ["4A", "Toán", "u2-trungbinh"],
  // Tiếng Việt seed cho lớp 4A để trang chi tiết có nội dung.
  ["4A", "Tiếng Việt", "u3-khainiem"],
];

// Học liệu độc lập (không thuộc bài giảng nào) — ngang hàng với bài giảng trong course
const MISC_TEMPLATES: Array<{ kind: MaterialKind; title: string; meta?: string }> = [
  { kind: "doc",      title: "Nội quy lớp học và hướng dẫn sử dụng",  meta: "2 trang" },
  { kind: "video",    title: "Video giới thiệu khóa học",             meta: "03:20" },
  { kind: "exercise", title: "Bài khảo sát đầu năm",                  meta: "10 câu" },
];
const MISC_CLASSES: Array<[string, string]> = [
  ["4A", "Toán"], ["4A", "Tiếng Việt"],
  ["3A", "Toán"], ["3B", "Toán"], ["3C", "Toán"], ["3D", "Toán"],
  ["4B", "Toán"], ["4C", "Toán"],
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
  for (const [cls, subj] of MISC_CLASSES) {
    for (const m of MISC_TEMPLATES) {
      acc.push({
        id: uid(),
        classRealId: cls, subject: subj, unitId: "_misc",
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

export function updateMaterial(id: string, patch: Partial<Omit<Material, "id">>) {
  let changed = false;
  materials = materials.map((m) => {
    if (m.id !== id) return m;
    changed = true;
    return { ...m, ...patch };
  });
  if (changed) emit();
}

export function moveMaterials(ids: string[], target: { classRealId: string; subject: string; unitId: string }) {
  const set = new Set(ids);
  let changed = false;
  materials = materials.map((m) => {
    if (!set.has(m.id)) return m;
    changed = true;
    return { ...m, ...target };
  });
  if (changed) emit();
}

export function copyMaterials(ids: string[], target: { classRealId: string; subject: string; unitId: string }) {
  const clones: Material[] = [];
  materials.forEach((m) => {
    if (ids.includes(m.id)) {
      clones.push({ ...m, ...target, id: uid(), origin: "class" });
    }
  });
  if (clones.length) {
    materials = [...materials, ...clones];
    emit();
  }
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
