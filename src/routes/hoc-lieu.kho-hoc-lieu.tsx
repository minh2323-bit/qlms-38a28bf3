import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, ChevronDown, Plus, Building2, Globe2,
  FileText, Video, Music, FileBox, Code2, ClipboardList, PlayCircle, Type, Presentation,
  MoreVertical, Eye, Pencil, Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AddMaterialMenuItems, MaterialFormModal, MATERIAL_TYPE_LIST, type MaterialTypeKey,
} from "@/components/AddMaterialFlow";

export const Route = createFileRoute("/hoc-lieu/kho-hoc-lieu")({
  head: () => ({
    meta: [
      { title: "Kho học liệu – Học liệu & Bài kiểm tra | Tiểu học Tô Hiệu" },
      { name: "description", content: "Quản lý kho học liệu của giáo viên." },
    ],
  }),
  component: KhoHocLieuPage,
});

const MATERIAL_TYPES = MATERIAL_TYPE_LIST.map((t) => t.label);
type MaterialType = (typeof MATERIAL_TYPES)[number];

const TYPE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  "Nội dung thuần": { icon: Type, color: "text-slate-600", bg: "bg-slate-100" },
  "Video": { icon: Video, color: "text-rose-600", bg: "bg-rose-100" },
  "Video tương tác": { icon: PlayCircle, color: "text-indigo-600", bg: "bg-indigo-100" },
  "Âm thanh": { icon: Music, color: "text-amber-600", bg: "bg-amber-100" },
  "Tài liệu văn bản": { icon: FileText, color: "text-sky-600", bg: "bg-sky-100" },
  "Tài liệu": { icon: FileText, color: "text-sky-600", bg: "bg-sky-100" },
  "Slide/Bản trình chiếu": { icon: Presentation, color: "text-orange-600", bg: "bg-orange-100" },
  "Scorm": { icon: FileBox, color: "text-violet-600", bg: "bg-violet-100" },
  "IFrame": { icon: Code2, color: "text-emerald-600", bg: "bg-emerald-100" },
  "Bài kiểm tra": { icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-100" },
};

const KHOI_LIST = ["Lớp 3", "Lớp 4", "Lớp 5"];
const MON_BY_KHOI: Record<string, string[]> = {
  "Lớp 3": ["Toán", "Tiếng Việt"],
  "Lớp 4": ["Toán", "Tiếng Việt", "Khoa học"],
  "Lớp 5": ["Toán", "Tiếng Việt"],
};
const CHUONG_BY_MON: Record<string, string[]> = {
  "Lớp 3-Toán": ["Chương 1: Số tự nhiên", "Chương 2: Phép tính", "Chương 3: Phân số"],
  "Lớp 4-Toán": ["Chương 1: Số tự nhiên", "Chương 2: Phân số", "Chương 3: Số thập phân", "Chương 5: Tỉ số phần trăm", "Chương 6: Hình học"],
  "Lớp 4-Tiếng Việt": ["Chương 1: Đọc hiểu", "Chương 2: Luyện từ và câu", "Chương 3: Tập làm văn"],
  "Lớp 4-Khoa học": ["Chương 1: Con người và sức khỏe", "Chương 2: Vật chất và năng lượng"],
  "Lớp 5-Toán": ["Chương 1: Ôn tập", "Chương 2: Số thập phân"],
  "Lớp 5-Tiếng Việt": ["Chương 1: Đọc hiểu", "Chương 2: Tập làm văn"],
  "Lớp 3-Tiếng Việt": ["Chương 1: Đọc hiểu", "Chương 2: Tập làm văn"],
};

type Material = {
  id: string;
  ten: string;
  khoi: string;
  mon: string;
  chuDe: string;
  loai: MaterialType;
  thuocVe: string[];
  ngayTao: string;
  nguon: string;
};

const MATERIALS: Material[] = [
  { id: "1", ten: "Bài giảng dẫn nhập - Phân số", khoi: "Lớp 4", mon: "Toán", chuDe: "Phân số cơ bản", loai: "Nội dung thuần", thuocVe: ["BG: Học về phân số", "KH: Toán nâng cao 4"], ngayTao: "15/09/2025", nguon: "Phùng Thúy Hằng" },
  { id: "2", ten: "Video minh họa quy đồng mẫu số", khoi: "Lớp 4", mon: "Toán", chuDe: "Phân số cơ bản", loai: "Video", thuocVe: ["BG: Học về phân số"], ngayTao: "16/09/2025", nguon: "Hanoi Study" },
  { id: "3", ten: "Bài kiểm tra 15 phút - Phân số", khoi: "Lớp 4", mon: "Toán", chuDe: "Phân số cơ bản", loai: "Bài kiểm tra", thuocVe: ["BG: Học về phân số", "BG: Ôn tập giữa kỳ"], ngayTao: "17/09/2025", nguon: "Phùng Thúy Hằng" },
  { id: "4", ten: "Audio đọc mẫu - Tre Việt Nam", khoi: "Lớp 4", mon: "Tiếng Việt", chuDe: "Đọc hiểu văn bản", loai: "Âm thanh", thuocVe: ["BG: Đọc hiểu thơ ca"], ngayTao: "20/09/2025", nguon: "Trần Minh Khôi" },
  { id: "5", ten: "Tài liệu lý thuyết - Số thập phân", khoi: "Lớp 4", mon: "Toán", chuDe: "Số thập phân", loai: "Tài liệu", thuocVe: ["BG: Số thập phân", "KH: Toán nâng cao 4"], ngayTao: "22/09/2025", nguon: "Phùng Thúy Hằng" },
  { id: "6", ten: "Trò chơi tương tác - Hình học", khoi: "Lớp 4", mon: "Toán", chuDe: "Hình học phẳng", loai: "Video tương tác", thuocVe: ["BG: Hình học trực quan"], ngayTao: "25/09/2025", nguon: "Hanoi Study" },
  { id: "7", ten: "Bài Scorm - Đo lường", khoi: "Lớp 4", mon: "Toán", chuDe: "Đo lường", loai: "Scorm", thuocVe: ["BG: Đo lường và đơn vị đo"], ngayTao: "01/10/2025", nguon: "Kho học liệu Sở" },
  { id: "8", ten: "Khung iframe khảo sát đầu vào", khoi: "Lớp 4", mon: "Toán", chuDe: "Khảo sát", loai: "IFrame", thuocVe: ["KH: Toán nâng cao 4"], ngayTao: "05/10/2025", nguon: "Phùng Thúy Hằng" },
  { id: "9", ten: "Video bài giảng tỉ số phần trăm", khoi: "Lớp 4", mon: "Toán", chuDe: "Tỉ số phần trăm", loai: "Video", thuocVe: ["BG: Tỉ số phần trăm"], ngayTao: "10/10/2025", nguon: "Lê Thị Hoa" },
  { id: "10", ten: "Phiếu bài tập tập làm văn", khoi: "Lớp 4", mon: "Tiếng Việt", chuDe: "Tập làm văn miêu tả", loai: "Tài liệu", thuocVe: ["BG: Văn miêu tả"], ngayTao: "12/10/2025", nguon: "Trần Minh Khôi" },
];

function KhoHocLieuPage() {
  const [search, setSearch] = useState("");
  const [loai, setLoai] = useState<string>("");
  const [khoi, setKhoi] = useState("");
  const [mon, setMon] = useState("");
  const [chuDe, setChuDe] = useState("");

  const monOptions = khoi ? MON_BY_KHOI[khoi] ?? [] : [];
  const chuongOptions = khoi && mon ? CHUONG_BY_MON[`${khoi}-${mon}`] ?? [] : [];

  const filtered = MATERIALS.filter((m) => {
    if (search && !m.ten.toLowerCase().includes(search.toLowerCase())) return false;
    if (loai && m.loai !== loai) return false;
    if (khoi && m.khoi !== khoi) return false;
    if (mon && m.mon !== mon) return false;
    if (chuDe && m.chuDe !== chuDe) return false;
    return true;
  });

  return (
    <AppShell>
      <>
        {/* Filter row + action buttons on same row */}
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên học liệu"
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white w-72 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <FilterSelect value={loai} onChange={setLoai} placeholder="Loại học liệu" options={[...MATERIAL_TYPES]} />
            <FilterSelect
              value={khoi}
              onChange={(v) => { setKhoi(v); setMon(""); setChuDe(""); }}
              placeholder="Khối"
              options={KHOI_LIST}
            />
            {khoi && (
              <FilterSelect
                value={mon}
                onChange={(v) => { setMon(v); setChuDe(""); }}
                placeholder="Môn"
                options={monOptions}
              />
            )}
            {khoi && mon && (
              <FilterSelect
                value={chuDe}
                onChange={setChuDe}
                placeholder="Chương/Chủ đề"
                options={chuongOptions}
              />
            )}
            {(loai || khoi || mon || chuDe || search) && (
              <button
                onClick={() => { setSearch(""); setLoai(""); setKhoi(""); setMon(""); setChuDe(""); }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium ml-1"
              >
                Xóa lọc
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm">
              <Building2 className="h-4 w-4" /> Thêm từ Kho học liệu trường
            </button>
            <button className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm">
              <Globe2 className="h-4 w-4" /> Thêm từ Hanoi Study
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm">
                  <Plus className="h-4 w-4" /> Thêm học liệu mới
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {MATERIAL_TYPES.map((t, i) => {
                  const meta = TYPE_META[t];
                  const Icon = meta.icon;
                  return (
                    <DropdownMenuItem key={t} className="cursor-pointer gap-2">
                      <span className="text-slate-400 text-xs w-4">{i + 1}.</span>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                      <span>{t}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        {/* Table */}
        <section className="mt-4">
          <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-700 text-white text-left">
                  <th className="px-3 py-3 font-semibold w-14 text-center">STT</th>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">Tên học liệu</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Lớp - Môn</th>
                  <th className="px-4 py-3 font-semibold">Chủ đề</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Thể loại</th>
                  <th className="px-4 py-3 font-semibold min-w-[220px]">Thuộc bài giảng/Khóa học</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Ngày tạo</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">Nguồn/Tác giả</th>
                  <th className="px-4 py-3 font-semibold text-center w-28">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const meta = TYPE_META[m.loai];
                  const Icon = meta.icon;
                  return (
                    <tr key={m.id} className={`border-t border-slate-200 align-top ${i % 2 === 1 ? "bg-indigo-50/40" : "bg-white"}`}>
                      <td className="px-3 py-3 text-center text-slate-700 font-semibold">{i + 1}</td>
                      <td className="px-4 py-3">
                        <button className="font-semibold text-indigo-700 hover:text-indigo-900 text-left">
                          {m.ten}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{m.khoi} - {m.mon}</td>
                      <td className="px-4 py-3 text-slate-700">{m.chuDe}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {m.loai}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.thuocVe.length === 0 ? (
                          <span className="text-slate-400 italic text-xs">Chưa thuộc bài giảng nào</span>
                        ) : (
                          <ul className="space-y-1">
                            {m.thuocVe.map((t) => (
                              <li key={t} className="text-xs text-slate-700 bg-slate-100 inline-block mr-1 mb-1 px-2 py-0.5 rounded">
                                {t}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{m.ngayTao}</td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{m.nguon}</td>
                      <td className="px-4 py-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 inline-flex items-center justify-center">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2 text-sky-600" /> Xem trước
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil className="h-4 w-4 mr-2 text-indigo-600" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-rose-600">
                              <Trash2 className="h-4 w-4 mr-2" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-slate-500 text-sm">
                      Không tìm thấy học liệu phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </>
    </AppShell>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}
