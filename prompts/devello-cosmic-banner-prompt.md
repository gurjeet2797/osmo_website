# Devello Studios — Cosmic Promotional Banner Prompt

Use this prompt to generate or build a promotional banner section for Devello Studios that showcases apps (like Osmo) with cosmic styling.

---

## Prompt

Create a **promotional banner section** for **Devello Studios**, a studio that builds apps. The banner appears on the main Devello Studios website and showcases featured apps (e.g., Osmo) with a **cosmic, dark, particle-rich aesthetic**.

### Visual Style — Cosmic Design System

- **Background**: Pure black (`#000000`) with layered cosmic elements
- **Starfield**: 80–120 small stars scattered across the banner, each with:
  - Size 0.6–2.8px, brightness 0.3–1.0
  - Subtle blue-to-cyan hue (HSB hue 0.55–0.75)
  - Gentle drift and pulse animation
  - Two-layer rendering: outer glow (12% opacity) + inner core (white)
- **Nebula**: 2–3 soft radial gradient layers drifting slowly
  - Deep purple `rgba(38, 13, 77, 0.08)` and deep blue `rgba(13, 26, 64, 0.04)`
  - ~30% of viewport width, oscillating ±10%
- **Constellation lines** (optional): Very subtle white lines connecting nearby stars, opacity ~0.08
- **Typography**: System font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif`), white text with opacity tiers (primary 100%, secondary 80%, muted 35%)

### Banner Structure

```
[Full-width section, min-height 400–500px]

  [Cosmic background: stars + nebula, fixed or parallax]

  [Centered content block — glassmorphism card]
    - "Our Apps" or "From Devello Studios" (section label, 10px mono, letter-spacing 2px)
    - Headline: "Apps that feel like magic" or similar (28–32px, thin/light)
    - Subheadline: Brief tagline about the studio (15px, 80% opacity)

    [App cards row — 2–3 cards]
      Each card:
        - App icon/logo (glowing particle ring style for Osmo)
        - App name
        - One-line description
        - "Learn more" or "Coming soon" CTA
        - Glass effect: bg rgba(255,255,255,0.06), border rgba(255,255,255,0.1), 28px radius, backdrop-blur 20px
```

### Design Tokens (CSS)

```css
--bg-primary: #000000;
--bg-sheet: rgba(255,255,255,0.06);
--border-subtle: rgba(255,255,255,0.1);
--text-primary: rgba(255,255,255,1);
--text-secondary: rgba(255,255,255,0.8);
--text-muted: rgba(255,255,255,0.35);
--radius-sheet: 28px;
--font-system: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
--font-mono: "SF Mono", ui-monospace, monospace;
--ease-spring: cubic-bezier(0.32, 0.72, 0, 1);
```

### Interactions

- **Hover on app cards**: Border → white 15%, subtle scale 1.02, 0.3s transition
- **Stars**: Optional mouse-repel (stars within 150px of cursor drift outward)
- **Scroll**: Section fades in + slides up 20px on scroll (IntersectionObserver)

### Content Placeholders

- **Section label**: "FROM DEVELLO STUDIOS" or "OUR APPS"
- **Headline**: "Apps that feel like magic" / "Crafted with care" / "Built for the way you work"
- **Subheadline**: "We build thoughtful software for iOS and the web."
- **App 1 (Osmo)**: Icon (particle ring), "Osmo", "Voice-driven calendar assistant", "Coming soon"
- **App 2**: [Your next app], icon, name, tagline, CTA
- **App 3**: [Optional third app]

### Technical Notes (if building)

- Use Canvas2D or WebGPU for particle background (Canvas2D fallback for compatibility)
- Reduce particle count on mobile (60 stars)
- Respect `prefers-reduced-motion`: show static star image or simplified gradient
- Banner should feel like stepping into the Osmo app — same cosmic language, same spatial relationships

### Key Principle

**The cosmic background is the brand.** It's not decoration — it's the experience. A user scrolling through Devello Studios should instantly recognize the same visual language as Osmo and feel continuity between the studio and its products.

---

## Shorter Version (for AI image generation)

> Promotional banner for Devello Studios: dark cosmic background with scattered glowing blue-white stars and soft purple/blue nebula clouds. Centered glassmorphism card with "Our Apps" label and headline. Row of 2–3 app cards (one shows a glowing particle ring icon for Osmo). Pure black background, white/light gray text, minimalist, premium feel. Aspect ratio 3:1 or 16:5 for web banner.
