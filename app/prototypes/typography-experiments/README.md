# Typography Experiments

Explore CSS capabilities for unique type treatments. Type a sentence and see it rendered in three different typographic styles.

## Features

- **Interactive text input** — Type any sentence and watch it transform in real time
- **Circular text** — Characters wrap around a circle using CSS transforms
- **3D skewed text** — Perspective and skew create a dimensional effect
- **Wavy text** — Animated wave motion using CSS keyframes
- **Variable font** — Instrument Serif uses `font-variation-settings` for optical size
- **Fonts** — Instrument Serif and Imperial Script (Google Fonts)

## Technology

- **Pure CSS** — No external libraries; all effects use only HTML and CSS
- **Next.js** — Uses `next/font` for font loading

## Typographic concepts

1. **Text on a circle** — Each character is positioned and rotated using `transform` and `transform-origin` to sit along a circular path
2. **3D skewed text** — `perspective`, `rotateX`, `rotateY`, and `skewX` create depth
3. **Wavy text** — `@keyframes` animation with staggered `animation-delay` per character

## How to run

The prototype is accessible via the homepage, or directly at:
`/prototypes/typography-experiments`

Run the dev server with `npm run dev` and navigate to the prototype.
