---
name: Kinetic Logic
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#383939'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e3e2e2'
  on-surface-variant: '#d8c3af'
  inverse-surface: '#e3e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#a08e7c'
  outline-variant: '#534435'
  surface-tint: '#ffb866'
  primary: '#ffb866'
  on-primary: '#482900'
  primary-container: '#cc7f0a'
  on-primary-container: '#3f2300'
  inverse-primary: '#875200'
  secondary: '#4ae183'
  on-secondary: '#003919'
  secondary-container: '#06bb63'
  on-secondary-container: '#00431f'
  tertiary: '#8dcdff'
  on-tertiary: '#00344f'
  tertiary-container: '#2299da'
  on-tertiary-container: '#002d45'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddba'
  primary-fixed-dim: '#ffb866'
  on-primary-fixed: '#2b1700'
  on-primary-fixed-variant: '#673d00'
  secondary-fixed: '#6bfe9c'
  secondary-fixed-dim: '#4ae183'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#cae6ff'
  tertiary-fixed-dim: '#8dcdff'
  on-tertiary-fixed: '#001e30'
  on-tertiary-fixed-variant: '#004b70'
  background: '#121414'
  on-background: '#e3e2e2'
  surface-variant: '#343535'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
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
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
This design system is engineered for high-efficiency logistics and transport management. The aesthetic leans into a **Modern Corporate** style with **Minimalist** influences, prioritizing clarity and speed of information processing. 

The interface evokes a sense of "command and control"—reliable, precise, and sophisticated. By utilizing a deep obsidian foundation with sharp, vibrant accents, the UI reduces eye strain for dispatchers and fleet managers during long shifts while ensuring critical status changes are immediately visible. The style avoids unnecessary decoration, focusing instead on structural integrity, clear data hierarchies, and tactile interaction states.

## Colors
The palette is built on a high-contrast dark foundation to support professional logistics environments.

- **Primary (Orange):** Reserved for primary actions, critical alerts, and active navigational states. It provides high visibility against the dark background.
- **Success (Green):** Used exclusively for positive status indicators (e.g., "Delivered," "On Time") and completion states.
- **Surface & Background:** The background uses a near-black (#111111), while cards and containers use a slightly lifted gray (#181818) to create subtle depth without relying on heavy shadows.
- **Borders:** A consistent #2B2B2B is used for all structural containment, ensuring elements are defined but not distracting.
- **Typography:** Pure white (#FFFFFF) is used for maximum legibility on headers, while a muted gray (#9A9A9A) handles secondary metadata and placeholder text.

## Typography
Inter is the sole typeface for this design system, chosen for its exceptional legibility in data-heavy environments. 

- **Weight Strategy:** Use Semibold (600) for all headings and primary actions to ensure clear hierarchy. Medium (500) is used for labels and navigation items. Regular (400) is reserved for body text and data values.
- **Numerical Data:** Since this is a Transport Management System, all numbers should ideally use tabular lining (tnum) to ensure columns of figures align perfectly in tables and manifests.
- **Labels:** Small labels (label-sm) utilize a slight tracking increase and uppercase transform to distinguish metadata from interactive text.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on maximizing horizontal space for tabular data.

- **Desktop:** 12-column grid with 20px gutters. Sidebars are fixed at 280px, while the main content area expands to fill the viewport.
- **Tablets:** 8-column grid with 16px gutters. Sidebars collapse into a rail or hamburger menu.
- **Mobile:** 4-column grid with 16px margins. Content stacks vertically; horizontal tables should utilize "sticky columns" for identifiers (e.g., Load ID).
- **Rhythm:** An 8px/4px base unit ensures consistent vertical rhythm. Use 16px (md) for standard padding inside cards and 24px (lg) for section spacing.

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than traditional drop shadows, maintaining a flat, modern technical look.

- **Level 0 (Background):** #111111. The foundation for the entire app.
- **Level 1 (Surface):** #181818. Used for cards, table headers, and sidebar containers.
- **Level 2 (Overlay/Modals):** #222222. Used for popovers, dropdowns, and modal dialogs to provide a subtle lift against Level 1 surfaces.
- **Outlines:** All containers use a 1px solid border (#2B2B2B). For active or focused states, the border transitions to the primary accent (#C57A00).
- **Active State:** Hovered items in lists or tables should use a subtle background highlight (#222222) to indicate interactivity without disrupting the color flow.

## Shapes
The shape language balances the rigidity of professional software with the approachable feel of modern SaaS.

- **Standard Radius:** 12px is the default for cards, input fields, and large buttons. This creates a distinct, modern container identity.
- **Small Radius:** 8px is used for nested elements like internal card components or small action buttons.
- **Pill Shape:** Fully rounded corners (999px) are reserved for status badges (e.g., "In Transit") and the primary search bar, making them instantly recognizable as distinct UI types compared to layout containers.

## Components
- **Buttons:** Primary buttons use the #C57A00 background with white text and a 12px radius. Secondary buttons are outlined with #2B2B2B.
- **Tables:** Rows must be a minimum of 48px high. Use a 1px bottom border (#2B2B2B) to separate rows. On hover, the row background changes to #222222. Table headers use a slightly darker tone or subtle bolding to differentiate from data.
- **Status Badges:** Pill-shaped with a low-opacity background of the status color (e.g., Green for success) and a high-contrast text color.
- **Inputs:** Search bars are pill-shaped with a #181818 background and #2B2B2B border. Standard text inputs are 12px rounded rectangles.
- **Cards:** Background color #181818 with a 12px radius and #2B2B2B border. No shadow.
- **Data Visualizations:** Charts and maps should use the primary orange and secondary green for data points, with the neutral gray for axis lines and grid markers.