// Tiện ích xuất báo cáo (CSV / PDF in) dùng chung cho các bảng báo cáo DTI.
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function printPdf(title: string, header: string[], rows: (string | number)[][]) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<html><head><title>${title}</title><style>
    body{font-family:system-ui,sans-serif;padding:24px}
    h1{font-size:18px;margin-bottom:12px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th,td{border:1px solid #cbd5e1;padding:6px;text-align:center}
    th{background:#eef2ff}
  </style></head><body><h1>${title}</h1><table><thead><tr>${
    header.map((h) => `<th>${h}</th>`).join("")
  }</tr></thead><tbody>${
    rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")
  }</tbody></table></body></html>`);
  w.document.close();
  w.focus();
  w.print();
}
