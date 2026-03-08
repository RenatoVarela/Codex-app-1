# UI Standards — The Codex

## Design Philosophy

Classical library aesthetic: warm wood tones, parchment backgrounds, serif typography, book metaphors. Every element should feel like part of a curated, centuries-old library — not a generic SaaS dashboard.

## Design Tokens

### Light Mode — "The Library"

| CSS Variable | Hex | Usage |
|---|---|---|
| `--color-wood-dark` | `#3E2723` | Headers, sidebar background, primary navigation |
| `--color-wood-warm` | `#5D4037` | Heading text, active borders |
| `--color-parchment` | `#FFF8E1` | Main background (aged paper feel) |
| `--color-gold` | `#C6893F` | CTAs, links, active icons, decorative accents |
| `--color-cream` | `#FFFDE7` | Cards, chat bubbles, content areas |
| `--color-leather` | `#8D6E63` | Borders, separators, secondary text |
| `--color-ink-green` | `#2E7D32` | Verified citations, success indicators |
| `--color-ink-red` | `#C62828` | Errors, alerts, destructive actions |

### Dark Mode — "Library at Night"

| CSS Variable | Hex | Usage |
|---|---|---|
| `--color-night-bg` | `#1A1A2E` | Main background |
| `--color-night-surface` | `#16213E` | Sidebar, cards, elevated surfaces |
| `--color-night-border` | `#0F3460` | Borders, secondary elements |
| `--color-night-gold` | `#E2B049` | Accents, CTAs (brighter than light mode) |
| `--color-night-text` | `#F5E6CC` | Primary text |
| `--color-night-muted` | `#D4A574` | Secondary text, desk lamp effect |

### Semantic Color Mapping (Tailwind CSS v4)

Map design tokens to shadcn/ui semantic variables in `app/globals.css`:

```css
:root {
  --background: var(--color-parchment);
  --foreground: var(--color-wood-dark);
  --card: var(--color-cream);
  --card-foreground: var(--color-wood-warm);
  --primary: var(--color-gold);
  --primary-foreground: var(--color-cream);
  --secondary: var(--color-leather);
  --secondary-foreground: var(--color-cream);
  --muted: var(--color-leather);
  --muted-foreground: var(--color-leather);
  --accent: var(--color-gold);
  --accent-foreground: var(--color-wood-dark);
  --destructive: var(--color-ink-red);
  --border: var(--color-leather);
  --ring: var(--color-gold);
}

.dark {
  --background: var(--color-night-bg);
  --foreground: var(--color-night-text);
  --card: var(--color-night-surface);
  --card-foreground: var(--color-night-text);
  --primary: var(--color-night-gold);
  --primary-foreground: var(--color-night-bg);
  --secondary: var(--color-night-border);
  --secondary-foreground: var(--color-night-text);
  --muted: var(--color-night-border);
  --muted-foreground: var(--color-night-muted);
  --accent: var(--color-night-gold);
  --accent-foreground: var(--color-night-bg);
  --destructive: var(--color-ink-red);
  --border: var(--color-night-border);
  --ring: var(--color-night-gold);
}
```

**Rule:** Never use hardcoded color values (`#FFF8E1`, `bg-amber-50`). Always use semantic tokens (`bg-background`, `text-foreground`, `border-border`).

## Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| Headings | Playfair Display | 700, 900 | Page titles, section headers, hero text |
| Body | Lora | 400, 500, 700 | Paragraphs, descriptions, chat messages |
| UI/Labels | Inter | 400, 500, 600 | Buttons, nav items, form labels, metadata |
| Code | JetBrains Mono | 400 | Code blocks, citations, technical content |

### Type Scale

```
text-xs    → 0.75rem / 12px  (metadata, timestamps)
text-sm    → 0.875rem / 14px (labels, captions, nav items)
text-base  → 1rem / 16px     (body text, chat messages)
text-lg    → 1.125rem / 18px (lead paragraphs, card titles)
text-xl    → 1.25rem / 20px  (section headings)
text-2xl   → 1.5rem / 24px   (page subtitles)
text-3xl   → 1.875rem / 30px (page titles)
text-4xl   → 2.25rem / 36px  (hero headings)
```

### Font Loading

Load via `next/font/google` in the root layout for automatic optimization:

```tsx
import { Playfair_Display, Lora, Inter, JetBrains_Mono } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
```

## Shadows

Use warm brown shadows — never pure gray or black:

```css
--shadow-sm: 0 1px 2px rgba(62, 39, 35, 0.08);
--shadow-md: 0 4px 6px rgba(62, 39, 35, 0.12);
--shadow-lg: 0 10px 15px rgba(62, 39, 35, 0.15);
--shadow-book: 4px 4px 12px rgba(62, 39, 35, 0.2), inset 0 0 0 1px rgba(141, 110, 99, 0.1);
```

## Borders

Book-binding style borders with subtle inner glow:

```css
--border-book: 1px solid var(--color-leather);
--border-book-hover: 1px solid var(--color-gold);
--border-radius-book: 4px;      /* Slight rounding, like a book corner */
--border-radius-card: 8px;      /* Cards, modals */
--border-radius-button: 6px;    /* Buttons, inputs */
--border-radius-full: 9999px;   /* Avatars, badges */
```

## Spacing

Follow Tailwind's default 4px base scale. Key spacing decisions:

| Context | Value | Tailwind |
|---|---|---|
| Page padding (desktop) | 32px | `p-8` |
| Page padding (mobile) | 16px | `p-4` |
| Card padding | 24px | `p-6` |
| Gap between cards | 16px | `gap-4` |
| Section gap | 32px | `gap-8` |
| Sidebar width | 280px | `w-70` |
| Max content width | 1280px | `max-w-7xl` |

## Component Patterns

### Cards (Book/Tome Style)

```tsx
<div className="bg-card rounded-lg border border-border shadow-md p-6
  transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
```

### Buttons

| Variant | Usage |
|---|---|
| Primary (gold) | Main CTAs: Upload, Send, Save |
| Secondary (leather/outline) | Cancel, Back, secondary actions |
| Ghost | Toolbar actions, icon-only buttons |
| Destructive (ink-red) | Delete, Remove |

### Inputs

- Parchment/cream background with leather border
- Gold ring on focus (`ring-primary`)
- Warm placeholder text (`text-muted-foreground`)

### Empty States

Every list/grid must handle the empty state with:
- A relevant illustration or icon
- A clear message explaining what goes here
- A CTA to populate the area (e.g., "Upload your first document")

### Loading States

- Skeleton loaders matching the component shape
- Warm parchment tone for skeleton backgrounds
- Subtle pulse animation

### Error States

- Ink-red border or background tint
- Clear error message with suggested action
- Never show raw error messages to users

## Animations (Motion / Framer Motion)

### Duration Scale

```
--duration-fast: 150ms    (hover effects, micro-interactions)
--duration-normal: 300ms  (component transitions, modals)
--duration-slow: 500ms    (page transitions, reveals)
--duration-stagger: 50ms  (delay between staggered items)
```

### Easing

```
--ease-out: cubic-bezier(0.16, 1, 0.3, 1)     (entrances)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)  (morphs, transitions)
--ease-spring: { type: "spring", stiffness: 300, damping: 30 }  (playful elements)
```

### Animation Patterns

| Element | Animation | Trigger |
|---|---|---|
| Book cards | Scale up + slight tilt (`rotateY(5deg)`) | Hover |
| Card grid | Stagger fade-in from bottom | Mount / page load |
| Sidebar | Slide from left + fade | Mount |
| Modals | Scale from 0.95 + fade | Open/close |
| Chat messages | Slide up + fade | New message |
| Streaming text | Character-by-character reveal | AI response |
| Page transitions | Fade + slight Y translate | Route change |
| Toast notifications | Slide from top-right + fade | Event |

### Motion Component Conventions

```tsx
// Use reusable motion primitives from components/motion/
<FadeIn delay={0.1}>
  <BookCard />
</FadeIn>

<StaggerChildren staggerDelay={0.05}>
  {books.map(book => <BookCard key={book.id} />)}
</StaggerChildren>
```

### Rules

- Respect `prefers-reduced-motion` — disable all non-essential animations
- Never animate layout properties (`width`, `height`) directly — use `transform` and `opacity`
- Keep animations under 500ms for interactive elements
- Use `AnimatePresence` for exit animations

## Responsive Breakpoints

Follow Tailwind defaults:

| Breakpoint | Min-width | Target |
|---|---|---|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile-First Rules

- Sidebar: hidden on mobile, toggle via hamburger menu
- Card grid: 1 column on mobile, 2 on `md`, 3 on `lg`, 4 on `xl`
- Chat: full-screen on mobile, side panel on desktop
- Touch targets: minimum 44x44px on mobile

## Accessibility

- Minimum contrast ratio: 4.5:1 for body text, 3:1 for large text
- All interactive elements must be keyboard navigable
- Focus indicators: gold ring (`ring-2 ring-primary ring-offset-2`)
- Images/icons: meaningful `alt` text or `aria-label`
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, `<aside>`)
- Screen reader support: `sr-only` class for visually hidden labels

## Icons

Use a single icon library consistently. Do not mix icon libraries.

## Anti-Patterns

- Never use pure gray (`#808080`, `gray-500`) — use warm tones from the palette
- Never use pure black (`#000000`) for text — use `--color-wood-dark` or `--color-wood-warm`
- Never use pure white (`#FFFFFF`) for backgrounds — use `--color-parchment` or `--color-cream`
- Never hardcode colors — always use CSS variables/semantic tokens
- Never skip empty/loading/error states
- Never use generic sans-serif for headings — always Playfair Display
- Never put animation duration above 500ms for interactive feedback
