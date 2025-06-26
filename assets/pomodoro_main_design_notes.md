# Pomodoro App Main Layout & UI Design Specification

## General Layout
- **Background**: Solid desaturated brick red (#B46A6A, inferred, use variable `--bg-red`).
- **Centralized content**: All major components are horizontally centered inside the viewport.

---

## Top Navigation Bar

- **Position**: Fixed at very top, full width
- **Background Color**: Matches page (`--bg-red`)
- **Contents**: 
  - **Left-aligned (Logo)**: 
    - Pomofocus logo ("Pomofocus" in bold, white)
    - Pomodoro/clock icon at far left (white, likely SVG)
    - Margin to right of logo text: ~16px
  - **Right-aligned Controls**: 
    - "Report" button (light gray bg, rounded, white text, font-size: 0.85em)
    - "Setting" button (light gray bg, rounded, white text, font-size: 0.85em)
    - Profile icon/button (rounded magenta/pink with initial or icon, rightmost)
    - Spacing between action buttons: 8–12px
    - Padding (nav contents): 16–20px vertical, 32–40px horizontal

---

## Timer & Mode Box

- **Container**: 
  - Light rose background (`--card-bg`, about #af7575, slightly lighter than main bg)
  - Rounded corners, generous padding (~32px top/bot, 24px sides).
  - Width: ~440px, centered.
- **Mode Tabs**:
  - Three tabs: Pomodoro (active), Short Break, Long Break
  - Layout: Inline, horizontal, upper inside of the timer card
  - **Active tab**: 
    - Bg: dark, pill button style (#7A4040)
    - White text, padding x/y: 12px/4px, border radius: 16px
  - **Inactive tabs**: lighter gray text, bg transparent, cursor pointer 
  - Margin between tabs: 10–16px
- **Timer Value**:
  - Large, bold, centered text: "25:00"
  - Font: 'Helvetica Neue, Arial, sans-serif', font-weight: 700, 
  - Size: 64–72px
  - Color: white
  - Margin below tabs: 18–24px
- **Start Button ("START")**:
  - Rectangular, pill-like, white bg, bold red text
  - Centered horizontally beneath timer
  - Height: 48px, min-width: 120px
  - Border radius: 8px
  - Margin above/below: 24px top, 16px bottom

---

## Current Task Display

- **Below Timer Box!**
- Centered, small text "#1" (task/order index, muted gray #dbafaf)
- Below index: task name, slightly larger, white, font-weight semibold
- Margin below timer card: 18–24px

---

## Task Field & Task List

- **Container**: 
  - Width: 440px, centered
  - Padding top: 0px (immediately following timer area)
  - Padding left/right: 8–12px
- **Task Field Header**:
  - "Tasks" (bold, white, smaller than heading, margin-bottom: 8px)
  - Add button/icon (plus inside rounded square, right aligned)
- **Task Items**:
  - Card-style list, vertically stacked, no visible border/shadow, separated by ~12px
  - Each Task:
    - Light gray background (#F5F5F5, `--task-bg`)
    - Rounded corners (8px)
    - Padding: 14px vertical, 16px horizontal
    - Left: circular checkbox (unfilled, gray border)
    - Center: task name (medium, dark text, font-size 1.06em)
    - Right: "O/" and menu icon (three dots, vertical, light gray)
    - Icon size: 20px
  - Space between each item: 10–12px

---

## Colors (as CSS Variables)

```
:root {
  --bg-red: #B46A6A;
  --card-bg: #af7575;
  --task-bg: #F5F5F5;
  --primary-text: #fff;
  --secondary-text: #dbafaf;
  --active-tab-bg: #7A4040;
  --task-text: #353535;
  --action-pink: #d33682;
  --icon-gray: #bbb;
  --btn-bg-gray: #ccc;
  --btn-text: #fff;
}
```

---

## Typography

- **Global font family**: 'Helvetica Neue', Arial, sans-serif
- **Logo**: bold, uppercase, tracking-wide, white, 1.25rem
- **Nav buttons**: 0.85rem, weight 500, white
- **Tabs**: 1rem, uppercase, 600, tracking-wide
- **Timer**: 72px, 700, line-height 100%, white, centered
- **Start button**: 1.15rem, 600, red text
- **Task section header**: 1.06rem, 600, white
- **Task names**: 1rem, 500, very dark gray

---

## Spacing & Border Radius

- **Main card**: 24px radius
- **Task item**: 8px radius
- **Button/tab pill corners**: 16px (tabs), 8px (buttons)
- **Gaps**: 16px nav items, 24px between major modules (timer/tasks), 10–12px between tasks

---

## Layout & Responsiveness

- **Central content**: uses column flexbox, centered horizontally. All modules have the same max width (440px).
- **Mobile**: On small screens, all widths are 100%, padding increases, module stacks keep vertical rhythm.

---

## Navigation

- **Structure**: 
  - Top fixed nav bar: logo left, controls right.
  - Central main card (timer/tabs)
  - Below: task display, then task list

---

## Interactive Elements

- **Nav Buttons**: hover effect (lighter gray)
- **Mode Tabs**: highlight + bg fill for active
- **Start Button**: slight shadow on hover, color inversion on click
- **Task Checkbox**: interactive (click to toggle), fill appears when done
- **Task menu**: three-dot menu, brings up task options (edit/delete)
- **"Add Task" icon**: click displays new task entry field

---

# Summary UI Flow

1. User controls main timer via center box (mode tabs to switch)
2. See active task below timer
3. View/manage tasks below (checkbox, reorder, menu)
4. Navigation bar always accessible at top

---

# Notes
- Border shadows are subtle or non-existent, flat design style.
- Rounded corners throughout
- All icons: SVG or font-based.
- Try to match all colors with CSS variables for easy theming.

