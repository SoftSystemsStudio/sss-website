# Asset licenses

Where every third-party font and image on softsystemsstudiollc.com comes from, and the
license that allows us to use it (compliance standard item 17,
`sss-hub/docs/specs/2026-10-31-compliance-standard-v1.md`).

## Fonts

All fonts are self-hosted from `packages/frontend/src/fonts/` and loaded with
`next/font/local`, so visitors' browsers never contact Google and the build never
downloads fonts. Each family's folder holds its `OFL.txt`. The files are Google Fonts'
own woff2 builds (latin subset; Jost also latin-ext), fetched once by
`packages/frontend/scripts/fetch-fonts.mjs`.

| Family             | Used on                                          | License     | Upstream                                      |
| ------------------ | ------------------------------------------------ | ----------- | --------------------------------------------- |
| Instrument Sans    | Whole site (`--font-sans`)                       | SIL OFL 1.1 | https://github.com/Instrument/instrument-sans |
| Cormorant Garamond | Whole site (`--font-serif`), Kettle & Grain demo | SIL OFL 1.1 | https://github.com/CatharsisFonts/Cormorant   |
| Manrope            | Kettle & Grain demo                              | SIL OFL 1.1 | https://github.com/googlefonts/manrope        |
| Archivo            | Ironwood Auto demo                               | SIL OFL 1.1 | https://github.com/Omnibus-Type/Archivo       |
| JetBrains Mono     | Ironwood Auto demo                               | SIL OFL 1.1 | https://github.com/JetBrains/JetBrainsMono    |
| Outfit             | Green Bench demo                                 | SIL OFL 1.1 | https://github.com/Outfitio/Outfit-Fonts      |
| Karla              | Green Bench demo                                 | SIL OFL 1.1 | https://github.com/googlefonts/karla          |
| Bodoni Moda        | Mayhaw demo                                      | SIL OFL 1.1 | https://github.com/indestructible-type/Bodoni |
| Jost               | Mayhaw demo                                      | SIL OFL 1.1 | https://github.com/indestructible-type/Jost   |

OFL 1.1 allows commercial web use and redistribution with the license kept alongside the
files; the fonts must not be sold on their own.

The `/api/og` social-image route still fetches Instrument Sans / Cormorant Garamond from
Google Fonts at request time, server-side (no visitor IP is sent to Google).

## Images

Not yet inventoried here. Demo-page photos are Pexels images, credited in
`PORTFOLIO_CONCEPTS.md` and on each demo page.
