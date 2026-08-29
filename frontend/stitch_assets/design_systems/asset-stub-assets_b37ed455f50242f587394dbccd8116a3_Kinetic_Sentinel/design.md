---
name: Kinetic Sentinel
colors:
  surface: '#0e1416'
  surface-dim: '#0e1416'
  surface-bright: '#343a3c'
  surface-container-lowest: '#090f11'
  surface-container-low: '#171d1e'
  surface-container: '#1b2122'
  surface-container-high: '#252b2d'
  surface-container-highest: '#303638'
  on-surface: '#dee3e6'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dee3e6'
  inverse-on-surface: '#2b3133'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#ffb873'
  on-tertiary: '#4b2800'
  tertiary-container: '#e89337'
  on-tertiary-container: '#5b3200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#0e1416'
  on-background: '#dee3e6'
  surface-variant: '#303638'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for high-stakes environments where rapid data processing and threat detection are paramount. The personality is hyper-technical, authoritative, and vigilant. It targets cybersecurity professionals and system architects who require clarity under pressure.

The style is a fusion of **Corporate Modernism** and **Tactile Glassmorphism**. It utilizes a "Command Center" aesthetic—dark, multi-layered surfaces that recede to let vibrant, kinetic accents pull the user's focus toward critical alerts and streaming data. The interface feels like a precision instrument: cold, sharp, and intensely responsive.

## Colors

The palette is optimized for OLED and high-resolution displays, utilizing a deep-space foundation to maximize the "pop" of the primary cyan.

- **Primary Accent:** The cyan (#06b6d4) is the "Active State" color. It should be used for interactive elements, focus rings, and primary data paths.
- **Surface Layering:** We move from a base of `#020617` (Deep Void) for background shells to `#0f172a` (Command Navy) for cards and containers. Higher elevation levels should use subtle shifts in lightness rather than standard gray scales to maintain the "Sentinel" blue-tinted darkness.
- **Semantic Punch:** Success, Warning, and Error colors are pushed to high-saturation values to ensure they break through the dark background instantly. Use these colors for status indicators, "Kill Switch" buttons, and critical telemetry.

## Typography

This design system uses a dual-font strategy to balance readability with a technical aesthetic.

- **Primary Typeface:** **Geist** provides a clean, neutral, and highly legible foundation for the main interface. Its geometric precision fits the "high-tech" narrative while remaining professional.
- **Secondary Typeface:** **JetBrains Mono** is used for all labels, data points, and terminal outputs. The monospaced nature emphasizes the data-driven, systematic soul of the product.
- **Scale:** Use tight letter spacing on larger headlines to create a "locked-in" feel. Use generous tracking on labels and code snippets to ensure legibility during high-speed scanning.

## Layout & Spacing

The layout philosophy is a **Fixed-Fluid Hybrid**. The main content container is capped at 1440px to ensure data density doesn't become overwhelming on ultra-wide monitors, while the inner grid remains fluid.

- **The 4px Grid:** All spacing must be a multiple of 4px. Use 8px and 16px for internal component padding, and 24px or 32px for section separation.
- **Responsive Behavior:** 
  - **Desktop:** 12-column grid with 24px gutters.
  - **Tablet:** 8-column grid with 16px gutters.
  - **Mobile:** 4-column grid with 16px margins.
- **Density:** High density is encouraged for data tables and dashboards. Use compact vertical padding (8px) for list items to maximize information on a single screen.

## Elevation & Depth

Depth is achieved through **Tonal layering** and **Backdrop Blurs** rather than traditional shadows.

- **Base Layer:** `#020617` - The canvas.
- **Level 1 (Cards/Sidebar):** `#0f172a` with a 1px border of `rgba(255,255,255,0.05)`.
- **Level 2 (Modals/Popovers):** `#1e293b` with a 20px backdrop blur (Glassmorphism) and a subtle 1px primary cyan inner-glow on the top edge.
- **Outlines:** Avoid heavy shadows. Use "Ghost Borders"—low-opacity (10-15%) strokes in the primary color—to define interactive boundaries. This maintains a flat, technical appearance while providing clear separation.

## Shapes

The shape language is **Soft-Technical**. We avoid fully sharp corners to prevent a "dated" look, but maintain a low radius to feel precise and engineered.

- **Standard Elements:** Use `0.25rem` (4px) for buttons, inputs, and small chips.
- **Containers:** Use `0.5rem` (8px) for cards and main dashboard widgets.
- **Status Indicators:** Use `full` (pill) for status badges to distinguish them from structural UI elements.

## Components

- **Buttons:** 
  - *Primary:* Solid Cyan (#06b6d4) with black text for maximum contrast.
  - *Secondary:* Transparent with a 1px Cyan border and Cyan text.
  - *Ghost:* No background, Cyan text, appears only on hover with a subtle `#0f172a` fill.
- **Inputs:** Dark background (`#020617`), 1px border (`#1e293b`). On focus, the border glows Cyan with a 2px outer-blur.
- **Chips/Badges:** Monospaced text (JetBrains Mono). Use high-vibrance semantic colors for backgrounds at 15% opacity with 100% opacity text for a "heads-up display" look.
- **Data Lists:** Use alternating row stripes (Zebra striping) with `#0f172a` and `#020617`. Highlight active rows with a Cyan left-border (3px wide).
- **Cards:** No shadows. Use a subtle 1px border. Title areas should have a slightly darker header background to create an "Instrument Panel" feel.