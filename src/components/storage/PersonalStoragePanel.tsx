import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

type Row = {
  id: string;
  name: string;
  type: string;
  sources: Array<{ label: string; value: string }>;
  size: number; // MB
  tab: "file" | "cover";
};

const ROWS: Row[] = [
  { id: "f1", name: "ABC", type: "PDF", size: 20, tab: "file", sources: [{ label: "Học liệu", value: "Làm quen phân số" }] },
  { id: "f2", name: "ABC", type: "PDF", size: 20, tab: "file", sources: [{ label: "Bài giảng", value: "Phân số; Hỗn số" }] },
  { id: "f3", name: "ABC", type: "PDF", size: 20, tab: "file", sources: [{ label: "Học liệu", value: "Làm quen phân số" }] },
  { id: "f4", name: "BCD", type: "Word", size: 20, tab: "file", sources: [{ label: "Câu hỏi", value: "Đọc bài sau và nhận xét?" }] },
  {
    id: "f5", name: "BCD", type: "Word", size: 20, tab: "file",
    sources: [{ label: "Câu hỏi", value: "Đọc bài sau và nhận xét?" }, { label: "Đề", value: "Kiểm tra Văn 1 tiết" }],
  },
  {
    id: "f6", name: "BCD", type: "Word", size: 20, tab: "file",
    sources: [{ label: "Câu hỏi", value: "Đọc bài sau và nhận xét?" }, { label: "Bài tập", value: "Phiếu luyện tập 3" }],
  },
  { id: "f7", name: "Bảng biểu Toán 4", type: "Excel", size: 15, tab: "file", sources: [{ label: "Bài tập", value: "Ôn tập số tự nhiên" }] },
  { id: "c1", name: "thumb-lop-4a.jpg", type: "Ảnh", size: 25, tab: "cover", sources: [{ label: "Lớp học", value: "Lớp 4A" }] },
  { id: "c2", name: "thumb-phan-so.jpg", type: "Ảnh", size: 25, tab: "cover", sources: [{ label: "Bài giảng", value: "Phân số; Hỗn số" }] },
  { id: "c3", name: "thumb-so-tu-nhien.jpg", type: "Ảnh", size: 25, tab: "cover", sources: [{ label: "Bài giảng", value: "Ôn tập số tự nhiên" }] },
  { id: "c4", name: "thumb-hinh-hoc.jpg", type: "Ảnh", size: 25, tab: "cover", sources: [{ label: "Học liệu", value: "Hình học cơ bản" }] },
];

export function PersonalStoragePanel() {
  const [tab, setTab] = useState<"file" | "cover">("file");
  const [rows, setRows] = useState<Row[]>(ROWS);
  const [type, setType] = useState("all");
  const [source, setSource] = useState("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ ids: string[] } | null>(null);

  const totalMB = rows.reduce((s, r) => s + r.size, 0);
  const coverMB = rows.filter((r) => r.tab === "cover").reduce((s, r) => s + r.size, 0);
  const fileMB = totalMB - coverMB;
  const QUOTA = 1024;

  const tabRows = useMemo(() => rows.filter((r) => r.tab === tab), [rows, tab]);
  const typeOptions = useMemo(() => Array.from(new Set(tabRows.map((r) => r.type))), [tabRows]);
  const sourceOptions = useMemo(
    () => Array.from(new Set(tabRows.flatMap((r) => r.sources.map((s) => s.label)))),
    [tabRows],
  );

  const filtered = useMemo(
    () =>
      tabRows.filter(
        (r) =>
          (type === "all" || r.type === type) &&
          (source === "all" || r.sources.some((s) => s.label === source)) &&
          r.name.toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [tabRows, type, source, q],
  );

  const allChecked = filtered.length > 0 && filtered.every((r) => sel.includes(r.id));

  function doDelete(ids: string[]) {
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSel((prev) => prev.filter((id) => !ids.includes(id)));
    setConfirm(null);
    toast.success(`Đã xóa ${ids.length} tệp, giải phóng bộ nhớ`);
  }

  return (
    <div className="space-y-4">
      {/* Tổng quan */}
      <div className="flex flex-wrap items-stretch gap-3">
        <div className="flex overflow-hidden rounded-xl border bg-white">
          <div className="w-2 bg-emerald-500" />
          <div className="p-4 min-w-[320px]">
            <div className="flex items-end gap-3">
              <p className="text-[15px] font-bold leading-tight text-indigo-800">
                Tổng dung lượng<br />đã sử dụng
              </p>
              <p className="text-3xl font-bold text-indigo-900">{totalMB} MB</p>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-sky-500"
                style={{ width: `${Math.min(100, (totalMB / QUOTA) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] italic text-slate-500">
              *Tổng dung lượng trường được khai thác: {QUOTA} MB
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {([
            ["Ảnh bìa", coverMB],
            ["Tệp, file", fileMB],
          ] as const).map(([label, val]) => (
            <div key={label} className="flex min-w-[240px] flex-1 items-center gap-6 rounded-xl border bg-white px-4 py-3">
              <span className="text-[14px] font-bold text-indigo-800">{label}</span>
              <span className="ml-auto text-[15px] text-slate-700">{val} MB</span>
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-start">
          <Button
            variant="destructive"
            disabled={sel.length === 0}
            onClick={() => setConfirm({ ids: sel })}
            className="h-11 rounded-lg px-6 text-[14px] font-bold"
          >
            Xóa hàng loạt{sel.length ? ` (${sel.length})` : ""}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b">
        {([
          ["file", "Tệp/file"],
          ["cover", "Ảnh bìa"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => { setTab(k); setSel([]); setType("all"); setSource("all"); }}
            className={`pb-2 text-[15px] font-bold transition ${
              tab === k
                ? "border-b-2 border-indigo-600 text-slate-800"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 w-[150px] text-[13px]">
            <SelectValue placeholder="Loại tệp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại tệp</SelectItem>
            {typeOptions.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="h-9 w-[170px] text-[13px]">
            <SelectValue placeholder="Nguồn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả nguồn</SelectItem>
            {sourceOptions.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm theo tên tệp..."
            className="h-9 w-[260px] pl-8 text-[13px]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-indigo-700 text-white">
            <tr>
              <th className="px-3 py-2.5 font-semibold">STT</th>
              <th className="px-3 py-2.5">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={(v) =>
                    setSel(v ? Array.from(new Set([...sel, ...filtered.map((r) => r.id)])) : [])
                  }
                  aria-label="Chọn tất cả"
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-indigo-700"
                />
              </th>
              <th className="px-3 py-2.5 font-semibold">Tên tệp</th>
              <th className="px-3 py-2.5 font-semibold">Loại tệp</th>
              <th className="px-3 py-2.5 font-semibold">Nguồn trên QLMS</th>
              <th className="px-3 py-2.5 font-semibold">Dung lượng</th>
              <th className="px-3 py-2.5 font-semibold">Tải về</th>
              <th className="px-3 py-2.5 font-semibold">Xóa</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id} className="border-t text-center align-middle">
                <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                <td className="px-3 py-3">
                  <Checkbox
                    checked={sel.includes(r.id)}
                    onCheckedChange={(v) =>
                      setSel((prev) => (v ? [...prev, r.id] : prev.filter((x) => x !== r.id)))
                    }
                    aria-label={`Chọn ${r.name}`}
                  />
                </td>
                <td className="px-3 py-3 font-semibold text-slate-800">{r.name}</td>
                <td className="px-3 py-3 text-slate-600">{r.type}</td>
                <td className="px-3 py-3 text-left">
                  {r.sources.map((s) => (
                    <p key={s.label + s.value} className="text-slate-600">
                      <span className="font-bold text-slate-800">{s.label}:</span> {s.value}
                    </p>
                  ))}
                </td>
                <td className="px-3 py-3 text-slate-700">{r.size} MB</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    title="Tải về"
                    onClick={() => toast.success(`Đang tải về "${r.name}"`)}
                    className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-sky-600 hover:bg-sky-50"
                  >
                    <Download className="h-[18px] w-[18px]" />
                  </button>
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    title="Xóa"
                    onClick={() => setConfirm({ ids: [r.id] })}
                    className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-[18px] w-[18px]" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                  Không có tệp phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tệp khỏi bộ nhớ?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.ids.length} tệp sẽ bị xóa vĩnh viễn và giải phóng dung lượng. Nội dung đang
              sử dụng tệp này có thể bị ảnh hưởng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => confirm && doDelete(confirm.ids)}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
