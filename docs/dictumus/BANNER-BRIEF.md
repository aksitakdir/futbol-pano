# Dictumus banner brief for scoutgamer.com

Brief for producing the Dictumus banner that will run on scoutgamer.com: a short animation plus its still frame. It is
self-contained: everything needed to make the files is here. Measurements were taken on the live site on 17 November 2026.

## 1. Context

- **Scout Gamer** (scoutgamer.com) is an English-language football site: young-player scouting lists, read against EA FC
  ratings. It is built by the same team as Dictumus.
- **Readers** arrive from Google, read one article (usually a "best young players" list) and leave. 76% read on a phone.
  The site is dark-themed only.
- **The test:** a Dictumus banner will appear inside those articles for 8 weeks (to about mid-January 2027), to see
  whether Scout Gamer readers try the game. There is no separate Dictumus page or menu item on the site yet.
- **Audience:** Dictumus is for ages 16+ and involves no betting. Scout Gamer's readers skew young, so the banner states
  both plainly.

## 2. What to deliver

| File | Spec |
|---|---|
| `dictumus-banner.png` | **960 × 480 px** (2:1). PNG, sRGB, fully opaque. The complete still banner: **export it from frame 1 of the animation**. The last frame is the same design |
| `dictumus-banner.mp4` | 960 × 480, constant 30 fps, **at most 150 frames (5.0 s)**, no audio track. H.264, yuv420p, BT.709, near-lossless (CRF ≤ 18, or ≥ 8 Mbps where the tool has no CRF). Render it frame by frame, not as a screen recording |
| `dictumus-banner-copy.txt` | Plain text of every word that appears, in order of appearance. Scout Gamer writes the alt text from it |
| Editable source | The project file (Remotion, After Effects, Figma…), so the banner can be re-rendered if a message has to change |

**Delivery:** hand the files back to the Scout Gamer owner. Name them exactly as above.

**How they are used:**
- The still PNG is what readers see first. It is also the only version for search engines, for readers who turned on
  "reduce motion", and for phones that refuse to autoplay video (e.g. iPhone Low Power Mode).
- The video plays over the still once per page view, when at least half the banner is on screen, and ends back on the
  still.

**Safe area:** 40 px inside every edge, so the content area is **880 × 400**. Every frame keeps logo and text inside it.

**Corners and frame:** deliver square corners and no border.
- Scout Gamer's code always adds a 10 px corner radius and a 1 px border in the site's border colour (`#182127` at 50%
  opacity).
- At the smallest size the radius cuts about 34 px of the 960 file at each corner. The safe area covers it.

**Tools:**
- **Remotion:** meets all of the above directly (frame 0 as a still, H.264 at CRF 18).
- **After Effects / Media Encoder:** use a bitrate (≥ 8 Mbps) instead of CRF and switch audio off.
- **Figma:** can make the PNG but not the MP4.

## 3. How the animation behaves

| Rule | Why |
|---|---|
| **Starts and ends on the same complete design** (= `dictumus-banner.png`); the motion happens in between | A reader who scrolls past mid-animation, or never sees it play, still gets the full message. There is no jump when playback starts or ends |
| **Max 5.0 seconds, plays once, never loops** | Accessibility rule WCAG 2.2.2: moving content that starts by itself (scrolling it into view counts) and lasts more than 5 s must offer a way to pause, stop or hide it. At 5 s or less, played once, it needs none |
| **The logo and `Ages 16+ · No betting` stay still and fully shown in every frame** | The two facts are never off screen |
| **No flashing at all:** no blinking elements, no rapid changes of background, text or colour. The hard ceiling is 3 flashes in any one second | WCAG 2.3.1 (seizure safety). The Better Ads Standards ban "flashing animated ads" on mobile, where 76% of readers are; calm, non-flashing animation is outside the standard |
| **Calm motion:** elements slide, fade, count up or flip; the background stays put | It sits inside an article people are reading |
| **No sound;** the file has no audio track | Browsers reliably start a video by themselves only when it is silent, and an article page should be silent |

**Ideas that suit the game.** Pick one: with the reading-time rule in §5, 5 seconds holds one mid-animation message, two
at most.
- A scoreline being typed in, with `HOME` / `AWAY` instead of club names.
- A prediction card flipping to show `+5 pts`.
- A friends' table re-ordering.

Each one ends back on the still design. No real club names, crests or players.

## 4. How big it appears on screen

The same banner is scaled to each slot. Sizes are CSS pixels (width × height):

| Where | Screen width | Displayed size |
|---|---|---|
| Right sidebar, desktop | 961 px and wider | **280 × 140** (smallest) |
| In the article (inside it or at its end), phone | 360 px | 320 × 160 |
| In the article (inside it or at its end), phone | 390 px | ≈347 × 174 |
| In the article (inside it or at its end), phone | 430 px | ≈383 × 192 |
| In the article, any slot | 540–960 px | **480 × 240** (largest; centred) |

- At the smallest size each pixel of the 960 file becomes 280 / 960 ≈ 0.29 CSS px. That drives the minimum sizes below.
- Above the banner the site prints a small text label, `FROM THE MAKERS OF SCOUT GAMER` (11 px, grey `#7c8891`), 22 px
  tall including its gap. It is not part of your files.

## 5. Minimum sizes and contrast (on the 960 × 480 canvas, whenever text is fully shown)

| Element | Minimum | On the 280 px sidebar banner | On a 390 px phone (≈347 px banner) |
|---|---|---|---|
| Any text, including `Ages 16+ · No betting` | **48 px font size** | 14 px | ≈17 px |
| Headline | **68 px font size** | ≈20 px | ≈25 px |
| Dictumus logo | **64 px tall** | ≈19 px | ≈23 px |

- "Font size" means the size set on the 960 canvas, not the cap height. Fonts with a small x-height need to go larger.
- **Font weight:** Medium (500) or heavier. No Light or Thin weights.
- **Contrast:** every piece of text at least **4.5:1** against what is directly behind it once fully shown. Frames
  mid-fade or mid-flip are exempt. The logo is exempt.
- **Reading time:** text that appears only in the middle of the animation stays fully shown for at least 1.5 seconds
  (45 frames), not counting its fade in or out.

## 6. What must be in the still design (first and last frame)

| Element | Rule |
|---|---|
| Dictumus logo | At least 64 px tall |
| Headline | English, max 42 characters, max 2 lines |
| `Ages 16+ · No betting` | **Exactly this text**, same capitals and middle dot (·), at least 48 px |
| Call to action | **Max 12 characters, counting spaces and the arrow**, e.g. `Play now →`. May be drawn as a button; the whole banner is the link |

**Layout (fits the 880 × 400 content area):**
- Logo at the top.
- Headline below it, on two lines.
- Bottom row, on one line: `Ages 16+ · No betting` on the left, the call to action on the right, at least 40 px apart.
  The whole row must fit within 880 px. With a wide typeface, shorten the CTA.
- Vertical budget: logo 64 + gap 24 + headline 156 + gap 24 + CTA row 96 = **364 px** (limit 400).
- **Why the CTA is short:** at 48 px, `Ages 16+ · No betting` and `Play in your browser →` together run ≈900–1,000 px,
  wider than the 880 px content area. The longer wording goes into the alt text and the site's HTML instead.

**Headline options** (pick one or write your own within the rules):
- `You read the players. Now call the scores.` (42 characters; written for list readers)
- `Call the scores. Keep the proof.` (32)
- `Predict the matches with your friends.` (38)

**"From the makers of Scout Gamer":** optional in the image. The site already prints it above the banner. Repeat it only if
it fits on the logo's row.

## 7. What must NOT be in the banner

- **No price message, including the word "free".**
  - Each league's season is free for its first half and paid for its second half. The European leagues reach their second
    half around early January, inside the test, so `Free until mid-season` would become untrue while the banner runs.
  - Leaving price out keeps one banner true for the whole test.
  - "No money" or "no real money" on their own are out too, since the second half is paid.
- **Anything that reads as betting:** the words bet, odds, stake, wager, "win £/$/€"; chips, coins, cash, betting slips.
- **Store badges.** No Google Play or App Store badge. The banner links to the web app, and Google's badge rules require
  the Play badge to link to Play. There is no App Store listing yet.
- **Football IP and real people:**
  - no league, competition or club logos, crests or recognisable club kits;
  - no real club names, including in example scorelines;
  - no real player photos, and no AI-generated likeness of a real player.
- **Childish or cartoon styling.** The UK advertising regulator treats cartoon styles and star players as having strong
  appeal to under-18s. Keep it clean and grown-up.
- **Photos, grain/texture, wide gradients.** Flat colours keep Scout Gamer's web copies small: the 960 px WebP of the
  still under ≈50 KB and the web video under ≈300 KB. The files you deliver have no size limit.

## 8. Colours

Use **Dictumus's own logo, typeface and dark brand background**, so the banner reads as a different product, not as a
Scout Gamer card. No light background: the page around it is near-black.

| Scout Gamer colour | Value |
|---|---|
| Page background (directly around the banner) | `#04080b` |
| Frame the site draws around the banner | 1 px `#182127` at 50% opacity |
| Accent on the list pages (97% of traffic) | emerald `#1bd79e` |

Dictumus's green (`#43f5a0`) is close to Scout Gamer's emerald. That is fine, but the banner needs enough of its own
identity (background, logo) to be told apart.

## 9. Handled on the Scout Gamer side (for information)

- **Link:** the whole banner links to the Dictumus web app, opening in a new tab:
  `https://app.dictumus.com/?utm_source=scoutgamer&utm_medium=referral&utm_campaign=scoutgamer_promo&utm_content=<slot>&utm_term=<article-slug>`
  - `<slot>` is `in-content`, `article-end` or `sidebar`; `<article-slug>` is the article the reader came from.
  - The link is marked `rel="sponsored noopener"`, with no `noreferrer`, so Dictumus also sees scoutgamer.com as the
    referrer.
- **Placement and frequency:**
  - Phones (up to 599 px wide): at most 2 banners per article, never two on one screen. One goes inside the article,
    after at least two sections (in a list, after the second or third player); the other at the end.
  - Tablets and phones in landscape (600–960 px): 1 banner, at the end.
  - Desktop (961 px and wider): 1 banner, at the top of the right sidebar, staying in view while the reader scrolls.
  - No pop-ups, nothing pinned to the bottom of a phone screen.
- **Web versions:** Scout Gamer encodes the master into a web MP4 (H.264) and makes WebP copies of the still at 480, 720
  and 960 px.
- **Alt text:** written from `dictumus-banner-copy.txt`. It also carries `no money between players` and `Play in your
  browser`, which do not fit in the image.

## 10. Please check on the Dictumus side

- **UTM capture:** app.dictumus.com should record the UTM parameters on landing and keep them through sign-up. Otherwise
  clicks from each slot cannot be told apart, and clicks cannot be linked to sign-ups.
- **Terms:** they currently say Dictumus "is free today" with no purchases. They need updating on the day the first league's
  paid second half starts.

## 11. Acceptance checklist

- [ ] `dictumus-banner.png`: exactly 960 × 480, opaque, sRGB, square corners, no border, exported from frame 1.
- [ ] `dictumus-banner.mp4`: 960 × 480, constant 30 fps, ≤ 150 frames, H.264, no audio track, plays once. The first and
      last frames show the PNG's design with nothing moved, resized or recoloured (compression differences are fine).
- [ ] In every frame: logo (≥ 64 px tall) and `Ages 16+ · No betting` still and fully shown; everything inside the 40 px
      safe area.
- [ ] Still design: headline, and a CTA of ≤ 12 characters; the bottom row fits 880 px.
- [ ] Text ≥ 48 px font size (headline ≥ 68 px), weight ≥ 500, contrast ≥ 4.5:1 when fully shown. Mid-animation text is
      fully shown ≥ 1.5 s.
- [ ] No flashing, no loop, calm motion, flat colours.
- [ ] Scaled down to 280 × 140 on screen, the still is readable and the animation is still clear. Check it at that size.
- [ ] None of: price or "free", betting words or imagery, store badges, league/club logos or names, real players, cartoon
      style.
- [ ] `dictumus-banner-copy.txt` with every word that appears, and the editable source file.
