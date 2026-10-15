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

## Architecture rules
- AI calls live only in `src/lib/ai.server.ts` (gateway fetch) and `src/lib/ai.functions.ts` (one server function + separate structured prompt per tool) — keeps keys server-side and prompts auditable.
- No persistence of user inputs/outputs; cross-tool transfer uses in-memory React context (`src/lib/transfer.tsx`) — v1 privacy requirement.
