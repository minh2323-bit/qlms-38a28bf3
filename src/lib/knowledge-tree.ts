// Cây kiến thức môn Toán – Lớp 4 (Chương trình GDPT 2018)
// Dùng chung cho: Lịch báo giảng, Lớp học số (Add học liệu/bài giảng), Học liệu.

export type KnowledgeUnit = { id: string; title: string; week: number };
export type KnowledgeChapter = { id: string; title: string; units: KnowledgeUnit[] };

export const KNOWLEDGE_TREE: KnowledgeChapter[] = [
  {
    id: "ch1",
    title: "Chương 1 – Số tự nhiên",
    units: [
      { id: "u1-onso",       title: "Ôn tập các số đến 100 000",        week: 1 },
      { id: "u1-sotunhien",  title: "Số có nhiều chữ số. Hàng và lớp",  week: 1 },
      { id: "u1-sosanh",     title: "So sánh các số tự nhiên",          week: 1 },
      { id: "u1-lamtron",    title: "Làm tròn số tự nhiên",             week: 2 },
      { id: "u1-yentata",    title: "Yến, tạ, tấn",                     week: 2 },
      { id: "u1-giaythoiki", title: "Giây – Thế kỉ",                    week: 2 },
    ],
  },
  {
    id: "ch2",
    title: "Chương 2 – Bốn phép tính với số tự nhiên",
    units: [
      { id: "u2-cong",       title: "Phép cộng số tự nhiên",                 week: 2 },
      { id: "u2-tru",        title: "Phép trừ số tự nhiên",                  week: 2 },
      { id: "u2-tinhchat",   title: "Tính chất giao hoán & kết hợp",         week: 3 },
      { id: "u2-nhan",       title: "Phép nhân số tự nhiên",                 week: 3 },
      { id: "u2-chia",       title: "Phép chia số tự nhiên",                 week: 3 },
      { id: "u2-trungbinh",  title: "Tìm số trung bình cộng",                week: 3 },
      { id: "u2-tonghieu",   title: "Tìm hai số khi biết tổng và hiệu",      week: 4 },
    ],
  },
  {
    id: "ch3",
    title: "Chương 3 – Phân số",
    units: [
      { id: "u3-khainiem",   title: "Khái niệm phân số",                     week: 4 },
      { id: "u3-tinhchat",   title: "Tính chất cơ bản của phân số",          week: 4 },
      { id: "u3-rutgon",     title: "Rút gọn phân số",                       week: 5 },
      { id: "u3-quydong",    title: "Quy đồng mẫu số các phân số",           week: 5 },
      { id: "u3-sosanh",     title: "So sánh các phân số",                   week: 5 },
    ],
  },
  {
    id: "ch4",
    title: "Chương 4 – Các phép tính với phân số",
    units: [
      { id: "u4-cong",       title: "Phép cộng phân số",                     week: 6 },
      { id: "u4-tru",        title: "Phép trừ phân số",                      week: 6 },
      { id: "u4-nhan",       title: "Phép nhân phân số",                     week: 6 },
      { id: "u4-chia",       title: "Phép chia phân số",                     week: 7 },
    ],
  },
  {
    id: "ch5",
    title: "Chương 5 – Hình học",
    units: [
      { id: "u5-goc",        title: "Góc nhọn, góc tù, góc bẹt",             week: 7 },
      { id: "u5-vuonggoc",   title: "Hai đường thẳng vuông góc",             week: 7 },
      { id: "u5-songsong",   title: "Hai đường thẳng song song",             week: 8 },
      { id: "u5-binhhanh",   title: "Hình bình hành",                        week: 8 },
      { id: "u5-thoi",       title: "Hình thoi",                             week: 8 },
    ],
  },
  {
    id: "ch6",
    title: "Chương 6 – Đo lường",
    units: [
      { id: "u6-dm2",        title: "Đề-xi-mét vuông, mét vuông",            week: 9 },
      { id: "u6-km2",        title: "Ki-lô-mét vuông",                       week: 9 },
      { id: "u6-khoiluong",  title: "Đơn vị đo khối lượng (ôn tập)",         week: 9 },
      { id: "u6-thoigian",   title: "Đơn vị đo thời gian (ôn tập)",          week: 9 },
    ],
  },
];

export function getUnit(unitId: string): KnowledgeUnit | undefined {
  for (const ch of KNOWLEDGE_TREE) {
    const u = ch.units.find((u) => u.id === unitId);
    if (u) return u;
  }
  return undefined;
}

export function getUnitTitle(unitId: string): string {
  return getUnit(unitId)?.title ?? unitId;
}

export function getChapterOfUnit(unitId: string): KnowledgeChapter | undefined {
  return KNOWLEDGE_TREE.find((ch) => ch.units.some((u) => u.id === unitId));
}

export function getChapterTitle(unitId: string): string {
  return getChapterOfUnit(unitId)?.title ?? "";
}
