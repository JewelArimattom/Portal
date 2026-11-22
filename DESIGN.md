---
name: UniMatch
description: An admissions atlas for comparing student records with published programme requirements.
colors:
  university-blue: "#142f4b"
  deep-blue: "#10283f"
  ink: "#152330"
  muted-ink: "#46535d"
  stone: "#f1f4f5"
  white: "#ffffff"
  rule: "rgb(20 47 75 / 16%)"
  campus-green: "#32674f"
  status-amber: "#885016"
  status-green-bg: "#edf5ef"
  status-green-ink: "#25563b"
  status-amber-bg: "#f8f0e6"
  status-amber-ink: "#70410e"
  status-neutral-bg: "#eff3f5"
  status-neutral-ink: "#354b5d"
typography:
  display:
    fontFamily: "Roboto Serif, Georgia, serif"
    fontSize: "clamp(54px, 6.05vw, 84px)"
    fontWeight: 400
    lineHeight: 0.99
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Roboto Serif, Georgia, serif"
    fontSize: "clamp(40px, 4.1vw, 58px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.028em"
  body:
    fontFamily: "Host Grotesk, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Host Grotesk, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
rounded:
  control: "999px"
  panel: "12px"
  panel-mobile: "10px"
  compact: "8px"
spacing:
  control-x: "22px"
  section-x: "clamp(24px, 6.1vw, 88px)"
  panel: "24px 28px 18px"
components:
  button-primary:
    backgroundColor: "{colors.university-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    height: "50px"
    padding: "0 22px"
  button-light:
    backgroundColor: "{colors.white}"
    textColor: "{colors.university-blue}"
    rounded: "{rounded.control}"
    height: "50px"
    padding: "0 22px"
  comparison-panel:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
---

# Design System: UniMatch

## Overview

**Creative North Star: “The Admissions Atlas”**

The Admissions Atlas treats programme discovery as a clear route through university choices. Architectural campus photography gives the page a real institutional setting; open white and cool stone surfaces, fine rules, and a shared comparison grid make requirements feel legible and navigable. University blue carries the main actions and structural emphasis, while green and amber distinguish the states used in the comparison example.

Roboto Serif gives large headings an editorial voice, balanced by the direct, compact Host Grotesk used for navigation, details, and controls. The composition moves from a full-bleed campus image to a requirement review and programme rows, with generous spacing and restrained interaction. The page closes by stating that admission is decided by each university.

**Key Characteristics:**
- Architectural campus photography and an open white/stone canvas.
- Deep university blue, with restrained green and amber status colors.
- Editorial serif headlines paired with precise sans-serif interface text.
- Comparison-led layouts built from thin rules and generous whitespace.

## Colors

A deep university blue anchors the system; pale stone and white provide quiet reading surfaces, with green and amber reserved for status distinctions.

### Primary
- **University Blue** (`colors.university-blue`): The main text and action color on light surfaces; also used for the navigation wordmark and comparison labels.
- **Deep Blue** (`colors.deep-blue`): The darkest blue, used for the closing footer and selected high-contrast text treatment.

### Secondary
- **Campus Green** (`colors.campus-green`): A restrained campus accent. The requirement example uses a related green treatment to mark a met result.
- **Status Amber** (`colors.status-amber`): The warm accent for a result that still needs review.

### Neutral
- **Ink** (`colors.ink`): Main text on light surfaces.
- **Muted Ink** (`colors.muted-ink`): Supporting descriptions and secondary details.
- **Stone** (`colors.stone`): Soft background for the comparison section.
- **White** (`colors.white`): Primary canvas and light action surface.
- **Rule** (`colors.rule`): Low-contrast dividers and panel outlines.
- **Status surfaces** (`colors.status-green-bg`, `colors.status-amber-bg`, `colors.status-neutral-bg`): Quiet backgrounds paired with their corresponding result text colors.

**The Status Color Rule.** Green, amber, and neutral status colors identify the comparison example’s distinct result states; keep them localized to status elements.

## Typography

**Display Font:** Roboto Serif (with Georgia, serif fallback)  
**Body Font:** Host Grotesk (with Arial, sans-serif fallback)

**Character:** The serif supplies an editorial, university-facing voice for large statements. Host Grotesk keeps navigation, programme details, and evidence labels compact and readable.

### Hierarchy
- **Display** (400, responsive 54–84px, 0.99 line-height): Hero statement; scales down on narrower screens.
- **Headline** (400, responsive 40–58px, 1.04 line-height): Main section headings; mobile size reduces to 35–43px.
- **Title** (600, 17–19px, compact line-height): Panel titles and programme names.
- **Body** (400, 16px, 1.55 line-height): Default interface copy, with supporting hero and section copy scaling between 16–18px.
- **Label** (600, 13–14px): Table headings, result badges, and compact navigation details.

## Layout

The desktop page uses broad split columns for hero copy and section introductions, then a four-column requirement comparison and a twelve-column campus photo arrangement. Large page sections use a viewport-height rhythm, with side insets that grow from 24px to 88px and section padding that scales with viewport height. At 900px, the split layouts and table columns tighten; at 639px, content stacks, table headings give way to labeled rows, and the photo grid becomes a two-column collage. Navigation changes to a menu at 800px. Keep comparison content aligned and give text room to breathe.

## Elevation & Depth

The observed landing surface is flat: depth comes from tonal changes between white and stone, thin blue-tinted rules, and the darkened photographic hero. Panels use a fine border instead of a drop shadow; interactive rows and buttons use brief position or color changes for feedback.

## Shapes

Controls and status badges use fully rounded pill silhouettes (999px). The comparison panel has a compact rounded rectangle (12px desktop, 10px mobile); the skip link uses a modest 8px corner. Photo frames remain square-edged and rely on cropped imagery rather than decorative outlines. Thin rules define panel and list structure.

## Components

### Buttons

Actions are compact pills with confident contrast and a small upward-arrow cue.
- **Shape:** Fully rounded pill (999px), 50px minimum height.
- **Primary:** University-blue fill, white text, 22px horizontal padding; used for the eligibility action on light sections.
- **Light:** White fill, university-blue text and outline; used over dark imagery and footer surfaces.
- **Hover / Focus:** Hover shifts color or lifts by 1px; active presses shift down. Keyboard focus has a visible 3px outline with offset.

### Chips

- **Style:** Result badges use a pill shape, compact padding, and a quiet tinted surface with matching status text.
- **State:** Green marks “Met,” amber marks “Needs verification,” and neutral blue-gray marks “Add evidence” in the illustrative comparison.

### Cards / Containers

- **Corner Style:** Compact rounded rectangle (12px desktop; 10px mobile).
- **Background:** White panel on the stone comparison section.
- **Shadow Strategy:** No shadow; a thin blue-tinted border defines the panel.
- **Internal Padding:** 24px 28px 18px desktop, tightening on mobile.

### Navigation

The wordmark uses the display serif; links use compact Host Grotesk text. Desktop links sit opposite the mark in a single row. Below 800px they collapse behind a round menu control, with full-width, ruled mobile links and a filled pill action. Hover underlines links; focus uses a clearly offset outline.

### Comparison Table

A thin-rule grid follows each requirement across student record, programme rule, and result. Keep the columns aligned on wide screens; on mobile, hide the header row and show each value with its own visible field label.

### Programme Rows

Programme links are open horizontal rows separated by hairline rules, with name, university, location, and a trailing arrow. On narrow screens, keep the programme and university visible and allow location to drop from the row.

## Do's and Don'ts

### Do:
- **Do** use architectural campus photography with the blue/white/stone palette.
- **Do** reserve green, amber, and neutral tinted treatments for compact requirement statuses.
- **Do** preserve the shared column alignment, thin rules, and generous section spacing when laying out comparison content.
- **Do** state that admission is decided by each university wherever the disclaimer is needed.

### Don't:
- **Don't** use color alone to communicate a requirement result; keep the status wording visible.
- **Don't** imply an admission guarantee or imply that UniMatch makes admission decisions.
- **Don't** claim admission or catalogue coverage beyond facts supported by the repository.
