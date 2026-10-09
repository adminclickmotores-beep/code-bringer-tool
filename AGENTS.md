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

# Project rules

- JG Motors app code lives in `src/jg/` (imported from Bolt); route files in `src/routes/` are thin wrappers that read shared state from `useJg()` — keeps the original page components intact.
- `JgApp` (mounted in `__root.tsx`) owns header/footer, vehicles, auth session and notifications — one shared shell for all pages.
- Storage buckets are private (workspace blocks public buckets); vehicle photo uploads store long-lived signed URLs.
- Vehicle-sale requests are validated and stored through a server function — keeps validation and rate limiting authoritative.
