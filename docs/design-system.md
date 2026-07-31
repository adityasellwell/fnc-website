# F&C Fresh Design System

This document outlines the core design tokens, typography, layout guidelines, and UI patterns for the F&C website. Refer to these rules during the UI polish phases to ensure consistency.

---

## 1. Color Palette

Our colors are curated to reflect freshness, premium quality, and clean aesthetics.

| Token | CSS Variable / Tailwind | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Brand Red** | `bg-fnc-red` / `text-fnc-red` | `#DC2F26` | Primary CTAs, active status states, highlights |
| **Brand Green** | `bg-fnc-green` / `text-fnc-green` | `#1E7E34` | Success alerts, positive ratings, badges |
| **Charcoal** | `bg-charcoal` / `text-charcoal` | `#1C1C1C` | Primary text, header background, dark mode elements |
| **Warm White** | `bg-warmwhite` | `#F9F6F0` | Default body backgrounds, cards, lists |
| **Slate** | `text-slate` | `#666666` | Secondary labels, descriptions, muted text |
| **Border Gray** | `border-bordergray` | `#E5E5E5` | Default card and table divider borders |

---

## 2. Typography

We use modern sans-serif typography (e.g. Outfit or Inter) with strict hierarchical scales.

| Style | Tailwind / Font Class | Weight | Size | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Heading)** | `font-display text-3xl md:text-4xl` | Bold (700) | `32px`/`36px` | Main page title |
| **H2 (Section Heading)** | `font-display text-xl md:text-2xl` | Bold (700) | `24px`/`28px` | Segment/card block titles |
| **Body Primary** | `font-body text-base` | Normal (400) | `16px` | Main content, inputs, descriptions |
| **Body Secondary** | `font-body text-sm` | Medium (500) | `14px` | Metadata labels, small details |
| **Caption / Small** | `font-body text-xs` | Normal (400) | `12px` | Timeline updates, footprint logs |

---

## 3. Spacing Grid

We use an 8px grid system. Avoid arbitrary spacing values.

- **8px (`p-2`, `gap-2`)**: Subtle margins, icon spacing, list gap.
- **16px (`p-4`, `gap-4`)**: Padding inside small cards, spacing between list elements.
- **24px (`p-6`, `gap-6`)**: Padding inside standard cards, gap between columns.
- **32px (`p-8`, `gap-8`)**: Page layout margins, section divider gaps.
- **48px (`py-12`)**: Major page header / footer spacing.

---

## 4. UI Components

### Buttons
- **Primary**: `h-11 px-5 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors`
- **Secondary**: `h-11 px-5 rounded-xl border border-bordergray bg-white font-body text-sm font-semibold text-charcoal hover:bg-warmwhite transition-colors`
- **Danger**: `h-11 px-5 rounded-xl bg-fnc-red/10 text-fnc-red font-body text-sm font-semibold hover:bg-fnc-red/20 transition-colors`

### Forms & Inputs
- **Text Inputs**: `h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors`
- **Validation Errors**: `font-body text-xs text-fnc-red mt-1`

### Cards
- **Product Cards**: Rounded borders (`rounded-3xl`), light shadows (`shadow-sm`), transparent card borders (`border border-bordergray`), and hover transitions (`hover:-translate-y-1 hover:shadow-md transition-all`).

### Tables
- **Grid Layout**: Header cells padded `px-5 py-3.5`, body cells `px-5 py-4`. Row hover highlight `hover:bg-warmwhite/60`. Pagination uses rounded border buttons.
