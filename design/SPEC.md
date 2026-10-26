# Myflo — Reference Design Specification

Derived by pixel-measuring the four uploaded reference screens.

Reference images are `744 × 1828 px` (except the 1536×1024 overview sheet).
The mock device therefore renders at a **design width of 390 CSS px**
(`S = 744 / 390 = 1.9077 ref-px per CSS px`). Every value below is in CSS px
unless marked *(ref)*.

```
ref → css :  css = ref / 1.9077
```

| Reference | Device frame | Screen (app surface) |
|---|---|---|
| corner radius | 44*(ref)* ≈ 23 | page radius 18 *(ref 34)* |
| frame inset | 6*(ref)* ≈ 3 | lavender `#B2B4E5` |

## 1. Page shell

| Token | Value |
|---|---|
| Design viewport | 390 × 958 (744 × 1828 ref) |
| Page background | `#FCF8F6` → `#FEFBFA` vertical wash |
| Page padding (home) | 11.5 left / right |
| Status bar height | 46 (time baseline at y=46, ink top y=35) |
| Status bar time | 13.5 / 700, `#231A33`, x=44 |
| Bottom nav top | y = 858 |
| Nav height | 80 (white, radius 22, shadow) |

## 2. Home

| Element | x | y | size | notes |
|---|---|---|---|---|
| hamburger | 35.6 | 84.4 | 22 × 17 | 3 bars, 2px, radius 1, `#2C2438` |
| greeting | 84.4 | ink top 80.2 | ink 91 × 22 | Manrope 800 / 23px, ls −0.5 |
| flower glyph | 178 | 81 | 17 × 16 | pink 5-petal |
| subtitle | 83.9 | ink 110.6 | ink 164 × 15 | 14 / 400 `#3B3548` |
| bell button | centre 287,93 | — | Ø 32.5 | 1px `#2C2438` ring, 15px glyph |

### Circular cycle dial — centre (192.6, 323.1)

| Layer | Geometry |
|---|---|
| outer track | r 158.3, 1.6px `#FBB7C6` |
| decorative dots | 24 dots every 15°, r 147.3, Ø 3.1, `#2C2438` |
| day numbers | r ≈ 118.5, 13px / 500, `#5A5464`, anchor middle |
| day-number angles | 1 @ −90°, 4 @ −54°, 28 @ −126°, 25 @ −162°, 22 @ +162°, 19 @ +126°, 16 @ +90° (12°/day dial) |
| pink band | outer r 158.9, inner r 149 �� 100 (measured taper), sweep −85° → +69°, fill `#FE6291`, rounded caps |
| band badges | Ø 21 white circles at (−29.2°, r 110) and (+61°, r 129) with ring `#FE6291` 1.5px |
| band caption | "Menstrual", r 129.5 at +9.4°, rotated 90°, 11 / 500 white, ls 1.5 |
| inner circle | r 87.6, 1.8px `#FBC2CE` |
| centre drop | 21 × 30, y −47 |
| "Day 1" | 23 / 800, centre y −6 |
| "Period Day" | 14 / 500, y +17.5, `#2C2438` |
| helper text | 12 / 400 two lines, y +40, `#6E6879` |

### Next-period card

| Property | Value |
|---|---|
| box | x 11.5 → 378.5 (w 366), y 490 → 629 (h 139) |
| radius / border | 26 / 1px `#FBE3E9` |
| fill | `#FFF3F6` |
| drop icon | 15 × 22 at x 33, y 545 |
| "Next Period" | 11.5 / 500, x 63.4, y 545 |
| date | 20 / 800, x 63.4, ink top 543.6 |
| "in N days" | 13 / 400, y 581 |
| character art | 120 wide, bottom-right, bleeds outside the card |

### Quick action cards (Mood / Cramps / Medicine)

| Property | Value |
|---|---|
| card size | 117.5 × 180 (peach), 118.5 × 210 (pink), 120 (blue) |
| x positions | 13 / 132.6 / 257.4 |
| y | 659 |
| radius | 30 |
| fills | `#FEE5D4` / `#FEDDEC` / `#E3F4FE` |
| inner white window | inset 3, height 80, radius 26 top / 45% bottom |
| art | 46–50 wide, centred in window |
| title | 16 / 700, y 757.5 |
| subtitle | 12.5 / 400, 2 lines, `#7C7587` |

### Bottom navigation

Fixed, `Home | Calendar | + | Insights | More`, white bar radius 22 at
y 858, h 80, shadow `0 8px 24px rgba(214,168,180,.18)`.
Active item pink `#F94E82`; inactive `#8D8698`.
Central button Ø 62 at y 858 (straddles the bar), fill `#FE6291`,
inner radius `#FFD3E0` 1px, white plus 20px.

## 3. Calendar

| Element | Value |
|---|---|
| header | back chip Ø 32 at x 20, y 70; title 22 / 700 centred |
| month card | x 20 → 370, y 108 → 470, radius 22, header `#FEE8DA` h 56 |
| weekday row | Sat … Fri, 12.5 / 600, active day 800 |
| grid | 7 cols × 6 rows, cell 50 × 54, numbers 14 / 500 |
| day states | period `#FE6291` disc (today: ring), fertile `#F3F1FE` pill row, ovulation `#D48CFB` dot, fertile dot `#A99BFB`, today legend `#7C6AFB` |
| legend | y 500, 4 items, dot Ø 9 |
| Cycle Events | 4 cards 84 × 78, radius 18 |
| Notes | card radius 18, white, icon 20 |

## 4. Log Symptoms

| Element | Value |
|---|---|
| header | back chip Ø 32 left, title 22 / 700, confirm Ø 34 right |
| mood grid | 4 × 2, tile 74.5 × 78, radius 18, gap 9 |
| tile fill | `#FFF1EB`; selected fill `#FDE9F0` + 1.5px `#FBA9C4` + glow |
| art | 36 × 38 |
| label | 11.5 / 500 |
| sliders | track h 9 radius 5, `#F5EDEC`; fill `#FE8FAE`; thumb Ø 21 white ring 4px |
| ticks | 0 2 4 6 8 10, 11 / 400 `#6E6879` |
| bleeding tiles | 4 × 76 × 76 |

## 5. Cycle History

| Element | Value |
|---|---|
| tabs | pill container radius 22, h 44; active white pill, text 13.5 / 700 |
| banner | radius 22, h 74, `#FDEEF7`, art right |
| chart | plot 60 → 355 x, 320 → 452 y; axis 11.5; point r 4.5; selected r 9; curve `#FB6D95` 1.6 |
| month band | April region `#EFEAFC` |
| tooltip | white pill, radius 12, 12.5 / 700 |
| recent cycles | card radius 22, rows h 45 |
| insight card | radius 22, `#FDEBF5`, art left |

## Typography

Manrope (variable) — best measured fit for the reference's geometric grotesque
(`Gargi` ink-aspect match within 0.5 %).

Weights: 400 body, 500 labels, 600 tiles/nav, 700 headings, 800 display.
Letter-spacing: display −0.5px, headings −0.2px, body 0.

## Motion

`--ease-out: cubic-bezier(.22,1,.36,1)`, 220ms standard, 320ms entrances,
`speed 120ms` for taps. `prefers-reduced-motion` disables transforms.
