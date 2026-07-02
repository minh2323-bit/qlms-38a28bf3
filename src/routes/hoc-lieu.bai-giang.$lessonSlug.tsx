import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Check, Lock, ChevronDown, Video, FileText, ClipboardList,
  BookOpen, Presentation, PlayCircle, Gamepad2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/hoc-lieu/bai-giang/$lessonSlug")({
  head: () => ({ meta: [{ title: "Chi tiết bài giảng – LMS" }] }),
  component: LessonDetailPage,
});

type LessonInfo = { title: string; subject: string; khoi: string; author: string };

const LESSONS_MAP: Record<string, LessonInfo> = {
  "hoc-ve-phan-so": { title: "Học về phân số", subject: "Toán", khoi: "Lớp 3", author: "Phùng Thúy Hằng" },
  "so-thap-phan-va-phep-so-sanh": { title: "Số thập phân và phép so sánh", subject: "Toán", khoi: "Lớp 3", author: "Phùng Thúy Hằng" },
  "hinh-hoc-truc-quan": { title: "Hình học trực quan", subject: "Toán", khoi: "Lớp 3", author: "Hanoi Study (Nguyễn Văn A)" },
  "do-luong-va-don-vi-do": { title: "Đo lường và đơn vị đo", subject: "Toán", khoi: "Lớp 4", author: "Phùng Thúy Hằng" },
  "ti-so-phan-tram": { title: "Tỉ số phần trăm", subject: "Toán", khoi: "Lớp 4", author: "Trần Minh Khôi" },
  "so-tu-nhien-va-phep-tinh": { title: "Số tự nhiên và phép tính", subject: "Toán", khoi: "Lớp 3", author: "Phùng Thúy Hằng" },
  "lam-tron-so-thap-phan": { title: "Làm tròn số thập phân", subject: "Toán", khoi: "Lớp 4", author: "Phùng Thúy Hằng" },
  "cac-phep-tinh-voi-phan-so": { title: "Các phép tính với phân số", subject: "Toán", khoi: "Lớp 3", author: "Lê Thị Hoa" },
};

type Kind = "video" | "slide" | "doc" | "exercise" | "game";
type Item = { id: string; title: string; kind: Kind; topic: string };

function buildItems(title: string): Item[] {
  const topics: Array<{ name: string; items: Array<{ t: string; k: Kind }> }> = [
    { name: "Khởi động", items: [
      { t: `Video mở đầu – ${title}`, k: "video" },
      { t: `Slide dẫn nhập – ${title}`, k: "slide" },
    ]},
    { name: "Hình thành kiến thức", items: [
      { t: `Bài giảng chính – ${title}`, k: "slide" },
      { t: `Tài liệu lý thuyết – ${title}`, k: "doc" },
      { t: `Video minh họa – ${title}`, k: "video" },
    ]},
    { name: "Luyện tập", items: [
      { t: `Phiếu bài tập – ${title}`, k: "exercise" },
      { t: `Trò chơi tương tác – ${title}`, k: "game" },
    ]},
    { name: "Đánh giá", items: [
      { t: `Bài kiểm tra 15 phút – ${title}`, k: "exercise" },
    ]},
  ];
  const flat: Item[] = [];
  topics.forEach((tp) => {
    tp.items.forEach((it, i) => {
      flat.push({ id: `${tp.name}-${i}`, title: it.t, kind: it.k, topic: tp.name });
    });
  });
  return flat;
}

const ICONS: Record<Kind, { Icon: typeof Video; cls: string; label: string }> = {
  video:    { Icon: Video,         cls: "bg-rose-50 text-rose-600",    label: "Video" },
  slide:    { Icon: Presentation,  cls: "bg-indigo-50 text-indigo-600", label: "Slide" },
  doc:      { Icon: FileText,      cls: "bg-sky-50 text-sky-600",       label: "Tài liệu" },
  exercise: { Icon: ClipboardList, cls: "bg-amber-50 text-amber-600",   label: "Bài tập" },
  game:     { Icon: Gamepad2,      cls: "bg-violet-50 text-violet-600", label: "Trò chơi" },
};

function LessonDetailPage() {
  const { lessonSlug } = Route.useParams();
  const navigate = useNavigate();
  const info = LESSONS_MAP[lessonSlug] ?? { title: decodeURIComponent(lessonSlug), subject: "Toán", khoi: "Lớp 4", author: "Giáo viên" };
  const items = useMemo(() => buildItems(info.title), [info.title]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [currentId, setCurrentId] = useState<string>(items[0]?.id ?? "");

  const current = items.find((i) => i.id === currentId) ?? items[0];
  const currentIndex = items.findIndex((i) => i.id === current.id);
  const doneCount = completed.size;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const handleFinish = () => {
    setCompleted((s) => new Set(s).add(current.id));
    toast.success("Đã đánh dấu hoàn thành");
    const next = items[currentIndex + 1];
    if (next) setCurrentId(next.id);
  };

  return (
    <AppShell>
      <div className="mb-4">
        <button
          onClick={() => navigate({ to: "/hoc-lieu/bai-giang" })}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách bài giảng
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-slate-500">
              {info.khoi} · {info.subject} · Tác giả: {info.author}
            </div>
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow"
            >
              <Check className="h-4 w-4" /> Hoàn thành
            </button>
          </div>

          <h1 className="mt-3 text-xl md:text-2xl font-bold text-slate-800">
            {current.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {current.topic} · {ICONS[current.kind].label}
          </p>

          <div className="mt-5">
            <Viewer item={current} />
          </div>
        </section>

        <aside className="space-y-4">
          <div
            className="rounded-2xl overflow-hidden border border-indigo-200 shadow-sm text-white"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)" }}
          >
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-xl bg-white/20 inline-flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs uppercase font-semibold opacity-80">Bài giảng</div>
                  <div className="font-bold truncate">{info.title}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="bg-white/20 px-2 py-1 rounded-md font-semibold">
                  {items.length} học liệu
                </span>
                <span className="ml-auto font-bold text-lg">{pct}%</span>
              </div>
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-300 to-rose-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-2 text-xs opacity-90">
                {doneCount}/{items.length} hoàn thành
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <ChevronDown className="h-4 w-4 text-slate-500" />
              <span className="font-bold text-slate-800 text-sm">Danh sách học liệu</span>
            </div>
            <ol className="relative py-3">
              <span aria-hidden className="absolute left-[34px] top-4 bottom-4 w-px bg-slate-200" />
              {items.map((s, i) => {
                const active = s.id === current.id;
                const done = completed.has(s.id);
                const locked = !done && !active && i > 0 && !completed.has(items[i - 1].id);
                const { Icon, cls, label } = ICONS[s.kind];
                return (
                  <li key={s.id} className="relative">
                    <button
                      onClick={() => setCurrentId(s.id)}
                      className={`w-full group flex items-center gap-3 pl-3 pr-4 py-2 transition text-left ${
                        active ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="relative shrink-0">
                        <span className={`h-11 w-11 rounded-full inline-flex items-center justify-center border-4 ${
                          active
                            ? "bg-white border-indigo-200 ring-2 ring-indigo-400"
                            : done
                              ? "bg-white border-emerald-100"
                              : locked
                                ? "bg-slate-50 border-slate-100"
                                : "bg-white border-rose-100"
                        }`}>
                          <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center ${
                            done ? "bg-emerald-50 text-emerald-600" : locked ? "bg-slate-100 text-slate-400" : cls
                          }`}>
                            <Icon className="h-4 w-4" />
                          </span>
                        </span>
                        {done && (
                          <span className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white inline-flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-semibold truncate ${active ? "text-indigo-700" : "text-slate-800"}`}>
                          {s.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <PlayCircle className="h-3 w-3 text-indigo-500" />
                          {s.topic} · {label}
                        </div>
                      </div>
                      {locked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>
      </div>
      <div className="sr-only">
        <Link to="/hoc-lieu/bai-giang">Bài giảng</Link>
      </div>
    </AppShell>
  );
}

function Viewer({ item }: { item: Item }) {
  if (item.kind === "video") {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video">
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title={item.title}
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }
  if (item.kind === "exercise") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="font-bold text-slate-800 mb-3">Bài tập</h3>
        <ol className="space-y-3 list-decimal ml-5 text-sm text-slate-700">
          <li>Tính: 245 + 137 = ?</li>
          <li>Số nào sau đây lớn hơn: 4.235 hay 4.253?</li>
          <li>Chọn phân số bằng 1/2: 2/4, 3/5, 5/8.</li>
        </ol>
      </div>
    );
  }
  const { Icon, label } = ICONS[item.kind];
  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-10 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="font-bold text-slate-800">{item.title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
        Nội dung {label.toLowerCase()} sẽ hiển thị tại đây.
      </p>
      <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
        Mở nội dung
      </button>
    </div>
  );
}
