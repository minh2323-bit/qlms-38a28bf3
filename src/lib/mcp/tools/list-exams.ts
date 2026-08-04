import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { listTests } from "@/lib/exam-store";

export default defineTool({
  name: "list_exams",
  title: "List exams",
  description:
    "List the demo exams (đề kiểm tra) in QLMS, optionally filtered by grade (khối) or subject (môn).",
  inputSchema: {
    grade: z.string().optional().describe('Grade filter, e.g. "3" or "4".'),
    subject: z.string().optional().describe('Subject filter, e.g. "Toán".'),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ grade, subject }) => {
    const items = listTests().filter(
      (t) =>
        (!grade || t.grade === grade) &&
        (!subject || t.subject.toLowerCase() === subject.toLowerCase()),
    );
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { items },
    };
  },
});
