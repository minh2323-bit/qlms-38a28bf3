/**
 * Quyền hạn giáo viên (mock – dùng cho demo UI).
 * - "teacher": GV thường → lớp tạo ra mặc định theo môn PCCM của GV
 * - "leader": Tổ trưởng chuyên môn → chọn được toàn bộ môn của trường + thêm GV phụ trách (trong tổ)
 * - "principal": Ban giám hiệu → toàn quyền, chọn GV toàn trường
 */
export type TeacherRank = "teacher" | "leader" | "principal";

export const CURRENT_TEACHER = {
  id: "gv-hoa",
  name: "Cô Nguyễn Thị Hoa",
  rank: "leader" as TeacherRank,
  /** Môn được phân công chuyên môn (PCCM) */
  pccm: ["Toán", "Tiếng Việt"],
  /** Tổ chuyên môn */
  team: "Tổ Tiểu học 1",
};

export const isLeaderOrAbove = (rank: TeacherRank = CURRENT_TEACHER.rank) =>
  rank === "leader" || rank === "principal";

/** Toàn bộ môn học của trường */
export const SCHOOL_SUBJECTS = [
  "Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học",
  "Lịch sử & Địa lí", "Đạo đức", "Tin học", "Công nghệ",
  "Âm nhạc", "Mĩ thuật", "Giáo dục thể chất", "HĐ trải nghiệm",
];

export type TeacherOption = { id: string; name: string; team: string; subject: string };

export const SCHOOL_TEACHERS: TeacherOption[] = [
  { id: "gv-hang", name: "Cô Phùng Thuý Hằng", team: "Tổ Tiểu học 1", subject: "Toán" },
  { id: "gv-mai", name: "Cô Lê Thị Mai", team: "Tổ Tiểu học 1", subject: "Khoa học" },
  { id: "gv-quan", name: "Thầy Trần Minh Quân", team: "Tổ Tiểu học 1", subject: "Tiếng Anh" },
  { id: "gv-nam", name: "Thầy Đỗ Văn Nam", team: "Tổ Tiểu học 2", subject: "Lịch sử & Địa lí" },
  { id: "gv-hanh", name: "Cô Bùi Thị Hạnh", team: "Tổ Tiểu học 2", subject: "Đạo đức" },
  { id: "gv-anh", name: "Thầy Phạm Quốc Anh", team: "Tổ Tiểu học 2", subject: "Tin học" },
  { id: "gv-ngoc", name: "Cô Vũ Bích Ngọc", team: "Tổ Năng khiếu", subject: "Âm nhạc" },
  { id: "gv-thao", name: "Cô Trần Thanh Thảo", team: "Tổ Năng khiếu", subject: "Mĩ thuật" },
];

/** GV có thể được thêm làm phụ trách theo quyền hạn hiện tại */
export function assignableTeachers(rank: TeacherRank = CURRENT_TEACHER.rank): TeacherOption[] {
  if (rank === "principal") return SCHOOL_TEACHERS;
  if (rank === "leader") return SCHOOL_TEACHERS.filter((t) => t.team === CURRENT_TEACHER.team);
  return [];
}
