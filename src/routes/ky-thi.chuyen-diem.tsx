import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, FileSpreadsheet, Filter, Lock, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { AppShell } from "@/components/AppShell";
import { ScoreTypeFilter } from "@/components/ScoreTypeFilter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useDemoAccount } from "@/lib/demo-account";
import { downloadCsv } from "@/lib/report-export";
import { isValidScore } from "@/lib/score";
import { visibleScoreColumns } from "@/lib/score-column-filter";

export const Route = createFileRoute("/ky-thi/chuyen-diem")({
  head: () => ({
    meta: [
      { title: "Chuyển điểm thi sang CSDL | QLMS" },
      { name: "description", content: "Rà soát, chỉnh sửa và chuyển điểm GKI, CKI, GKII, CKII của học sinh sang cơ sở dữ liệu ngành." },
      { property: "og:title", content: "Chuyển điểm thi sang CSDL" },
      { property: "og:description", content: "Bảng điểm kỳ thi theo khối, lớp và nút xác nhận chuyển điểm sang CSDL." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScoreTransferPage,
});

type ScoreKey = "gk1a" | "gk1b" | "ck1" | "gk2" | "ck2";
type Row = { id: string; name: string; cccd: string; dob: string; khoi: string; lop: string } & Record<ScoreKey, string>;

const NAMES = ["Nguyễn Minh Anh", "Trần Gia Bảo", "Lê Khánh Chi", "Phạm Đức Duy", "Hoàng Thu Hà", "Vũ Quang Huy", "Đặng Ngọc Lan", "Bùi Hải Long", "Phí Song Ngân", "Đỗ Minh Quân", "Ngô Thảo Vy", "Lý Tuấn Kiệt"];
const CLASSES = ["3A", "3B", "4A", "4B", "5A", "5B"];
const INITIAL: Row[] = CLASSES.flatMap((lop, ci) =>
  NAMES.slice(0, 6).map((_, i) => {
    const n = NAMES[(i + ci * 2) % NAMES.length];
    const seed = (i * 7 + ci * 3) % 10;
    const sc = (k: number) => (Math.min(10, 5 + ((seed + k) % 6) + ((seed + k) % 2) * 0.5)).toFixed(1).replace(/\.0$/, "");
    const year = 2019 - (Number(lop[0]) - 3);
    // GKI do 2 kỳ thi cùng chọn: phần lớn ở cột (1), một số ở cột (2), vài em có cả 2 (xung đột)
    const both = (i + ci) % 9 === 4;
    const inB = i % 3 === 2;
    return {
      id: `${lop}-${i}`, name: n, cccd: `0012190${String(ci * 100 + i * 37 + 10000).padStart(5, "0")}`, khoi: lop[0], lop,
      dob: `${String((i * 5 + ci) % 28 + 1).padStart(2, "0")}/${String((i + ci) % 12 + 1).padStart(2, "0")}/${year}`,
      gk1a: inB && !both ? "" : sc(0), gk1b: inB || both ? sc(4) : "",
      ck1: sc(1), gk2: sc(2), ck2: i === 5 ? "" : sc(3),
    };
  }),
);
const COLS: { key: ScoreKey; label: string; sub?: string }[] = [
  { key: "gk1a", label: "Điểm GKI", sub: "(1)" }, { key: "gk1b", label: "Điểm GKI", sub: "(2)" },
  { key: "ck1", label: "Điểm CKI" }, { key: "gk2", label: "Điểm GKII" }, { key: "ck2", label: "Điểm CKII" },
];
const conflict = (r: Row) => r.gk1a.trim() !== "" && r.gk1b.trim() !== "";

function MultiCheck({ label, value, options, onChange }: { label: string; value: string[]; options: { v: string; l: string }[]; onChange: (v: string[]) => void }) {
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 font-normal">
          <Filter className="h-4 w-4" />{label}: {value.length === 0 ? "Tất cả" : options.filter((o) => value.includes(o.v)).map((o) => o.v).join(", ")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2" align="start">
        {options.map((o) => (
          <label key={o.v} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
            <Checkbox checked={value.includes(o.v)} onCheckedChange={() => toggle(o.v)} />{o.l}
          </label>
        ))}
        <div className="mt-2 border-t pt-2 flex justify-end"><Button variant="ghost" size="sm" onClick={() => onChange([])}>Tất cả</Button></div>
      </PopoverContent>
    </Popover>
  );
}

function ScoreTransferPage() {
  const account = useDemoAccount();
  const canEdit = account === "principal";
  const [rows, setRows] = useState(INITIAL);
  const [q, setQ] = useState("");
  const [khoi, setKhoi] = useState<string[]>([]);
  const [lop, setLop] = useState<string[]>([]);
  const [hiddenScoreKeys, setHiddenScoreKeys] = useState<string[]>([]);
  const [locked, setLocked] = useState<Set<ScoreKey>>(new Set(["ck1"]));
  const [transferred, setTransferred] = useState<string | null>(null);

  const lopOptions = CLASSES.filter((c) => khoi.length === 0 || khoi.includes(c[0]));
  const shown = useMemo(() => rows.filter((r) =>
    r.name.toLowerCase().includes(q.trim().toLowerCase()) && (khoi.length === 0 || khoi.includes(r.khoi)) && (lop.length === 0 || lop.includes(r.lop))), [rows, q, khoi, lop]);
  const invalid = rows.some((r) => COLS.some((c) => !isValidScore(r[c.key])));
  const conflicts = rows.filter(conflict).length;
  // GV chỉ thấy cột điểm BGH đã xác nhận chuyển sang CSDL
  const availableCols = canEdit ? COLS : COLS.filter((c) => locked.has(c.key));
  const cols = visibleScoreColumns(availableCols, hiddenScoreKeys);
  const gk1Cols = cols.filter((c) => c.sub);
  const otherCols = cols.filter((c) => !c.sub);

  const update = (id: string, key: ScoreKey, v: string) => {
    if (!/^\d{0,2}(\.\d?)?$/.test(v)) return;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
  };
  const unlock = (k: ScoreKey) => {
    if (!canEdit) { toast.error("Chỉ Ban giám hiệu được mở khóa cột điểm."); return; }
    setLocked((s) => { const n = new Set(s); n.delete(k); return n; });
    toast.success("Đã mở khóa cột điểm.");
  };

  const exportExcel = () => downloadCsv("chuyen-diem-csdl.csv",
    ["STT", "Họ và tên học sinh", "CCCD", "Ngày sinh", "Khối", "Lớp", ...cols.map((c) => `${c.label}${c.sub ? " " + c.sub : ""}`)],
    shown.map((r, i) => [i + 1, r.name, r.cccd, r.dob, r.khoi, r.lop, ...cols.map((c) => r[c.key])]));

  const confirm = () => {
    if (invalid) { toast.error("Có điểm không hợp lệ. Điểm phải trong thang 0–10, tối đa 1 chữ số thập phân."); return; }
    if (conflicts) { toast.error(`Có ${conflicts} học sinh có cả 2 đầu điểm GKI. Vui lòng xóa 1 đầu điểm trước khi chuyển.`); return; }
    setLocked(new Set(COLS.filter((c) => rows.some((r) => r[c.key].trim() !== "")).map((c) => c.key)));
    setTransferred(new Date().toLocaleString("vi-VN"));
    toast.success(`Đã chuyển điểm của ${shown.length} học sinh sang CSDL.`);
  };

  const th = "px-3 py-2 font-medium whitespace-nowrap border-b";
  const lockBtn = (k: ScoreKey) => locked.has(k) ? (
    <button type="button" onClick={() => unlock(k)} title={canEdit ? "Đã chuyển sang CSDL – bấm để mở khóa" : "Đã chuyển sang CSDL"}
      className="ml-1 inline-flex align-middle text-amber-600 hover:text-amber-700"><Lock className="h-3.5 w-3.5" /></button>
  ) : null;

  return (
    <AppShell>
      <Toaster />
      <div className="p-6 space-y-4 text-[13px]">
        <div>
          <h1 className="text-lg font-semibold">Chuyển điểm thi sang CSDL</h1>
          <p className="text-muted-foreground">
            {canEdit ? "Ban giám hiệu có thể chỉnh sửa điểm trước khi xác nhận chuyển." : "Chỉ Ban giám hiệu được sửa điểm."} Điểm thang 0–10, tối đa 1 chữ số thập phân, dùng dấu "." (VD: 8.5). Cột có biểu tượng <Lock className="inline h-3 w-3" /> đã được chuyển; BGH bấm vào biểu tượng để mở khóa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-9" placeholder="Tìm tên học sinh" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <MultiCheck label="Khối" value={khoi} options={["3", "4", "5"].map((k) => ({ v: k, l: `Khối ${k}` }))}
            onChange={(v) => { setKhoi(v); setLop((l) => l.filter((c) => v.length === 0 || v.includes(c[0]))); }} />
          <MultiCheck label="Lớp" value={lop} options={lopOptions.map((c) => ({ v: c, l: `Lớp ${c}` }))} onChange={setLop} />
          <ScoreTypeFilter columns={availableCols} hiddenKeys={hiddenScoreKeys} onChange={setHiddenScoreKeys} />
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4" />Xuất Excel</Button>
            <Button size="sm" onClick={confirm} disabled={!canEdit} className="bg-emerald-600 hover:bg-emerald-700 text-primary-foreground"><CheckCircle2 className="h-4 w-4" />Xác nhận</Button>
          </div>
        </div>
        {conflicts > 0 && <p className="text-destructive">Có {conflicts} học sinh có cả 2 đầu điểm GKI (1) và (2) – được tô đỏ trong bảng.</p>}
        {transferred && <p className="text-emerald-700">Đã chuyển điểm sang CSDL lúc {transferred}.</p>}
        <div className="rounded-lg border bg-card overflow-auto max-h-[70vh]">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 bg-muted z-10">
              <tr>
                <th colSpan={6} className={`${th} text-center border-r`}>Thông tin học sinh</th>
                {cols.length > 0 && <th colSpan={cols.length} className={`${th} text-center`}>Điểm thi</th>}
              </tr>
              <tr className="text-left">
                {["STT", "Họ và tên học sinh", "CCCD", "Ngày sinh", "Khối", "Lớp"].map((h, i) => (
                  <th key={h} rowSpan={2} className={`${th} ${i === 5 ? "border-r" : ""}`}>{h}</th>
                ))}
                {gk1Cols.length > 0 && <th colSpan={gk1Cols.length} className={`${th} text-center`}>Điểm GKI</th>}
                {otherCols.map((c) => <th key={c.key} rowSpan={2} className={`${th} text-center`}>{c.label}{lockBtn(c.key)}</th>)}
              </tr>
              <tr>
                {gk1Cols.map((c) => <th key={c.key} className={`${th} text-center`}>{c.sub}{lockBtn(c.key)}</th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => {
                const clash = conflict(r);
                return (
                  <tr key={r.id} className={clash ? "bg-destructive/10" : ""}>
                    <td className="px-3 py-1.5 border-b">{i + 1}</td>
                    <td className={`px-3 py-1.5 border-b font-medium ${clash ? "text-destructive" : ""}`}>{r.name}</td>
                    <td className="px-3 py-1.5 border-b">{r.cccd}</td>
                    <td className="px-3 py-1.5 border-b">{r.dob}</td>
                    <td className="px-3 py-1.5 border-b">{r.khoi}</td>
                    <td className="px-3 py-1.5 border-b border-r">{r.lop}</td>
                    {cols.map((c) => {
                      const v = r[c.key];
                      const bad = !isValidScore(v) || (clash && (c.key === "gk1a" || c.key === "gk1b"));
                      const isLocked = locked.has(c.key);
                      return (
                        <td key={c.key} className="px-3 py-1.5 border-b text-center">
                          {canEdit && !isLocked ? (
                            <Input inputMode="decimal" aria-label={`${c.label} ${c.sub ?? ""} ${r.name}`} value={v} onChange={(e) => update(r.id, c.key, e.target.value)}
                              className={`h-8 w-20 mx-auto text-center ${bad ? "border-destructive text-destructive bg-destructive/10" : ""}`}
                              title={clash ? "Học sinh có cả 2 đầu điểm GKI" : bad ? "Điểm từ 0 đến 10, tối đa 1 chữ số thập phân" : undefined} />
                          ) : <span className={bad ? "text-destructive font-semibold" : isLocked ? "text-muted-foreground" : ""}>{v || "–"}</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan={6 + cols.length} className="px-3 py-6 text-center text-muted-foreground">Không có học sinh phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
