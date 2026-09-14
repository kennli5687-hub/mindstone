# A Letter to Tomorrow

An original English, 16-page / 64-panel comic leads into ten walkable Three.js scenes. Dialogue and narration are embedded in generated artwork. An expandable transcript supports reading small text; it is not a replacement for in-panel lettering.

## Learning loop

Scenario → read a scene → Keep this memory → Explore → apply the memory at an obstacle → earn a keepsake → open the next doorway. Quiz is optional reflection, not a progression requirement. The map supports revisiting unlocked places. Notebook links return to the relevant comic page. Browser storage retains memories, solved gates, current location and reading bookmark. Closing an object returns to walking; closing the story returns to the current world when entered from it.

Controls: WASD / arrows, E to interact, click ground to walk, click an object to approach, touch arrow controls. Click movement routes around obstacles. The HUD offers an alternate interaction path. There is no timed penalty or loss of rewards for wrong answers.

## Scene mapping

| Place | Comic page | Obstacle | Keepsake |
|---|---:|---|---|
| Fog Attic | 2 | Order the worry / hiding / relief gears | Loop lens |
| Return Station | 4 | Set a concrete return cue and action | Return ticket |
| Small-Door Workshop | 5 | Choose a manageable action | Paper key |
| Crooked Gallery | 6 | Choose a usable imperfect tile | Crooked prism |
| Weather Observatory | 7 | Sort observations and predictions | Clear-sky lens |
| Staying Garden | 8 | Restore the grounding sequence | Present seed |
| Unfinished Bridge | 9 | Order manageable stepping stones | Step stone |
| Borrowed-Voice Archive | 10 | Choose compassionate self-talk | Kind lantern |
| Two-Person Harbor | 11 | Coordinate a specific request for help | Companion bell |
| Tomorrow Post Office | 12 | Choose a value rather than certainty | Tomorrow stamp |

## Content boundaries and reference

Avoidance is described as a behavior, not a standalone diagnosis. The narrative acknowledges healthy rest, actual safety, variable feelings, setbacks, and professional support. Clearing fog is a fictional visual effect, not a clinical outcome. Exercises use a safe everyday writing task, not trauma exposure. No cure is promised.

General reference: [NHS — Facing your fears](https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/facing-your-fears/). The original fictional script is in `src/adventure/story.js`; it is not quoted from this reference.

## Verification

Run `node --test src/adventure/adventure.test.js` and `vite build`. Tests cover all ten gates, memory requirements, wrong answers, repeat rewards, persistence, invalid saves and unavailable storage. Art lives under `public/assets/letter-story/`; the built-in image generation prompt set is stored alongside the assets.
