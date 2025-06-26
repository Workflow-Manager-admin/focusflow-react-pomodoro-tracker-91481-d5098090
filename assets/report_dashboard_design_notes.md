# Pomodoro Report Dashboard – UI Design Notes

## Page Structure & Layout
- **Container:** The page uses a single-column, centered layout, with moderate horizontal padding (approximately 24–32px).
- **Top Navigation Tabs:** Fixed at the top within a rounded-rectangle background ("tabbed" motif).
  - **Tabs:** "Summary" (active), "Detail", "Ranking"
    - **Active Tab Color:** #E8B5B7 (pinkish pastel), solid fill.
    - **Inactive Tab Color:** White background, thin pink border.
    - **Tab Font:** Medium-weight, sans-serif, ~16px, all-caps or normal case.
    - **Spacing:** Uniform margin/gap between tabs, tab group horizontally centered.
- **Section Titles:**
  - "Activity Summary", "Focus Hours" — simple, medium bold, ~16px, standard left margin.
  - Top and bottom margin above/below titles: approx. 24px.

---

## Dashboard Components

### 1. **Activity Summary Section**
- **Location:** Beneath tabs, with ~32px vertical margin from nav.
- **Contains:** 3 summary cards horizontally arranged ('flex row').
  - **Cards:**
    1. **Hours Focused:** 
       - **Icon:** Clock, circular background, line icon pink (#E8B5B7)
       - **Metric:** "0"
       - **Label:** "hours focused"
    2. **Days Accessed:**
       - **Icon:** Calendar
       - **Metric:** "1"
       - **Label:** "days accessed"
    3. **Day Streak:**
       - **Icon:** Flame
       - **Metric:** "1"
       - **Label:** "day streak"
  - **Card Style:**
    - Card background: White
    - Border radius: ~12px
    - Box shadow: Very soft/pastel shadow or none
    - Padding: ~12–16px all sides
    - Metrics: Large, bold, pink color
    - Labels: Smaller, gray or muted text
    - Icon: Top, centered, sized ~28x28px
    - Spacing between cards: ~16–24px ("gap")

---

### 2. **Focus Hours Section**
- **Header:** "Focus Hours"
- **Filter Bar:** Three toggle buttons, grouped
  - "Week" (active), "Month", "Year"
    - Button Style:
      - Active: pink fill (#E8B5B7), white text
      - Inactive: white background, pink border, pink text
      - Rounded corners, font ~14px, medium weight
      - Spacing: ~8px gap between buttons
  - **Date Range Bar:** To the right of buttons
    - Contains: Lock icon, selected range ("This Week") in pill-shaped button, left/right chevrons for navigation.
    - Buttons: White bg with pink border, rounded, consistent sizing with filter buttons.
    - Chevrons: Small icons, pink
    - Spacing: 8px between range nav and toggles.
- **Graph/Card:**
  - **Area:** Large card, white background with gridlines for a bar graph. (Full width minus regular padding.)
  - **Graph:** Bar chart.
    - **X-Axis:** Date range (rotated labels), e.g. "Fri 21-Jun"
    - **Y-Axis:** Decimal value axis (0–0.025 increments)
    - **Bars:** Pale pink fill (#E8B5B7, 40% opacity). Only one bar present.
    - **Legend:** Top center overlay - "No Project" with pink icon.
  - **Padding:** Top/bottom ~24px, sides ~20–24px inside card.

---

### 3. **Focus Hours Breakdown Table**
- **Table Style:**
  - **Header Row:** "PROJECT" (left), "TIME(HR:MIN)" (right)
     - All-caps header, gray text, font size ~12px, bold/medium
     - Border-bottom: thin, light gray
  - **Rows:**
    - **No Project:** Checkbox (filled, pink), project label aligned left, duration right ("00:01")
    - **Total:** Label "Total" (bold), right-aligned total duration ("00:01")
  - **Checkbox:** Square, pink fill when checked
  - **Edit Button:** Top-right of table, small rounded button, pink border and text, no fill
  - **Spacing:** Row height ~36px, vertical margin above/below: ~16px
  - **Table BG:** White, rounded corners, subtle border/shadow

---

## Theme & Visual Motifs
- **Primary Color:** #E8B5B7 (Pastel Pink, used for accent, buttons, icons)
- **Secondary:** #FFF (White, backgrounds)
- **Typography:** 
  - Font Family: "Helvetica Neue", Arial, sans-serif
  - Headers: ~16px, medium/bold
  - Body: ~14px, normal/medium
  - Number/Metric: ~28px, bold, pink color
- **Spacing System:**
  - Main vertical rhythm: ~24px between blocks, ~16px internal gutters
  - Card gap: ~16px
  - Table margin: ~16px above/below
- **Radii:**
  - Buttons/cards: ~12px
  - Pills/toggle: ~24px fully rounded
- **Iconography:** 
  - Line icons, pink stroke
  - Checkbox: Pink with white check
  - Nav/Legend: SVG preferred, min size 20x20px
- **Borders:** Thin 1px, solid pink outline on interactive items

---

## Layout/Responsiveness
- **Single-column, mobile-first design**
- On small screens, card stack vertically; graph and tables are full width with minimal horizontal scrolling.
- Padding collapses to ~12px sides on <600px screens.

---

## Components Inventory
- Tab bar (with active/inactive visual state)
- Metric cards (with icon/title/value)
- Filter toggle group (Week/Month/Year)
- Date range nav pill (left/right)
- Chart card (with legend)
- Table (with checkboxes and edit button)
- Icon buttons (edit, chevrons)
- Section heading
- Empty state (bars/metrics when 0)

---

**This spec serves as a detailed implementation reference to recreate the "Report" dashboard as shown in the screenshots. Every measurement/color has been inferred from the visuals for maximum fidelity.**
