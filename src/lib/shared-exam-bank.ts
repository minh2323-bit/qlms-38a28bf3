// Hằng số & tiện ích dùng chung cho Ngân hàng câu hỏi kỳ thi và Đề thi kỳ thi.
import { KNOWLEDGE_TREE } from "@/lib/knowledge-tree";

export type QType = "single" | "multiple" | "essay" | "truefalse" | "drag" | "fill" | "match" | "order";
export type Level = "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export const TYPE_LABEL: Record<QType, string> = {
  single: "Trắc nghiệm 1 đáp án",
  multiple: "Trắc nghiệm nhiều đáp án",
  essay: "Tự luận",
  truefalse: "Đúng - Sai",
  drag: "Kéo thả",
  fill: "Điền khuyết",
  match: "Nối",
  order: "Sắp xếp",
};

export const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export const LEVELS: Level[] = ["Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao"];
export const GRADES: string[] = ["1", "2", "3", "4", "5"];
export const SUBJECTS: string[] = ["Toán", "Tiếng Việt", "Tiếng Anh", "Tự nhiên và Xã hội", "Đạo đức"];

/** Giáo viên trong tổ chuyên môn của người dùng hiện tại */
export const PROPOSERS: string[] = [
  "Phùng Thúy Hằng",
  "Nguyễn Văn A",
  "Trần Thị Bích",
  "Lê Minh Châu",
  "Đỗ Quang Huy",
];

export function chapterTitle(id?: string) {
  return KNOWLEDGE_TREE.find((c) => c.id === id)?.title ?? "";
}

export function lessonTitle(chapId?: string, lesId?: string) {
  const ch = KNOWLEDGE_TREE.find((c) => c.id === chapId);
  return ch?.units.find((u) => u.id === lesId)?.title ?? "";
}

export function todayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
