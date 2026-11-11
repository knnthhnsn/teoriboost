# Brief: Køreskoler i Danmark, interactive map and SEO pages for teoriboost.dk

You are building a new section for https://teoriboost.dk (TeoriBoost, a Danish driving-theory app for 16 to 19 year olds). Kenneth, the owner, asked for: a full interactive map of all driving schools in Denmark that really helps a learner find the right school, with a good SEO page for each, so people who search for "kørekort" and "køreskole" land on TeoriBoost. Visual and content quality must be very high, and everything must follow the TeoriBoost brand style.

Work only inside this folder (`outputs/teoriboost-koereskoler-20261110/`). Do not deploy, publish, commit, push, send e-mail or contact anyone. Do not create accounts, and do not use API keys or paid services. Claude reviews your result and does the release.

## Read first (read-only references)
- `../teoriboost-release-site-perf-20261108/`: the live site as static files. Study `index.html`, `site.css`, `knowledge.css`, `policy-footer.css`, `policy-footer.js`, one guide under `viden/`, `sitemap.xml` and `robots.txt`. The new section must look and feel like part of this site: same header, footer, type, spacing, buttons and cards.
- `../natkoersel/scripts/build-seo.mjs`, `validate-seo.mjs`, `check-guide-design.mjs`, `policy-footer.mjs`: how guide pages are generated and which design and SEO gates they must pass. Reuse their header and footer markup and pass the same gates where they apply.

## Deliverables (all inside this folder)
1. `data/schools.json`: one record per driving school, plus `data/raw/` with every fetched source file and a `data/SOURCES.md` listing each source, its licence, the fetch date and the URL.
2. `build.mjs`: a Node script with no dependencies beyond what is already installed, which generates the whole section into `site/koereskoler/` from the data.
3. `site/koereskoler/index.html`: the interactive map page.
4. `site/koereskoler/<kommune-or-by>/index.html`: one page per municipality or town that has schools.
5. `site/koereskoler/<by>/<skole-slug>/index.html`: one page per school that has enough verified data (see quality rules).
6. `site/koereskoler/sitemap.xml` with every indexable page, ready to merge into the site's sitemap.
7. `qa/`: screenshots at 320, 390, 768 and 1440 px of the map page, two town pages and three school pages, plus the output of your checks.
8. `REPORT.md`: counts per source, how many schools were found, de-duplicated, and given a page; known gaps; every open question for Kenneth; how to rebuild.

## Data: rules
- Use only sources that may legally be reused and republished, and record the licence. Good candidates: OpenStreetMap through the Overpass API (`amenity=driving_school`, ODbL, needs attribution), the Danish address API at `api.dataforsyningen.dk` (free, no key) for geocoding, municipality and postcode, and public register data for companies in industry code 855300 (Køreskoler) if you can get it without credentials. Each school's own website may be read for facts about that school (categories offered, address, phone, opening hours), respecting robots.txt, with at most one request per second per host.
- Do not scrape Google Maps, Trustpilot, Krak, De Gule Sider or any site whose terms forbid it. Do not copy descriptive text from any site.
- Every field in a record carries its source and fetch date. If two sources disagree, keep both and mark the conflict; do not guess.
- De-duplicate by CVR number where known, otherwise by normalised name plus address.
- Many schools are one-person businesses, so treat the data as personal data: publish only business facts (name, business address, business phone, website, categories, CVR number). No private addresses that are not the registered business address, no personal mobile numbers that are not published by the school itself as its contact number, no photos of people.
- Never invent a fact. No ratings, pass rates, prices or "best school" claims unless a public source states them, and then show the source and the date. No fake reviews.

## The map page: what makes it helpful
- Search by town, postcode or address, with suggestions. "Find nær mig" uses geolocation only after the user presses it.
- Filters only for facts the data actually has for most schools (for example licence categories B, A, BE; lessons in English), each with a count.
- A list that stays in sync with the map, sorted by distance once a place is chosen. Clusters when zoomed out. Selecting a pin or a list row highlights the other.
- A short, honest guide beside it: how to choose a school (what to ask, what the lovpakke covers, how theory and driving lessons fit together), linking to TeoriBoost guides under `/viden/` and to the app at https://app.teoriboost.dk.
- Works with keyboard and screen reader. Without JavaScript the page still shows the full list grouped by region with links.
- Map technology: MapLibre GL JS or Leaflet, with tiles from a provider that allows production use without a key (for example OpenFreeMap), styled in the brand's neutral greys with yellow pins. Load the map library and tiles only after the first screen has painted, or when the user interacts, so old phones get a fast first screen.

## SEO pages: quality rules
- Danish, plain and specific, written for a 16 to 19 year old and their parents. No filler, no keyword stuffing.
- A page must be useful on its own. A school page needs at least: verified name, address on a small map, contact or website, what it teaches, the nearest practical test site if a public source gives it, and the town page it belongs to. A school with less than that gets no page of its own; it is listed on its town page only.
- Town pages carry real substance: how many schools, where they are, what is different about taking a licence there (test site, typical travel), and answers to the questions people search for, each sourced.
- No two pages may share more than their template. Check this: compare the visible text of all pages and report near-duplicates.
- Unique title and meta description per page, one h1, breadcrumbs, canonical URL, valid JSON-LD (use only schema.org types that exist, and validate them), internal links to the town page, the map and two relevant `/viden/` guides.
- Each page shows "Oplysninger hentet <date>" with its sources, and a clear way for a school to ask for a correction. Leave the contact address as the placeholder `KONTAKT_TODO` and list it in the report; Kenneth supplies it.

## Brand style: hard rules
- Colours, only these (Kenneth is colour-blind, so check every colour by hex): yellow #FFD60A (fills only, never text on light), yellow shades #FFF6C7, #FFEB85, #FFE45C, #E8BC00, #C9A200, #4A4127 (dark-yellow text on light); cream white #FEFFED; black #0F1215; asphalt greys #F4F5F7, #E3E5E8, #C2CCD6, #5F656D, #525C65, #3A434C, #2B3138, ink #1F2328; green #58CC02 with text #2F6F00 and tint #E8FBD5, red #FF4B4B with text #D42F2F and tint #FFE5E5, only for right and wrong; blue #1CB0F6 with text #0A7BBF; orange #FF9600 for warnings only. The dot in the logo name "teoriboost." is always #FFD60A.
- Type: the site's own fonts and weights, taken from `site.css`. Do not add fonts.
- Banned, because Kenneth calls them AI slop: emojis; arrows of any kind as decoration (a chevron inside a round disc button is fine); coloured accent stripes on one side of a card; zero-padded ordinals such as 01, 02; gradient glows and yellow washes; generic stock or clip art; jokes.
- Mobile is its own composition, not the desktop layout squeezed. Check 320 to 1440 px. Text contrast at least 4.5:1, tap targets at least 44 px, visible focus, reduced motion respected.
- Any illustration must be in the TeoriBoost house style (illustrated realism with thin ink lines, muted palette, faint grain; references in `../natkoersel/docs/redesign/car3d/ref/` and `../natkoersel/docs/redesign/garage-v6/style-reference.png`) and made with your image generation tool. Prefer no illustration over a weak one.

## How to work
1. Gather and clean the data first. Write `data/SOURCES.md` and the counts into `REPORT.md` before building pages.
2. Build a vertical slice: the map page, one town page and three school pages. Screenshot them, review them against every rule above, and fix what fails.
3. Then generate everything, and run your checks: all internal links resolve, HTML is valid, JSON-LD validates, no banned characters or colours (scan the output for emojis, arrow glyphs and hex colours outside the list), no near-duplicate pages, no horizontal overflow at 320 px.
4. Finish `REPORT.md`. Be exact about what is verified and what is not, and list what Kenneth must decide (for example the correction contact, and whether one-person schools should have their own page).
