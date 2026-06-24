export type KnowledgeUnit = { id: string; title: string; week: number };
export type KnowledgeChapter = { id: string; title: string; units: KnowledgeUnit[] };

export const KNOWLEDGE_TREE: KnowledgeChapter[] = [
  {
    id: "ch1", title: "Chương 1 – Số và phép tính",
    units: [
      { id: "u-tn", title: "Số tự nhiên & các phép tính với số tự nhiên", week: 1 },
      { id: "u-ps", title: "Phân số", week: 1 },
      { id: "u-stp", title: "Số thập phân", week: 2 },
      { id: "u-sstp", title: "So sánh các số thập phân", week: 2 },
      { id: "u-lt", title: "Làm tròn số thập phân", week: 2 },
      { id: "u-pct", title: "Các phép tính với số thập phân", week: 3 },
      { id: "u-tsl", title: "Tỉ số. Tỉ số phần trăm", week: 3 },
    ],
  },
  {
    id: "ch2", title: "Chương 2 – Hình học & Đo lường",
    units: [
      { id: "u-hh", title: "Hình học trực quan", week: 3 },
      { id: "u-dl", title: "Đo lường", week: 3 },
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
