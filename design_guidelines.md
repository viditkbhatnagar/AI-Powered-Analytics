# AI-Powered Analytics Design Guidelines

## Design Approach

**Selected System: Fluent Design + Data Visualization Best Practices**

This is a professional data visualization platform competing with Tableau/Power BI. Design follows Microsoft Fluent Design principles for productivity applications, emphasizing clarity, efficiency, and data-first layouts. The visual language should feel like a sophisticated enterprise analytics tool, not a marketing website.

**Core Principles:**
- Data is the hero - visualizations take center stage
- Functional clarity over decorative elements
- Professional, trustworthy aesthetic for career decisions
- Efficient information access with minimal friction

---

## Typography

**Font Family:**
- Primary: Inter (via Google Fonts CDN) - clean, readable, professional
- Monospace: 'Roboto Mono' for data values, numbers, code

**Type Scale:**
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Labels/Metadata: text-sm (14px)
- Small Text: text-xs (12px)

**Hierarchy:**
Use font-weight variations (font-medium, font-semibold, font-bold) and text opacity (text-opacity-90, text-opacity-70) to establish clear information hierarchy without relying on size alone.

---

## Layout System

**Spacing Primitives:**
Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm (p-4, m-8, gap-6, space-y-12, etc.)

**Container Structure:**
- Max-width: max-w-7xl for main content areas
- Page padding: px-6 md:px-8 lg:px-12
- Section spacing: py-8 md:py-12
- Card padding: p-6
- Component gaps: gap-4 to gap-8

**Grid Layouts:**
- Domain cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Visualization gallery: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6
- Dashboard builder: Three-column layout (250px sidebar | flex-1 canvas | 300px config panel)

---

## Application Architecture

**Overall Layout:**
Left sidebar navigation (240px fixed width) with top header bar (64px height). Main content area fills remaining space with proper scroll behavior.

**Navigation Structure:**
- Persistent left sidebar with icon + label navigation items
- Collapsible on mobile to hamburger menu
- Breadcrumb trail below header (Industry > Domain > Sub-domain)
- Top-right: Theme toggle, settings, export actions

**Page Layouts:**

**Home Page:**
Simple grid of industry cards (3-column on desktop). Each card shows industry icon, title, brief description, domain count. Supply Chain card highlighted as "Pre-loaded" with badge.

**Domain Gallery:**
18 domain cards in responsive grid. Each card: large icon at top, domain name, 2-line description, "Explore" button, sub-domain count badge. Hover elevation effect.

**Visualization Gallery:**
Category filter tabs at top (All, Trends, Domains, Salary, Certifications). Below: card grid of chart thumbnails with chart name, category badge, expand icon. Click opens full-screen chart modal.

**Dashboard Builder:**
Left panel: Collapsible data field tree (CO1-CO4 sections). Center: Drop zone canvas with grid snapping (4x6 grid). Right panel: Chart configuration (type selector, data mappings, styling options). Top toolbar: Save, Load, New Dashboard, Export.

**Chart Expansion Modal:**
Full-screen overlay with close button. Chart fills 80% of viewport width/height. Below chart: Export buttons (PNG, PDF, SVG, Excel), share button. Side panel with metadata (data source, last updated, download count).

---

## Component Library

**Cards:**
- Border: border border-gray-200 (subtle outline)
- Rounded corners: rounded-lg
- Hover state: hover:shadow-lg transition-shadow
- Padding: p-6
- Background: Solid (no gradients)

**Buttons:**
- Primary: Large touch target (px-6 py-3), rounded-md, font-medium
- Secondary: Same size, outlined variant
- Icon buttons: 40px x 40px square, rounded-md
- Button groups: gap-3 for spacing

**Data Tables:**
- Zebra striping on rows
- Sticky header on scroll
- Sort indicators in headers
- Row hover highlight
- Compact row height (py-2) for density

**Form Inputs:**
- Height: h-10 (40px minimum touch target)
- Rounded: rounded-md
- Border: border focus:ring-2 focus:ring-offset-2
- Labels: text-sm font-medium mb-2

**Modals/Dialogs:**
- Backdrop: Semi-transparent overlay
- Modal width: max-w-4xl for chart expansion, max-w-md for confirmations
- Padding: p-6
- Close button: Top-right, 32px x 32px

**Tabs:**
- Horizontal pill-style tabs for category filters
- Active tab: Solid background, inactive: transparent with subtle border
- Tab padding: px-4 py-2
- Gap between tabs: gap-2

**Badges/Tags:**
- Small, rounded-full, px-3 py-1, text-xs
- Use for: "Pre-loaded", category labels, domain counts
- No borders, solid backgrounds with contrasting text

**Tooltips:**
- Small, rounded-md, px-3 py-2
- text-xs, max-width: max-w-xs
- Show on hover for truncated text, icons, data points

**Charts:**
All charts use consistent padding (p-4), min-height of 400px for desktop, 300px for mobile. Legends positioned top-right or bottom-center. Axis labels: text-xs. Grid lines: subtle, dashed.

---

## Responsive Behavior

**Desktop (≥1200px):** Full three-column dashboard builder, 3-column domain grid, sidebar visible
**Tablet (768px-1199px):** 2-column grids, sidebar collapsible, chart thumbnails 2-up
**Mobile (<768px):** Single column, hamburger menu, stacked dashboard builder panels (tabs), full-width charts with horizontal scroll for wide data

**Touch Interactions:**
- Minimum button size: 44px x 44px
- Swipeable chart galleries on mobile
- Pull-to-refresh for data updates
- Pinch-zoom on expanded charts

---

## Images

**No hero images.** This is a data application, not a marketing site.

**Icons:**
Use Heroicons (via CDN) throughout - outline style for navigation/actions, solid style for filled states. Icon size: 20px (w-5 h-5) for inline, 24px (w-6 h-6) for buttons, 48px (w-12 h-12) for domain cards.

**Chart Thumbnails:**
Generated programmatically - static preview of actual chart data at 300px x 200px. No placeholder images.

**Illustrations:**
Empty states only: Simple line illustrations for "No dashboards created yet", "Upload your first file". Keep minimal and professional.

---

## Animations

**Minimal animations only:**
- Fade-in for modals: duration-200
- Slide-in for sidebars: duration-300
- Chart loading: Simple spinner, no skeleton screens
- Hover elevations: transition-shadow duration-200
- No scroll-triggered animations, parallax, or decorative motion

---

## Accessibility

- All interactive elements keyboard navigable
- Focus indicators: ring-2 ring-offset-2 on all focusable elements
- ARIA labels on icon-only buttons
- Color contrast: WCAG AA minimum for all text
- Screen reader announcements for chart data updates
- Skip-to-content link at top