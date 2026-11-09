import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ScoreColumn = { key: string; label: string; sub?: string };

export function ScoreTypeFilter({ columns, hiddenKeys, onChange }: {
  columns: readonly ScoreColumn[];
  hiddenKeys: string[];
  onChange: (keys: string[]) => void;
}) {
  const selectedCount = columns.filter((column) => !hiddenKeys.includes(column.key)).length;
  return <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="h-9 gap-1.5 font-normal" aria-label="Loại điểm">
        <Filter className="h-4 w-4 shrink-0" />
        Loại điểm: {selectedCount === columns.length && columns.length > 0 ? "Tất cả" : `${selectedCount}/${columns.length}`}
        <ChevronDown className="h-4 w-4 shrink-0" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-56 p-2">
      {columns.map((column) => <label key={column.key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
        <Checkbox checked={!hiddenKeys.includes(column.key)} onCheckedChange={(checked) => onChange(checked === true
          ? hiddenKeys.filter((key) => key !== column.key)
          : [...hiddenKeys.filter((key) => key !== column.key), column.key])} />
        {column.label}{column.sub ? ` ${column.sub}` : ""}
      </label>)}
      {columns.length === 0 && <p className="px-2 py-1.5 text-sm text-muted-foreground">Chưa có cột điểm đã xác nhận</p>}
      <div className="mt-2 flex justify-end border-t pt-2">
        <Button variant="ghost" size="sm" disabled={columns.length === 0} onClick={() => onChange(hiddenKeys.filter((key) => !columns.some((column) => column.key === key)))}>Chọn tất cả</Button>
      </div>
    </PopoverContent>
  </Popover>;
}