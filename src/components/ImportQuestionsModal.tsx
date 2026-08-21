import { useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";

const ACCEPT = ".doc,.docx,.pdf,.xls,.xlsx";

function download(name: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const WORD_TEMPLATE = `<html xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>
<h2>MẪU NHẬP CÂU HỎI</h2>
<p><i>Mỗi câu bắt đầu bằng "Câu n:", các đáp án A/B/C/D, dòng "Đáp án:" ghi phương án đúng.</i></p>
<p><b>Câu 1:</b> Số nào lớn nhất trong các số sau: 3 210, 3 120, 3 201, 3 102?</p>
<p>A. 3 210</p><p>B. 3 120</p><p>C. 3 201</p><p>D. 3 102</p>
<p>Đáp án: A</p><p>Mức độ: Nhận biết</p><p>Khối: 4 | Môn: Toán</p>
<p><b>Câu 2:</b> Chọn các phân số bằng 1/2:</p>
<p>A. 2/4</p><p>B. 3/6</p><p>C. 2/3</p><p>D. 5/10</p>
<p>Đáp án: A, B, D</p><p>Mức độ: Thông hiểu</p><p>Khối: 4 | Môn: Toán</p>
</body></html>`;

const EXCEL_TEMPLATE = [
  ["Câu hỏi", "Loại (single/multiple/essay/truefalse/fill)", "Mức độ", "Khối", "Môn", "Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D", "Đáp án đúng"],
  ["Số nào lớn nhất: 3 210, 3 120, 3 201, 3 102?", "single", "Nhận biết", "4", "Toán", "3 210", "3 120", "3 201", "3 102", "A"],
  ["Chọn các phân số bằng 1/2", "multiple", "Thông hiểu", "4", "Toán", "2/4", "3/6", "2/3", "5/10", "A,B,D"],
].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");

export function ImportQuestionsModal({
  onClose, onConfirm,
}: { onClose: () => void; onConfirm: (fileName: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f?: File | null) => {
    if (!f) return;
    const ok = /\.(docx?|pdf|xlsx?)$/i.test(f.name);
    if (!ok) { toast.error("Chỉ chấp nhận tệp Word, PDF hoặc Excel"); return; }
    setFile(f);
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Tải tệp từ thiết bị để thêm câu hỏi</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
              drag ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50"
            }`}
          >
            <UploadCloud className="h-10 w-10 mx-auto text-indigo-500" />
            <div className="mt-2 text-sm font-semibold text-slate-800">
              Kéo thả tệp vào đây hoặc bấm để chọn tệp
            </div>
            <div className="text-xs text-slate-500 mt-1">Hỗ trợ định dạng Word (.doc, .docx), PDF (.pdf), Excel (.xls, .xlsx)</div>
            <input
              ref={inputRef} type="file" accept={ACCEPT} className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm">
              <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
              <span className="font-medium text-slate-800 truncate flex-1">{file.name}</span>
              <span className="text-xs text-slate-500 shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-slate-400 hover:text-rose-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => download("Mau-cau-hoi.doc", WORD_TEMPLATE, "application/msword")}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Tải file word mẫu
            </button>
            <button
              onClick={() => download("Mau-cau-hoi.csv", "\uFEFF" + EXCEL_TEMPLATE, "text/csv;charset=utf-8")}
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" /> Tải file excel mẫu
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
            disabled={!file}
            onClick={() => file && onConfirm(file.name)}
          >
            <CheckCircle2 className="h-4 w-4" /> Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
