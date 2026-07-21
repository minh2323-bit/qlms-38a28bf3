import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Check, ChevronDown, ChevronUp, Video, FileText, ClipboardList,
  BookOpen, Presentation, PlayCircle, Gamepad2, Heart, FileType,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AnnouncementSection } from "@/components/AnnouncementSection";
import { toast } from "sonner";

export const Route = createFileRoute("/hoc-sinh/bai-giang/$lessonSlug")({
  head: () => ({ meta: [{ title: "Chi tiết bài giảng – Học sinh" }] }),
  component: LessonDetailPage,
});

type LessonInfo = { title: string; subject: string; khoi: string; author: string; description: string };

const DEFAULT_DESC =
  "Bài giảng này giúp em nắm vững kiến thức nền tảng, luyện tập qua các dạng bài phong phú và tự đánh giá năng lực qua bài kiểm tra ngắn. Em hãy hoàn thành đầy đủ các học liệu để đạt kết quả tốt nhất nhé!";

const LESSONS_MAP: Record<string, LessonInfo> = {
  "hoc-ve-phan-so": { title: "Học về phân số", subject: "Toán", khoi: "Lớp 4", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
  "so-thap-phan-va-phep-so-sanh": { title: "Số thập phân và phép so sánh", subject: "Toán", khoi: "Lớp 4", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
  "hinh-hoc-truc-quan": { title: "Hình học trực quan", subject: "Toán", khoi: "Lớp 4", author: "Nguyễn Văn A", description: DEFAULT_DESC },
  "do-luong-va-don-vi-do": { title: "Đo lường và đơn vị đo", subject: "Toán", khoi: "Lớp 4", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
  "ti-so-phan-tram": { title: "Tỉ số phần trăm", subject: "Toán", khoi: "Lớp 4", author: "Trần Minh Khôi", description: DEFAULT_DESC },
  "so-tu-nhien-va-phep-tinh": { title: "Số tự nhiên và phép tính", subject: "Toán", khoi: "Lớp 4", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
};

type Kind = "video" | "slide" | "doc" | "pdf" | "exercise" | "game";
type Item = { id: string; title: string; kind: Kind; topic: string };

function buildItems(title: string): Item[] {
  const topics: Array<{ name: string; items: Array<{ t: string; k: Kind }> }> = [
    { name: "Tìm hiểu", items: [
      { t: `Tìm hiểu về ${title.toLowerCase()}`, k: "video" },
      { t: `Bài giảng dẫn nhập – ${title}`, k: "slide" },
    ]},
    { name: "Hình thành kiến thức", items: [
      { t: `Bài giảng chính – ${title}`, k: "slide" },
      { t: `Tài liệu lý thuyết – ${title}`, k: "pdf" },
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
  topics.forEach((tp) => tp.items.forEach((it, i) => flat.push({ id: `${tp.name}-${i}`, title: it.t, kind: it.k, topic: tp.name })));
  return flat;
}

const ICONS: Record<Kind, { Icon: typeof Video; cls: string; label: string }> = {
  video:    { Icon: Video,         cls: "bg-rose-50 text-rose-600",     label: "Video" },
  slide:    { Icon: Presentation,  cls: "bg-indigo-50 text-indigo-600", label: "Slide" },
  doc:      { Icon: FileText,      cls: "bg-sky-50 text-sky-600",       label: "Tài liệu" },
  pdf:      { Icon: FileType,      cls: "bg-red-50 text-red-600",       label: "PDF" },
  exercise: { Icon: ClipboardList, cls: "bg-amber-50 text-amber-600",   label: "Bài tập" },
  game:     { Icon: Gamepad2,      cls: "bg-violet-50 text-violet-600", label: "Trò chơi" },
};

function LessonDetailPage() {
  const { lessonSlug } = Route.useParams();
  const navigate = useNavigate();
  const info = LESSONS_MAP[lessonSlug] ?? { title: decodeURIComponent(lessonSlug), subject: "Toán", khoi: "Lớp 4", author: "Giáo viên", description: DEFAULT_DESC };
  const items = useMemo(() => buildItems(info.title), [info.title]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [currentId, setCurrentId] = useState<string>(items[0]?.id ?? "");
  const [liked, setLiked] = useState(false);
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    Array.from(new Set(items.map((i) => i.topic))).forEach((t, i) => (o[t] = i === 0));
    return o;
  });

  const current = items.find((i) => i.id === currentId) ?? items[0];
  const currentIndex = items.findIndex((i) => i.id === current.id);
  const doneCount = completed.size;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const topicsGrouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    items.forEach((it) => { if (!map.has(it.topic)) map.set(it.topic, []); map.get(it.topic)!.push(it); });
    return Array.from(map.entries());
  }, [items]);

  const handleFinish = () => {
    setCompleted((s) => new Set(s).add(current.id));
    toast.success("Đã đánh dấu hoàn thành");
    const next = items[currentIndex + 1];
    if (next) setCurrentId(next.id);
  };

  const toggleLike = () => {
    setLiked((v) => {
      const nv = !v;
      toast.success(nv ? "Đã lưu vào Học liệu đã thích" : "Đã bỏ khỏi Học liệu đã thích");
      return nv;
    });
  };

  return (
    <AppShell role="student">
      <div className="mb-4">
        <button
          onClick={() => navigate({ to: "/hoc-sinh/lop-bai-giang" })}
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
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLike}
                title={liked ? "Bỏ khỏi Học liệu đã thích" : "Lưu vào Học liệu đã thích"}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border transition ${
                  liked
                    ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                }`}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
                {liked ? "Đã thích" : "Thả tim"}
              </button>
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow"
              >
                <Check className="h-4 w-4" /> Hoàn thành
              </button>
            </div>
          </div>

          <h1 className="mt-3 text-xl md:text-2xl font-bold text-slate-800">{current.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{current.topic} · {ICONS[current.kind].label}</p>

          <div className="mt-5 aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-black">
            {current.kind === "video" ? (
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title={current.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-600 gap-3">
                {(() => { const I = ICONS[current.kind].Icon; return <I className="h-14 w-14 text-indigo-500" />; })()}
                <div className="text-sm font-medium">{ICONS[current.kind].label} — {current.title}</div>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Mô tả bài giảng</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{info.description}</p>
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
                <span className="bg-white/20 px-2 py-1 rounded-md font-semibold">{items.length} học liệu</span>
                <span className="ml-auto font-bold text-lg">{pct}%</span>
              </div>
              <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-300 to-rose-400 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 text-xs opacity-90">{doneCount}/{items.length} hoàn thành</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <span className="font-bold text-slate-800 text-sm">Danh sách chủ đề</span>
            </div>
            <div className="divide-y">
              {topicsGrouped.map(([topic, list]) => {
                const isOpen = openTopics[topic] ?? false;
                const topicDone = list.filter((l) => completed.has(l.id)).length;
                return (
                  <div key={topic}>
                    <button
                      onClick={() => setOpenTopics((p) => ({ ...p, [topic]: !isOpen }))}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50"
                    >
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">{topic}</div>
                        <div className="text-xs text-slate-500">{topicDone}/{list.length} hoàn thành</div>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </button>
                    {isOpen && (
                      <ol className="py-2 bg-slate-50/40">
                        {list.map((s) => {
                          const active = s.id === current.id;
                          const done = completed.has(s.id);
                          const { Icon, cls, label } = ICONS[s.kind];
                          return (
                            <li key={s.id}>
                              <button
                                onClick={() => setCurrentId(s.id)}
                                className={`w-full flex items-center gap-3 pl-3 pr-2 py-2 transition text-left ${
                                  active ? "bg-indigo-50" : "hover:bg-white"
                                }`}
                              >
                                <span className="relative shrink-0">
                                  <span className={`h-9 w-9 rounded-full inline-flex items-center justify-center border-4 ${
                                    active ? "bg-white border-indigo-200 ring-2 ring-indigo-400"
                                    : done ? "bg-white border-emerald-100" : "bg-white border-rose-100"
                                  }`}>
                                    <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center ${done ? "bg-emerald-50 text-emerald-600" : cls}`}>
                                      <Icon className="h-3.5 w-3.5" />
                                    </span>
                                  </span>
                                  {done && (
                                    <span className="absolute -right-0.5 -bottom-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white inline-flex items-center justify-center">
                                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                                    </span>
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className={`text-sm font-semibold truncate ${active ? "text-indigo-700" : "text-slate-800"}`}>{s.title}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <PlayCircle className="h-3 w-3 text-indigo-500" />{label}
                                  </div>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <AnnouncementSection classRealId="4A" subject={info.subject} teacherName={info.author} />
    </AppShell>
  );
}
