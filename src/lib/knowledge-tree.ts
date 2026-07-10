// Cây kiến thức môn Toán – Tiểu học (Chương trình GDPT 2018)
// Cấu trúc bám theo Học liệu số HCM (hoclieuso.hcm.edu.vn): các mạch kiến thức.
// Dùng chung cho: Lịch báo giảng, Lớp học số (Add học liệu/bài giảng), Học liệu.

export type KnowledgeUnit = { id: string; title: string; week: number };
export type KnowledgeChapter = { id: string; title: string; units: KnowledgeUnit[] };

/** Tree mặc định trang chủ (Khối 4 – Toán) — giữ lại export cũ để tương thích. */
export const KNOWLEDGE_TREE: KnowledgeChapter[] = [
  {
    id: "ch1",
    title: "Số và Phép tính – Số tự nhiên",
    units: [
      { id: "u1-onso",       title: "Ôn tập các số đến 100 000",                   week: 1 },
      { id: "u1-sotunhien",  title: "Số có nhiều chữ số. Hàng và lớp",             week: 1 },
      { id: "u1-sosanh",     title: "So sánh các số tự nhiên",                     week: 1 },
      { id: "u1-lamtron",    title: "Làm tròn số tự nhiên",                        week: 2 },
      { id: "u2-cong",       title: "Phép cộng số tự nhiên",                       week: 2 },
      { id: "u2-tru",        title: "Phép trừ số tự nhiên",                        week: 2 },
      { id: "u2-tinhchat",   title: "Tính chất giao hoán & kết hợp của phép cộng", week: 3 },
      { id: "u2-nhan",       title: "Phép nhân số tự nhiên",                       week: 3 },
      { id: "u2-chia",       title: "Phép chia số tự nhiên",                       week: 3 },
      { id: "u2-bieuthuc",   title: "Biểu thức có chứa chữ",                       week: 3 },
      { id: "u2-trungbinh",  title: "Tìm số trung bình cộng",                      week: 3 },
      { id: "u2-tonghieu",   title: "Tìm hai số khi biết tổng và hiệu",            week: 4 },
    ],
  },
  {
    id: "ch2",
    title: "Số và Phép tính – Phân số",
    units: [
      { id: "u3-khainiem",   title: "Khái niệm phân số",                           week: 4 },
      { id: "u3-tinhchat",   title: "Tính chất cơ bản của phân số",                week: 4 },
      { id: "u3-rutgon",     title: "Rút gọn phân số",                             week: 5 },
      { id: "u3-quydong",    title: "Quy đồng mẫu số các phân số",                 week: 5 },
      { id: "u3-sosanh",     title: "So sánh các phân số",                         week: 5 },
      { id: "u4-cong",       title: "Phép cộng phân số",                           week: 6 },
      { id: "u4-tru",        title: "Phép trừ phân số",                            week: 6 },
      { id: "u4-nhan",       title: "Phép nhân phân số",                           week: 6 },
      { id: "u4-chia",       title: "Phép chia phân số",                           week: 7 },
    ],
  },
  {
    id: "ch3",
    title: "Hình học và Đo lường",
    units: [
      { id: "u5-goc",        title: "Góc nhọn, góc tù, góc bẹt",                   week: 7 },
      { id: "u5-vuonggoc",   title: "Hai đường thẳng vuông góc",                   week: 7 },
      { id: "u5-songsong",   title: "Hai đường thẳng song song",                   week: 8 },
      { id: "u5-binhhanh",   title: "Hình bình hành",                              week: 8 },
      { id: "u5-thoi",       title: "Hình thoi",                                   week: 8 },
      { id: "u6-dm2",        title: "Đề-xi-mét vuông, mét vuông",                  week: 9 },
      { id: "u6-km2",        title: "Ki-lô-mét vuông",                             week: 9 },
      { id: "u1-yentata",    title: "Yến, tạ, tấn",                                week: 9 },
      { id: "u1-giaythoiki", title: "Giây – Thế kỉ",                               week: 9 },
      { id: "u6-khoiluong",  title: "Đơn vị đo khối lượng (ôn tập)",               week: 9 },
      { id: "u6-thoigian",   title: "Đơn vị đo thời gian (ôn tập)",                week: 9 },
    ],
  },
  {
    id: "ch4",
    title: "Một số yếu tố Thống kê và Xác suất",
    units: [
      { id: "u7-dayso",      title: "Dãy số liệu thống kê",                        week: 10 },
      { id: "u7-bieudo",     title: "Biểu đồ cột",                                 week: 10 },
      { id: "u7-xacsuat",    title: "Sự kiện chắc chắn, có thể, không thể",        week: 10 },
    ],
  },
];

/** Cây kiến thức Khối 3 – Toán. */
export const KNOWLEDGE_TREE_G3: KnowledgeChapter[] = [
  {
    id: "g3-ch1",
    title: "Ôn tập và bổ sung",
    units: [
      { id: "g3-u1-onso",       title: "Ôn tập các số trong phạm vi 1 000",          week: 1 },
      { id: "g3-u1-oncongtru",  title: "Ôn tập phép cộng, phép trừ trong phạm vi 1 000", week: 1 },
      { id: "g3-u1-onnhanchia", title: "Ôn tập phép nhân, phép chia",                 week: 1 },
      { id: "g3-u1-bieuthuc",   title: "Tính giá trị của biểu thức số",               week: 2 },
    ],
  },
  {
    id: "g3-ch2",
    title: "Bảng nhân, bảng chia",
    units: [
      { id: "g3-u2-bn6",   title: "Bảng nhân 6",                week: 2 },
      { id: "g3-u2-bn7",   title: "Bảng nhân 7",                week: 2 },
      { id: "g3-u2-bn8",   title: "Bảng nhân 8",                week: 3 },
      { id: "g3-u2-bn9",   title: "Bảng nhân 9",                week: 3 },
      { id: "g3-u2-bc6",   title: "Bảng chia 6",                week: 3 },
      { id: "g3-u2-bc7",   title: "Bảng chia 7",                week: 3 },
      { id: "g3-u2-bc8",   title: "Bảng chia 8",                week: 4 },
      { id: "g3-u2-bc9",   title: "Bảng chia 9",                week: 4 },
      { id: "g3-u2-modong",title: "Mô-đun gấp, giảm một số đi nhiều lần", week: 4 },
    ],
  },
  {
    id: "g3-ch3",
    title: "Các số trong phạm vi 10 000 – 100 000",
    units: [
      { id: "g3-u3-10000",   title: "Các số trong phạm vi 10 000",              week: 5 },
      { id: "g3-u3-100000",  title: "Các số trong phạm vi 100 000",             week: 5 },
      { id: "g3-u3-sosanh",  title: "So sánh các số trong phạm vi 100 000",     week: 5 },
      { id: "g3-u3-lamtron", title: "Làm tròn số đến hàng chục, hàng trăm",     week: 6 },
    ],
  },
  {
    id: "g3-ch4",
    title: "Cộng, trừ, nhân, chia trong phạm vi 100 000",
    units: [
      { id: "g3-u4-cong",   title: "Phép cộng trong phạm vi 100 000",            week: 6 },
      { id: "g3-u4-tru",    title: "Phép trừ trong phạm vi 100 000",             week: 6 },
      { id: "g3-u4-nhan",   title: "Nhân số có nhiều chữ số với số có một chữ số", week: 7 },
      { id: "g3-u4-chia",   title: "Chia số có nhiều chữ số cho số có một chữ số", week: 7 },
      { id: "g3-u4-tinhgt", title: "Tính giá trị của biểu thức",                 week: 7 },
      { id: "g3-u4-tdang",  title: "Tìm thành phần chưa biết của phép tính",     week: 8 },
    ],
  },
  {
    id: "g3-ch5",
    title: "Hình học và Đo lường",
    units: [
      { id: "g3-u5-diem",     title: "Điểm, đoạn thẳng, đường thẳng",            week: 8 },
      { id: "g3-u5-gocvuong", title: "Góc vuông, góc không vuông",               week: 8 },
      { id: "g3-u5-tamgiac",  title: "Hình tam giác, hình tứ giác",              week: 9 },
      { id: "g3-u5-cnhat",    title: "Hình chữ nhật, hình vuông",                week: 9 },
      { id: "g3-u5-chuvi",    title: "Chu vi hình chữ nhật, hình vuông",         week: 9 },
      { id: "g3-u5-dientich", title: "Diện tích hình chữ nhật, hình vuông",      week: 9 },
      { id: "g3-u5-mm",       title: "Mi-li-mét",                                week: 9 },
      { id: "g3-u5-gam",      title: "Gam",                                      week: 9 },
      { id: "g3-u5-lit",      title: "Mi-li-lít",                                week: 9 },
      { id: "g3-u5-nhietdo",  title: "Nhiệt độ",                                 week: 9 },
      { id: "g3-u5-tien",     title: "Tiền Việt Nam",                            week: 9 },
      { id: "g3-u5-thoigian", title: "Đơn vị đo thời gian",                      week: 9 },
    ],
  },
  {
    id: "g3-ch6",
    title: "Một số yếu tố Thống kê và Xác suất",
    units: [
      { id: "g3-u6-thuthap",  title: "Thu thập, phân loại, ghi chép số liệu",    week: 10 },
      { id: "g3-u6-bangso",   title: "Bảng số liệu thống kê",                    week: 10 },
      { id: "g3-u6-xacsuat",  title: "Sự kiện chắc chắn, có thể, không thể",     week: 10 },
    ],
  },
];

/** Cây kiến thức Khối 4 – Tiếng Việt (Kết nối tri thức). */
export const KNOWLEDGE_TREE_TV4: KnowledgeChapter[] = [
  {
    id: "tv4-ch1",
    title: "Chủ đề 1: Mỗi người một vẻ",
    units: [
      { id: "tv4-b1",  title: "Bài 1: Điều kì diệu – Danh từ – Đoạn văn và câu chủ đề", week: 1 },
      { id: "tv4-b2",  title: "Bài 2: Thi nhạc – Đoạn văn nêu ý kiến – Tôi và bạn",     week: 1 },
      { id: "tv4-b3",  title: "Bài 3: Anh em sinh đôi – Danh từ chung, danh từ riêng",   week: 2 },
      { id: "tv4-b4",  title: "Bài 4: Công chúa và người dẫn chuyện – Đọc mở rộng",     week: 2 },
      { id: "tv4-b5",  title: "Bài 5: Thần lằn xanh và tắc kè – Luyện tập về danh từ",  week: 3 },
      { id: "tv4-b6",  title: "Bài 6: Nghệ sĩ trống – Báo cáo thảo luận nhóm – Bốn anh tài", week: 3 },
      { id: "tv4-b7",  title: "Bài 7: Những bức chân dung – Quy tắc viết tên cơ quan, tổ chức", week: 4 },
      { id: "tv4-b8",  title: "Bài 8: Ôn tập giữa học kì I",                              week: 4 },
    ],
  },
  {
    id: "tv4-ch2",
    title: "Chủ đề 2: Trải nghiệm và khám phá",
    units: [
      { id: "tv4-b9",  title: "Bài 9: Bầu trời trong quả trứng – Động từ – Bài văn thuật lại một sự việc", week: 5 },
      { id: "tv4-b10", title: "Bài 10: Tiếng nói của cỏ cây – Trải nghiệm đáng nhớ",   week: 5 },
      { id: "tv4-b11", title: "Bài 11: Tập làm văn – Luyện tập về động từ – Viết bài văn thuật lại một sự việc", week: 6 },
    ],
  },
];

/** Map nhãn Khối/Môn → key chuẩn. */
function normalizeGrade(grade: string | number): string {
  return String(grade).replace(/[^0-9]/g, "");
}
function normalizeSubject(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("toán") || s === "toan") return "toan";
  if (s.includes("tiếng việt") || s === "tv") return "tv";
  return s;
}

/** Trả về cây kiến thức theo khối + môn. */
export function getKnowledgeTree(grade: string | number, subject: string): KnowledgeChapter[] {
  const g = normalizeGrade(grade);
  const s = normalizeSubject(subject);
  if (s === "toan") {
    if (g === "4") return KNOWLEDGE_TREE;
    if (g === "3") return KNOWLEDGE_TREE_G3;
    return [];
  }
  if (s === "tv") {
    if (g === "4") return KNOWLEDGE_TREE_TV4;
    return [];
  }
  return [];
}

/** Helper cho lớp học (truyền "4A"/"3D" và "Toán"). */
export function getTreeForClass(classLop: string, subject: string): KnowledgeChapter[] {
  return getKnowledgeTree(normalizeGrade(classLop), subject);
}

/** Tổng hợp tất cả cây để tra cứu cross-grade. */
const ALL_TREES: KnowledgeChapter[][] = [KNOWLEDGE_TREE, KNOWLEDGE_TREE_G3, KNOWLEDGE_TREE_TV4];


export function getUnit(unitId: string): KnowledgeUnit | undefined {
  for (const tree of ALL_TREES) {
    for (const ch of tree) {
      const u = ch.units.find((u) => u.id === unitId);
      if (u) return u;
    }
  }
  return undefined;
}

export function getUnitTitle(unitId: string): string {
  return getUnit(unitId)?.title ?? unitId;
}

export function getChapterOfUnit(unitId: string): KnowledgeChapter | undefined {
  for (const tree of ALL_TREES) {
    const ch = tree.find((ch) => ch.units.some((u) => u.id === unitId));
    if (ch) return ch;
  }
  return undefined;
}

export function getChapterTitle(unitId: string): string {
  return getChapterOfUnit(unitId)?.title ?? "";
}
