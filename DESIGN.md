---
name: Blog & Custom CMS
description: A minimalist content publishing platform and editor.
colors:
  primary: "#1c1917"
  background: "#ffffff"
  muted: "#f5f5f4"
  border: "#e7e5e4"
  destructive: "#dc2626"
typography:
  display:
    fontFamily: "Geist, var(--font-sans), sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Geist, var(--font-sans), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.75
rounded:
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0.5rem 0.625rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: "0.5rem 0.625rem"
---

# Design System: Blog & Custom CMS

## 1. Overview

**Creative North Star: "The Editorial Studio"**

The Editorial Studio aesthetic is characterized by broad whitespace margins, large high-contrast titles, and elegant typography reminiscent of premium publishing houses. The design prioritizes the reading experience, establishing a quiet, focused environment for content consumption. Layouts emphasize editorial restraint, using grid structures to frame stories rather than cluttering them with heavy decorations or high-contrast side-stripe borders.

This visual system explicitly rejects the cluttered, plugin-heavy look of standard templates, as well as the loud SaaS templates that rely on neon gradients, excessive glassmorphism, or tiny uppercase tracked eyebrows on every section.

**Key Characteristics:**
- Generous whitespace and wide content margins.
- Clean typography with strong hierarchical contrast.
- Stark flat surface layers relying on thin structural borders rather than drop shadows.
- Restrained interactive styling with instant state transitions.

## 2. Colors

A strictly controlled, monochromatic-forward palette focusing on maximum readability and structural clarity.

### Primary
- **Carbon Black** (#1c1917 / oklch(0.205 0 0)): Used for headings, body text, primary button backgrounds, and core branding elements.

### Neutral
- **Paper White** (#ffffff / oklch(1 0 0)): The canvas color for page backgrounds and content surfaces, ensuring clean contrast.
- **Warm Grey Border** (#e7e5e4 / oklch(0.922 0 0)): Used for card dividers, table strokes, and subtle bounds.
- **Muted Wash** (#f5f5f4 / oklch(0.97 0 0)): Used for code block backgrounds, secondary buttons, and subtle component backgrounds.

### Accent
- **Rust Red** (#dc2626 / oklch(0.577 0.245 27.325)): Restricted purely to destructive actions, warning states, and errors.

**The Restraint Rule.** The interface remains strictly monochromatic. Color must never be used decoratively; it serves only functional purposes (interactive states, destructive actions, or dynamic selections).

## 3. Typography

**Display Font:** Geist Sans (with fallback system-ui, sans-serif)
**Body Font:** Geist Sans (with fallback system-ui, sans-serif)
**Label/Mono Font:** Geist Mono (with fallback monospace)

**Character:** Clean, highly readable, and contemporary. The pairing focuses on structural clarity and modern editorial flow, using varying weights and generous line-heights.

### Hierarchy
- **Display** (Bold (700), 1.875rem (30px), 1.25): Used for primary article headings and hero titles.
- **Headline** (Bold (700), 1.5rem (24px), 1.25): Used for section headers and large subtitles.
- **Title** (Semibold (600), 1.25rem (20px), 1.3): Used for post card titles and subheadings.
- **Body** (Regular (400), 0.875rem (14px), 1.75): Used for paragraph content. Maximum line length is capped at 75ch.
- **Label** (Medium (500), 0.75rem (12px), normal): Used for tag badges, metadata rows, and form input labels.

**The Single Family Rule.** Typography is driven entirely by Geist to maintain a singular, cohesive aesthetic across editorial and dashboard layouts.

## 4. Elevation

The system is starkly flat. No drop shadows are used under normal conditions, and depth is conveyed purely through contrasting background shades (e.g., nesting a muted background within white) and thin borders.

**The Stark Flat Rule.** Surfaces remain flat at rest. Physical depth is rejected; layout structure is established using borders (1px border-border) or structural grid spacing.

## 5. Components

Interactive components are styled to feel refined, restrained, and precise.

### Buttons
- **Shape:** Rounded corners with a 0.625rem (10px) radius.
- **Primary:** Background Carbon Black (#1c1917), text Paper White (#ffffff), height 2rem (32px), horizontal padding 0.625rem (10px).
- **Hover / Focus:** Hover reduces opacity slightly (bg-primary/80); focus applies a subtle outline ring (focus-visible:ring-3).
- **Secondary:** Background Muted Wash (#f5f5f4), text Carbon Black (#1c1917).

### Cards / Containers
- **Corner Style:** Rounded corners with a 0.75rem (12px) radius.
- **Background:** White (#ffffff) or Muted Wash (#f5f5f4).
- **Shadow Strategy:** Stark flat; no shadows are applied.
- **Border:** Thin stroke (1px solid #e7e5e4).
- **Internal Padding:** 1.25rem (20px) padding.

### Inputs / Fields
- **Style:** Background white or low-opacity input wash, border #e7e5e4, radius 0.625rem.
- **Focus:** Focus updates the border to primary (#1c1917) with a subtle ring.

## 6. Do's and Don'ts

### Do:
- **Do** maintain wide content margins and generous whitespace around text blocks to support the editorial aesthetic.
- **Do** use thin (1px) borders with #e7e5e4 to separate structural card components.
- **Do** check font contrast ratios to ensure body text achieves >=4.5:1 against the background.

### Don't:
- **Don't** use colored side-stripe borders (e.g., border-left) to accent callout blocks or post cards.
- **Don't** add decorative gradients, text gradients, or blurs to create glassmorphism.
- **Don't** add drop shadows to cards or containers (maintain the Stark Flat rule).
- **Don't** use tiny tracked uppercase eyebrows above section headings.
