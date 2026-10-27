# Original website media

## Active logo-led theme

The current website uses charcoal (`#11191c`, `#252b2e`), metallic-gold accents (`#bd953d`, `#997326`) and warm white (`#faf8f2`). The client's supplied bull logo is copied without editing to `public/assets/brand/client-logo.jpeg` and used in the header and footer. Its original green arrow is retained; green/red market gain/loss indicators retain their conventional meaning. Green is not used as the website's main theme.

Active artwork: `hero-gold.png`, `hero-gold.webm` and `about-gold.png`, all in `public/assets/brand/`. The 8-second native-resolution motion version is created by `qa/create-gold-hero.mjs`. `qa/apply-logo-theme.mjs` applies this palette and actual logo after any reference import. Earlier palette sections below are historical notes.

Both original illustrations were edited with the built-in image generation tool using this final prompt, with the corresponding hero or About image as its edit target:

> Edit target: attached original [hero/about] finance website illustration. Recolour ONLY to match a black-and-gold finance logo: ALL teal/green surfaces become glossy charcoal, smoked black glass and graphite (#11191C); metallic accents and disks become rich elegant metallic gold (#C59A37), not copper. Background is clean warm white/ivory (#FAF8F2). No green, no burgundy, no blue. Preserve exact composition, objects, generous negative space, material edges, dimensions/aspect ratio and sharp realistic 3D lighting. Do not add a bull or logo; the site uses a separately supplied real logo. No text or watermarks, no cropping, no blur. Premium charcoal/gold financial-services visual.

## Current colour theme

The active design uses deep teal (`#103f39`, `#165c52`), warm ivory (`#f7f4ed`) and copper (`#a86744`). `hero-teal.png`, `hero-teal.webm` and `about-teal.png` are the active raster and video assets in `public/assets/brand/`. Previous blue versions are retained as historical source files and are not displayed. `qa/apply-theme.mjs` applies the palette to layout styles, inline decorative colours, wordmarks and SVG icons. `qa/create-teal-hero.mjs` rebuilds the teal motion footage.

The built-in image generation tool edited the existing original hero and About illustrations using this final prompt for each corresponding image:

> Edit target: attached original financial website [hero/about] illustration. Change ONLY its color palette into a refined deep teal, warm ivory and copper theme: blue glass and blue ribbons become rich teal/emerald glass and ribbons; cool blue background becomes warm ivory or very pale sage; gold metallic accents become restrained warm copper. Preserve the exact objects, composition, empty space, dimensions/aspect ratio, sharp edges, material detail, lighting and realistic 3D style. No words, no logos, no extra elements, no cropping. Retain crisp high-resolution rendering. The goal is a cohesive premium teal/ivory/copper website instead of the previous blue theme.

The current site uses project-owned visual assets in `public/assets/brand/`. The reference site's copied photographs, video, logos, product/service images and decorative backgrounds are no longer used by the local pages. Existing typography and layout libraries remain in place.

## Asset inventory

- `hero-original.png`: original AI-generated hero artwork.
- `hero-original.webm`: original eight-second looping animation composed locally from the new hero artwork; 1440 × 810, muted, with poster fallback and a pause/play button. Reduced-motion visitors start with playback paused.
- `about-original.png`: original AI-generated financial planning illustration.
- `wordmark.svg`, `wordmark-light.svg`, `favicon.svg`: newly authored provisional visual identity using the existing project display name. The final client logo can replace these files later.
- Product/service icons, contact card, milestone illustrations and section patterns: new SVG assets authored for this project.
- Leadership and association placeholders: clearly labelled graphics awaiting actual client-approved names, photographs and details.

The artwork is illustrative, not a photograph of the client's premises or staff. Actual office and team photographs still need to be supplied. The remaining written reference-company claims, figures, policies and testimonials require the separate content-customisation checklist; a media replacement does not approve them for this business.

## Generation method and final prompts

Both raster illustrations were created using the built-in image generation tool. No reference-company media was used as an image-generation input. The final files were copied into this workspace; the generated originals were retained at the tool's original save location.

Hero prompt:

> Use case: ads-marketing. Asset type: original wide hero artwork for an Indian financial services website, landscape 16:9. Create a premium contemporary 3D editorial illustration with a small architectural staircase of frosted pale-blue glass blocks rising toward the right, elegant blue translucent arcs, subtle warm gold coin-like discs without symbols, and a deep blue flowing ribbon suggesting a considered financial journey. Sophisticated, calm, trustworthy; soft realistic studio lighting, crisp material detail, pale ice-blue to white background. Main composition on the RIGHT HALF with ample uncluttered pale negative space on the LEFT for HTML headline copy. No words, letters, numbers, currency marks, logos, brand names, watermarks, screens, charts promising returns, cartoon people, or existing company imagery. This must be a wholly original image, not based on or resembling the reference company's media. Web-ready high quality.

About artwork prompt:

> Use case: stylized-concept. Asset type: original square editorial illustration for the About section of an Indian financial services website. A beautifully art-directed architectural still life representing careful financial planning: matte blue geometric columns of different heights, a luminous frosted glass sphere, a folded ivory planning sheet with only abstract blue line patterns (no readable text or numbers), and one thin warm-gold arc linking the forms. Centered sculptural composition with generous pale-blue negative space, elegant realistic 3D materials, soft studio shadows, calm trustworthy blue-white-gold palette matching a white and blue financial website. No actual office, no people, no logos, no words, no company branding, no banknotes, no returns promises, no watermarks. Wholly original brand-neutral illustration, square format.

## Maintenance

## Hero sharpness revision

The original 1440px video was being enlarged to the full desktop width. The current hero uses `hero-sharp.png` and `hero-sharp.webm`, generated and encoded at the source's actual 1672 × 940 resolution. The artwork is displayed in a rounded panel capped at 900px on desktop, with its full native proportions visible using `object-fit: contain`. The hero has additional vertical breathing room and stacks the text above the complete artwork on mobile. The new VP9 recording targets 10 Mbps and uses only 0.8% zoom, avoiding the previous downsampling and excessive enlargement. `qa/create-sharp-hero.mjs` rebuilds this recording. This is not a 4K asset: although requested, the image tool returned a 1672px-wide image.

Built-in image generation edit prompt (input: `hero-original.png`):

> Use case: precise-object-edit. Edit target: the attached original website hero illustration. Produce an ultra-high-resolution 3840 x 2160 landscape master for a full-width desktop website hero. Preserve this exact blue-glass staircase, gold disks, flowing blue ribbon, pale background and empty left half for HTML text. Improve image clarity only: exceptionally crisp glass bevels and gold edges, sharply resolved material texture and controlled highlights. Everything in focus; no haze, bloom, depth-of-field blur, motion blur, softness, muddy gradients or over-sharpening halos. Keep the elegant realistic 3D appearance and composition. No words, logos, watermarks, new objects, or changes to the concept. Need genuine detailed high-resolution output suitable for 1920px and wider displays, not a small preview.

`qa/create-original-media.mjs` creates the SVG asset set and renders the local hero animation from the saved illustration. `qa/apply-original-media.mjs` updates the requested pages and substitutes copied image backgrounds in the retained layout styles. The reference finalisation workflow invokes this substitution after importing pages, so a subsequent import preserves the media decision.

The Laravel renderer versions `replica.css` and `replica.js` using file modification time to avoid stale browser copies. Media verification is included in the website feature tests. Browser verification uses `node qa/check-replica.mjs`.
