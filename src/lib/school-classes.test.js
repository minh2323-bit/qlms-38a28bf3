import { describe, expect, test } from "bun:test";
import { SCHOOL_CLASS_DB, SCHOOL_PCCM, SCHOOL_SELF } from "./school-classes";

describe("school class navigation identities", () => {
  const cards = [...SCHOOL_PCCM, ...SCHOOL_SELF];

  test("every school class has a distinct ID separate from teacher classes", () => {
    expect(cards).toHaveLength(7);
    expect(new Set(cards.map((c) => c.id)).size).toBe(7);
    for (const card of cards) {
      expect(["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"]).not.toContain(card.id);
    }
  });

  for (const card of cards) {
    test(`${card.id} resolves to matching detail metadata`, () => {
      expect(SCHOOL_CLASS_DB[card.id]).toMatchObject({
        id: card.id, name: card.name, teacher: card.teacher,
        subject: card.subject, subjectsTaught: [card.subject],
        students: card.hocSinh, status: card.status, thumb: card.thumb,
      });
    });
  }

  test("4B Tin học does not resolve to the principal's 4A", () => {
    expect(SCHOOL_CLASS_DB["school-4b-it"]).toMatchObject({
      name: "Lớp 4B Năm học 2025 - 2026", subject: "Tin học",
      teacher: "Thầy Phạm Quốc Anh", students: 41,
    });
  });

  test("self-created classes do not inherit a review class's administrative link", () => {
    for (const card of SCHOOL_SELF) expect(SCHOOL_CLASS_DB[card.id]?.lop).toBe("");
  });
});