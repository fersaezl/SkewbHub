# SkewbHub
<img src="img/logo.png" alt="SkewbHub logo" width="80">

A web-based Skewb timer and algorithm trainer to practice cases and track your times.

![SkewbHub timer on desktop](docs/screenshot.png)

| Timer | Times |
|:-:|:-:|
| ![Timer on mobile](docs/screenshot-mobile-timer.png) | ![Times on mobile](docs/screenshot-mobile-times.png) |

## Features
- Timer with spacebar control (hold to start on touch screens)
- Official WCA-style scrambles generated with [cubing.js](https://js.cubing.net/cubing/)
- Flat image of the scrambled cube, drawn with SVG
- Session statistics (ao5, ao12, best) saved in your browser
- Summary table with current and best time, ao5 and ao12
- Delete individual times or clear the session
- Scramble history with previous and next buttons
- +2 and DNF penalties
- Scramble saved with each solve
- Dark design with a static desktop layout and a scrollable list of times
- Mobile layout with a big touch area, quick +2 and DNF buttons and Timer / Times tabs

## Tech Stack
HTML · CSS · Bootstrap · JavaScript · jQuery

## Live
[fersaezl.github.io/SkewbHub](https://fersaezl.github.io/SkewbHub/)

## Roadmap
- Case training mode
- Export/import times (JSON/CSV)
- Installable app (PWA)
- Sessions

## Credits
- Scrambles by [cubing.js](https://js.cubing.net/cubing/)
- The layout of the scramble image is inspired by [csTimer](https://cstimer.net/). No csTimer code is used.
