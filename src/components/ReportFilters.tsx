// Bộ lọc dùng chung cho các báo cáo: Đơn vị (trường/phân hiệu) + Khoảng thời gian.
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const UNITS = [
  "TH Tô Hiệu - Trường chính",
  "TH Tô Hiệu - Phân hiệu 1",
  "TH Tô Hiệu - Phân hiệu 2",
];

export function UnitFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Đơn vị" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả đơn vị</SelectItem>
        {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function DateRangeFilter({
  value, onChange,
}: { value?: DateRange; onChange: (v?: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const label = value?.from
    ? value.to
      ? `${format(value.from, "dd/MM/yyyy")} – ${format(value.to, "dd/MM/yyyy")}`
      : format(value.from, "dd/MM/yyyy")
    : "Khoảng thời gian";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-9 justify-start gap-1.5 font-normal", !value?.from && "text-muted-foreground")}
        >
          <CalendarIcon className="h-4 w-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={value}
          onSelect={onChange}
          locale={vi}
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="flex justify-end gap-2 border-t p-2">
          <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>Xóa</Button>
          <Button size="sm" onClick={() => setOpen(false)}>Áp dụng</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Ký hiệu Enetpoint. */
export function EnetPoint({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-600">
      <Sparkles className="h-3.5 w-3.5" />
      {value.toLocaleString("vi-VN")}
    </span>
  );
}

/** Class cho ô của dòng Tổng số (ghim đáy bảng). */
export const totalCell = "sticky bottom-0 bg-indigo-50/95 backdrop-blur border-t-2 border-indigo-200 py-2.5 px-3 font-bold text-indigo-800";
