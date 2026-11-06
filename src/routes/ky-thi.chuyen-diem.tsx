import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, FileSpreadsheet, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { useDemoAccount } from "@/lib/demo-account";
import { downloadCsv } from "@/lib/report-export";
import { isValidScore } from "@/lib/score";

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

type ScoreKey = "gk1" | "ck1" | "gk2" | "ck2";
type Row = { id: string; name: string; dob: string; khoi: string; lop: string } & Record<ScoreKey, string>;

const NAMES = ["Nguyễn Minh Anh", "Trần Gia Bảo", "Lê Khánh Chi", "Phạm Đức Duy", "Hoàng Thu Hà", "Vũ Quang Huy", "Đặng Ngọc Lan", "Bùi Hải Long", "Phí Song Ngân", "Đỗ Minh Quân", "Ngô Thảo Vy", "Lý Tuấn Kiệt"];
const CLASSES = ["3A", "3B", "4A", "4B", "5A", "5B"];
const INITIAL: Row[] = CLASSES.flatMap((lop, ci) =>
  NAMES.slice(0, 6).map((_, i) => {
    const n = NAMES[(i + ci * 2) % NAMES.length];
    const seed = (i * 7 + ci * 3) % 10;
    const sc = (k: number) => (Math.min(10, 5 + ((seed + k) % 6) + ((seed + k) % 2) * 0.5)).toFixed(1).replace(/\.0$/, "");
    const year = 2019 - (Number(lop[0]) - 3);
    return { id: `${lop}-${i}`, name: n, dob: `${String((i * 5 + ci) % 28 + 1).padStart(2, "0")}/${String((i + ci) % 12 + 1).padStart(2, "0")}/${year}`, khoi: lop[0], lop, gk1: sc(0), ck1: sc(1), gk2: sc(2), ck2: i === 5 ? "" : sc(3) };
  }),
);
const COLS: { key: ScoreKey; label: string }[] = [
  { key: "gk1", label: "Điểm GKI" }, { key: "ck1", label: "Điểm CKI" }, { key: "gk2", label: "Điểm GKII" }, { key: "ck2", label: "Điểm CKII" },
];

function ScoreTransferPage() {
  const account = useDemoAccount();
  const canEdit = account === "principal";
  const [rows, setRows] = useState(INITIAL);
  const [q, setQ] = useState("");
  const [khoi, setKhoi] = useState("all");
  const [lop, setLop] = useState("all");
  const [transferred, setTransferred] = useState<string | null>(null);

  const lopOptions = CLASSES.filter((c) => khoi === "all" || c[0] === khoi);
  const shown = useMemo(() => rows.filter((r) =>
    r.name.toLowerCase().includes(q.trim().toLowerCase()) && (khoi === "all" || r.khoi === khoi) && (lop === "all" || r.lop === lop)), [rows, q, khoi, lop]);
  const invalid = rows.some((r) => COLS.some((c) => !isValidScore(r[c.key])));

  const update = (id: string, key: ScoreKey, v: string) => {
    if (!/^\d{0,2}(\.\d?)?$/.test(v)) return; // only digits and one "." with max 1 decimal
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: v } : r)));
  };

  const exportExcel = () => downloadCsv("chuyen-diem-csdl.csv",
    ["STT", "Họ và tên học sinh", "Ngày sinh", "Khối", "Lớp", ...COLS.map((c) => c.label)],
    shown.map((r, i) => [i + 1, r.name, r.dob, r.khoi, r.lop, r.gk1, r.ck1, r.gk2, r.ck2]));

  const confirm = () => {
    if (invalid) { toast.error("Có điểm không hợp lệ. Điểm phải trong thang 0–10, tối đa 1 chữ số thập phân."); return; }
    setTransferred(new Date().toLocaleString("vi-VN"));
    toast.success(`Đã chuyển điểm của ${shown.length} học sinh sang CSDL.`);
  };

  return (
    <AppShell>
      <Toaster />
      <div className="p-6 space-y-4 text-[13px]">
        <div>
          <h1 className="text-lg font-semibold">Chuyển điểm thi sang CSDL</h1>
          <p className="text-muted-foreground">
            {canEdit ? "Ban giám hiệu có thể chỉnh sửa điểm trước khi xác nhận chuyển." : "Chỉ Ban giám hiệu được sửa điểm."} Điểm thang 0–10, tối đa 1 chữ số thập phân, dùng dấu "." (VD: 8.5).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-9" placeholder="Tìm tên học sinh" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={khoi} onValueChange={(v) => { setKhoi(v); setLop("all"); }}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khối</SelectItem>
              {["3", "4", "5"].map((k) => <SelectItem key={k} value={k}>Khối {k}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={lop} onValueChange={setLop}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {lopOptions.map((c) => <SelectItem key={c} value={c}>Lớp {c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4" />Xuất Excel</Button>
            <Button size="sm" onClick={confirm} disabled={!canEdit}><CheckCircle2 className="h-4 w-4" />Xác nhận</Button>
          </div>
        </div>
        {transferred && <p className="text-emerald-700">Đã chuyển điểm sang CSDL lúc {transferred}.</p>}
        <div className="rounded-lg border bg-card overflow-auto max-h-[70vh]">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted">
              <tr className="text-left">
                {["STT", "Họ và tên học sinh", "Ngày sinh", "Khối", "Lớp", ...COLS.map((c) => c.label)].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r, i) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-1.5">{i + 1}</td>
                  <td className="px-3 py-1.5 font-medium">{r.name}</td>
                  <td className="px-3 py-1.5">{r.dob}</td>
                  <td className="px-3 py-1.5">{r.khoi}</td>
                  <td className="px-3 py-1.5">{r.lop}</td>
                  {COLS.map((c) => {
                    const v = r[c.key];
                    const bad = !isValidScore(v);
                    return (
                      <td key={c.key} className="px-3 py-1.5">
                        {canEdit ? (
                          <Input inputMode="decimal" aria-label={`${c.label} ${r.name}`} value={v} onChange={(e) => update(r.id, c.key, e.target.value)}
                            className={`h-8 w-20 text-center ${bad ? "border-destructive text-destructive" : ""}`} title={bad ? "Điểm từ 0 đến 10, tối đa 1 chữ số thập phân" : undefined} />
                        ) : <span>{v || "–"}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan={9} className="px-3 py-6 text-center text-muted-foreground">Không có học sinh phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
