## Mục tiêu
1. Đảm bảo click vào card lớp học → mở trang chi tiết tương ứng (trang `/lop-hoc-so/$classId` đã có sẵn, nhưng đang dùng mock cứng — sẽ wire thẳng dữ liệu lớp đang click).
2. Tạo liên kết **2 chiều** giữa **Lớp học số** (trong `/lop-hoc-so`) và **Lịch báo giảng** (trong `/`) theo cặp khoá `(Lớp thực, Môn, Đơn vị kiến thức)` — gọi tắt là `unitKey`.

## Kiến trúc dữ liệu chia sẻ

Tạo một store đơn giản (React Context + `useSyncExternalStore`, không cần backend), giữ in-memory cho demo:

```text
src/lib/teaching-store.ts
  - ClassRoom { id, name, lop ("4A"), subject ("Toán"), ... }
  - Material   { id, unitId, classRealId ("4A"), subject, kind, title, meta }
  - schedule   { weekIdx, day, period, lesson { classRealId, subject, unitId, topic } }

  API:
    listMaterialsByClass(classRoomId)
    listMaterialsByUnit(classRealId, subject, unitId)
    addMaterial(material)        // emit để cả 2 trang nghe
    removeMaterial(id)
    subscribe(listener)
```

- Lớp học số có field `lop` (4A...) + `subject` (Toán/Tiếng Việt) — đã có sẵn trong `CLASSES_SEED`.
- Lịch báo giảng có `Lesson { class, subject, unitId }` — đã có sẵn.
- `unitKey = ${classRealId}|${subject}|${unitId}` là khoá đồng bộ.

## Thay đổi cụ thể

### 1. `src/lib/teaching-store.ts` (mới)
- Khởi tạo store từ seed hiện có (MATERIALS_SEED + lessons cũ).
- Expose hook `useTeachingStore()`.

### 2. `src/routes/lop-hoc-so.$classId.tsx`
- Đọc `info` từ store thay vì `CLASS_DB` cứng (fallback CLASS_DB nếu chưa có).
- Trong dropdown **Thêm bài giảng / Thêm học liệu / Thêm bài tập**: mở mini-modal cho chọn:
  - Bài/Đơn vị kiến thức (lấy từ `KNOWLEDGE_TREE` — sẽ tách ra `src/lib/knowledge-tree.ts` để dùng chung)
  - Tiêu đề + meta
  → gọi `store.addMaterial({ classRealId: info.lop, subject: info.subject, unitId, ... })`.
- Khi thêm xong: học liệu xuất hiện trong list lớp + toast "Đã đồng bộ sang Lịch báo giảng".
- Vì cùng `unitId`, mọi tiết lịch khớp đơn vị đó (cùng lớp 4A, môn Toán) sẽ tự thấy học liệu mới trong `LessonPanel`.

### 3. `src/routes/index.tsx` (Lịch báo giảng)
- `LessonPanel` (đang đọc `MATERIALS_SEED[lesson.unitId]`) → đổi sang `useTeachingStore().listMaterialsByUnit(lesson.class, lesson.subject, lesson.unitId)`.
- Trong panel đó, nút **+ Thêm học liệu** sẽ gọi `store.addMaterial({...})` với `classRealId = lesson.class, subject = lesson.subject, unitId = lesson.unitId`.
- Học liệu mới này lập tức xuất hiện trong **trang chi tiết lớp học số** tương ứng (vd: Lớp 4A – Toán) như một mục "bài giảng" thuộc đơn vị/chương đó.
- Nếu lớp số chưa có "lesson section" cho `unitId` đó → tự tạo section mới (tên = tên unit từ KNOWLEDGE_TREE) và bỏ học liệu vào.

### 4. `src/lib/knowledge-tree.ts` (mới, tách ra)
- Move `KNOWLEDGE_TREE` ra dùng chung cho cả index + class-detail (form chọn chương/bài khi thêm học liệu).

## Phạm vi không thay đổi
- Toàn bộ layout, màu, navigation hiện tại giữ nguyên.
- Mock data hiện tại được nạp vào store khi khởi động — UI không đổi lần load đầu.
- Chưa có persistence (reload mất). Nếu cần lưu, tôi sẽ thêm localStorage trong bước phụ.

## Câu hỏi xác nhận trước khi build
1. **Khoá liên kết**: dùng cặp `(lớp thực, môn, unitId)` để khớp lớp số ↔ lịch (đề xuất trên) — OK?
2. Trang chi tiết lớp học hiện tại đã có đủ các phần bạn yêu cầu (banner, mã lớp + copy, số học sinh, GV, ảnh nền, mô tả, 2 nút + dropdown 3 lựa chọn, list bài giảng/học liệu, kéo thả sắp xếp). Bạn có muốn tôi **giữ nguyên thiết kế** và chỉ wire dữ liệu thật, hay điều chỉnh thêm gì không?
