import { useSyncExternalStore } from "react";

export type Comment = {
  id: string;
  author: string;
  role: "teacher" | "student";
  content: string;
  createdAt: number;
};

export type Announcement = {
  id: string;
  classRealId: string;
  subject: string;
  audience: string; // "Tất cả học viên" hoặc "Nhóm 3-ICT…"
  author: string;
  content: string;
  createdAt: number;
  comments: Comment[];
};

type Listener = () => void;
let items: Announcement[] = [];
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- Seed ---------- */
function seed() {
  if (items.length) return;
  const now = Date.now();
  items = [
    {
      id: uid(),
      classRealId: "4A", subject: "Toán",
      audience: "Tất cả học viên",
      author: "Cô Nguyễn Thị Hoa",
      content: "Chào các con! Tuần này lớp mình sẽ ôn tập phép cộng và phép trừ trong phạm vi 100 000. Các con xem trước bài giảng nhé.",
      createdAt: now - 1000 * 60 * 60 * 26,
      comments: [
        {
          id: uid(), author: "Học sinh Nguyễn An", role: "student",
          content: "Dạ con đã xem ạ. Cô ơi bài 3 trang 12 con chưa hiểu cách quy đồng ạ.",
          createdAt: now - 1000 * 60 * 60 * 20,
        },
        {
          id: uid(), author: "Cô Nguyễn Thị Hoa", role: "teacher",
          content: "Cô sẽ chữa lại bài đó trong buổi học sáng mai con nhé.",
          createdAt: now - 1000 * 60 * 60 * 18,
        },
      ],
    },
  ];
}
seed();

/* ---------- API ---------- */
export function listAnnouncements(classRealId: string, subject: string) {
  return items
    .filter((a) => a.classRealId === classRealId && a.subject === subject)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addAnnouncement(input: Omit<Announcement, "id" | "createdAt" | "comments">) {
  const next: Announcement = { ...input, id: uid(), createdAt: Date.now(), comments: [] };
  items = [next, ...items];
  emit();
  return next;
}

export function addComment(annId: string, c: Omit<Comment, "id" | "createdAt">) {
  items = items.map((a) =>
    a.id === annId
      ? { ...a, comments: [...a.comments, { ...c, id: uid(), createdAt: Date.now() }] }
      : a,
  );
  emit();
}

export function removeAnnouncement(id: string) {
  items = items.filter((a) => a.id !== id);
  emit();
}

export function useAnnouncements(classRealId: string, subject: string): Announcement[] {
  const all = useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => items,
    () => items,
  );
  return all
    .filter((a) => a.classRealId === classRealId && a.subject === subject)
    .sort((a, b) => b.createdAt - a.createdAt);
}

