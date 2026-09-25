# Hero + shared images

- `hero.jpg` — home page hero background (landscape photograph). Loaded
  with `next/image` (fill, priority, `sizes="100vw"`) inside the Ken Burns
  container in `src/app/page.tsx`; crop is set via `objectPosition` there.
  Recommended: ~2400 px on the long side, ~80 % JPEG quality. Strip
  EXIF/GPS and convert to sRGB before committing (iPhone photos are
  Display P3 and carry the location). The wood-toned gradient sits
  underneath and shows while the image loads.

Project photos live in `./projects/` — see the README there.
