import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SCORE_SUBJECTS } from "@/lib/score-subjects";

export function SubjectFilter({ selected, onChange }: { selected: string[]; onChange: (subjects: string[]) => void }) {
  return <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" size="sm" className="h-9 gap-1.5 font-normal" aria-label="Môn học">
        <Filter className="h-4 w-4 shrink-0" />
        Môn học: {selected.length === SCORE_SUBJECTS.length ? "Tất cả" : `${selected.length}/${SCORE_SUBJECTS.length}`}
        <ChevronDown className="h-4 w-4 shrink-0" />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="start" className="w-56 p-2">
      {SCORE_SUBJECTS.map((subject) => <label key={subject} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
        <Checkbox aria-label={subject} checked={selected.includes(subject)} onCheckedChange={(checked) => onChange(checked === true
          ? [...selected.filter((value) => value !== subject), subject]
          : selected.filter((value) => value !== subject))} />
        {subject}
      </label>)}
      <div className="mt-2 flex justify-end border-t pt-2">
        <Button variant="ghost" size="sm" onClick={() => onChange([...SCORE_SUBJECTS])}>Chọn tất cả</Button>
      </div>
    </PopoverContent>
  </Popover>;
}