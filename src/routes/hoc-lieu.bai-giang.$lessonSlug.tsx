import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Check, Lock, ChevronDown, ChevronUp, Video, FileText, ClipboardList,
  BookOpen, Presentation, PlayCircle, Gamepad2, MoreVertical, Download, Lock as LockIcon,
  Heart, Reply, Send, MessageCircle, FileType,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/hoc-lieu/bai-giang/$lessonSlug")({
  head: () => ({ meta: [{ title: "Chi tiết bài giảng – LMS" }] }),
  component: LessonDetailPage,
});

type LessonInfo = { title: string; subject: string; khoi: string; author: string; description: string };

const DEFAULT_DESC =
  "Bài giảng này giúp học sinh nắm vững kiến thức nền tảng, luyện tập qua các dạng bài phong phú và tự đánh giá năng lực qua bài kiểm tra ngắn. Giáo viên có thể theo dõi tiến độ của học sinh theo từng học liệu, khuyến khích các em hoàn thành đầy đủ để đạt kết quả tốt nhất.";

const LESSONS_MAP: Record<string, LessonInfo> = {
  "hoc-ve-phan-so": { title: "Học về phân số", subject: "Toán", khoi: "Lớp 3", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
  "so-thap-phan-va-phep-so-sanh": { title: "Số thập phân và phép so sánh", subject: "Toán", khoi: "Lớp 3", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
  "hinh-hoc-truc-quan": { title: "Hình học trực quan", subject: "Toán", khoi: "Lớp 3", author: "Hanoi Study (Nguyễn Văn A)", description: DEFAULT_DESC },
  "do-luong-va-don-vi-do": { title: "Đo lường và đơn vị đo", subject: "Toán", khoi: "Lớp 4", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
  "ti-so-phan-tram": { title: "Tỉ số phần trăm", subject: "Toán", khoi: "Lớp 4", author: "Trần Minh Khôi", description: DEFAULT_DESC },
  "so-tu-nhien-va-phep-tinh": { title: "Số tự nhiên và phép tính", subject: "Toán", khoi: "Lớp 3", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
  "lam-tron-so-thap-phan": { title: "Làm tròn số thập phân", subject: "Toán", khoi: "Lớp 4", author: "Phùng Thúy Hằng", description: DEFAULT_DESC },
  "cac-phep-tinh-voi-phan-so": { title: "Các phép tính với phân số", subject: "Toán", khoi: "Lớp 3", author: "Lê Thị Hoa", description: DEFAULT_DESC },
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
  pdf:      { Icon: FileType,      cls: "bg-red-50 text-red-600",       label: "PDF" },
  exercise: { Icon: ClipboardList, cls: "bg-amber-50 text-amber-600",   label: "Bài tập" },
  game:     { Icon: Gamepad2,      cls: "bg-violet-50 text-violet-600", label: "Trò chơi" },
};

type CommentT = {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  replies: CommentT[];
};

function LessonDetailPage() {
  const { lessonSlug } = Route.useParams();
  const navigate = useNavigate();
  const info = LESSONS_MAP[lessonSlug] ?? { title: decodeURIComponent(lessonSlug), subject: "Toán", khoi: "Lớp 4", author: "Giáo viên", description: DEFAULT_DESC };
  const items = useMemo(() => buildItems(info.title), [info.title]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [currentId, setCurrentId] = useState<string>(items[0]?.id ?? "");
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
    items.forEach((it) => {
      if (!map.has(it.topic)) map.set(it.topic, []);
      map.get(it.topic)!.push(it);
    });
    return Array.from(map.entries());
  }, [items]);

  const handleFinish = () => {
    setCompleted((s) => new Set(s).add(current.id));
    toast.success("Đã đánh dấu hoàn thành");
    const next = items[currentIndex + 1];
    if (next) setCurrentId(next.id);
  };

  const toggleLock = (id: string) => {
    setLocked((s) => {
      const n = new Set(s);
      if (n.has(id)) { n.delete(id); toast.success("Đã mở khóa học liệu"); }
      else { n.add(id); toast.success("Đã khóa học liệu"); }
      return n;
    });
  };

  const handleDownload = (title: string) => toast.success(`Đang tải: ${title}`);

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

          {/* Mô tả bài giảng tổng */}
          <div className="mt-6 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-amber-600" />
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                Mô tả bài giảng
              </h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {info.description}
            </p>
          </div>

          {/* Bình luận */}
          <CommentSection />
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
                      <ol className="relative py-2 bg-slate-50/40">
                        <span aria-hidden className="absolute left-[34px] top-3 bottom-3 w-px bg-slate-200" />
                        {list.map((s, i) => {
                          const active = s.id === current.id;
                          const done = completed.has(s.id);
                          const isLocked = locked.has(s.id);
                          const chainLocked = !done && !active && i > 0 && !completed.has(list[i - 1].id);
                          const { Icon, cls, label } = ICONS[s.kind];
                          return (
                            <li key={s.id} className="relative group">
                              <button
                                onClick={() => !isLocked && setCurrentId(s.id)}
                                disabled={isLocked}
                                className={`w-full flex items-center gap-3 pl-3 pr-2 py-2 transition text-left ${
                                  active ? "bg-indigo-50" : "hover:bg-white"
                                } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                              >
                                <span className="relative shrink-0">
                                  <span className={`h-10 w-10 rounded-full inline-flex items-center justify-center border-4 ${
                                    active
                                      ? "bg-white border-indigo-200 ring-2 ring-indigo-400"
                                      : done
                                        ? "bg-white border-emerald-100"
                                        : chainLocked || isLocked
                                          ? "bg-slate-50 border-slate-100"
                                          : "bg-white border-rose-100"
                                  }`}>
                                    <span className={`h-7 w-7 rounded-full inline-flex items-center justify-center ${
                                      done ? "bg-emerald-50 text-emerald-600" : (chainLocked || isLocked) ? "bg-slate-100 text-slate-400" : cls
                                    }`}>
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
                                  <div className={`text-sm font-semibold truncate ${active ? "text-indigo-700" : "text-slate-800"}`}>
                                    {s.title}
                                  </div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <PlayCircle className="h-3 w-3 text-indigo-500" />
                                    {label}
                                  </div>
                                </div>
                                {isLocked && <LockIcon className="h-3.5 w-3.5 text-slate-400" />}
                              </button>
                              <ItemMenu
                                isLocked={isLocked}
                                onLock={() => toggleLock(s.id)}
                                onDownload={() => handleDownload(s.title)}
                              />
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
      <div className="sr-only">
        <Link to="/hoc-lieu/bai-giang">Bài giảng</Link>
      </div>
    </AppShell>
  );
}

function ItemMenu({ isLocked, onLock, onDownload }: { isLocked: boolean; onLock: () => void; onDownload: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} className="absolute right-2 top-1/2 -translate-y-1/2">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition"
        aria-label="Tùy chọn"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onLock(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LockIcon className="h-4 w-4" /> {isLocked ? "Mở khóa" : "Khóa"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDownload(); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Tải về
          </button>
        </div>
      )}
    </div>
  );
}

function CommentSection() {
  const [comments, setComments] = useState<CommentT[]>([
    {
      id: "c1", author: "Trần Minh Khôi", avatar: "TK",
      text: "Bài giảng rất trực quan, học sinh dễ nắm bắt kiến thức!",
      time: "2 giờ trước", likes: 3, liked: false,
      replies: [
        { id: "c1r1", author: "Phùng Thúy Hằng", avatar: "PH",
          text: "Cảm ơn thầy, tôi sẽ bổ sung thêm ví dụ minh họa.",
          time: "1 giờ trước", likes: 1, liked: false, replies: [] },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

  const post = () => {
    if (!input.trim()) return;
    setComments((cs) => [
      { id: `c${Date.now()}`, author: "Bạn", avatar: "B", text: input.trim(), time: "vừa xong", likes: 0, liked: false, replies: [] },
      ...cs,
    ]);
    setInput("");
  };

  const postReply = (parentId: string) => {
    if (!replyText.trim()) return;
    setComments((cs) => cs.map((c) => c.id === parentId ? {
      ...c, replies: [...c.replies, {
        id: `r${Date.now()}`, author: "Bạn", avatar: "B", text: replyText.trim(),
        time: "vừa xong", likes: 0, liked: false, replies: [],
      }],
    } : c));
    setReplyText("");
    setReplyTo(null);
  };

  const toggleLike = (parentId: string, replyId?: string) => {
    setComments((cs) => cs.map((c) => {
      if (c.id !== parentId) return c;
      if (!replyId) return { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) };
      return { ...c, replies: c.replies.map((r) => r.id === replyId
        ? { ...r, liked: !r.liked, likes: r.likes + (r.liked ? -1 : 1) } : r) };
    }));
  };

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-4 w-4 text-indigo-600" />
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
          Bình luận ({total})
        </h3>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">B</div>
        <div className="flex-1 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && post()}
            placeholder="Viết bình luận..."
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={post}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-slate-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">{c.author}</span>
                  <span className="text-xs text-slate-400">{c.time}</span>
                </div>
                <p className="text-sm text-slate-700 mt-0.5">{c.text}</p>
              </div>
              <div className="flex items-center gap-4 mt-1 px-2">
                <button
                  onClick={() => toggleLike(c.id)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${c.liked ? "text-rose-600" : "text-slate-500 hover:text-rose-600"}`}
                >
                  <Heart className={`h-3.5 w-3.5 ${c.liked ? "fill-current" : ""}`} /> {c.likes}
                </button>
                <button
                  onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600"
                >
                  <Reply className="h-3.5 w-3.5" /> Trả lời
                </button>
              </div>

              {c.replies.length > 0 && (
                <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-100">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {r.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-50 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-800">{r.author}</span>
                            <span className="text-xs text-slate-400">{r.time}</span>
                          </div>
                          <p className="text-sm text-slate-700 mt-0.5">{r.text}</p>
                        </div>
                        <div className="px-2 mt-1">
                          <button
                            onClick={() => toggleLike(c.id, r.id)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${r.liked ? "text-rose-600" : "text-slate-500 hover:text-rose-600"}`}
                          >
                            <Heart className={`h-3 w-3 ${r.liked ? "fill-current" : ""}`} /> {r.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {replyTo === c.id && (
                <div className="mt-2 flex gap-2 pl-4">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && postReply(c.id)}
                    autoFocus
                    placeholder={`Trả lời ${c.author}...`}
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => postReply(c.id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold"
                  >
                    Gửi
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
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
  if (item.kind === "pdf") {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-white text-xs">
          <div className="flex items-center gap-2">
            <FileType className="h-4 w-4 text-red-400" />
            <span className="font-semibold">{item.title}.pdf</span>
          </div>
          <button className="inline-flex items-center gap-1 hover:text-red-300">
            <Download className="h-3.5 w-3.5" /> Tải về
          </button>
        </div>
        <div className="aspect-[4/5] bg-white flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <FileType className="h-10 w-10" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
            <p className="text-sm text-slate-500 mt-2">
              Trình xem PDF – Xem trực tiếp trong trình duyệt. Nội dung tài liệu sẽ được render tại đây.
            </p>
            <div className="mt-6 space-y-2 text-left text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
              <p><strong>Trang 1/12</strong></p>
              <p>Chương I – Kiến thức nền tảng</p>
              <p>1.1. Khái niệm cơ bản...</p>
              <p>1.2. Ví dụ minh họa...</p>
            </div>
          </div>
        </div>
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
