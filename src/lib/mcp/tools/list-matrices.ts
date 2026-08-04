import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { listMatrices, matrixTotal } from "@/lib/matrix-store";

export default defineTool({
  name: "list_matrices",
  title: "List exam matrices",
  description: "List the demo exam matrices (khung ma trận đề) with their rows and total question count.",
  inputSchema: {
    grade: z.string().optional().describe('Grade filter, e.g. "4".'),
    subject: z.string().optional().describe('Subject filter, e.g. "Toán".'),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ grade, subject }) => {
    const items = listMatrices()
      .filter(
        (m) =>
          (!grade || String(m.grade) === grade) &&
          (!subject || String(m.subject).toLowerCase() === subject.toLowerCase()),
      )
      .map((m) => ({ ...m, totalQuestions: matrixTotal(m.rows) }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { items },
    };
  },
});
