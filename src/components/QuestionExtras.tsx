import type { QuestionDraft } from "@/components/QuestionFormModal";

/** Các trường đáp án bổ sung của những dạng câu hỏi mới, lưu kèm câu hỏi trong ngân hàng. */
export type QuestionExtras = Pick<
  QuestionDraft,
  | "explain"
  | "shortAnswers"
  | "caseSensitive"
  | "dragAnswers"
  | "dragDistractors"
  | "fillAnswers"
  | "pairs"
  | "orderItems"
  | "orderLayout"
> & {
  /** Nội dung đầy đủ của câu hỏi khi dạng câu hỏi có tiêu đề riêng (Kéo thả / Điền khuyết) */
  body?: string;
};

/** Lấy toàn bộ dữ liệu đáp án mở rộng từ popup thêm mới câu hỏi. */
export function draftExtras(d: QuestionDraft): QuestionExtras {
  return {
    body: d.title ? d.content : undefined,
    explain: d.explain || undefined,
    shortAnswers: d.shortAnswers,
    caseSensitive: d.caseSensitive,
    dragAnswers: d.dragAnswers,
    dragDistractors: d.dragDistractors,
    fillAnswers: d.fillAnswers,
    pairs: d.pairs,
    orderItems: d.orderItems,
    orderLayout: d.orderLayout,
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</div>
      {children}
    </div>
  );
}

function Row({ label, text, tone = "default" }: { label?: string; text: string; tone?: "default" | "ok" | "muted" }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : tone === "muted"
        ? "bg-slate-50 text-slate-600"
        : "bg-white text-slate-700";
  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${cls}`}>
      {label && <span className="font-semibold min-w-6">{label}</span>}
      <span className="flex-1">{text}</span>
    </div>
  );
}

/** Hiển thị nội dung & đáp án của các dạng câu hỏi mới trong popup xem chi tiết. */
export function QuestionExtraDetails({ q }: { q: QuestionExtras }) {
  return (
    <>
      {q.body && (
        <div className="rounded-lg bg-slate-50 border p-3 text-sm text-slate-800 whitespace-pre-line">{q.body}</div>
      )}

      {q.shortAnswers?.length ? (
        <Block title={`Câu trả lời được chấp nhận${q.caseSensitive ? " (phân biệt hoa/thường)" : ""}`}>
          {q.shortAnswers.map((a, i) => <Row key={i} label={`${i + 1}.`} text={a} tone="ok" />)}
        </Block>
      ) : null}

      {q.fillAnswers?.length ? (
        <Block title="Đáp án các chỗ trống">
          {q.fillAnswers.map((g, i) => <Row key={i} label={`(${i + 1})`} text={g.join(" / ")} tone="ok" />)}
        </Block>
      ) : null}

      {q.dragAnswers?.length ? (
        <Block title="Đáp án đúng">
          {q.dragAnswers.map((a, i) => <Row key={i} label={`(${i + 1})`} text={a} tone="ok" />)}
        </Block>
      ) : null}

      {q.dragDistractors?.length ? (
        <Block title="Đáp án nhiễu">
          {q.dragDistractors.map((a, i) => <Row key={i} text={a} tone="muted" />)}
        </Block>
      ) : null}

      {q.pairs?.length ? (
        <Block title="Các cặp nối">
          {q.pairs.map((p, i) => <Row key={i} label={`${i + 1}.`} text={`${p.left}  →  ${p.right}`} tone="ok" />)}
        </Block>
      ) : null}

      {q.orderItems?.length ? (
        <Block title={`Thứ tự đúng${q.orderLayout === "horizontal" ? " (hàng ngang)" : ""}`}>
          {q.orderItems.map((o, i) => <Row key={i} label={`${i + 1}.`} text={o} tone="ok" />)}
        </Block>
      ) : null}

      {q.explain && (
        <Block title="Giải thích">
          <div className="rounded-md border bg-white px-3 py-2 text-sm text-slate-700 whitespace-pre-line">{q.explain}</div>
        </Block>
      )}
    </>
  );
}
