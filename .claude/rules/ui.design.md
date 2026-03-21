# Design System Document

## 1. Overview & Creative North Star: "The Tactical Edit"
This design system moves away from the cluttered, ad-heavy aesthetic of traditional sports journalism. Our Creative North Star is **"The Tactical Edit"**—a high-end editorial approach that treats soccer management with the prestige of a luxury timepiece or a high-performance architectural blueprint. 

We achieve a signature look by rejecting "template" grids in favor of **intentional asymmetry**. Expect large, aggressive typography offsets and generous "negative space" that allows the deep emerald and charcoal palette to breathe. The goal is to make the user feel like a technical director in a glass-walled suite, not a data entry clerk.

---

## 2. Colors: The Pitch & The Pavilion
The palette is rooted in the "Deep Emerald" (`primary`) of a pristine pitch at twilight, contrasted against "Charcoal" (`secondary`) and "Clean White" (`surface_container_lowest`).

*   **Primary (Emerald):** Used for brand authority and key actions. Use `primary` (#003526) for high-impact moments and `primary_container` (#054d3a) for structural depth.
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Differentiation must be achieved via background shifts. Place a `surface_container_low` (#f1f3ff) card against a `surface` (#f9f9ff) background to create definition.
*   **Surface Hierarchy & Nesting:** Treat the UI as layers of physical material.
    *   **Base:** `surface` (#f9f9ff)
    *   **Intermediate:** `surface_container` (#e9edff)
    *   **Elevated Data:** `surface_container_lowest` (#ffffff)
*   **The Glass & Gradient Rule:** For floating headers or navigation overlays, use `surface_variant` (#dce2f7) at 80% opacity with a `20px` backdrop blur. Apply a subtle linear gradient from `primary` to `primary_container` on CTA buttons to add a "polymeric" professional sheen.

---

## 3. Typography: Athletic Authority
We pair the geometric aggression of **Space Grotesk** with the technical precision of **Inter** and **Manrope**.

*   **Display & Headlines (Space Grotesk):** These are your "power" players. Use `display-lg` (3.5rem) for league titles and `headline-lg` (2rem) for match results. The tight tracking and bold weights convey speed and impact.
*   **Body & Titles (Inter):** Used for the "intel" of the system. `title-md` (1.125rem) handles player names and match details, ensuring maximum legibility during fast-paced navigation.
*   **Data Labels (Manrope):** `label-md` (0.75rem) is reserved for technical stats (xG, possession, heatmaps). Its slightly wider stance provides clarity in dense tables.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web 2.0" for this system. We use **Tonal Layering** to define the field of play.

*   **The Layering Principle:** To lift a match-day card, do not add a border. Instead, place a `surface_container_lowest` (pure white) card onto a `surface_container_low` background. The subtle shift in hex code provides a sophisticated, "Retina-sharp" edge.
*   **Ambient Shadows:** For floating modals (e.g., player substitutions), use a shadow with a 32px blur, 0% spread, and 6% opacity using the `on_surface` (#141b2b) color. It should look like a soft glow, not a hard shadow.
*   **The Ghost Border:** If a boundary is required for accessibility in complex data tables, use `outline_variant` (#bfc9c4) at 15% opacity. It should be barely felt, only seen.

---

## 5. Components: The Kit
Every component follows the **0.25rem (DEFAULT)** or **0.5rem (lg)** roundedness scale to maintain a modern, "technical gear" feel.

*   **Buttons:**
    *   **Primary:** `primary` background with `on_primary` text. Use `lg` (0.5rem) corner radius.
    *   **Secondary:** `secondary_container` background. No border.
*   **Status Indicators (The W/L/D Chips):**
    *   **Win:** `primary_fixed` (#b0f0d6) with `on_primary_fixed_variant` text.
    *   **Loss:** `error_container` (#ffdad6) with `on_error_container` text.
    *   **Draw:** `secondary_fixed` (#d9e3f7) with `on_secondary_fixed_variant` text.
*   **Cards & Lists:** **Strictly forbid divider lines.** Use `1.5` (0.375rem) or `2` (0.5rem) spacing gaps to separate player rows. A player’s row should simply be a slightly different surface tone (`surface_container_high`) when hovered.
*   **Pitch Visualizers (Specialty Component):** Use `primary` as the grass base. Use `primary_fixed_dim` (#95d3ba) for pitch markings at 30% opacity to create a high-end, architectural tactic board.
*   **Input Fields:** Use `surface_container_low` as the fill. On focus, transition the background to `surface_container_lowest` and add a 2px "Ghost Border" of `primary`.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. A league table can be offset to the right, leaving a large `display-lg` heading in the top-left white space.
*   **Do** use "Breathing Room." If you think a section needs more space, use the `10` (2.5rem) or `12` (3rem) spacing tokens.
*   **Do** use color-coded text for stats. A "Win Streak" should use `on_primary_container` (#7fbda5) to tie back to the pitch emerald.

### Don't:
*   **Don't** use 100% black. Always use `on_background` (#141b2b) or `primary` (#003526) for text to maintain the "Deep Emerald" atmosphere.
*   **Don't** use standard "Alert Red" for errors if you can help it; use the sophisticated `tertiary` (#4e2013) or `error` (#ba1a1a) tokens provided to keep the palette grounded.
*   **Don't** use center-alignment for data. Sports management is about precision—keep data left-aligned or tabular-right for numerical comparison.