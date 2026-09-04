# Design direction

## Product character

AWS Learning Journal is a personal engineering notebook and knowledge garden. It should feel calm, technical, editorial, and lived-in. It must not resemble an admin dashboard, commercial LMS, AWS Console clone, or SaaS landing page.

Design read: an editorial technical journal for an individual AWS learner, built with restrained typography, deliberate whitespace, tactile photography, and one muted teal accent.

Design dials:

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 3`

## Layout

- Global header: maximum 1400px
- Main content: maximum 1020px
- Long-form article: maximum 800px
- No persistent global sidebar
- Contextual navigation only when the content needs it
- Desktop navigation stays on one line and under 80px high
- Below 900px, desktop navigation becomes a purpose-built mobile drawer

## Visual system

- Typeface: Geist for interface and reading, Geist Mono for dates, counts, and compact technical metadata
- Palette: cool graphite neutrals with a muted teal accent and restrained amber for warnings
- Radius rule: 14px for surfaces, 8-10px for controls, circular only for the user avatar and semantic state markers
- Depth: borders and tonal surfaces first; shadows reserved for modal and popover layers
- Cards: used only where a bounded interaction or content group needs one
- Images: natural editorial photography, no logos, fake screens, neon, or AWS branding imitation

## Themes and localization

Light and dark themes share the same hierarchy and accent. A small pre-hydration script applies the saved or system theme to avoid a flash. Preference storage uses the versioned key `aws-journal:prefs:v1`.

English and Vietnamese share one route and component structure under `/en` and `/vi`. Components are sized for Vietnamese text expansion instead of using alternate layouts.

## Interaction and accessibility

- Visible keyboard focus on all controls
- Semantic links, buttons, fieldsets, labels, and dialog roles
- Escape closes search; keyboard focus moves into its input
- Hover, active, selected, disabled, empty, correct, and incorrect states are included
- Reduced-motion preferences disable non-essential transitions
- Client-side state is limited to interactions that need it

## Current implementation boundary

This phase contains frontend UI, local mock data, and local interaction state only. Authentication, databases, APIs, AWS integration, Cloudflare services, analytics, CMS, and deployment are intentionally not implemented.
