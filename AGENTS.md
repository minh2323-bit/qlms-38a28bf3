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
