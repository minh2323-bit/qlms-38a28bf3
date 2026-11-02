import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

export function ExamSelect({ label, value, onChange, options, disabled }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; disabled?: boolean }) {
  return <div className="min-w-0 space-y-1.5"><Label>{label}</Label><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger aria-label={label}><SelectValue placeholder="Chọn" /></SelectTrigger><SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>;
}
export function ExamInput({ label, value, onChange, type = "text", disabled }: { label: string; value: string; onChange: (v: string) => void; type?: string; disabled?: boolean }) {
  return <div className="space-y-1.5"><Label>{label}</Label><Input aria-label={label} type={type} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} /></div>;
}
export function ExamMultiSelect({ label, values, options, onChange, disabled }: { label: string; values: string[]; options: { id: string; name: string }[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  return <div className="space-y-1.5 min-w-0"><Label>{label}</Label><Popover><PopoverTrigger asChild><Button variant="outline" disabled={disabled} className="w-full justify-between font-normal" aria-label={label}><span className="truncate">{values.length ? `${values.length} đã chọn` : "Chọn"}</span><ChevronDown /></Button></PopoverTrigger><PopoverContent className="max-h-72 overflow-auto w-80"><div className="space-y-3">{options.map((o) => <label key={o.id} className="flex gap-2 items-start text-sm"><Checkbox checked={values.includes(o.id)} onCheckedChange={() => onChange(values.includes(o.id) ? values.filter((v) => v !== o.id) : [...values, o.id])} />{o.name}</label>)}</div></PopoverContent></Popover><p className="text-xs text-muted-foreground break-words">{values.map((id) => options.find((o) => o.id === id)?.name).filter(Boolean).join(", ")}</p></div>;
}
export function ExamBand({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-4"><h2 className="bg-exam-tint text-exam-primary font-semibold text-sm px-4 py-2 border-b">{title}</h2><div className="px-4 space-y-4">{children}</div></section>;
}
export function examDate(value: string) {
  if (!value) return "—";
  const [date, time] = value.split("T"), [year, month, day] = date.split("-");
  return `${day}/${month}/${year} ${time ?? ""}`;
}
export const examTableClass = "w-full text-[13px] [&_th]:bg-exam-tint [&_th]:text-exam-primary [&_th]:font-semibold [&_th]:text-left [&_th]:px-3 [&_th]:py-3 [&_td]:px-3 [&_td]:py-3 [&_tbody_tr]:border-b [&_tbody_tr:nth-child(even)]:bg-muted/40 [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10";