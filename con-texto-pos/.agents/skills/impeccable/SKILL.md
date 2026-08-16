# Impeccable Design System & AI Principles

This skill provides design direction and anti-slop rules for building frontend UIs.

## Core Design Directives

### 1. Hierarchy & Contrast
- Establish a clear visual hierarchy on every screen: Primary action, secondary actions, quiet background.
- Avoid uniform spacing and identical component cards. Give dominant cards distinct weight.
- Contrast ratios must pass WCAG AA guidelines.

### 2. Typography & Scaling
- Use a single, high-quality typeface (e.g. Roboto) with distinct font weights (300, 400, 500, 700).
- Scale font sizes responsively using `rem` units paired with fluid root sizing.
- Avoid undersized text (minimum 12px for labels, 14px-16px for body content).

### 3. Anti-Slop Guidelines
- **No AI Beige or Generic Grays**: Use curated color palettes with intentional primary, secondary, and surface container tones.
- **No Over-Rounding**: Match border radii proportionally (e.g. 4px small, 8px medium, 12px/16px cards, 9999px pills).
- **No Ghost Cards**: Avoid wrapping every metric or item in nested containers inside containers. Use subtle borders, whitespace, and elevation.
- **Interactive Feedback**: All touch/click targets must have distinct hover, focus, and active states with smooth transitions.

### 4. POS & Dashboard Principles
- **Scannability**: High data density with prominent key numbers (sales, cash totals, stock alerts).
- **Clear Actions**: Primary actions (e.g., "Cobrar", "Abrir Caja") must stand out unambiguously.
