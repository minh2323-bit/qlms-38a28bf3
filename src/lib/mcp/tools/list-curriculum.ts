import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getKnowledgeTree } from "@/lib/knowledge-tree";

export default defineTool({
  name: "list_curriculum",
  title: "List curriculum",
  description:
    "List the curriculum tree (chương/chủ đề và bài học) for a grade and subject in QLMS.",
  inputSchema: {
    grade: z.string().describe('Grade, e.g. "3" or "4".'),
    subject: z.string().describe('Subject, e.g. "Toán" or "Tiếng Việt".'),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ grade, subject }) => {
    const chapters = getKnowledgeTree(grade, subject);
    return {
      content: [{ type: "text", text: JSON.stringify(chapters, null, 2) }],
      structuredContent: { chapters },
    };
  },
});
