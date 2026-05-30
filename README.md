# Mordewin's Sapphire — companion app

A personal, single-character companion for the homebrew magic item **Mordewin's Sapphire**
(modified 5E). It tracks tier progression, rolls the tier-correct dice for each unlocked power,
and totals damage/healing with a full breakdown. Offline, local, no accounts, no backend.

The Sapphire **is** the interface: a faceted gem (the original item art) sits at the centre with the
three active powers orbiting it; tapping one charges the gem, fires a forked bolt down its wire, and
raises the activation drawer. Passive effects sit in a quiet rail beneath.

## Run

```bash
npm install
npm run dev      # local dev server (http://localhost:5180)
npm test         # unit tests (dice engine, rollers, unlock gates) — 35 tests
npm run build    # static production build → dist/
npm run preview  # serve the built dist/
```

The build is fully static and self-contained (fonts + icons are self-hosted, the gem art is
bundled — **no CDN at runtime**). Deploy `dist/` to GitHub Pages / Netlify / Vercel, or just open it
locally. `base` is `./` so it works from any sub-path. State persists in `localStorage`; use the
**Export / Import** buttons in the progression view to back up or move between the phone and Surface.

## Structure

| Path | Purpose |
|---|---|
| `src/config.ts` | Player values (brief §6), seeded unlocks, documented rules conflicts |
| `src/types.ts` | Domain types (tiers, powers, effects, save state) |
| `src/dice.ts` (+ `.test.ts`) | Dice engine: `roll`, per-target multiplier, `RollBuilder`, manual override |
| `src/powers.ts` (+ `.test.ts`) | Power dataset, tier tables, rollers, meta text, tier reference |
| `src/state/` | Reducer + `localStorage` persistence + unlock-gate logic (+ tests) |
| `src/components/` | `GemHub` (gem + nodes + choreography), `Drawer`, `Progression`, `Header`, `PassiveRail`, `Sky` |
| `scripts/cut-bg.mjs` | Regenerates `sapphire-cut.png` (transparent gem) from `Sapphire.png` |

## The gem is raster art, not SVG

The v3 mockup generated the gem as an SVG, but it diverged from the real art and earlier SVG
recreations kept misreading the geometry (the gold is a 6-point setting with gold pentagon points; only
the three large crowns are blue). So the canonical gem is **`Sapphire.png` with its white background
flood-filled out** (`src/assets/sapphire.png`, produced by `scripts/cut-bg.mjs`), with all the
activation choreography animating around/with it. Per-facet animation is intentionally out of scope.

## Rules conflicts (docx vs. brief §7)

The docx is the source of truth; two tier numbers disagreed with the brief and were resolved with the
player. Both are surfaced in-app (progression view) and noted in `config.ts → RULES_CONFLICTS`:

- **Storm Tornado · Superior** → using the **brief's** Contact **4d6** / suction **DC 21** (the docx
  bundles that upgrade with "any HP" = Ultimate).
- **Thunder Step · Superior** → using the **docx's** origin blast **3d6** Thunder (the brief kept it at
  2d6 until Ultimate).

Open questions Q1 (base-tier cost = 1) and Q2 (Aurum spend vs. threshold) use the brief defaults and are
editable in the progression view. The Storm Tornado dissipate hit (Q3) is meta-text only.

## Out of scope (v1)

No HP / spell-slot / rest / usage tracking, no spiritual-weapon to-hit, no save-result prompts,
no multi-character, no backend (brief §10). Roll history and full PWA install are later nice-to-haves.
