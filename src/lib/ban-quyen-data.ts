// Mock data cho Kho học liệu bản quyền dùng chung của trường/HanoiStudy.
export type BanQuyenSet = {
  id: string;
  title: string;
  subtitle: string;
  grade: string;   // "Khối 1".."Khối 5"
  subject: string; // "Toán", "Tiếng Việt"...
  publisher: string;
  learners: number;
  totalUnits: number;
  progress: number; // 0-100
  color: string;    // gradient tailwind classes for cover
};

export const BAN_QUYEN_SUBJECTS = [
  { key: "Tiếng Việt", label: "Tiếng Việt" },
  { key: "Toán", label: "Toán" },
  { key: "Đạo đức", label: "Đạo đức" },
  { key: "Tự nhiên và xã hội", label: "Tự nhiên và xã hội" },
  { key: "Công nghệ", label: "Công nghệ" },
  { key: "Tin học", label: "Tin học" },
  { key: "Tiếng Anh", label: "Tiếng Anh" },
  { key: "Mĩ thuật", label: "Mĩ thuật" },
  { key: "Âm nhạc", label: "Âm nhạc" },
];

export const BAN_QUYEN_GRADES = ["Khối 1", "Khối 2", "Khối 3", "Khối 4", "Khối 5"];

const COLORS = [
  "from-amber-400 to-orange-500",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-fuchsia-400 to-pink-600",
  "from-violet-400 to-indigo-600",
  "from-rose-400 to-red-500",
  "from-lime-400 to-green-600",
  "from-cyan-400 to-sky-600",
];

function make(id: string, subject: string, grade: string, i: number): BanQuyenSet {
  const gradeNum = grade.replace(/[^0-9]/g, "");
  return {
    id,
    title: `${subject} ${gradeNum} - Theo Chương trình GDPT`,
    subtitle: `Hướng dẫn cách phát âm và luyện kỹ năng theo bộ ${subject}`,
    grade,
    subject,
    publisher: ["Kết nối tri thức", "Cánh diều", "Chân trời sáng tạo"][i % 3],
    learners: 800 + (i * 37) % 500,
    totalUnits: 120 + (i * 11) % 90,
    progress: (i * 7) % 20,
    color: COLORS[(i + subject.length) % COLORS.length],
  };
}

export const BAN_QUYEN_SETS: BanQuyenSet[] = (() => {
  const out: BanQuyenSet[] = [];
  let n = 0;
  for (const g of BAN_QUYEN_GRADES) {
    for (const s of BAN_QUYEN_SUBJECTS) {
      // 1-2 sets/subject/grade
      out.push(make(`set-${n}`, s.key, g, n)); n++;
      if ((n % 3) === 0) { out.push(make(`set-${n}`, s.key, g, n)); n++; }
    }
  }
  return out;
})();

/* ==================== Nội dung / mục lục của 1 bộ ==================== */

export type BanQuyenMaterial = {
  id: string;
  title: string;
  kind: "video" | "questions" | "book" | "doc" | "audio";
};

export type BanQuyenSection = {
  id: string;
  title: string;
  materials: BanQuyenMaterial[];
};

export type BanQuyenLesson = {
  id: string;
  title: string;
  sections: BanQuyenSection[];
};

export type BanQuyenChapter = {
  id: string;
  title: string;
  lessons: BanQuyenLesson[];
};

const KINDS: BanQuyenMaterial["kind"][] = ["video", "questions", "book", "doc", "audio"];

function mkMaterials(prefix: string, count: number): BanQuyenMaterial[] {
  const titles = [
    "Đọc, viết các số trong phạm vi 1 000",
    "So sánh hai số",
    "Ôn tập về phép cộng, phép trừ trong phạm vi 1 000",
    "Ôn tập về hình học và đo lường",
    "Nhận biết đơn vị đo mi-li-mét",
    "Bộ câu hỏi luyện tập",
    "Sách bài tập điện tử",
  ];
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-m${i}`,
    title: titles[(i + prefix.length) % titles.length],
    kind: KINDS[(i + prefix.length) % KINDS.length],
  }));
}

export function getSetContent(_setId: string): BanQuyenChapter[] {
  // demo tree – reusable for any set
  const chapters: BanQuyenChapter[] = [];
  for (let c = 1; c <= 3; c++) {
    const lessons: BanQuyenLesson[] = [];
    for (let l = 1; l <= 6; l++) {
      const sections: BanQuyenSection[] = [
        { id: `c${c}l${l}s1`, title: "Ôn tập các số trong phạm vi 1 000", materials: mkMaterials(`c${c}l${l}s1`, 2) },
        { id: `c${c}l${l}s2`, title: "Ôn tập về phép cộng, phép trừ trong phạm vi 1 000", materials: mkMaterials(`c${c}l${l}s2`, 1) },
        { id: `c${c}l${l}s3`, title: "Ôn tập về hình học và đo lường", materials: mkMaterials(`c${c}l${l}s3`, 1) },
        { id: `c${c}l${l}s4`, title: "Mi-li-mét", materials: mkMaterials(`c${c}l${l}s4`, 2) },
      ];
      lessons.push({
        id: `c${c}l${l}`,
        title: [
          "Ôn tập các số đến 1000",
          "Ôn tập phép cộng, phép trừ trong phạm vi 1000",
          "Tìm thành phần trong phép cộng, phép trừ",
          "Ôn tập bảng nhân 2; 5, bảng chia 2; 5",
          "Bảng nhân 3, bảng chia 3",
          "Bảng nhân 4, bảng chia 4",
        ][l - 1],
        sections,
      });
    }
    chapters.push({ id: `c${c}`, title: `Chủ đề ${c}`, lessons });
  }
  return chapters;
}

export const KIND_META: Record<BanQuyenMaterial["kind"], { label: string; color: string; bg: string }> = {
  video:     { label: "Video",       color: "text-rose-600",    bg: "bg-rose-100" },
  questions: { label: "Bộ câu hỏi",  color: "text-violet-600",  bg: "bg-violet-100" },
  book:      { label: "Sách số",     color: "text-sky-600",     bg: "bg-sky-100" },
  doc:       { label: "Tài liệu",    color: "text-slate-600",   bg: "bg-slate-100" },
  audio:     { label: "Âm thanh",    color: "text-amber-600",   bg: "bg-amber-100" },
};
