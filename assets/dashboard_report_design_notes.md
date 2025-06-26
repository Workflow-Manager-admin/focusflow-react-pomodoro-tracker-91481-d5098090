# Pomodoro Dashboard/Report Section – UI Design Notes

## 1. Layout & Structure

- **Overall Structure:** Centered, vertically stacked layout. Centralized card for main timer; task list and controls below.
- **Containers:**
  - **Top Navigation Strip:** Fixed, flush with page background; contains logo on left, controls (Reset, Settings, profile icon) on right.
  - **Main Timer Card:** Large, centered rectangular card; contains tab-style segment selector at top, large timer, and a primary button.
  - **Current Task/Progress:** Small card below main timer (shows selected/current task).
  - **Task List Card:** Vertically stacked, rounded-corner card containing Tasks heading and sub-cards for individual tasks.

## 2. Color Palette (CSS Variables)

```css
:root {
  --bg-canvas: #BF5C5C;
  --card-bg: #CB6F6F;
  --primary-text: #fff;
  --secondary-text: #f0eaea;
  --accent: #ffffff;
  --divider: #D8A1A1;
  --button-bg: #fff;
  --button-text: #BF5C5C;
  --button-active-bg: #e7d3d3;
  --tab-active-bg: #A44444;
  --tab-inactive-bg: transparent;
  --icon-bg: #FFF1F1;
}
```
### Color Reference
- **Background:** Solid muted deep red (`#BF5C5C`).
- **Cards:** Slightly lighter, soft red (`#CB6F6F`).
- **Text:** White (`#fff`), off-white/gray for subtext.
- **Edges/Lines:** Slightly lighter divider lines.
- **Primary Buttons:** White fill, red text.
- **Tabs:** Active tab is deeper red, inactive are transparent.

## 3. Typography

- **Font Family:** "Helvetica Neue", Arial, sans-serif (sans-serif stack)
- **Primary Heading (Timer):** 
  - Size: ~4rem (massive)
  - Weight: Bold (700+)
  - Color: `#fff`
  - Line height: Tight/normal
- **Navigation:**
  - Logo: Bold, small caps, left
  - Settings/Reset/Profile: Medium to bold, 0.7-1rem
- **Tabs (Pomodoro/Short Break/Long Break):**
  - Size: ~1.1-1.2rem
  - Weight: 500-600
  - Case: Sentence/Title Case
  - Active: White text, colored bg; Inactive: light text, transparent bg
- **Task Titles & Descriptions:**
  - Task Name: 1rem-1.2rem, Semi-bold, white
  - Subtext (duration/count): 0.95rem, lighter color

## 4. Layout Methods

- **Top Bar:** Flexbox, `justify-content: space-between`, `align-items: center`
- **Main Column:** Flexbox, `flex-direction: column`, `align-items: center`, margin auto
- **Cards:** Fixed width (~370-400px), center-aligned, slight card/elevation effect (soft shadow or border)
- **Tabs:** Flex row, pill-shaped or rectangular, evenly spaced
- **Tasks:** Parent card (`<section>`) with vertical stacking, each task row is flex, spaced-between

## 5. Spacing & Sizing

- **Main Card Width:** ~370px-400px
- **Card Padding:** 24-32px (main timer), 18-24px (task card)
- **Card Border Radius:** 16px (rounded, accentuates "card" feel)
- **Button Height:** 48px, min-width: 120px, border-radius: 18px, font-size: 1.2rem
- **Tab Height:** 38-40px; margin between tabs: 0.5rem
- **Stacked Gaps:** 18-24px between stacked containers

## 6. Navigation

- **Left:** "PomoFocus" logo (with icon, if any)
- **Right:** Buttons: 
  - "Reset" (rectangular, outline, light background/button color)
  - "Setting" (rounded, faint color background), 
  - profile icon (filled circle with initial or avatar)

## 7. Interactive Elements

- **Tabs:** Clickable, pill/rectangle, change style on selected.
- **Start Button:** Raised, white fill, prominent.
- **Icon Buttons:** Overflow, settings icon, task addition ("+" sign in task section), subtle outlined or icon-only
- **Task Row:** Each task row has left icon (checkbox or type), main text, counter or menu on right.

## 8. Motifs & Details

- **Cards:** Soft, raised feel; rounded corners, all consistent.
- **Line Dividers:** Thin, slightly lighter than card background.
- **Highlight:** Current/active elements (active tab & button) have depth via color, minimal shadow.
- **Simplicity:** Minimal visual clutter, spacing is generous, focus remains on timer/countdown.

## 9. Imagery & Icons

- **Icons:** Monochrome or two-tone, simple line (SVG or font icon)
- **Profile:** Circle (avatar background solid, single character for initial)
- **Checkboxes/Task Icons:** Circle outline or minimal icon.

## 10. Responsive Adaptation

- **Mobile:** 
  - Cards and main content max-width: 95vw
  - Padding reduced to 12-16px
  - Navigation stack: Logo on left, controls become menu or icon-only

---

## 11. Example Structure (Component Map)

```
<Header>
  [Logo]                [Reset] [Setting] [Profile]
</Header>
<Main>
  <Card>
    <TabList> [Pomodoro] [Short Break] [Long Break] </TabList>
    <TimerDisplay> 25:00 </TimerDisplay>
    <StartButton> START </StartButton>
  </Card>
  <CurrentTaskCard> "Face mask" </CurrentTaskCard>
  <TaskListCard>
    <TasksHeader> Tasks <AddButton>+</AddButton></TasksHeader>
    <TaskRow>
      [Icon] Face mask [Count/controls]
    </TaskRow>
    <TaskRow>
      [Icon] Study [Count/controls]
    </TaskRow>
  </TaskListCard>
</Main>
```

---

## 12. Visual Hierarchy & UX Guidance

- Timer and active action are always visually dominant.
- Use color and elevation to indicate interaction states and focus.
- Side actions (reset, setting, profile) are easy to reach but visually downplayed vs main timer.

---

# END OF DESIGN NOTES
