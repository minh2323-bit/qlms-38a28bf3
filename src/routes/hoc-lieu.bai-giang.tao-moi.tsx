import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Info, ListChecks, Users, Check, ChevronRight, ArrowLeft, X,
  Plus, Trash2, Eye, SquarePen, Upload, Link as LinkIcon,
  FileText, Video, Presentation as PresentationIcon, ClipboardList, Gamepad2,
  ChevronDown, Share2, Globe2, Save,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getKnowledgeTree, getUnitTitle } from "@/lib/knowledge-tree";

const ASSIGN_CLASS_OPTIONS = [
  "Lớp Toán 4A - Cô Hoa",
  "Lớp Toán 4B - Cô Hoa",
  "Lớp Tiếng Việt 4A - Cô Lan",
  "Lớp bổ túc Toán 4",
  "Lớp ôn thi HSG Tiếng Anh",
];

type CreateLessonSearch = { khoi?: string; mon?: string; from?: string; edit?: string; title?: string; unitId?: string };

export const Route = createFileRoute("/hoc-lieu/bai-giang/tao-moi")({
  head: () => ({
    meta: [
      { title: "Tạo bài giảng mới | Tiểu học Tô Hiệu" },
      { name: "description", content: "Tạo bài giảng mới theo 3 bước." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): CreateLessonSearch => ({
    khoi: typeof s.khoi === "string" ? s.khoi : undefined,
    mon: typeof s.mon === "string" ? s.mon : undefined,
    from: typeof s.from === "string" ? s.from : undefined,
    edit: typeof s.edit === "string" ? s.edit : undefined,
    title: typeof s.title === "string" ? s.title : undefined,
    unitId: typeof s.unitId === "string" ? s.unitId : undefined,
  }),
  component: CreateLessonPage,
});


/* ------------------------------ Constants ------------------------------ */

const GRADES = ["Lớp 3", "Lớp 4"];
const SUBJECTS = ["Toán"];

const REG_OPTIONS = [
  {
    value: "admin",
    label: "Quản trị ghi danh",
    desc: "Giáo viên/Quản trị chọn học sinh được học bài giảng này.",
  },
  {
    value: "self-now",
    label: "Học sinh tự đăng ký và học ngay",
    desc: "Học sinh đăng ký và bắt đầu học mà không cần duyệt.",
  },
  {
    value: "self-approve",
    label: "Học sinh tự đăng ký và chờ duyệt",
    desc: "Học sinh đăng ký, giáo viên duyệt rồi mới học được.",
  },
] as const;
type RegMode = (typeof REG_OPTIONS)[number]["value"];

const RULE_OPTIONS = [
  { value: "sequential", label: "Học tuần tự" },
  { value: "free",       label: "Học tự do" },
];

/* Student DB (mock – đồng bộ với Lớp học số) */
type Student = { id: string; code: string; name: string; dob: string };
const STUDENT_DB: Record<string, Student[]> = {
  "4A": [
    { id: "s1", code: "0123456783", name: "Nguyễn An",        dob: "15/03/2015" },
    { id: "s2", code: "0365427720", name: "Mai Huyền",        dob: "02/07/2015" },
    { id: "s3", code: "0123456787", name: "Trần Bảo",         dob: "21/11/2015" },
    { id: "s4", code: "0348844088", name: "Thanh Vân",        dob: "08/05/2015" },
    { id: "s5", code: "0335773123", name: "Vũ Huy Hoàng",     dob: "30/09/2015" },
    { id: "s6", code: "0912125548", name: "Phạm Tất Thắng",   dob: "12/12/2015" },
    { id: "s7", code: "0934778812", name: "Lê Minh Châu",     dob: "04/02/2015" },
    { id: "s8", code: "0978221190", name: "Hoàng Khánh Linh", dob: "19/06/2015" },
  ],
  "4B": [
    { id: "s9",  code: "0901123456", name: "Đỗ Quang Huy",     dob: "11/01/2015" },
    { id: "s10", code: "0901123457", name: "Nguyễn Bích Ngọc", dob: "23/04/2015" },
    { id: "s11", code: "0901123458", name: "Bùi Tiến Dũng",    dob: "07/08/2015" },
  ],
  "4C": [
    { id: "s12", code: "0902223456", name: "Hà Thu Phương",    dob: "14/03/2015" },
    { id: "s13", code: "0902223457", name: "Lý Văn Tài",       dob: "26/10/2015" },
  ],
  "3A": [
    { id: "s14", code: "0903334456", name: "Trịnh Mỹ Duyên",   dob: "05/05/2016" },
    { id: "s15", code: "0903334457", name: "Phan Đức Anh",     dob: "18/09/2016" },
  ],
  "3B": [
    { id: "s16", code: "0904445567", name: "Ngô Hồng Nhung",   dob: "22/02/2016" },
  ],
  "3C": [
    { id: "s17", code: "0905556678", name: "Tô Quốc Việt",     dob: "30/07/2016" },
  ],
  "3D": [
    { id: "s18", code: "0906667789", name: "Đặng Phương Mai",  dob: "11/11/2016" },
  ],
};

/* ------------------------------- Types ------------------------------- */

type Material = {
  id: string;
  name: string;
  type: "Video" | "Tài liệu" | "Slide / Bài giảng" | "Bài kiểm tra" | "Trò chơi tương tác";
  completion: string;
  topicId: string;
};
type Topic = { id: string; name: string };

const COMPLETION_OPTIONS = [
  "Sau khi đạt mức nội dung",
  "Sau khi trả lời câu hỏi",
  "Sau khoảng thời gian",
  "Học sinh tự click Hoàn thành",
];

const MATERIAL_TYPES: Material["type"][] = [
  "Video", "Tài liệu", "Slide / Bài giảng", "Bài kiểm tra", "Trò chơi tương tác",
];

/* ============================ Stepper ============================ */

const STEPS = [
  { id: 1, name: "Thông tin Bài giảng", icon: Info },
  { id: 2, name: "Nội dung bài giảng",  icon: ListChecks },
  { id: 3, name: "Đăng ký & Học sinh",  icon: Users },
] as const;

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const done = current > s.id;
          const active = current === s.id;
          return (
            <div key={s.id} className="flex-1 flex items-start">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`h-14 w-14 rounded-full flex items-center justify-center border-2 transition shadow-sm ${
                    done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : active
                      ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  {done ? <Check className="h-6 w-6" strokeWidth={3} /> : <Icon className="h-6 w-6" />}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-xs font-semibold ${active ? "text-indigo-700" : done ? "text-emerald-600" : "text-slate-400"}`}>
                    BƯỚC {s.id}
                  </div>
                  <div className={`text-sm font-bold mt-0.5 ${active ? "text-slate-800" : done ? "text-slate-700" : "text-slate-400"}`}>
                    {s.name}
                  </div>
                </div>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mt-7 mx-2">
                  <div className={`h-1 rounded-full ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ Page ============================ */

function CreateLessonPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const prefilledKhoi = search.khoi ?? "";
  const prefilledMon = search.mon ?? "";
  const isPrefilled = !!(prefilledKhoi && prefilledMon);
  const isEditing = !!search.edit;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [title, setTitle] = useState(search.title ?? "");
  const [khoi, setKhoi] = useState(prefilledKhoi);
  const [mon, setMon] = useState(prefilledMon);
  const [chapterId, setChapterId] = useState("");
  const [unitId, setUnitId] = useState(search.unitId ?? "");
  const [coverMode, setCoverMode] = useState<"link" | "file">("link");
  const [coverLink, setCoverLink] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [coverDataUrl, setCoverDataUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);


  const tree = useMemo(
    () => (khoi && mon ? getKnowledgeTree(khoi.replace(/[^0-9]/g, ""), mon) : []),
    [khoi, mon],
  );

  const canCreate =
    title.trim().length > 0 && !!khoi && !!mon && !!chapterId && !!unitId &&
    ((coverMode === "link" && coverLink.trim()) || (coverMode === "file" && coverFileName));

  const [lessonCreated, setLessonCreated] = useState(false);

  // Step 2
  const [topics, setTopics] = useState<Topic[]>([]);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [addingMaterialAt, setAddingMaterialAt] = useState<string | null>(null); // topicId or null
  const [editMatId, setEditMatId] = useState<string | null>(null);
  const [addTopicOpen, setAddTopicOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  // Step 3
  const [regMode, setRegMode] = useState<RegMode>("self-approve");
  const [rule, setRule] = useState(RULE_OPTIONS[0].value);
  const [filterGrade, setFilterGrade] = useState("4");
  const [filterClass, setFilterClass] = useState("4A");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);

  const onCreateShell = () => {
    if (!canCreate) return;
    setLessonCreated(true);
    setStep(2);
  };

  const onFinish = () => {
    // mock save
    navigate({ to: "/hoc-lieu/bai-giang" });
  };

  return (
    <AppShell>
      <>
        {/* Header */}
        <section className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">
              <Link to="/hoc-lieu/bai-giang" className="hover:text-indigo-700">Bài giảng</Link>
              <span className="mx-1.5">/</span>
              <span className="text-slate-700 font-semibold">{isEditing ? "Sửa bài giảng" : "Tạo bài giảng mới"}</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">
              {title.trim() || "Bài giảng mới"}
              {lessonCreated && (
                <span className="ml-3 align-middle text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  Đã tạo vỏ bài giảng
                </span>
              )}
            </h1>
          </div>
          <Link
            to="/hoc-lieu/bai-giang"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" /> Đóng
          </Link>
        </section>

        <Stepper current={step} />

        {/* Body */}
        {step === 1 && (
          <Step1
            title={title} setTitle={setTitle}
            khoi={khoi} setKhoi={(v) => { setKhoi(v); setChapterId(""); setUnitId(""); }}
            mon={mon}   setMon={(v) => { setMon(v); setChapterId(""); setUnitId(""); }}
            chapterId={chapterId} setChapterId={(v) => { setChapterId(v); setUnitId(""); }}
            unitId={unitId} setUnitId={setUnitId}
            tree={tree}
            coverMode={coverMode} setCoverMode={setCoverMode}
            coverLink={coverLink} setCoverLink={setCoverLink}
            coverFileName={coverFileName}
            coverDataUrl={coverDataUrl}
            fileRef={fileRef}
            onPickFile={(f) => {
              setCoverFileName(f.name);
              const r = new FileReader();
              r.onload = () => setCoverDataUrl(String(r.result));
              r.readAsDataURL(f);
            }}
            canCreate={!!canCreate}
            onCreate={onCreateShell}
            lockGradeSubject={isPrefilled}
            fromHint={search.from}
          />
        )}

        {step === 2 && (
          <Step2
            topics={topics} setTopics={setTopics}
            materials={materials} setMaterials={setMaterials}
            addingMaterialAt={addingMaterialAt} setAddingMaterialAt={setAddingMaterialAt}
            editMatId={editMatId} setEditMatId={setEditMatId}
            addTopicOpen={addTopicOpen} setAddTopicOpen={setAddTopicOpen}
            newTopic={newTopic} setNewTopic={setNewTopic}
          />
        )}

        {step === 3 && (
          <Step3
            regMode={regMode} setRegMode={setRegMode}
            rule={rule} setRule={setRule}
            filterGrade={filterGrade} setFilterGrade={setFilterGrade}
            filterClass={filterClass} setFilterClass={setFilterClass}
            selected={selectedStudents} setSelected={setSelectedStudents}
          />
        )}

        {/* Footer nav (only step 2, 3) */}
        {step > 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => (s === 3 ? 2 : 1) as 1 | 2 | 3)}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </button>
            {step === 2 ? (
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1.5"
              >
                Tiếp tục <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Đã lưu nháp bài giảng")}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Lưu nháp
                </button>
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1.5"
                >
                  <Eye className="h-4 w-4" /> Xem trước
                </button>
                <button
                  onClick={onFinish}
                  disabled={regMode === "admin" && selectedStudents.size === 0}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> Hoàn tất tạo bài giảng
                </button>
              </div>
            )}
          </div>
        )}

        {/* Preview modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-indigo-700">Xem trước bài giảng</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-xl bg-indigo-50/60 border border-indigo-100 p-3">
                <div className="h-20 w-32 rounded-lg overflow-hidden border bg-white flex items-center justify-center text-slate-400 text-xs shrink-0">
                  {coverDataUrl
                    ? <img src={coverDataUrl} alt="cover" className="w-full h-full object-cover" />
                    : coverLink
                      ? <img src={coverLink} alt="cover" className="w-full h-full object-cover" />
                      : <span>Ảnh đại diện</span>}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-800">{title || "(Chưa có tên)"}</div>
                  <div className="text-xs text-slate-500 mt-1">{khoi || "—"} · {mon || "—"}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <PreviewCell label="Chương mục" value={tree.find((c) => c.id === chapterId)?.title || "—"} />
                <PreviewCell label="Bài học" value={tree.find((c) => c.id === chapterId)?.units.find((u) => u.id === unitId)?.title || "—"} />
                <PreviewCell label="Số chủ đề" value={`${topics.length}`} />
                <PreviewCell label="Số học liệu" value={`${materials.length}`} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Danh sách chủ đề</div>
                <ul className="space-y-1.5">
                  {topics.length === 0
                    ? <li className="text-sm text-slate-400">— chưa có chủ đề —</li>
                    : topics.map((t, i) => (
                        <li key={t.id} className="rounded-lg border bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
                          {i + 1}. {t.name}
                        </li>
                      ))}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>Đóng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </>
    </AppShell>
  );
}

function PreviewCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white px-3 py-2">
      <div className="text-[11px] uppercase text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

/* ============================ Step 1 ============================ */

function Step1(props: {
  title: string; setTitle: (v: string) => void;
  khoi: string; setKhoi: (v: string) => void;
  mon: string; setMon: (v: string) => void;
  chapterId: string; setChapterId: (v: string) => void;
  unitId: string; setUnitId: (v: string) => void;
  tree: ReturnType<typeof getKnowledgeTree>;
  coverMode: "link" | "file"; setCoverMode: (v: "link" | "file") => void;
  coverLink: string; setCoverLink: (v: string) => void;
  coverFileName: string;
  coverDataUrl: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onPickFile: (f: File) => void;
  canCreate: boolean;
  onCreate: () => void;
  lockGradeSubject?: boolean;
  fromHint?: string;
}) {
  const {
    title, setTitle, khoi, setKhoi, mon, setMon,
    chapterId, setChapterId, unitId, setUnitId, tree,
    coverMode, setCoverMode, coverLink, setCoverLink, coverFileName, coverDataUrl,
    fileRef, onPickFile, canCreate, onCreate, lockGradeSubject, fromHint,
  } = props;

  const chapter = tree.find((c) => c.id === chapterId);
  const unitOptions = chapter?.units ?? [];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">Thông tin bài giảng</h2>
        <div className="flex items-center gap-2">
          <Link
            to="/hoc-lieu/bai-giang"
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >
            Đóng
          </Link>
          <button
            onClick={onCreate}
            disabled={!canCreate}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Tạo mới
          </button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {lockGradeSubject && (
          <div className="flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <b>Khối</b> và <b>Môn</b> đã được tự động điền theo {fromHint ? fromHint : "lớp học"}.
              Bạn chỉ cần chọn <b>Chương mục</b> và <b>Bài học</b> phù hợp.
            </div>
          </div>
        )}

        <Field label="Tiêu đề bài giảng" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Ôn tập Phép cộng phân số"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </Field>

        <div className="grid grid-cols-4 gap-4">
          <Field label="Khối" required>
            <Select
              value={khoi}
              onChange={setKhoi}
              options={GRADES}
              placeholder="— Chọn khối —"
              disabled={lockGradeSubject}
            />
          </Field>
          <Field label="Môn" required>
            <Select
              value={mon}
              onChange={setMon}
              options={SUBJECTS}
              placeholder="— Chọn môn —"
              disabled={lockGradeSubject || !khoi}
            />
          </Field>
          <Field label="Chương mục" required>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              disabled={!mon}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">{!mon ? "— Chọn môn trước —" : "— Chọn chương mục —"}</option>
              {tree.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Bài học" required>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              disabled={!chapterId}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">{!chapterId ? "— Chọn chương trước —" : "— Chọn bài học —"}</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Ảnh đại diện" required>
          <div className="space-y-3">
            <div className="inline-flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setCoverMode("link")}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md inline-flex items-center gap-1.5 ${coverMode === "link" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"}`}
              >
                <LinkIcon className="h-4 w-4" /> Nhập liên kết
              </button>
              <button
                onClick={() => setCoverMode("file")}
                className={`px-3 py-1.5 text-sm font-semibold rounded-md inline-flex items-center gap-1.5 ${coverMode === "file" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600"}`}
              >
                <Upload className="h-4 w-4" /> Tải file
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-28 w-44 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden text-slate-400 text-xs">
                {coverMode === "link" && coverLink
                  ? <img src={coverLink} alt="cover" className="w-full h-full object-cover" />
                  : coverMode === "file" && coverDataUrl
                    ? <img src={coverDataUrl} alt="cover" className="w-full h-full object-cover" />
                    : <span>Xem trước ảnh</span>}
              </div>
              <div className="flex-1">
                {coverMode === "link" ? (
                  <input
                    value={coverLink}
                    onChange={(e) => setCoverLink(e.target.value)}
                    placeholder="https://…/cover.jpg"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                ) : (
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onPickFile(f);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 inline-flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" /> Chọn file ảnh
                    </button>
                    {coverFileName && (
                      <p className="mt-2 text-xs text-slate-500">Đã chọn: {coverFileName}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Field>
      </div>
    </section>
  );
}

/* ============================ Step 2 ============================ */

function getMaterialIcon(t: Material["type"]) {
  if (t === "Video") return { Icon: Video, color: "text-rose-600" };
  if (t === "Tài liệu") return { Icon: FileText, color: "text-sky-600" };
  if (t === "Slide / Bài giảng") return { Icon: PresentationIcon, color: "text-indigo-600" };
  if (t === "Bài kiểm tra") return { Icon: ClipboardList, color: "text-amber-600" };
  return { Icon: Gamepad2, color: "text-violet-600" };
}

function Step2(props: {
  topics: Topic[]; setTopics: React.Dispatch<React.SetStateAction<Topic[]>>;
  materials: Material[]; setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  addingMaterialAt: string | null; setAddingMaterialAt: (v: string | null) => void;
  editMatId: string | null; setEditMatId: (v: string | null) => void;
  addTopicOpen: boolean; setAddTopicOpen: (v: boolean) => void;
  newTopic: string; setNewTopic: (v: string) => void;
}) {
  const {
    topics, setTopics, materials, setMaterials,
    addingMaterialAt, setAddingMaterialAt,
    editMatId, setEditMatId,
    addTopicOpen, setAddTopicOpen, newTopic, setNewTopic,
  } = props;

  const rows = materials;

  const addTopic = () => {
    const t = newTopic.trim();
    if (!t) return;
    setTopics((s) => [...s, { id: "t-" + Date.now(), name: t }]);
    setNewTopic(""); setAddTopicOpen(false);
  };

  const removeMaterial = (id: string) =>
    setMaterials((m) => m.filter((x) => x.id !== id));

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">Nội dung bài giảng</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddTopicOpen(true)}
            className="px-3 py-2 text-sm font-semibold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Thêm chủ đề
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Thêm học liệu <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setAddingMaterialAt(topics[0]?.id ?? "t-uncat")}
              >
                <Plus className="h-4 w-4 mr-2 text-indigo-600" /> Thêm học liệu mới
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Share2 className="h-4 w-4 mr-2 text-sky-600" /> Thêm từ Kho chia sẻ trường
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Globe2 className="h-4 w-4 mr-2 text-violet-600" /> Thêm từ Hanoi Study
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2.5 text-center font-semibold w-14">STT</th>
                <th className="px-3 py-2.5 text-center font-semibold w-20">Xem/Sửa</th>
                <th className="px-3 py-2.5 text-left font-semibold">Tên học liệu</th>
                <th className="px-3 py-2.5 text-left font-semibold w-44">Loại học liệu</th>
                <th className="px-3 py-2.5 text-left font-semibold w-56">Cách đánh giá hoàn thành</th>
                <th className="px-3 py-2.5 text-center font-semibold w-16">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topics.map((tp) => {
                const items = rows.filter((m) => m.topicId === tp.id);
                return (
                  <React.Fragment key={tp.id}>
                    <tr className="bg-indigo-50/40">
                      <td colSpan={6} className="px-3 py-2 font-semibold text-indigo-700">
                        {tp.name}
                        <button
                          onClick={() => setAddingMaterialAt(tp.id)}
                          className="ml-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Thêm học liệu
                        </button>
                      </td>
                    </tr>
                    {items.length === 0 && (
                      <tr key={"e-" + tp.id}>
                        <td colSpan={6} className="px-3 py-4 text-center text-xs text-slate-400 italic">
                          Chưa có học liệu trong chủ đề này.
                        </td>
                      </tr>
                    )}
                    {items.map((m, i) => {
                      const { Icon, color } = getMaterialIcon(m.type);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-3 py-3 text-center text-slate-500">{i + 1}</td>
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => setEditMatId(m.id)}
                              className="h-8 w-8 rounded-md border border-slate-200 bg-white text-indigo-600 hover:bg-indigo-50 inline-flex items-center justify-center"
                            >
                              <SquarePen className="h-4 w-4" />
                            </button>
                          </td>
                          <td className="px-3 py-3 text-slate-800 font-medium">
                            <span className="inline-flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${color}`} />
                              {m.name}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-700">{m.type}</td>
                          <td className="px-3 py-3 text-slate-700">{m.completion}</td>
                          <td className="px-3 py-3 text-center">
                            <button
                              onClick={() => removeMaterial(m.id)}
                              className="h-8 w-8 rounded-md border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {addingMaterialAt && (
        <AddMaterialMiniModal
          topics={topics}
          defaultTopicId={addingMaterialAt}
          onClose={() => setAddingMaterialAt(null)}
          onAdd={(m) => { setMaterials((s) => [...s, m]); setAddingMaterialAt(null); }}
        />
      )}

      {addTopicOpen && (
        <SmallModal title="Thêm chủ đề" onClose={() => setAddTopicOpen(false)}>
          <div className="space-y-3">
            <Field label="Tên chủ đề" required>
              <input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="VD: Vận dụng"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </Field>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddTopicOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              >Hủy</button>
              <button
                onClick={addTopic}
                disabled={!newTopic.trim()}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >Thêm</button>
            </div>
          </div>
        </SmallModal>
      )}

      {editMatId && (
        <SmallModal title="Chi tiết học liệu" onClose={() => setEditMatId(null)}>
          {(() => {
            const m = materials.find((x) => x.id === editMatId);
            if (!m) return null;
            return (
              <div className="space-y-2 text-sm">
                <div><span className="text-slate-500">Tên:</span> <b>{m.name}</b></div>
                <div><span className="text-slate-500">Loại:</span> {m.type}</div>
                <div><span className="text-slate-500">Hoàn thành:</span> {m.completion}</div>
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setEditMatId(null)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >Đóng</button>
                </div>
              </div>
            );
          })()}
        </SmallModal>
      )}
    </section>
  );
}

function AddMaterialMiniModal({
  topics, defaultTopicId, onClose, onAdd,
}: {
  topics: Topic[];
  defaultTopicId: string;
  onClose: () => void;
  onAdd: (m: Material) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Material["type"]>("Video");
  const [completion, setCompletion] = useState(COMPLETION_OPTIONS[0]);
  const [topicId, setTopicId] = useState(defaultTopicId);

  return (
    <SmallModal title="Thêm học liệu mới" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Chủ đề">
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white"
          >
            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Tên học liệu" required>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Video mở đầu - Phân số"
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white"
          />
        </Field>
        <Field label="Loại học liệu" required>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Material["type"])}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white"
          >
            {MATERIAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        {type === "Video" && (
          <VideoSource />
        )}
        <Field label="Cách đánh giá hoàn thành">
          <select
            value={completion}
            onChange={(e) => setCompletion(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white"
          >
            {COMPLETION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          >Hủy</button>
          <button
            disabled={!name.trim()}
            onClick={() => onAdd({
              id: "m-" + Date.now(), name: name.trim(), type, completion, topicId,
            })}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >Thêm</button>
        </div>
      </div>
    </SmallModal>
  );
}

function VideoSource() {
  const [mode, setMode] = useState<"link" | "file">("link");
  const [link, setLink] = useState("");
  const [fileName, setFileName] = useState("");
  return (
    <Field label="Nguồn video">
      <div className="flex items-center gap-4 mb-2 text-sm">
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={mode === "link"} onChange={() => setMode("link")} />
          Gửi link
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer">
          <input type="radio" checked={mode === "file"} onChange={() => setMode("file")} />
          Tải file
        </label>
      </div>
      {mode === "link" ? (
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Dán link YouTube/Vimeo/Drive…"
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white"
        />
      ) : (
        <label className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer text-slate-600">
          <span className="truncate">{fileName || "Chọn tệp video để tải lên"}</span>
          <span className="text-indigo-600 font-semibold">Chọn tệp</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
      )}
    </Field>
  );
}


/* ============================ Step 3 ============================ */

function Step3(props: {
  regMode: RegMode; setRegMode: (v: RegMode) => void;
  rule: string; setRule: (v: string) => void;
  filterGrade: string; setFilterGrade: (v: string) => void;
  filterClass: string; setFilterClass: (v: string) => void;
  selected: Set<string>; setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const {
    regMode, setRegMode, rule, setRule,
    filterGrade, setFilterGrade, filterClass, setFilterClass,
    selected, setSelected,
  } = props;

  const gradeClasses = useMemo(
    () => Object.keys(STUDENT_DB).filter((c) => c.startsWith(filterGrade)),
    [filterGrade],
  );
  const students = STUDENT_DB[filterClass] ?? [];
  const allChecked = students.length > 0 && students.every((s) => selected.has(s.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) students.forEach((s) => next.delete(s.id));
      else students.forEach((s) => next.add(s.id));
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <section className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <h2 className="text-base font-bold text-slate-800 mb-4">Cấu hình bài giảng</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Hình thức đăng ký">
            <select
              value={regMode}
              onChange={(e) => setRegMode(e.target.value as RegMode)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {REG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {REG_OPTIONS.find((o) => o.value === regMode)?.desc}
            </p>
          </Field>
          <Field label="Quy luật nội dung">
            <select
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              {RULE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {regMode === "admin" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800">Danh sách học sinh được ghi danh</h3>
            <div className="text-sm text-slate-600">
              Đã chọn: <span className="font-bold text-indigo-700">{selected.size}</span> học sinh
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Khối</label>
              <select
                value={filterGrade}
                onChange={(e) => {
                  setFilterGrade(e.target.value);
                  const first = Object.keys(STUDENT_DB).find((c) => c.startsWith(e.target.value));
                  if (first) setFilterClass(first);
                }}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
              >
                {["3", "4"].map((g) => <option key={g} value={g}>Khối {g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Lớp</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
              >
                {gradeClasses.map((c) => <option key={c} value={c}>Lớp {c}</option>)}
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold w-12">STT</th>
                  <th className="px-3 py-2 text-left font-semibold">Mã định danh</th>
                  <th className="px-3 py-2 text-left font-semibold">Tên học sinh</th>
                  <th className="px-3 py-2 text-left font-semibold">Ngày sinh</th>
                  <th className="px-3 py-2 text-center font-semibold w-14">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll}
                      className="h-4 w-4 accent-indigo-600 cursor-pointer" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => {
                  const checked = selected.has(s.id);
                  return (
                    <tr key={s.id}
                      className={`hover:bg-slate-50 cursor-pointer ${checked ? "bg-indigo-50/40" : ""}`}
                      onClick={() => toggleOne(s.id)}>
                      <td className="px-3 py-2 text-slate-500">{String(idx + 1).padStart(2, "0")}</td>
                      <td className="px-3 py-2 font-mono text-slate-700">{s.code}</td>
                      <td className="px-3 py-2 text-slate-800 font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-slate-600">{s.dob}</td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(s.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 accent-indigo-600 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-400 italic">
                      Không có học sinh nào trong lớp này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================ Small UI helpers ============================ */

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Select({
  value, onChange, options, placeholder, disabled,
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; disabled?: boolean }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:bg-slate-50 disabled:text-slate-400"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SmallModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/* ============================ Unit checkbox dropdown ============================ */

function UnitCheckboxDropdown({
  tree, value, onChange, disabled, placeholder,
}: {
  tree: ReturnType<typeof getKnowledgeTree>;
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };
  const label =
    value.length === 0
      ? placeholder ?? "— Chọn đơn vị kiến thức —"
      : `Đã chọn ${value.length} đơn vị kiến thức`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={value.length === 0 ? "text-slate-400" : "text-slate-700"}>{label}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg py-1">
          {tree.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-400">Không có dữ liệu.</div>
          )}
          {tree.map((ch) => (
            <div key={ch.id}>
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-500 uppercase bg-slate-50">
                {ch.title}
              </div>
              {ch.units.map((u) => {
                const checked = value.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-start gap-2 px-3 py-2 text-sm hover:bg-indigo-50/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(u.id)}
                      className="mt-0.5 h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-slate-700">{u.title}</span>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

