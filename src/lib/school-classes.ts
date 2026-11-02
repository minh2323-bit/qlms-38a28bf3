import thumbLop3D from "../assets/thumb-lop-3d.jpg";
import thumbLop3B from "../assets/thumb-lop-3b.jpg";
import thumbLop3C from "../assets/thumb-lop-3c.jpg";
import thumbLop4C from "../assets/thumb-lop-4c.jpg";
import thumbLop4B from "../assets/thumb-lop-4b.jpg";
import thumbBoTuc from "../assets/thumb-bo-tuc-toan.jpg";
import thumbHsgAnh from "../assets/thumb-on-thi-hsg-anh.jpg";

type SchoolClass = {
  id: string; name: string; subject: string; thumb: string;
  baiGiang: number; hocLieu: number; hocSinh: number;
  status: "draft" | "deployed";
  teacher: string; createdAt: string; lop: string; code: string;
};

export const SCHOOL_PCCM: SchoolClass[] = [
  { id: "school-3d-tv", name: "Lớp 3D Năm học 2025 - 2026", subject: "Tiếng Việt", thumb: thumbLop3D, baiGiang: 15, hocLieu: 15, hocSinh: 40, status: "deployed", teacher: "Cô Nguyễn Thu Trang", createdAt: "05/09/2025", lop: "3D", code: "LH-3D-TV2526" },
  { id: "school-3b-english", name: "Lớp 3B Năm học 2025 - 2026", subject: "Tiếng Anh", thumb: thumbLop3B, baiGiang: 14, hocLieu: 16, hocSinh: 42, status: "draft", teacher: "Thầy Trần Minh Quân", createdAt: "06/09/2025", lop: "3B", code: "LH-3B-TA2526" },
  { id: "school-3c-science", name: "Lớp 3C Năm học 2025 - 2026", subject: "Khoa học", thumb: thumbLop3C, baiGiang: 13, hocLieu: 14, hocSinh: 39, status: "deployed", teacher: "Cô Lê Thị Mai", createdAt: "06/09/2025", lop: "3C", code: "LH-3C-KH2526" },
  { id: "school-4c-math", name: "Lớp 4C Năm học 2025 - 2026", subject: "Toán", thumb: thumbLop4C, baiGiang: 15, hocLieu: 15, hocSinh: 40, status: "deployed", teacher: "Cô Phùng Thuý Hằng", createdAt: "08/09/2025", lop: "4C", code: "LH-4C-T2526" },
  { id: "school-4b-it", name: "Lớp 4B Năm học 2025 - 2026", subject: "Tin học", thumb: thumbLop4B, baiGiang: 9, hocLieu: 12, hocSinh: 41, status: "deployed", teacher: "Thầy Phạm Quốc Anh", createdAt: "10/09/2025", lop: "4B", code: "LH-4B-TH2526" },
];

export const SCHOOL_SELF: SchoolClass[] = [
  { id: "school-remedial-math", name: "Lớp bổ túc học sinh Toán", subject: "Toán", thumb: thumbBoTuc, baiGiang: 6, hocLieu: 9, hocSinh: 25, status: "deployed", teacher: "Cô Phùng Thuý Hằng", createdAt: "12/10/2025", lop: "", code: "LH-BT-T2526" },
  { id: "school-advanced-english", name: "Lớp ôn thi học sinh giỏi Tiếng Anh", subject: "Tiếng Anh", thumb: thumbHsgAnh, baiGiang: 10, hocLieu: 14, hocSinh: 18, status: "draft", teacher: "Thầy Trần Minh Quân", createdAt: "20/10/2025", lop: "", code: "LH-HSG-TA2526" },
];

// Cards and detail pages resolve the same identity; self-created classes
// have no administrative class link unless one is explicitly supplied.
export const SCHOOL_CLASS_DB = Object.fromEntries(
  [...SCHOOL_PCCM, ...SCHOOL_SELF].map((c) => [c.id, {
    ...c,
    students: c.hocSinh,
    subjectsTaught: [c.subject],
    description: "",
  }]),
);