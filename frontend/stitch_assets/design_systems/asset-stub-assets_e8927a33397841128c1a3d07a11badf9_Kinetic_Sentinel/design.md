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
  secondary: '#ffb3ad'
  on-secondary: '#68000a'
  secondary-container: '#a40217'
  on-secondary-container: '#ffaea8'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e79400'
  on-tertiary-container: '#563400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ad'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#930013'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0e1416'
  on-background: '#dee3e6'
  surface-variant: '#303638'
typography:
  display:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  technical-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  technical-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 24px
---

## Brand & Style
The design system is engineered for high-stakes cybersecurity environments where cognitive load management and rapid data synthesis are critical. The brand personality is clinical, vigilant, and authoritative, evoking a sense of "active monitoring" and technical precision. 

The aesthetic leverages a **Modern Corporate Dark Mode** blended with **Minimalist Technical** influences. It avoids unnecessary ornamentation, focusing instead on data density and clear visual hierarchies. The interface utilizes high-contrast accents against deep slate foundations to ensure that critical threats are immediately distinguishable from baseline system noise. The emotional response is one of calm control amidst complex, fast-moving data streams.

## Colors
This design system utilizes a tiered dark-mode palette to define depth and urgency.
- **Base Foundations:** The background uses a deep slate (#0F172A) to reduce eye strain, while surfaces use a slightly lighter navy (#1E293B) to create structural containment.
- **Functional Accents:** Electric Cyan (#06B6D4) is the primary interactive color, reserved for system actions and healthy metrics.
- **Semantic Urgency:** Crimson Red (#EF4444) is strictly reserved for critical threat scores (>0.8) and destructive actions. Amber Orange (#F59E0B) indicates warning states and high-risk vectors (0.5 - 0.8).
- **Typography:** Headers use Slate 50 for maximum legibility; secondary metadata uses Slate 400 to maintain a clear information hierarchy.

## Typography
The typography strategy differentiates between "Interface Narrative" and "Data Reality." 
- **Geist** is used for high-level headings to provide a modern, sharp technical feel.
- **Inter** handles standard UI body copy and inputs, chosen for its exceptional readability in dense layouts.
- **JetBrains Mono** is the functional workhorse for all technical strings, including CVE IDs, IP addresses, hash values, and threat scores. This monospaced font ensures that character-specific details are never misread.
- Large displays scale down by 20% for mobile devices, while technical labels remain fixed at 12px/14px to preserve data integrity.

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

## Shapes
The shape language is "Soft-Industrial." Components use a **4px (Soft)** corner radius to maintain a professional, slightly rigid feel that aligns with cybersecurity's need for order. 
- **Buttons and Inputs:** 4px radius.
- **Cards and Modals:** 8px (Large) radius.
- **Severity Badges:** 2px radius for a sharper, "tag-like" appearance.
- **Selection Indicators:** Vertical bars (pill-shaped) are used on the left edge of active list items or navigation links.

## Components
- **Buttons:** Primary buttons use a solid Cyan (#06B6D4) fill with Slate 950 text. Secondary buttons use a Slate 800 ghost style with 1px borders.
- **Severity Badges:** Compact labels with JetBrains Mono text. Use low-opacity fills (15%) of the accent color with a solid 1px border of the same color for high visibility.
- **Data Tables:** Row headers in Slate 50. Alternate row striping is not used; instead, use 1px bottom borders. Critical rows should have a 2px Crimson left-border highlight.
- **Progress Bars:** Thin 4px tracks. The "fill" should utilize a slight gradient of the accent color. Critical bars (Red) include the soft glow effect mentioned in Elevation.
- **Radar Charts:** Use semi-transparent Cyan strokes with Slate 400 grid lines. Vertices for high-risk nodes should be marked with Amber or Red points.
- **Input Fields:** Dark fills (#0F172A) with a Slate 700 border. Focus state changes border to Cyan with a 1px glow.