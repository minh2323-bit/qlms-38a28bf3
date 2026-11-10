<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- School class cards and details share identity metadata from `src/lib/school-classes.ts`; keep dedicated school IDs separate from existing teacher class IDs to prevent cross-class navigation.
- Official exams use `src/lib/official-exams.ts` as their shared mock domain store and `src/components/exams` for list, creation and detail flows; all account checks are presentation-only, not authenticated authorization.
- The mock account selector shares in-memory context through `src/lib/demo-account.ts` so shared exam URLs retain the selected account without browser-storage authorization claims.
- Teacher assessment transfer uses a separate mock domain from exam transfer so assessment edits and confirmation locks cannot affect exam scores; confirmation remains in-memory, not a live CSDL integration.
- Both score-transfer pages share ScoreTypeFilter and score-column selection logic; visibility selection only narrows available columns and never changes score data or confirmation permissions.
- Exam transfer uses the shared multi-subject filter; teacher transfer requires a single grade/class/subject scope so each table and export contains only that teaching context.
- Both transfer pages share ExamScorePicker and exam-score-import adapters; imported exams add independent in-memory score columns, match students by CCCD plus subject, and never overwrite existing scores or bypass confirmation locks.
- Teacher column locks, removal and source metadata are scoped by grade/class/subject; replacement uses the shared picker and teacher-score-columns validation to preserve other contexts and reject locked edits. Source dates are recorded as the mock import date when original grading timestamps are unavailable.
- Seed teacher-score provenance from the same mock rows as the displayed values; new imports write scores only into the scope where their source is recorded, so populated cells always retain traceable content.
