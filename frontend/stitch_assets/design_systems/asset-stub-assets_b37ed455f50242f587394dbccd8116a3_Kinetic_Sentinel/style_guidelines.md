## Brand & Style

The design system is engineered for high-stakes environments where rapid data processing and threat detection are paramount. The personality is hyper-technical, authoritative, and vigilant. It targets cybersecurity professionals and system architects who require clarity under pressure.

The style is a fusion of **Corporate Modernism** and **Tactile Glassmorphism**. It utilizes a "Command Center" aesthetic—dark, multi-layered surfaces that recede to let vibrant, kinetic accents pull the user's focus toward critical alerts and streaming data. The interface feels like a precision instrument: cold, sharp, and intensely responsive.

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

## Components

- **Buttons:** 
  - *Primary:* Solid Cyan (#06b6d4) with black text for maximum contrast.
  - *Secondary:* Transparent with a 1px Cyan border and Cyan text.
  - *Ghost:* No background, Cyan text, appears only on hover with a subtle `#0f172a` fill.
- **Inputs:** Dark background (`#020617`), 1px border (`#1e293b`). On focus, the border glows Cyan with a 2px outer-blur.
- **Chips/Badges:** Monospaced text (JetBrains Mono). Use high-vibrance semantic colors for backgrounds at 15% opacity with 100% opacity text for a "heads-up display" look.
- **Data Lists:** Use alternating row stripes (Zebra striping) with `#0f172a` and `#020617`. Highlight active rows with a Cyan left-border (3px wide).
- **Cards:** No shadows. Use a subtle 1px border. Title areas should have a slightly darker header background to create an "Instrument Panel" feel.