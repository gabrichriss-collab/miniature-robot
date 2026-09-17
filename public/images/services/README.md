# Service card photographs

Real photographs used by the six service cards in the home
`ServicesSlider`. When a file is missing, the card gracefully falls
back to the wood-tone gradient — the layout does not break.

## Required files

Drop each image at the matching filename below. **The mapping is
enforced by `src/data/services.ts` — do not swap the files.**

| Filename | Belongs to | Alt text |
|---|---|---|
| `rehabilitering.jpg` | Rehabilitering | Rehabilitering av trehus med stillas og utskifting av kledning |
| `tilbygg.jpg` | Tilbygg | Moderne tilbygg i tre med store glassdører og terrasse |
| `terrasse-uterom.jpg` | Terrasse & uterom | Terrasse i tre med glassrekkverk og utsikt |
| `fasade.jpg` | Fasade | Moderne fasade med mørk stående trekledning |
| `vinduer-dorer.jpg` | Vinduer & dører | Hvite vinduer montert i trekledd bolig |
| `innvendig.jpg` | Innvendig | Innvendig tømrerarbeid med spilevegg og spesialtilpasset entré |

## Format notes

- Source format: **JPEG** at ~2000 px on the long side, ~85 % quality.
  `next/image` re-encodes to WebP / AVIF automatically at request
  time, so you don't need to convert.
- The card container is portrait (`3 / 4`) — landscape source images
  crop from the centre by default (`object-position: center`). If a
  particular photograph needs a different focal point, set
  `imagePosition` on the service entry in `src/data/services.ts`
  (e.g. `"50% 30%"`).
- No layout shift: the card sets `aspect-ratio: 3/4` and the image
  uses `fill` — the reserved box is always the correct size.
- LCP: the first card is `priority`, the rest are lazy.
