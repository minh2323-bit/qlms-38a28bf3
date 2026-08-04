import { defineMcp } from "@lovable.dev/mcp-js";
import listExams from "./tools/list-exams";
import getExam from "./tools/get-exam";
import listMatrices from "./tools/list-matrices";
import listCurriculum from "./tools/list-curriculum";

export default defineMcp({
  name: "qlms-mockup",
  title: "QLMS mockup",
  version: "0.1.0",
  instructions:
    "Read-only tools for the QLMS teaching-management demo app. Use `list_curriculum` to browse chapters and lessons, `list_exams` / `get_exam` for exams and their questions, and `list_matrices` for exam matrices.",
  tools: [listCurriculum, listExams, getExam, listMatrices],
});
