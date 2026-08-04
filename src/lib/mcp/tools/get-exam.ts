import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getTest, getTestQuestions } from "@/lib/exam-store";
import { getMatrix } from "@/lib/matrix-store";

export default defineTool({
  name: "get_exam",
  title: "Get exam detail",
  description:
    "Get one demo exam by id, including its questions and the matrix (khung ma trận) it was generated from.",
  inputSchema: { id: z.string().describe('Exam id, e.g. "e1".') },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const test = getTest(id);
    if (!test) throw new ToolError(`No exam found with id "${id}".`);
    const questions = getTestQuestions(test);
    const matrix = test.matrixId ? getMatrix(test.matrixId) : undefined;
    const payload = { test, questions, matrix: matrix ?? null };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
