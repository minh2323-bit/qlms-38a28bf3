import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, KeyRound, RefreshCw, FileDown, Eye, EyeOff, X, UserPlus, UserMinus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/lop-hoc-so/$classId_/hoc-sinh")({
  head: () => ({
    meta: [
      { title: "Danh sách học sinh – LMS Giáo viên" },
      { name: "description", content: "Danh sách học sinh của lớp chủ nhiệm." },
    ],
  }),
  component: StudentsPage,
});

type Student = {
  stt: number;
  taiKhoan: string;
  hoTen: string;
  matKhau: string;
  gioiTinh: "Nam" | "Nữ";
  ngaySinh: string;
  lop: string;
  dienThoai: string;
};

const STUDENTS: Student[] = [
  { stt: 1, taiKhoan: "001319022540", hoTen: "Lê Bảo An",         matKhau: "0186820268", gioiTinh: "Nữ",  ngaySinh: "02/04/2019", lop: "4A", dienThoai: "0981236368" },
  { stt: 2, taiKhoan: "001219038735", hoTen: "Ngô Bảo An",         matKhau: "0167436665", gioiTinh: "Nam", ngaySinh: "23/07/2019", lop: "4A", dienThoai: "0986225708" },
  { stt: 3, taiKhoan: "001319047229", hoTen: "Phạm Phương Mỹ An",  matKhau: "0175034738", gioiTinh: "Nữ",  ngaySinh: "21/08/2019", lop: "4A", dienThoai: "0973725584" },
  { stt: 4, taiKhoan: "001219074235", hoTen: "Phạm Vũ Bình An",    matKhau: "0181772872", gioiTinh: "Nam", ngaySinh: "17/11/2019", lop: "4A", dienThoai: "0365457456" },
  { stt: 5, taiKhoan: "001319033769", hoTen: "Nguyễn Thị Hà Anh",  matKhau: "0169109095", gioiTinh: "Nữ",  ngaySinh: "09/06/2019", lop: "4A", dienThoai: "0974932286" },
  { stt: 6, taiKhoan: "001319015935", hoTen: "Phạm Linh Anh",      matKhau: "0167546873", gioiTinh: "Nữ",  ngaySinh: "17/03/2019", lop: "4A", dienThoai: "0398336453" },
  { stt: 7, taiKhoan: "001219046312", hoTen: "Trịnh Đức Thiên Ân", matKhau: "0181775183", gioiTinh: "Nam", ngaySinh: "31/08/2019", lop: "4A", dienThoai: "0972768194" },
  { stt: 8, taiKhoan: "001219075020", hoTen: "Ngô Bảo Bình",       matKhau: "0181773019", gioiTinh: "Nam", ngaySinh: "21/11/2019", lop: "4A", dienThoai: "0974346497" },
  { stt: 9, taiKhoan: "001319088100", hoTen: "Trần Khánh Chi",     matKhau: "0175000101", gioiTinh: "Nữ",  ngaySinh: "05/01/2019", lop: "4A", dienThoai: "0977111222" },
  { stt: 10, taiKhoan: "001219099210", hoTen: "Lê Minh Đức",       matKhau: "0175000102", gioiTinh: "Nam", ngaySinh: "12/02/2019", lop: "4A", dienThoai: "0977333444" },
];

// Digital classes that are linked to a real class (has "Đồng bộ tài khoản").
// c7 is "Lớp 4B, 4C, 4D" — a multi-class review class, not linked to a specific real class.
const CLASSES_WITH_REAL_LINK = new Set(["c1", "c2", "c3", "c4", "c5", "c6", "c8"]);

type PwOption = "manual" | "cccd" | "birthday" | "phone";

function StudentsPage() {
  const { classId } = Route.useParams();
  const navigate = useNavigate();
  const isHomeroom = classId === "c1" || classId === "c2";
  const hasRealClass = CLASSES_WITH_REAL_LINK.has(classId);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [pwOpen, setPwOpen] = useState(false);
  const [pwOption, setPwOption] = useState<PwOption>("manual");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [unregisterTarget, setUnregisterTarget] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return STUDENTS;
    return STUDENTS.filter((x) => x.hoTen.toLowerCase().includes(s));
  }, [q]);

  const allChecked = filtered.length > 0 && filtered.every((s) => selected.has(s.stt));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((s) => next.delete(s.stt));
    else filtered.forEach((s) => next.add(s.stt));
    setSelected(next);
  };
  const toggleOne = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const openResetPw = () => {
    if (selected.size === 0) {
      toast.error("Vui lòng chọn ít nhất 1 học sinh");
      return;
    }
    setPwOption("manual");
    setPw1(""); setPw2("");
    setPwOpen(true);
  };

  const confirmResetPw = () => {
    if (pwOption === "manual") {
      if (pw1.length < 8 || !/^[A-Za-z0-9]+$/.test(pw1)) {
        toast.error("Mật khẩu không hợp lệ. Tối thiểu 8 ký tự, chỉ chứa chữ hoặc số.");
        return;
      }
      if (pw1 !== pw2) {
        toast.error("Xác nhận mật khẩu không khớp");
        return;
      }
    }
    setPwOpen(false);
    toast.success(`Đã cấp lại mật khẩu cho ${selected.size} học sinh`);
  };

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <button
            onClick={() => navigate({ to: "/lop-hoc-so/$classId", params: { classId } })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại lớp học
          </button>
          <h1 className="mt-2 text-xl font-bold text-slate-800">Danh sách học sinh lớp 4A</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý tài khoản, mật khẩu và thông tin học sinh trong lớp chủ nhiệm.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
        {/* Top toolbar */}
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {hasRealClass && (
            <button
              onClick={() => toast.success("Đã đồng bộ tài khoản")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" /> Đồng bộ tài khoản
            </button>
          )}
          {isHomeroom && (
            <button
              onClick={openResetPw}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <KeyRound className="h-4 w-4" /> Cấp lại mật khẩu
            </button>
          )}
          <button
            onClick={() => toast.success("Đang xuất Excel…")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" /> Xuất excel
          </button>
        </div>

        {/* Search only */}
        <div className="mt-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm tên học sinh"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-sky-800 text-white">
                <th className="px-3 py-2 text-left font-semibold rounded-l-md">STT</th>
                <th className="px-3 py-2 text-left font-semibold">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                </th>
                <th className="px-3 py-2 text-left font-semibold">Tài khoản/CCCD</th>
                <th className="px-3 py-2 text-left font-semibold">Họ tên</th>
                <th className="px-3 py-2 text-left font-semibold">Mật khẩu khởi tạo</th>
                <th className="px-3 py-2 text-left font-semibold">Giới tính</th>
                <th className="px-3 py-2 text-left font-semibold">Ngày sinh</th>
                <th className="px-3 py-2 text-left font-semibold">Lớp</th>
                <th className="px-3 py-2 text-left font-semibold rounded-r-md">Điện thoại liên hệ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.stt} className="bg-slate-50/60 hover:bg-slate-100/60 border-b border-white">
                  <td className="px-3 py-2.5">{s.stt}</td>
                  <td className="px-3 py-2.5">
                    <input type="checkbox" checked={selected.has(s.stt)} onChange={() => toggleOne(s.stt)} />
                  </td>
                  <td className="px-3 py-2.5">{s.taiKhoan}</td>
                  <td className="px-3 py-2.5 font-medium text-slate-800">{s.hoTen}</td>
                  <td className="px-3 py-2.5">{s.matKhau}</td>
                  <td className="px-3 py-2.5">{s.gioiTinh}</td>
                  <td className="px-3 py-2.5">{s.ngaySinh}</td>
                  <td className="px-3 py-2.5">{s.lop}</td>
                  <td className="px-3 py-2.5">{s.dienThoai}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-400 italic">Không có học sinh nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4">
        <Link to="/lop-hoc-so/$classId" params={{ classId }} className="text-sm font-medium text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Quay lại chi tiết lớp
        </Link>
      </div>

      {/* Reset password modal */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">Cấp lại mật khẩu</DialogTitle>
          </DialogHeader>

          <div className="text-sm text-slate-700 space-y-1">
            <div>Chọn phương án cấp lại mật khẩu :</div>
            <div>+ Tự nhập → Nhập mật khẩu mới</div>
            <div>+ Số CCCD → Mật khẩu mới là số CCCD của học sinh</div>
            <div>+ Ngày sinh → Ví dụ: 02/03/2001 thì mật khẩu sẽ là 02032001</div>
            <div>+ Số điện thoại: Mật khẩu mới là số điện thoại của học sinh đã đăng ký</div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tùy chọn cấp mật khẩu</label>
            <select
              value={pwOption}
              onChange={(e) => setPwOption(e.target.value as PwOption)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="manual">Tự nhập</option>
              <option value="cccd">Số CCCD</option>
              <option value="birthday">Ngày sinh</option>
              <option value="phone">Số điện thoại</option>
            </select>
          </div>

          {pwOption === "manual" && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nhập mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPw1 ? "text" : "password"}
                    value={pw1}
                    onChange={(e) => setPw1(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button type="button" onClick={() => setShowPw1((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700">
                    {showPw1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-xs italic text-slate-500">
                  Mật khẩu mới phải bao gồm 8 ký tự . Bao gồm chữ hoặc số và không chứa ký tự đặc biệt
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPw2 ? "text" : "password"}
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button type="button" onClick={() => setShowPw2((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700">
                    {showPw2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              onClick={() => setPwOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              onClick={confirmResetPw}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Xác nhận
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
