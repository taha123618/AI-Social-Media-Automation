# Schedule a Demo — Design Specification

---

## 1. Context and Goals

**Design intent**: Deliver a conversion-optimized, enterprise-grade demo booking page where decision-makers can schedule a personalized product walkthrough in under 90 seconds with zero friction.

**Business goals**:
- Drive qualified demo requests from buyers, teams, and decision-makers
- Reduce time-to-submission with clear hierarchy and progressive disclosure
- Establish trust through social proof, transparent process, and professional presentation
- Maintain 100% design token compliance — no hard-coded values

**User goals**:
- Quickly understand what the demo includes and whether it's worth their time
- Complete the booking form with minimal cognitive load
- Receive clear confirmation and next-step expectations

**Page density**: links (10), inputs (8), lists (3), buttons (2), navigation (1)

---

## 2. Design Tokens and Foundations

### 2.1 Typography

| Token | Value |
|---|---|
| `font.family.primary` | Inter |
| `font.family.stack` | Inter, Inter Placeholder, sans-serif |
| `font.size.base` | 16px |
| `font.weight.base` | 500 |
| `font.lineHeight.base` | 25.6px |
| `font.size.xs` | 8px |
| `font.size.sm` | 12px |
| `font.size.md` | 14px |
| `font.size.lg` | 16px |
| `font.size.xl` | 17px |
| `font.size.2xl` | 18px |
| `font.size.3xl` | 20px |
| `font.size.4xl` | 24px |

Headings must use `font.weight` 700–800. Body text must use `font.weight.base` (500). Labels must use `font.weight` 600. Fine print (legal, hints) must use `font.size.sm` (12px).

### 2.2 Color Palette

| Token | Value | Usage |
|---|---|---|
| `color.surface.base` | `#000000` | Page background (dark mode) |
| `color.surface.muted` | `#ffffff` | Card / container backgrounds (light mode) |
| `color.surface.raised` | `#f8f8ff` | Elevated surfaces, hover states (light mode) |
| `color.surface.strong` | `#2e42ff` | Primary actions, active indicators, brand accents |
| `color.text.secondary` | `#1e2022` | Body text, form labels, headings |
| `color.text.tertiary` | `#19154e` | Secondary headings, muted emphasis |
| `color.text.inverse` | `#51565b` | Muted body text, placeholders, disabled text |

**Contrast compliance**:
- `color.text.secondary` on `color.surface.muted`: ratio ≥ 14.3:1 (passes AAA)
- `color.text.inverse` on `color.surface.muted`: ratio ≥ 4.1:1 (passes AA)
- `color.surface.strong` on `color.surface.muted`: ratio ≥ 5.8:1 (passes AA for text ≥ 14px bold)

### 2.3 Spacing Scale

| Token | Value | Example usage |
|---|---|---|
| `space.1` | 5px | Inline icon gaps, badge padding |
| `space.2` | 8px | Micro spacing between label and field |
| `space.3` | 10px | Tight component spacing |
| `space.4` | 12px | Section divider margin |
| `space.5` | 15px | Form row gap (horizontal) |
| `space.6` | 18px | Card padding (compact) |
| `space.7` | 20px | Card padding (standard) |
| `space.8` | 25px | Section spacing, form group spacing |

**Rules**: All spacing must use this scale. Never use arbitrary pixel values. Section-to-section vertical rhythm must be `space.8` × 4 (100px) minimum.

### 2.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius.xs` | 5px | Small badges, tags |
| `radius.sm` | 6px | Small UI elements |
| `radius.md` | 8px | Input fields, selects |
| `radius.lg` | 10px | Cards, containers |
| `radius.xl` | 40px | Hero CTAs, large buttons |

### 2.5 Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow.1` | `rgba(21, 16, 47, 0.02) 0px 14px 20px 0px` | Subtle card elevation |
| `shadow.2` | multi-layer: 0.6px/0.6px/-1.25px rgba(0,0,0,0.72), 2.3px/2.3px/-2.5px rgba(0,0,0,0.64), 10px/10px/-3.75px rgba(0,0,0,0.25) | Raised cards, dropdowns |
| `shadow.3` | multi-layer: 0.6px/0.6px/-1.25px rgba(0,0,0,0.18), 2.3px/2.3px/-2.5px rgba(0,0,0,0.16), 10px/10px/-3.75px rgba(0,0,0,0.06) | Modal, floating elements |
| `shadow.4` | `rgba(21, 16, 47, 0) 0px 0px 0px 0px` | No shadow (reset) |

### 2.6 Motion

| Token | Value | Usage |
|---|---|---|
| `motion.duration.instant` | 200ms | Hover, focus, active transitions |

All interactive transitions must use `200ms` with `ease-in-out` easing. Page-section entrance animations should use 400–600ms staggered at 80–120ms intervals.

---

## 3. Component-Level Rules

### 3.1 Page Layout

**Anatomy** (top-to-bottom):
1. Navbar (sticky, `z-index: 100`)
2. Hero Section
3. Demo Form Section
4. How It Works Section
5. Features/Benefits Section (optional — depending on content strategy)
6. Trust Section (testimonials + stats)
7. FAQ Section
8. CTA Section
9. Footer

**Responsive behavior**:
- Desktop (≥1024px): 12-column grid, max-width 1200px centered
- Tablet (640–1023px): 8-column grid, reduced horizontal padding to `space.5`
- Mobile (<640px): 4-column grid, single-column layout, full-bleed sections

**Edge cases**:
- When JS is disabled: form must still render and submit via native HTML form behavior; animations degrade gracefully (static layout)
- When content is empty: each section must handle "no data" gracefully — lists show "Nothing here yet", stats show dashes, testimonials show placeholder

---

### 3.2 Navigation

**States**:
- **default**: `color.text.secondary` on `color.surface.muted`, no underline
- **hover**: `color.text.secondary`, `opacity: 0.8`
- **focus-visible**: `outline: 2px solid color.surface.strong`, `outline-offset: 2px`
- **active**: `color.surface.strong`
- **disabled**: `color.text.inverse`, `opacity: 0.5`, `pointer-events: none`

**Keyboard & pointer**: `Enter`/`Space` activates link. Touch target must be ≥44×44px.

**Responsive**: On mobile (<768px), navigation collapses into a hamburger menu with slide-in drawer.

**Accessibility**: Each link must have visible text. Icon-only links must have `aria-label`. Focus order must match visual order.

---

### 3.3 Buttons (2 instances: primary + outline)

#### Primary Button ("Book Your Demo")

| State | Background | Text | Border | Shadow |
|---|---|---|---|---|
| default | `color.surface.strong` | `#ffffff` | none | `shadow.2` |
| hover | `color.surface.strong` (darken 8%) | `#ffffff` | none | `shadow.3` |
| focus-visible | `color.surface.strong` | `#ffffff` | `2px solid color.surface.strong` + `2px offset ring` | — |
| active | `color.surface.strong` (darken 15%) | `#ffffff` | none | `shadow.1` (inset) |
| disabled | `color.text.inverse` @ 30% | `color.text.inverse` @ 50% | none | `shadow.4` |
| loading | Same as disabled + `cursor: wait` | — | — | — |

**Specs**: `height: 56px`, `padding: 0 space.8`, `font.size.lg`, `font.weight: 700`, `radius.xl`

#### Outline Button ("View Pricing")

| State | Background | Text | Border |
|---|---|---|---|
| default | transparent | `color.text.secondary` | `1px solid color.text.inverse` |
| hover | `color.surface.raised` | `color.text.secondary` | `1px solid color.text.secondary` |
| focus-visible | transparent | `color.text.secondary` | `2px solid color.surface.strong` + offset ring |
| active | `color.surface.raised` (pressed) | `color.surface.strong` | `1px solid color.surface.strong` |
| disabled | transparent | `color.text.inverse` @ 50% | `1px solid color.text.inverse` @ 30% |

**Specs**: Same as primary (height, padding, font, radius)

**Edge cases**:
- Long button text (mobile): text wraps to two lines max, button height expands to fit, `overflow: hidden`
- Multiple CTAs in a row: stack vertically on mobile with `space.4` gap

---

### 3.4 Inputs (8 instances)

**Types**: text (firstName, lastName, email, company, jobTitle, phone), date, select (teamSize, country, useCase, preferredTime), textarea (notes)

| State | Border | Background | Text | Icon |
|---|---|---|---|---|
| default | `1px solid color.text.inverse` @ 30% | `color.surface.muted` | `color.text.secondary` | `color.text.inverse` |
| hover | `1px solid color.text.inverse` @ 60% | `color.surface.raised` | `color.text.secondary` | `color.text.secondary` |
| focus-visible | `2px solid color.surface.strong` | `color.surface.muted` | `color.text.secondary` | `color.surface.strong` |
| filled/valid | `1px solid` green-500 @ 40% | `color.surface.muted` | `color.text.secondary` | green-500 |
| error | `2px solid` red-500 | `color.surface.muted` | `color.text.secondary` | red-500 |
| disabled | `1px solid color.text.inverse` @ 15% | `color.surface.raised` @ 50% | `color.text.inverse` @ 50% | `color.text.inverse` @ 40% |
| loading | Same as disabled + skeleton shimmer | — | — | — |

**Specs**: `height: 48px`, `padding: 0 space.4`, `font.size.md`, `font.weight: 500`, `radius.md`

**Icon prefix**: 20×20px, positioned `left: space.4`, vertically centered. Input text must have `padding-left: 44px` to clear the icon.

**Long content**:
- Text inputs: `text-overflow: ellipsis` on overflow
- Select: truncate with ellipsis, full content visible in dropdown
- Textarea: `field-sizing: content` with `min-height: 100px`, `max-height: 300px`, vertical scroll at limit
- Date input: use native `<input type="date">` with `min` set to today and `max` set to +90 days

**Keyboard**: `Tab` to focus (in logical order), `Enter` to submit form, `Escape` to blur/dismiss select dropdown, arrow keys to navigate select options.

**Accessibility**:
- Each input must have a visible `<label>` element (not placeholder-only)
- Error messages must use `aria-describedby` linking to error element
- Required fields must have `aria-required="true"`
- Input groups must use `<fieldset>` + `<legend>`
- Autocomplete attributes must be set: `given-name`, `family-name`, `email`, `organization`, `organization-title`, `tel`, `country-name`

---

### 3.5 Form (1 instance — DemoBookingForm)

**States**:
- **idle**: All 8 inputs visible, submit button enabled, helper text visible
- **filling**: Inline validation on blur (not keystroke), character count shown for textarea
- **submitting**: All inputs disabled, button shows spinner + "Submitting..." text, form blocking
- **success**: All inputs hidden, success card visible with checkmark + "We'll be in touch within 24 hours"
- **error**: Scrolled to first error, error banner at top + inline field errors, form remains editable
- **validation error**: Field borders turn red, error message appears below field, focus moved to first erroneous field

**Layout**: Two-column grid on desktop (fields alternate sides), single-column on mobile.

**Submit flow**: `POST` to `/api/demo` → validate → store → return 200/422. No client-side-only submission.

**Edge cases**:
- Form abandoned mid-fill: no auto-save for MVP; future iteration may add localStorage draft
- Double-click prevention: button disabled after first click
- Network timeout: show toast "Connection lost. Your draft has been saved." with retry button
- Bot detection: honeypot field (hidden input that bots fill), rate limit at 3 submissions per hour per IP

**Accessibility**:
- `novalidate` on form element (custom validation via JS)
- Error summary at top of form with `role="alert"` and `tabindex="-1"` (auto-focus)
- Success state uses `role="status"` with `aria-live="polite"`
- Submit button must have `aria-busy` during submission

---

### 3.6 List — How It Works (4 steps)

**States**:
- **default**: 4 vertically stacked cards (mobile) or horizontal row (desktop), each with step number, icon, title, description
- **hover**: card elevates with `shadow.2`, border color shifts to step accent
- **focus-visible**: outline on interactive elements inside card
- **interacted**: visited steps show subtle checkmark or dimmed state

**Specs**: `radius.lg`, `padding: space.7`, border `1px solid color.text.inverse` @ 20%

**Responsive**: Desktop shows 4-column grid with connector line between steps. Mobile stacks vertically with downward arrows between cards.

**Long content**: Description truncates at 3 lines with ellipsis; full text visible on card expand (optional).

---

### 3.7 List — FAQ Accordion (8 questions)

**States**:
- **collapsed**: Question visible, chevron/plus icon, clean border
- **expanded**: Question visible with minus icon, answer revealed with `max-height` animation
- **hover**: Background shifts to `color.surface.raised`
- **focus-visible**: `2px solid color.surface.strong` outline
- **single-open**: Only one accordion item open at a time (others close)

**Specs**: `radius.lg`, `padding: space.7`, border-bottom separator between items

**Animation**: `max-height` expands over 300ms ease-in-out, opacity fades in over 200ms.

**Keyboard**: `Tab` to focus question buttons, `Enter`/`Space` to toggle, `ArrowDown`/`ArrowUp` to navigate between questions (when in accordion group).

**Accessibility**:
- Each button uses `aria-expanded="true|false"`
- Answer panel uses `aria-labelledby` referencing the button `id`
- Focus must move to answer content when expanded

---

### 3.8 List — Features/Benefits (6–8 items)

**States**:
- **default**: Grid card with icon, title, description
- **hover**: Card background shifts to `color.surface.raised`, `shadow.1` applied
- **focus-visible**: Card receives outline ring

**Specs**: `radius.lg`, `padding: space.7`, 3-column grid (desktop) → 2-column (tablet) → 1-column (mobile)

---

### 3.9 Trust Section — Stats (4 items) + Testimonials (3 items)

**Stats**:
- Text-only large numbers (`font.size.4xl`, `font.weight: 800`) with label below (`font.size.md`)
- `radius.lg` card with `shadow.1`
- Animate number count-up on scroll into view (optional enhancement)

**Testimonials**:
- Card with quote, star rating, author avatar (initials), name, role
- `radius.lg`, `padding: space.7`, `shadow.1`
- Responsive: 3-column → 2-column → 1-column

---

### 3.10 CTA Section

**Anatomy**: Gradient background, centered headline + subheadline, dual buttons (primary + outline), trust badges

**States**: Same as Button (section 3.3). The section background must be `color.surface.strong` with 10% opacity gradient overlay.

**Responsive**: On mobile, buttons stack vertically, trust badges wrap to 2 per row.

---

### 3.11 Loading / Error / Empty States

**Loading state**:
- Skeleton shimmer for Hero (text blocks + CTA boxes)
- Skeleton shimmer for Form (8 rectangular placeholders)
- `border-radius` matches actual components
- Shimmer animation: `linear-gradient` sweep over 1.5s infinite

**Error state** (form submission failure):
- Red banner at top of form: "We couldn't submit your request. Please try again."
- Individual fields that failed validation: red border + error message below
- Network/server error: `role="alert"` toast "Something went wrong. Your draft has been saved."

**Empty state**:
- FAQ with no questions: Not applicable (static content)
- Testimonials with no data: Show placeholder "Trusted by teams like yours" with generic stats
- Stats with no data: Show dashes (—) or zeros

---

## 4. Accessibility Requirements and Testable Acceptance Criteria

### 4.1 Keyboard Navigation

| Criteria | Pass | Fail |
|---|---|---|
| All interactive elements reachable via `Tab` | Tab reaches every link, button, input, and accordion trigger | Any interactive element skipped in tab order |
| Focus order matches visual order | Tab order follows DOM order left-to-right, top-to-bottom | Tab jumps randomly across page sections |
| `Enter`/`Space` activates focused element | All actions trigger on keypress | Element receives focus but does not respond to keypress |
| `Escape` closes overlays/dropdowns | Select dropdowns and mobile menu dismiss on Escape | Overlay remains open after Escape |
| Focus is trapped inside modal/drawer | Tab cycles within open modal, does not reach background | Tab exits modal to background elements |

### 4.2 Focus Indicators

| Criteria | Pass | Fail |
|---|---|---|
| `:focus-visible` provides visible outline | All interactive elements show 2px solid `color.surface.strong` outline with 2px offset | Outline is missing or uses `outline: none` without replacement |
| Focus indicator contrast ≥ 3:1 | Outline color has sufficient contrast against all backgrounds | Outline is same color as background |
| Focus indicator is not clipped by `overflow: hidden` | Focus ring remains fully visible | Ring is partially hidden by parent overflow |

### 4.3 Color and Contrast

| Criteria | Pass | Fail |
|---|---|---|
| Body text contrast ≥ 4.5:1 | All text at `font.size.lg` or below meets 4.5:1 | Any text below minimum ratio |
| Large text contrast ≥ 3:1 | All text at `font.size.2xl`+ meets 3:1 ratio | Heading fails minimum ratio |
| Error state uses text + icon (not color alone) | Error inputs have red border + error message text + icon | Error is indicated only by red border |
| Link text is distinguishable | Links have underline or contrast ≥ 3:1 from body text | Links are same color/shade as body text |

### 4.4 Form Accessibility

| Criteria | Pass | Fail |
|---|---|---|
| Every input has a label | `<label for="id">` or `aria-label` present | Input has only placeholder text as label |
| Error messages linked to input | Error uses `aria-describedby="error-id"` | Error is visually adjacent but not programmatically linked |
| Required fields identified | `aria-required="true"` + visible asterisk | Required fields marked only with color |
| Form submission feedback | `role="alert"` on success/error messages | Feedback is visual-only (green/red without ARIA) |
| Autocomplete attributes set | `autocomplete="email"`, `autocomplete="tel"`, etc. | Missing or incorrect autocomplete values |

### 4.5 Screen Reader

| Criteria | Pass | Fail |
|---|---|---|
| Page has `h1` | Single `<h1>` describing page purpose | Multiple `h1` or missing `h1` |
| Heading hierarchy is logical | `h1` → `h2` → `h3` without skips | Jump from `h1` to `h3` |
| Images have alt text | Decorative images use `alt=""`, informative images have descriptive `alt` | Missing or redundant alt text |
| Live regions for dynamic content | `aria-live="polite"` on success/error/toast | Dynamic content announced without live region |

---

## 5. Content and Tone Standards

### 5.1 Voice Principles

- **Confident but not pushy**: "See how SocialAI helps teams scale" not "Don't miss out on the best tool ever"
- **Concise**: Max 25 words per sentence, max 3 sentences per paragraph
- **Implementation-focused**: "Schedule, publish, and optimize across all platforms" not "Revolutionize your workflow"
- **Action-oriented**: Use active voice, start CTAs with verbs (Book, Schedule, See, Get)

### 5.2 Page Content Map

| Element | Content | Tone |
|---|---|---|
| Hero headline (h1) | "See Why Teams Choose SocialAI" | Confident, benefit-focused |
| Hero subheadline | "Book a personalized walkthrough. See how SocialAI helps teams create, schedule, and analyze content at scale." | Direct, descriptive |
| CTA (primary) | "Book Your Demo" | Verb-first, 3 words max |
| CTA (outline) | "View Pricing" | Simple, clear |
| Section labels | "Schedule a Demo", "How It Works", "FAQ", "Trusted by Teams" | Label-like, 2–4 words |
| Form labels | "First Name *", "Work Email *", "Team Size *" | Noun + asterisk, 2–4 words |
| Submit button | "Schedule My Demo" | Verb + possessive + noun |
| Success message | "Demo Request Received! We'll be in touch within 24 hours." | Warm, specific timeframe |
| Error message | "Please fix the errors below." | Direct, blame-free |

### 5.3 Prohibited Content Patterns

| ❌ Don't | ✅ Do |
|---|---|
| "Revolutionize your workflow" | "Schedule, publish, and optimize across all platforms" |
| "Don't miss this opportunity" | "Book your personalized demo" |
| "We're the #1 solution" | "Trusted by 24,700+ teams" |
| "Fill out this form" | "Select a date and time that works for you" |
| "Submit" | "Schedule My Demo" |
| Ambiguous "Learn More" | Specific "View Pricing" / "See Features" |
| "Our platform is amazing" | Feature-specific value (e.g., "AI recommends optimal posting times") |
| All-caps or excessive punctuation | Sentence case, one exclamation max per page section |

### 5.4 Form Error Messages

| Field | Error Message |
|---|---|
| First/Last Name | "First name is required" / "Last name must be under 50 characters" |
| Email | "Enter a valid work email" |
| Company | "Company name is required" |
| Phone | "Enter a valid phone number" |
| Team Size | "Select your team size" |
| Country | "Select your country" |
| Use Case | "Select your primary use case" |
| Date/Time | "Select a preferred date" / "Select a preferred time" |
| Notes | "Notes must be under 500 characters" |

---

## 6. Anti-Patterns and Prohibited Implementations

### 6.1 Prohibited Visual Patterns

| ❌ Anti-pattern | Why | ✅ Alternative |
|---|---|---|
| Using raw hex values inline | Breaks token system, creates visual debt | Map all values through semantic CSS custom properties |
| Hiding focus indicators (`outline: none`) | Fails WCAG 2.4.7 | Use `:focus-visible` with 2px solid `color.surface.strong` |
| Placeholder-only labels | Fails WCAG 3.3.2 | Always use `<label>` element with proper `for` attribute |
| Low-contrast hint text (< 4.5:1) | Inaccessible on light backgrounds | Use `color.text.inverse` at minimum, test with contrast checker |
| Single-state form feedback | No loading/error/empty handling | Define and implement all 5 states (idle, filling, submitting, success, error) |
| Disabled buttons with no visual change | Confusing for users | Apply `opacity: 0.5`, `cursor: not-allowed`, 30% saturation |
| One-off spacing values | Breaks visual rhythm | Use spacing token scale exclusively |
| Using `color.surface.strong` for non-interactive text | Confuses users (text looks clickable) | Reserve brand color for interactive elements |
| Auto-playing video in hero | Accessibility and performance issues | Use static hero with optional "Watch Demo" trigger |

### 6.2 Prohibited Interaction Patterns

| ❌ Anti-pattern | Why | ✅ Alternative |
|---|---|---|
| Form submission without confirmation | Users don't know if it worked | Show success state with specific next-step info |
| Double-click submit (no debounce) | Duplicate lead records | Disable submit button on first click, show loading state |
| Auto-scroll to errors without focus | Screen reader users miss it | Focus the first error field programmatically |
| Keyboard trap without escape | Inaccessible for keyboard-only users | Always provide Escape key to dismiss overlays |
| Scrolljacking or custom scroll | Breaks user expectations, accessibility | Use native scroll with smooth scroll on same-page links |
| Hover-only interactions on touch devices | Content unreachable on mobile | Use `@media (hover: hover)` for hover effects, add tap fallback |

### 6.3 Prohibited Content Patterns

| ❌ Anti-pattern | Why | ✅ Alternative |
|---|---|---|
| Vague CTAs ("Submit", "Click Here") | No context for screen readers | Descriptive CTAs ("Book Your Demo", "Schedule My Demo") |
| Jargon or buzzwords | Alienates decision-makers | Plain language describing actual functionality |
| No time commitment stated | Reduces trust | State "30-minute session" explicitly |
| No follow-up expectation | Users left wondering | Say "We'll contact you within 24 hours" |
| Wall of text in form fields | Increases abandonment | Use progressive disclosure, max 3 fields per row |

---

## 7. QA Checklist

### 7.1 Visual and Token Compliance

- [ ] All colors reference semantic tokens (no raw hex except brand-approved values)
- [ ] All spacing uses the spacing scale (`space.1` through `space.8`)
- [ ] All typography uses the type scale (`font.size.xs` through `font.size.4xl`)
- [ ] All border radii use the radius scale
- [ ] All shadows use the shadow tokens
- [ ] All transitions use `motion.duration.instant` (200ms)
- [ ] No one-off CSS values introduced
- [ ] Light and dark modes render correctly with same token set
- [ ] Page renders without JS (degraded but functional)

### 7.2 Component States

- [ ] Every interactive component has default, hover, focus-visible, active, disabled states
- [ ] Form has idle, filling, submitting, success, error states
- [ ] Loading skeleton matches component shapes and dimensions
- [ ] Error state shows both banner + inline field errors
- [ ] Empty states handled gracefully

### 7.3 Responsive

- [ ] Page renders correctly at 320px, 375px, 768px, 1024px, 1440px
- [ ] Two-column form collapses to single column on mobile
- [ ] CTAs stack vertically on mobile
- [ ] Navigation collapses to hamburger on mobile
- [ ] Feature cards reflow from 4-col → 2-col → 1-col
- [ ] No horizontal scroll on any breakpoint
- [ ] Touch targets ≥ 44×44px

### 7.4 Accessibility

- [ ] Tab order matches visual order
- [ ] All interactive elements have visible focus indicators
- [ ] Form labels are `<label>` elements (not `aria-label` only)
- [ ] Error messages use `aria-describedby`
- [ ] Required fields have `aria-required="true"` + asterisk
- [ ] Success/error messages use `role="alert"`
- [ ] Accordion uses `aria-expanded` + `aria-labelledby`
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] All images have appropriate alt text
- [ ] Page meets WCAG 2.2 AA minimum contrast (4.5:1 body, 3:1 large text)
- [ ] Keyboard can reach and activate every interactive element

### 7.5 Form and Data

- [ ] All 8 required fields validate correctly
- [ ] Optional notes field accepts empty value
- [ ] Email field rejects invalid formats
- [ ] Phone field accepts international formats
- [ ] Date picker limits selection to today + 90 days
- [ ] Duplicate submission prevented (button disabled)
- [ ] Form data persists across page reload (if draft saved)
- [ ] Honeypot bot detection works
- [ ] Rate limiting (3/hr) is enforced

### 7.6 Content

- [ ] All CTAs are verb-first and specific
- [ ] No placeholder text serves as label substitute
- [ ] Error messages are helpful, not technical
- [ ] Success message includes specific next-step timeframe
- [ ] All links have descriptive text (no "Click Here")
- [ ] Tone is consistent across all sections (confident, concise, implementation-focused)
- [ ] No jargon, buzzwords, or exaggerated claims

### 7.7 Performance

- [ ] Animations use `transform` and `opacity` only (no layout-triggering properties)
- [ ] Page loads under 3s on 3G (test with throttling)
- [ ] No render-blocking resources in critical path
- [ ] Form submission uses server action (no client-only fetch)
- [ ] Loading skeleton appears within 200ms of navigation

---

*End of design specification. Token values reference the GravityWrite design system. All rules are testable in implementation and enforced via QA checklist.*
