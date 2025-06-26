# Pomodoro Timer Interface – Design Notes

## 1. Color Palette

| Use                           | Color (Hex) |
|-------------------------------|-------------|
| Primary Background            | `#d96868`   |
| Surface/Card Background       | `#c85f5f`   |
| Accent/Primary Button (text)  | `#fff`      |
| Tab Inactive Text             | `#e8b3b3`   |
| Icon/Border                   | `#fff`      |
| Floating Button (background)  | `#fff`      |
| CTA Button Text               | `#c85f5f`   |


## 2. Typography

- **Font Family:** "Helvetica Neue", Arial, sans-serif
- **Timer Display:** 72–96px, bold, white
- **Section Headers ("Tasks", session label):** 18–24px, semi-bold, white
- **Buttons ("START"):** 18–22px, medium–bold, uppercase, centered, white bg
- **Tabs (labels):** 14–16px, regular, white when selected, soft pinkish inactive
- **Task/Body Text:** 14–18px, regular/semi-bold, white or soft/muted red as context signals
- **Button text:** Bold, uppercase, white or main accent

## 3. Layout & Structure

### A. Header Bar
- **Type:** Horizontal, fixed-top, full width
- **Components:**
    - Left: Logo ("Pomofocus"), white text
    - Right: Icon-buttons: 
        - "Report", "Setting", "Sign In"
        - White background, rounded rectangle
        - Icon + label, 12–16px margin right
- **Padding:** 16–20px y-axis, 24–32px x-axis

### B. Main Content Area
- **Centered Card/Surface:** Rounded corners (16–20px radius), muted-red background
- **Tabs:** 
    - Tabs aligned horizontally above main timer
    - "Pomodoro" (selected), "Short Break", "Long Break"
    - Pill-shaped for selected, muted/faint for inactive
    - Even padding and spacing (16px each side)
- **Timer Display:** 
    - Large, centered numeric display (`30:00`), bold, white
    - Ample top/bottom margin (24–32px)
- **START Button:** 
    - Large rectangle, white background
    - Soft red text, 8–16px border radius
    - Centered below timer
- **Session Label:**
    - Example: "#2 Time to focus!"
    - Centered, smaller than timer, top/bottom margin

### C. Tasks Section
- **Container:** Below timer area, muted-red background, rounded
- **Header:** "Tasks" label left, settings/menu icon right, horizontal rule below
- **Add Task:**
    - Centered pill/oval button
    - Plus icon ("+") left, text "Add Task" right
    - Outlined/ghost style
- **Section separation:** Dotted/dashed line
- **Task Item Area:** Area for tasks not fully visible, separated by lines

### D. Floating Action Buttons
- **Bottom Left:** "Visit site"
    - Rounded pill/button, external arrow icon, shadow, white bg
    - Black or dark icon/text
- **Bottom Right:** Refresh/Reset ("↻")
    - Circular, white, shadow, dark icon

### E. Spacing & Border Radius
- **Container/Card Padding:** 24–32px
- **Sections Separation:** 24–32px vertical
- **Card/Surface Border Radius:** 16–20px
- **Tab Pills/Buttons:** 16px
- **Main Button:** 8–16px

## 4. Motifs & Icons

- Minimal, soft-rounded, bold color blocks
- Icons used: report, settings, sign-in, plus/add, refresh/reset, external/visit site
- Consistent icon sizing: 16–20px
- Prominent, obvious tabs

## 5. Interactive Elements

- **Tabs:** Mode switch, pill highlight for active, pointer hover/selection
- **Start Button:** Central CTA, bold
- **Add Task:** Floating/centered, primary outlined style
- **Floating buttons:** Fixed to corners, always visible

## 6. Responsiveness & Adaptation

- Expect single column stack for mobile/tablet
- Floating buttons remain anchored to viewport corners
- Sufficient separation and padding at all breakpoints

---

## CSS Variable Suggestions

```css
:root {
  --primary-bg: #d96868;
  --card-bg: #c85f5f;
  --primary-text: #fff;
  --inactive-tab: #e8b3b3;
  --button-bg: #fff;
  --button-text: #c85f5f;
  --border-radius-lg: 20px;
  --border-radius-md: 16px;
  --border-radius-sm: 8px;
  --header-padding: 24px;
}
```

---

## UI Structure Outline

```
<Header>
  <Logo />
  <IconButtonGroup>
    <IconButton>Report</IconButton>
    <IconButton>Setting</IconButton>
    <IconButton>Sign In</IconButton>
  </IconButtonGroup>
</Header>
<MainContent>
  <Card>
    <Tabs>
      <Tab active>Pomodoro</Tab>
      <Tab>Short Break</Tab>
      <Tab>Long Break</Tab>
    </Tabs>
    <TimerDisplay>30:00</TimerDisplay>
    <StartButton>START</StartButton>
    <SessionLabel>#2 Time to focus!</SessionLabel>
  </Card>
  <TasksSection>
    <TasksHeader>
      <span>Tasks</span>
      <IconButton>[Settings/Menu]</IconButton>
    </TasksHeader>
    <Divider />
    <AddTaskButton><Icon>+</Icon> Add Task</AddTaskButton>
    <!-- Task list items here -->
  </TasksSection>
</MainContent>
<FloatingActionButton position="bottom-left">Visit site</FloatingActionButton>
<FloatingActionButton position="bottom-right">↻</FloatingActionButton>
```

---

**Use this as the implementation reference for creating a visually accurate Pomodoro timer interface matching the provided screenshot.**
