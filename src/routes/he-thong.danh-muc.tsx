import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Filter, FilterX, Columns3, Pencil, Download, Trash2, Database, RefreshCcw, ArrowUpDown, Check, GripVertical,
} from "lucide-react";

export const Route = createFileRoute("/he-thong/danh-muc")({
  head: () => ({ meta: [{ title: "Danh mục – Hệ thống" }] }),
  component: Page,
});

type Tab = "mon-hoc" | "chuong-hoc" | "bai-hoc";
type Source = "school" | "system";

type Subject = {
  id: string;
  grade: string; // "Khối 1"
  code: string;  // Mã môn học
  dbCode: string; // Mã môn học CSDL
  name: string;
  visible: boolean;
  source: Source;
};

const GRADES = ["Khối 1", "Khối 2", "Khối 3", "Khối 4", "Khối 5"];

const SEED: Subject[] = [
  { id: "s1", grade: "Khối 1", code: "0101", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s2", grade: "Khối 1", code: "0102", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s3", grade: "Khối 1", code: "0103", dbCode: "Đạo đức (03)", name: "Đạo đức", visible: true, source: "system" },
  { id: "s4", grade: "Khối 1", code: "0104", dbCode: "TN&XH (04)", name: "Tự nhiên và Xã hội", visible: true, source: "system" },
  { id: "s5", grade: "Khối 2", code: "0201", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s6", grade: "Khối 2", code: "0202", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s7", grade: "Khối 3", code: "0301", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s8", grade: "Khối 3", code: "0302", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s9", grade: "Khối 3", code: "0305", dbCode: "TA (05)", name: "Tiếng Anh", visible: false, source: "school" },
  { id: "s10", grade: "Khối 4", code: "0401", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s11", grade: "Khối 4", code: "0402", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s12", grade: "Khối 4", code: "0407", dbCode: "TH (07)", name: "Tin học", visible: true, source: "school" },
  { id: "s13", grade: "Khối 5", code: "0501", dbCode: "Toán (01)", name: "Toán", visible: true, source: "system" },
  { id: "s14", grade: "Khối 5", code: "0502", dbCode: "Tiếng Việt (02)", name: "Tiếng Việt", visible: true, source: "system" },
  { id: "s15", grade: "Khối 5", code: "0508", dbCode: "STEM (08)", name: "STEM", visible: false, source: "school" },
];

function Page() {
  const [tab, setTab] = useState<Tab>("mon-hoc");

  return (
    <AppShell role="teacher">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Danh mục</h1>
            <p className="text-sm text-slate-500">Quản lý danh mục Môn học, Chương học và Bài học của trường.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="inline-flex bg-white border rounded-xl p-1 shadow-sm">
          {[
            { id: "mon-hoc", label: "Môn học" },
            { id: "chuong-hoc", label: "Chương học" },
            { id: "bai-hoc", label: "Bài học" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                tab === t.id ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "mon-hoc" && <MonHocPanel />}
        {tab === "chuong-hoc" && (
          <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
            Danh sách chương học sẽ được cấu hình tại đây.
          </div>
        )}
        {tab === "bai-hoc" && (
          <div className="bg-white border rounded-xl p-10 text-center text-slate-500">
            Danh sách bài học sẽ được cấu hình tại đây.
          </div>
        )}
      </div>
    </AppShell>
  );
}

/* ---------------- Môn học panel ---------------- */
function MonHocPanel() {
  const [rows, setRows] = useState<Subject[]>(SEED);
  const [grade, setGrade] = useState<string>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortMode, setSortMode] = useState(false);
  const [sortDraft, setSortDraft] = useState<Subject[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

  const enterSort = () => {
    setSortDraft(rows);
    setSortMode(true);
  };
  const confirmSort = () => {
    setRows(sortDraft);
    setSortMode(false);
  };
  const cancelSort = () => setSortMode(false);

  const onDragStart = (id: string) => setDragId(id);
  const onDragOver = (e: React.DragEvent, overId: string) => {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    setSortDraft((prev) => {
      const from = prev.findIndex((r) => r.id === dragId);
      const to = prev.findIndex((r) => r.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const source = sortMode ? sortDraft : rows;
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return source.filter((r) => {
      if (grade !== "all" && r.grade !== grade) return false;
      if (kw && !r.name.toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [source, grade, q]);

  const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((r) => next.delete(r.id));
    else filtered.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleVisible = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r)));
  };

  return (
    <div className="space-y-3">
      {/* Action bar */}
      <div className="bg-white border rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
        <button className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50" title="Bộ lọc">
          <Filter className="h-4 w-4" />
        </button>
        <button className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50" title="Xoá bộ lọc">
          <FilterX className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        <button className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50" title="Cột">
          <Columns3 className="h-4 w-4" />
        </button>
        <Button
          variant="outline"
          onClick={enterSort}
          className={`border-sky-500 text-sky-600 hover:bg-sky-50 ${sortMode ? "bg-sky-50" : ""}`}
        >
          <ArrowUpDown className="h-4 w-4 mr-1.5" /> Sắp xếp
        </Button>
        <Button variant="outline" className="border-sky-500 text-sky-600 hover:bg-sky-50">
          <RefreshCcw className="h-4 w-4 mr-1.5" /> Lấy dữ liệu từ hệ thống
        </Button>
        <Button variant="outline" className="border-sky-500 text-sky-600 hover:bg-sky-50">
          <Database className="h-4 w-4 mr-1.5" /> Chuẩn hóa môn học
        </Button>
        <Button variant="outline" className="border-rose-500 text-rose-600 hover:bg-rose-50">
          <Trash2 className="h-4 w-4 mr-1.5" /> Xóa
        </Button>
        <Button variant="outline" className="border-sky-500 text-sky-600 hover:bg-sky-50">
          <Download className="h-4 w-4 mr-1.5" /> Xuất excel
        </Button>
        <Button className="bg-sky-600 hover:bg-sky-700 text-white">Thêm mới</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="w-56 bg-white">
            <SelectValue placeholder="Khối" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khối</SelectItem>
            {GRADES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm"
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-indigo-700 hover:bg-indigo-700">
              <TableHead className="text-white text-center w-14">STT</TableHead>
              <TableHead className="text-white w-12">
                <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="text-white w-16">Sửa</TableHead>
              <TableHead className="text-white">Khối</TableHead>
              <TableHead className="text-white text-right">Mã môn học</TableHead>
              <TableHead className="text-white">Mã môn học CSDL</TableHead>
              <TableHead className="text-white">Tên môn học</TableHead>
              <TableHead className="text-white text-center bg-indigo-800">Hiển thị</TableHead>
              <TableHead className="text-white text-center bg-indigo-800">Nguồn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r, idx) => (
              <TableRow key={r.id} className="hover:bg-slate-50">
                <TableCell className="text-center">{idx + 1}</TableCell>
                <TableCell>
                  <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} />
                </TableCell>
                <TableCell>
                  <button className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
                <TableCell>{r.grade}</TableCell>
                <TableCell className="text-right tabular-nums">{r.code}</TableCell>
                <TableCell>{r.dbCode}</TableCell>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-center">
                  <Checkbox checked={r.visible} onCheckedChange={() => toggleVisible(r.id)} />
                </TableCell>
                <TableCell className="text-center">
                  {r.source === "school" ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Trường tạo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Từ hệ thống
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                  Không có môn học phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
