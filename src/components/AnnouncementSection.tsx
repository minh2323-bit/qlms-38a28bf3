import { useState } from "react";
import {
  Pencil, X, Users, ChevronDown, Bold, Italic, Underline as UnderlineIcon,
  List, Eraser, Paperclip, Youtube, Link2, Upload, MessageCircle, Send, Trash2, Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAnnouncements, addAnnouncement, addComment, removeAnnouncement,
  type Announcement,
} from "@/lib/announcement-store";

type Props = {
  classRealId: string;
  subject: string;
  teacherName: string;
};

const STUDENTS_IN_CLASS = [
  "Lê Bảo An", "Ngô Bảo An", "Phạm Phương Mỹ An", "Phạm Vũ Bình An",
  "Nguyễn Thị Hà Anh", "Phạm Linh Anh", "Trịnh Đức Thiên Ân", "Ngô Bảo Bình",
  "Trần Khánh Chi", "Lê Minh Đức",
];

function fmtTime(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function AnnouncementSection({ classRealId, subject, teacherName }: Props) {
  const items = useAnnouncements(classRealId, subject);
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <section className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 inline-flex items-center justify-center">
            <Megaphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Thông báo & Thảo luận</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {items.length} thông báo — học sinh có thể bình luận và trao đổi với giáo viên
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
        >
          <Pencil className="h-4 w-4" /> Thông báo mới
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            Chưa có thông báo nào. Bấm <b className="text-sky-700">Thông báo mới</b> để bắt đầu.
          </div>
        )}
        {items.map((a) => (
          <AnnouncementCard key={a.id} item={a} teacherName={teacherName} />
        ))}
      </div>

      {openCreate && (
        <CreateAnnouncementModal
          teacherName={teacherName}
          onClose={() => setOpenCreate(false)}
          onSubmit={(data) => {
            addAnnouncement({
              classRealId, subject,
              audience: data.audience, content: data.content, author: teacherName,
            });
            setOpenCreate(false);
            toast.success("Đã đăng thông báo");
          }}
        />
      )}
    </section>
  );
}

/* ============================ Card ============================ */

function AnnouncementCard({ item, teacherName }: { item: Announcement; teacherName: string }) {
  const [showAll, setShowAll] = useState(false);
  const [draft, setDraft] = useState("");
  const visible = showAll ? item.comments : item.comments.slice(-2);

  const submit = (role: "teacher" | "student") => {
    if (!draft.trim()) return;
    addComment(item.id, {
      author: role === "teacher" ? teacherName : "Học sinh demo",
      role,
      content: draft.trim(),
    });
    setDraft("");
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <header className="px-4 py-3 flex items-start justify-between gap-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <span className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center font-bold text-sm">
            {item.author.split(" ").slice(-1)[0]?.[0] ?? "T"}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.author}</p>
            <p className="text-xs text-slate-500">
              {fmtTime(item.createdAt)} · gửi tới <b className="text-slate-700">{item.audience}</b>
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm("Xóa thông báo này?")) {
              removeAnnouncement(item.id);
              toast.success("Đã xóa thông báo");
            }
          }}
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          title="Xóa thông báo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </header>

      <div className="px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
        {item.content}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <MessageCircle className="h-3.5 w-3.5" />
          {item.comments.length} phản hồi
          {item.comments.length > 2 && (
            <button onClick={() => setShowAll((v) => !v)} className="ml-auto text-indigo-600 font-semibold hover:underline">
              {showAll ? "Thu gọn" : `Xem tất cả ${item.comments.length} phản hồi`}
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {visible.map((c) => (
            <li key={c.id} className="flex items-start gap-2">
              <span className={`h-7 w-7 rounded-full inline-flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                c.role === "teacher" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
              }`}>
                {c.author.split(" ").slice(-1)[0]?.[0] ?? "?"}
              </span>
              <div className="flex-1 rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold text-slate-700">
                  {c.author}
                  {c.role === "teacher" && (
                    <span className="ml-1.5 text-[10px] uppercase font-bold text-emerald-700">GV</span>
                  )}
                  <span className="ml-2 font-normal text-slate-400">{fmtTime(c.createdAt)}</span>
                </p>
                <p className="text-sm text-slate-700 mt-0.5">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit("teacher"); }}
            placeholder="Viết phản hồi với tư cách giáo viên…"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button
            onClick={() => submit("student")}
            title="Gửi (giả lập học sinh)"
            className="px-2.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            HS
          </button>
          <button
            onClick={() => submit("teacher")}
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Gửi
          </button>
        </div>
      </div>
    </article>
  );
}

/* ============================ Modal ============================ */

function CreateAnnouncementModal({
  teacherName, onClose, onSubmit,
}: {
  teacherName: string;
  onClose: () => void;
  onSubmit: (data: { audience: string; content: string }) => void;
}) {
  const [audienceMode, setAudienceMode] = useState<"all" | "custom">("all");
  const [pickedStudents, setPickedStudents] = useState<Set<string>>(new Set());
  const [allowReply, setAllowReply] = useState<"allow" | "deny">("allow");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [content, setContent] = useState("");

  const audienceLabel = audienceMode === "all"
    ? "Tất cả học sinh"
    : `${pickedStudents.size} học sinh được chọn`;

  const canSubmit = content.trim().length > 0 && (audienceMode === "all" || pickedStudents.size > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tạo thông báo mới</h2>
            <p className="text-xs text-slate-500 mt-0.5">Người gửi: <b>{teacherName}</b></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {/* Audience selector */}
          <div className="flex items-start gap-2 flex-wrap bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200">
            <div className="relative">
              <select
                value={audienceMode}
                onChange={(e) => { setAudienceMode(e.target.value as "all" | "custom"); setPickerOpen(false); }}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="all">Tất cả học sinh</option>
                <option value="custom">Chọn đối tượng riêng</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {audienceMode === "custom" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md border border-sky-300 bg-white text-sky-700 hover:bg-sky-50"
                >
                  <Users className="h-4 w-4" /> {audienceLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {pickerOpen && (
                  <div className="absolute z-10 mt-1.5 w-72 rounded-lg border border-slate-200 bg-white shadow-lg p-2 max-h-72 overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-500 px-2 py-1">Danh sách học sinh trong lớp</div>
                    <ul className="space-y-0.5">
                      {STUDENTS_IN_CLASS.map((name) => {
                        const checked = pickedStudents.has(name);
                        return (
                          <li key={name}>
                            <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setPickedStudents((s) => {
                                    const n = new Set(s);
                                    if (n.has(name)) n.delete(name); else n.add(name);
                                    return n;
                                  });
                                }}
                              />
                              <span className="text-slate-700">{name}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex justify-end pt-2 border-t mt-2">
                      <button
                        type="button"
                        onClick={() => setPickerOpen(false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative ml-auto">
              <select
                value={allowReply}
                onChange={(e) => setAllowReply(e.target.value as "allow" | "deny")}
                className="appearance-none pl-3 pr-8 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="allow">Cho phép học sinh phản hồi</option>
                <option value="deny">Không cho phép phản hồi</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>


          {/* Editor */}
          <div className="border border-indigo-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-200">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Thông báo nội dung nào đó cho lớp học của bạn"
              className="w-full px-4 py-3 text-sm text-slate-700 placeholder:text-indigo-300 focus:outline-none resize-none"
            />
            <div className="flex items-center gap-1 px-3 py-2 border-t border-slate-200 bg-slate-50 text-slate-500">
              <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Đậm"><Bold className="h-4 w-4" /></button>
              <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Nghiêng"><Italic className="h-4 w-4" /></button>
              <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Gạch chân"><UnderlineIcon className="h-4 w-4" /></button>
              <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Danh sách"><List className="h-4 w-4" /></button>
              <button type="button" className="p-1.5 rounded hover:bg-slate-200" title="Xóa định dạng"><Eraser className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Attachment icons */}
          <div className="flex items-center gap-3 text-slate-500">
            <button type="button" className="h-9 w-9 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center" title="Đính kèm học liệu">
              <Paperclip className="h-4 w-4" />
            </button>
            <button type="button" className="h-9 w-9 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center" title="Đính kèm video">
              <Youtube className="h-4 w-4" />
            </button>
            <button type="button" className="h-9 w-9 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center" title="Tải tệp">
              <Upload className="h-4 w-4" />
            </button>
            <button type="button" className="h-9 w-9 rounded-full border border-slate-200 hover:bg-slate-50 inline-flex items-center justify-center" title="Liên kết">
              <Link2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:underline"
          >
            Huỷ
          </button>
          <button
            onClick={() => canSubmit && onSubmit({ audience: audienceLabel, content: content.trim() })}
            disabled={!canSubmit}
            className={`px-5 py-2 text-sm font-semibold rounded-lg inline-flex items-center gap-1.5 ${
              canSubmit ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Đăng
          </button>
        </div>
      </div>
    </div>
  );
}
