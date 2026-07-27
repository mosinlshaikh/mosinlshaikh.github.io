# TTRL CSS Architecture

## Canonical entry point

`realistic-icons.css` is retained only as a compatibility shim because `index.html` already references it. It imports `ttrl-production.css`, which is the single production manifest.

## Source order

1. `ttrl-tokens.css` — shared design tokens
2. `realistic-icons-base.css` — accessible icon and artwork foundation
3. `phase3-hero.css` — hero presentation
4. `phase4-enterprise.css` — service, project, process and FAQ components
5. `phase5-agent.css` — TTRL Client Agent presentation
6. `phase6-performance.css` — responsive, accessibility and performance rules
7. Final correction layers — transparency, number removal, clarity and restrained realism

## Engineering rules

- Do not add another numbered phase stylesheet.
- Do not place component rules in `realistic-icons.css`.
- Reuse variables from `ttrl-tokens.css`.
- Prefer component-specific selectors over broad global overrides.
- Avoid new `!important` declarations unless overriding third-party or legacy rules during consolidation.
- Every visual change must be checked at 360, 390, 412, 768, 1024, 1366 and 1920 CSS pixels.
- Preserve reduced-motion, keyboard focus and readable contrast.

## Next consolidation step

The current modules are now behind one controlled entry point. During future UI work, accepted rules should be moved from the legacy phase files into named modules such as `hero.css`, `sections.css`, `responsive.css` and `agent.css`, then the obsolete phase files can be deleted in one reviewed migration.
