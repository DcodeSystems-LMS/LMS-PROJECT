# Student Assessments Page - UI Design Specification

## Page URL
`http://localhost:3000/student/assessments`

## Overall Layout

### Container
- **Max Width**: 1440px
- **Padding**: 24px (Desktop), 16px (Tablet), 12px (Mobile)
- **Background**: #FFFFFF
- **Spacing Between Sections**: 24px

---

## 1. Page Header Section

### Layout
- **Padding**: 0px
- **Margin Bottom**: 24px

### Elements
- **Title**: "Assessments"
  - Font Size: 24px (Desktop), 20px (Mobile)
  - Font Weight: 700 (Bold)
  - Color: #111827
  - Line Height: 1.2
  - Margin Bottom: 4px

- **Subtitle**: "Practice tests, quizzes, and track your progress"
  - Font Size: 16px (Desktop), 14px (Mobile)
  - Font Weight: 400 (Regular)
  - Color: #6B7280
  - Line Height: 1.5

---

## 2. Stats Section

### Container
- **Background**: #FFFFFF
- **Border**: 1px solid #F3F4F6
- **Border Radius**: 16px
- **Padding**: 24px (Desktop), 16px (Mobile)
- **Shadow**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **Margin Bottom**: 32px

### Section Title
- **Text**: "Your Assessment Progress"
- **Font Size**: 18px (Desktop), 16px (Mobile)
- **Font Weight**: 600 (Semi-Bold)
- **Color**: #111827
- **Margin Bottom**: 24px

### Stats Grid
- **Layout**: 4 columns (Desktop), 2 columns (Tablet/Mobile)
- **Gap**: 24px (Desktop), 16px (Mobile)

### Stat Card (Each)
- **Layout**: Centered, vertical stack
- **Icon Container**:
  - Size: 56px × 56px (Desktop), 48px × 48px (Mobile)
  - Border Radius: 16px
  - Background: Gradient (see colors below)
  - Icon: White, 20px (Desktop), 18px (Mobile)
  - Margin Bottom: 12px
  - Hover: Scale 1.05, Shadow

- **Value**:
  - Font Size: 32px (Desktop), 24px (Mobile)
  - Font Weight: 700 (Bold)
  - Color: #111827
  - Margin Bottom: 4px

- **Label**:
  - Font Size: 14px (Desktop), 12px (Mobile)
  - Font Weight: 400 (Regular)
  - Color: #6B7280

### Stat Card Colors
1. **Total Assessments**:
   - Icon Background: Linear gradient (135deg, #3B82F6, #2563EB)
   - Icon: `ri-file-list-line`

2. **Completed**:
   - Icon Background: Linear gradient (135deg, #10B981, #059669)
   - Icon: `ri-checkbox-circle-line`

3. **In Progress**:
   - Icon Background: Linear gradient (135deg, #F97316, #EA580C)
   - Icon: `ri-play-circle-line`

4. **Average Score**:
   - Icon Background: Linear gradient (135deg, #8B5CF6, #7C3AED)
   - Icon: `ri-star-line`

---

## 3. Course Filter Section

### Container
- **Background**: #FFFFFF
- **Border Radius**: 8px
- **Padding**: 24px (Desktop), 16px (Mobile)
- **Margin Bottom**: 24px

### Section Title
- **Text**: "Select Course"
- **Font Size**: 18px (Desktop), 16px (Mobile)
- **Font Weight**: 600 (Semi-Bold)
- **Color**: #111827
- **Margin Bottom**: 16px

### Course Grid
- **Layout**: 3 columns (Desktop), 2 columns (Tablet), 1 column (Mobile)
- **Gap**: 12px

### Course Button
- **Padding**: 16px (Desktop), 12px (Mobile)
- **Border**: 2px solid
- **Border Radius**: 8px
- **Text Align**: Left
- **Cursor**: Pointer
- **Transition**: All 0.2s

**Default State**:
- Border Color: #E5E7EB
- Background: #FFFFFF
- Hover: Border Color #D1D5DB

**Selected State**:
- Border Color: #3B82F6
- Background: #EFF6FF

**Content**:
- **Title**: Font Size 16px (Desktop), 14px (Mobile), Weight 500, Color #111827
- **Count** (if not "All Courses"): Font Size 14px (Desktop), 12px (Mobile), Color #6B7280, Margin Top 4px

---

## 4. Filter Tabs Section

### Container
- **Background**: #F3F4F6
- **Padding**: 4px
- **Border Radius**: 8px
- **Margin Bottom**: 24px
- **Layout**: Horizontal flex, scrollable on mobile

### Tab Button
- **Padding**: 8px 16px (Desktop), 6px 12px (Mobile)
- **Border Radius**: 6px
- **Font Size**: 14px (Desktop), 12px (Mobile)
- **Font Weight**: 500 (Medium)
- **Transition**: Colors 0.2s
- **White Space**: Nowrap
- **Margin**: 0 4px

**Default State**:
- Background: Transparent
- Color: #6B7280
- Hover: Color #111827

**Active State**:
- Background: #FFFFFF
- Color: #3B82F6
- Shadow: 0 1px 2px rgba(0, 0, 0, 0.05)

---

## 5. Assessment Card

### Container
- **Background**: #FFFFFF
- **Border Radius**: 8px
- **Padding**: 24px (Desktop), 16px (Mobile)
- **Shadow**: 0 1px 3px rgba(0, 0, 0, 0.1)
- **Margin Bottom**: 16px
- **Hover**: Shadow 0 10px 15px rgba(0, 0, 0, 0.1)
- **Transition**: Shadow 0.2s

### Card Layout
- **Desktop**: Flex row, space between
- **Mobile**: Flex column

### Left Section (Main Content)

#### Header Row
- **Layout**: Flex row, space between, wrap on mobile
- **Margin Bottom**: 12px

**Title Section**:
- **Title**: 
  - Font Size: 18px (Desktop), 16px (Mobile)
  - Font Weight: 600 (Semi-Bold)
  - Color: #111827
  - Margin Bottom: 4px
  - Truncate on overflow

- **Course Name**:
  - Font Size: 16px (Desktop), 14px (Mobile)
  - Font Weight: 400 (Regular)
  - Color: #6B7280
  - Margin Bottom: 8px
  - Truncate on overflow

**Badges** (Right side):
- **Layout**: Flex row, gap 8px, wrap
- **Badge**:
  - Padding: 4px 8px
  - Border Radius: 9999px (Full rounded)
  - Font Size: 12px
  - Font Weight: 500 (Medium)

**Badge Colors**:
- **Type Badge**:
  - Quiz: Background #DBEAFE, Color #1E40AF
  - Test: Background #E9D5FF, Color #6B21A8
  - Practice: Background #D1FAE5, Color #065F46

- **Difficulty Badge**:
  - Easy: Background #D1FAE5, Color #065F46
  - Medium: Background #FEF3C7, Color #92400E
  - Hard: Background #FEE2E2, Color #991B1B

#### Info Grid
- **Layout**: 4 columns (Desktop), 2 columns (Tablet), 1 column (Mobile)
- **Gap**: 16px
- **Margin Bottom**: 16px
- **Font Size**: 14px (Desktop), 12px (Mobile)
- **Color**: #6B7280

**Info Item**:
- **Layout**: Flex row, align center
- **Icon**: 
  - Size: 16px
  - Color: #9CA3AF
  - Margin Right: 8px
- **Text**: Font Size 14px (Desktop), 12px (Mobile)

#### Topics Section (if topics exist)
- **Margin Bottom**: 16px
- **Title**: 
  - Font Size: 14px (Desktop), 12px (Mobile)
  - Font Weight: 500 (Medium)
  - Color: #374151
  - Margin Bottom: 8px

- **Topics Container**:
  - Layout: Flex row, wrap, gap 8px
  - **Topic Badge**:
    - Background: #F3F4F6
    - Color: #374151
    - Padding: 4px 8px
    - Border Radius: 6px
    - Font Size: 12px

#### Score Section (if completed)
- **Background**: #D1FAE5
- **Padding**: 12px
- **Border Radius**: 8px
- **Margin Bottom**: 16px
- **Layout**: Flex row, space between, align center

- **Score Text**:
  - Label: Font Size 12px (Desktop), 11px (Mobile), Weight 500, Color #065F46
  - Value: Font Size 18px (Desktop), 16px (Mobile), Weight 700, Color #059669

- **Trophy Icon**:
  - Size: 24px (Desktop), 20px (Mobile)
  - Color: #059669

#### Feedback Section (if feedback exists)
- **Background**: #DBEAFE
- **Padding**: 12px
- **Border Radius**: 8px
- **Margin Bottom**: 16px
- **Layout**: Flex row, align start

- **Chat Icon**:
  - Size: 16px
  - Color: #1E40AF
  - Margin Right: 8px
  - Margin Top: 2px

- **Feedback Content**:
  - **Title**: "Instructor Feedback"
    - Font Size: 12px (Desktop), 11px (Mobile)
    - Font Weight: 500 (Medium)
    - Color: #1E3A8A
    - Margin Bottom: 4px
  - **Text**: 
    - Font Size: 12px (Desktop), 11px (Mobile)
    - Color: #1E40AF

### Right Section (Actions)

#### Actions Container
- **Desktop**: Flex column, gap 8px
- **Mobile**: Flex row, gap 8px

#### Action Buttons

**Primary Button** (Start/Continue):
- **Padding**: 8px 16px
- **Background**: #3B82F6
- **Color**: #FFFFFF
- **Border Radius**: 6px
- **Font Size**: 14px
- **Font Weight**: 500 (Medium)
- **Icon**: `ri-play-line`, Margin Right 8px
- **Hover**: Background #2563EB
- **Full Width**: On mobile

**Outline Button** (View Results):
- **Padding**: 8px 16px
- **Background**: Transparent
- **Border**: 1px solid #E5E7EB
- **Color**: #374151
- **Border Radius**: 6px
- **Font Size**: 14px
- **Font Weight**: 500 (Medium)
- **Icon**: `ri-eye-line`, Margin Right 8px
- **Hover**: Background #F9FAFB
- **Full Width**: On mobile

#### Status Badge
- **Padding**: 4px 12px
- **Border Radius**: 9999px (Full rounded)
- **Font Size**: 12px
- **Font Weight**: 500 (Medium)
- **Text Align**: Center

**Status Colors**:
- **Upcoming**: Background #F3F4F6, Color #374151
- **In Progress**: Background #FED7AA, Color #9A3412
- **Completed**: Background #D1FAE5, Color #065F46

---

## 6. Empty State

### Container
- **Padding**: 48px 24px
- **Text Align**: Center

### Icon Circle
- **Size**: 64px × 64px
- **Background**: #F3F4F6
- **Border Radius**: 50% (Circle)
- **Layout**: Flex center
- **Margin Bottom**: 16px
- **Icon**: `ri-file-list-line`
  - Size: 32px
  - Color: #9CA3AF

### Title
- **Text**: "No assessments found"
- **Font Size**: 18px
- **Font Weight**: 500 (Medium)
- **Color**: #111827
- **Margin Bottom**: 8px

### Description
- **Font Size**: 16px
- **Font Weight**: 400 (Regular)
- **Color**: #6B7280
- **Margin Bottom**: 16px

### Help Box (if applicable)
- **Background**: #DBEAFE
- **Border**: 1px solid #BFDBFE
- **Padding**: 16px
- **Border Radius**: 8px
- **Max Width**: 448px
- **Margin**: 0 auto
- **Layout**: Flex row, align start

- **Info Icon**: 
  - Size: 20px
  - Color: #3B82F6
  - Margin Right: 8px
  - Margin Top: 2px

- **Content**:
  - **Title**: "Need help?"
    - Font Size: 14px
    - Font Weight: 500 (Medium)
    - Color: #1E40AF
    - Margin Bottom: 4px
  - **Text**: 
    - Font Size: 14px
    - Color: #1E40AF

---

## 7. Start Assessment Modal

### Modal Container
- **Width**: 600px (Desktop), 90vw (Mobile)
- **Max Width**: 600px
- **Background**: #FFFFFF
- **Border Radius**: 8px
- **Padding**: 24px

### Modal Title
- **Text**: "Start Assessment"
- **Font Size**: 20px
- **Font Weight**: 600 (Semi-Bold)
- **Color**: #111827
- **Margin Bottom**: 16px

### Info Card
- **Background**: #F9FAFB
- **Padding**: 16px
- **Border Radius**: 8px
- **Margin Bottom**: 16px

**Content**:
- **Title**: 
  - Font Size: 18px
  - Font Weight: 600 (Semi-Bold)
  - Color: #111827
  - Margin Bottom: 8px

- **Course Name**:
  - Font Size: 16px
  - Font Weight: 400 (Regular)
  - Color: #6B7280
  - Margin Bottom: 12px

- **Info Grid**:
  - Layout: 2 columns
  - Gap: 16px
  - Font Size: 14px

  **Info Item**:
  - **Label**: Font Weight 500 (Medium), Color #374151
  - **Value**: Color #6B7280
  - **Badge Value**: Use badge styling if applicable

### Warning Box
- **Background**: #FEF3C7
- **Border**: 1px solid #FCD34D
- **Padding**: 16px
- **Border Radius**: 8px
- **Margin Bottom**: 16px
- **Layout**: Flex row, align start

- **Alert Icon**:
  - Size: 20px
  - Color: #D97706
  - Margin Right: 8px
  - Margin Top: 2px

- **Content**:
  - **Title**: "Important Instructions:"
    - Font Size: 14px
    - Font Weight: 500 (Medium)
    - Color: #92400E
    - Margin Bottom: 4px
  - **List**: 
    - Font Size: 14px
    - Color: #92400E
    - List Style: Disc, Inside
    - Line Height: 1.6

### Action Buttons
- **Layout**: Flex row, justify end, gap 12px
- **Margin Top**: 16px

**Cancel Button**:
- **Padding**: 8px 16px
- **Background**: Transparent
- **Border**: 1px solid #E5E7EB
- **Color**: #374151
- **Border Radius**: 6px
- **Font Size**: 14px
- **Font Weight**: 500 (Medium)
- **Hover**: Background #F9FAFB

**Start Button**:
- **Padding**: 8px 16px
- **Background**: #3B82F6
- **Color**: #FFFFFF
- **Border Radius**: 6px
- **Font Size**: 14px
- **Font Weight**: 500 (Medium)
- **Icon**: `ri-play-line`, Margin Right 8px
- **Hover**: Background #2563EB

---

## Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

---

## Icons Used (RemixIcon)

- `ri-file-list-line` - Total assessments
- `ri-checkbox-circle-line` - Completed
- `ri-play-circle-line` - In progress
- `ri-star-line` - Average score
- `ri-time-line` - Duration
- `ri-question-mark` - Questions
- `ri-refresh-line` - Attempts
- `ri-calendar-line` - Due date
- `ri-trophy-line` - Score
- `ri-chat-3-line` - Feedback
- `ri-play-line` - Start/Continue
- `ri-eye-line` - View results
- `ri-alert-line` - Warning
- `ri-information-line` - Info

---

## Notes for Figma Implementation

1. Use Auto Layout for all components
2. Set up proper constraints for responsive behavior
3. Create component variants for different states (hover, active, disabled)
4. Use color styles for consistent theming
5. Set up text styles for typography
6. Use effects (shadows) as specified
7. Create reusable badge components
8. Set up proper spacing using 4px grid system

