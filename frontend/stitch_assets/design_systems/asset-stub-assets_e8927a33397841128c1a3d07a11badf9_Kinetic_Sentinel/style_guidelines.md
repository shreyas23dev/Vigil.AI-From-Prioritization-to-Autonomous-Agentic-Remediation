## Brand & Style
The design system is engineered for high-stakes cybersecurity environments where cognitive load management and rapid data synthesis are critical. The brand personality is clinical, vigilant, and authoritative, evoking a sense of "active monitoring" and technical precision. 

The aesthetic leverages a **Modern Corporate Dark Mode** blended with **Minimalist Technical** influences. It avoids unnecessary ornamentation, focusing instead on data density and clear visual hierarchies. The interface utilizes high-contrast accents against deep slate foundations to ensure that critical threats are immediately distinguishable from baseline system noise. The emotional response is one of calm control amidst complex, fast-moving data streams.

## Layout & Spacing
This design system employs a strict **4px/8px incremental grid** to achieve high data density without sacrificing clarity. 
- **Grid System:** A 12-column fluid grid is used for dashboard layouts. On desktop, sidebars are fixed at 240px, while the main content area expands.
- **Density:** Padding within cards and tables is kept tight (12px or 16px) to allow more information to be visible above the fold. 
- **Responsive Behavior:** On tablet, the grid shifts to 6 columns. On mobile, elements stack into a single column with horizontal margins reduced to 16px. 
- **Dividers:** Use 1px borders (#334155) instead of large gaps to separate data points, maintaining a compact footprint.

## Elevation & Depth
In this dark-themed system, depth is communicated through **Tonal Layering** and **Subtle Glows** rather than traditional drop shadows.
- **Level 0 (Background):** #0F172A - The lowest plane.
- **Level 1 (Cards/Panels):** #1E293B - Used for primary content containers. These should have a subtle 1px border (#334155) to define edges.
- **Level 2 (Modals/Popovers):** #334155 - Elevated surfaces that sit above the main UI.
- **Luminous Effects:** For critical alerts (Red), a soft 8px outer glow (15% opacity) is applied to progress bars and badges to draw the eye immediately. Interactive elements like buttons use a subtle Cyan inner-glow on hover to indicate "active" states.

## Components
- **Buttons:** Primary buttons use a solid Cyan (#06B6D4) fill with Slate 950 text. Secondary buttons use a Slate 800 ghost style with 1px borders.
- **Severity Badges:** Compact labels with JetBrains Mono text. Use low-opacity fills (15%) of the accent color with a solid 1px border of the same color for high visibility.
- **Data Tables:** Row headers in Slate 50. Alternate row striping is not used; instead, use 1px bottom borders. Critical rows should have a 2px Crimson left-border highlight.
- **Progress Bars:** Thin 4px tracks. The "fill" should utilize a slight gradient of the accent color. Critical bars (Red) include the soft glow effect mentioned in Elevation.
- **Radar Charts:** Use semi-transparent Cyan strokes with Slate 400 grid lines. Vertices for high-risk nodes should be marked with Amber or Red points.
- **Input Fields:** Dark fills (#0F172A) with a Slate 700 border. Focus state changes border to Cyan with a 1px glow.