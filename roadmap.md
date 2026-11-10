# Monitoring fixes

# Teacher column source management

- [x] Require single grade, class and subject selections; remove their table/export columns.
- [x] Add column menus, source details, scoped removal and replacement using the content picker.
- [x] Verify default selection, source replacement and lock rules with tests and browser checks.

- [x] Restore teacher assessment-column unlocking after confirmation and verify editing/reconfirmation.
- [x] Align the principal class report's class-size total and verify the footer.

# Official exams

- [x] Match the uploaded HTML official-exam interface and complete one/multiple-session mock creation flow.
- [x] Apply leadership, department head/deputy, and assigned-teacher presentation permissions and approval visibility.
- [x] Verify mock creation, approval, viewing, supervision and grading flows and focused rule tests.

Scope: this project remains a mockup. Exam data and account selection are in-memory; real authenticated permissions, durable storage and live student submissions are not implemented.

# Teacher score transfer

- [x] Add the final teacher Statistics & Reports submenu and assessment-score page.
- [x] Verify multi-select filters, score validation, export and mock confirmation/locking.

# Score type filter

- [x] Add matching checked score-type dropdowns to both score-transfer pages.
- [x] Verify column visibility, teacher confirmed-column restrictions, and filtered exports.

# Subject filters and transfer reminders

- [x] Add subject columns and default-all multi-checkbox subject filters on both transfer pages, including exports.
- [x] Add the linked GKI/CKI reminder and dark warning text with red horizontal borders.
- [x] Verify subject selection, exports and reminder navigation.

# Add scores from other exams

- [x] Add shared plus-button picker with score type, search, level filter, grouped single-choice exam list and confirmation on both transfer pages.
- [x] Import selected exam scores without overwriting existing columns; exclude already-added exams and preserve existing confirmation permissions.
- [x] Verify picker filters, single selection, added columns and exports with focused tests and browser checks.

# Content picker wording and class filter

- [x] Rename the teacher picker search field to "Tìm tên nội dung" and drop the Bài tập / Bài kiểm tra labels above the list.
- [x] Swap the exam-level filter for a class-name filter when Bài tập or Bài kiểm tra is selected, importing only that class's scores.
- [x] Verify both pickers in the browser and keep the focused filter tests passing.