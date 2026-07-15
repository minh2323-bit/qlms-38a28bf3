# Plan: LBG lesson tagging + lecture source picker + per-chapter add button

## 1. LBG lesson cards (`src/routes/index.tsx`)

Change teacher timetable cards from showing "Nội dung" (unit title) to showing **assigned lesson tags**.

- Extend the schedule lesson type with `assignedUnitIds: string[]` (in-memory state, no persistence change beyond current store).
- New cards render:
  - Line 1: `Lớp - Môn` (unchanged).
  - Line 2: `Tên tiết PPCT: {name}` (teacher-entered, unchanged).
  - Line 3: horizontal wrap of **lesson tags** (one colored pill per assigned lesson) + a small `+` button.
- On fresh timetable creation, `assignedUnitIds` is empty — no tag row, just the `+`.
- Clicking `+` opens **AssignLessonsModal**:
  - Lists `getTreeForClass(classLop, subject)` grouped by chapter, each lesson has a checkbox.
  - Pre-checks currently assigned units.
  - "Hoàn thành" writes back the selection.
- Each tag has an inline `×` for quick removal.
- Tag color: single shared token (indigo/violet pill) — "cùng màu" per user.

## 2. "Thêm bài giảng" source picker (`src/routes/index.tsx` + reuse from `lop-hoc-so.$classId.tsx`)

When teacher opens a schedule slot side panel and clicks **Thêm nội dung mới → Bài giảng**, show a new **LectureSourceModal** with two choice boxes:

- **Thêm mới** → opens the existing `AddMaterialModal` (lecture flow) already exported from `lop-hoc-so.$classId.tsx`.
- **Thêm từ Kho bài giảng** → opens **LectureLibraryPickerModal**:
  - Grid of lecture cards from the teacher's library (reuse the data source used by `hoc-lieu.bai-giang.index.tsx`; if it's local seed, import it or expose a `listLibraryLectures()` helper).
  - Multi-select via card checkbox overlay.
  - "Xác nhận" → clones each selected lecture into the current slot's `(class, subject, unit)` via `addMaterial` with `origin: "schedule"`.

Học liệu / Bài tập / Bài kiểm tra / Lời nhắc entries keep their current single-flow behavior.

## 3. Per-chapter "+" in "Nội dung lớp học" (`src/routes/lop-hoc-so.$classId.tsx`)

Inside the class content section, each chapter group currently lists its materials. Add a final row inside each chapter:

- A dashed `+` row button labeled "Thêm nội dung vào chủ đề này".
- Click opens **ChapterAddContentModal** with 3 tile choices: **Bài giảng / Học liệu / Bài tập**.
- Each tile routes into the existing add-flow for that kind, pre-scoping the target chapter/unit context (default `unitId` = first unit of that chapter; teacher can still change inside the form).

The top-level "Thêm nội dung" dropdown in the section header stays as is (already pruned of Bài kiểm tra).

## Technical notes

- No schema/store migrations required; `assignedUnitIds` lives on the schedule lesson object already stored in module-scope state inside `index.tsx`. Persistence layer is unchanged.
- Lesson tags reuse existing `Badge` component with `variant="secondary"` + a fixed tailwind class for the shared color.
- Lecture library data: if `hoc-lieu.bai-giang.index.tsx` currently holds an inline seed array, extract it into `src/lib/lecture-library.ts` (new) so both the library page and the picker modal share it.
- All new modals are added to `src/routes/index.tsx` (LBG) and `src/routes/lop-hoc-so.$classId.tsx` respectively — no new route files.

## Out of scope (ask before doing)

- Persisting `assignedUnitIds` to any backend.
- Reworking the class detail chapter grouping algorithm itself.
- Changing how existing "unit" tagging on materials works.

Confirm and I'll implement all three parts in one pass.
