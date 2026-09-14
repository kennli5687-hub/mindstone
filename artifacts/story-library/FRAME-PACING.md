# Desktop frame-pacing sample

## One-minute follow-up

Repeated the open-door storybook measurement for 60.01 seconds on the same connected desktop Chrome and 700×380 CSS / 1050×570 pixel canvas. Measured 3,601 delivered callbacks, 60.00 FPS, median 16.7ms, p95 18.4ms, p99 18.7ms, maximum 18.8ms, zero intervals over 25ms or 50ms. The renderer drew 3,599 frames (its change-signature gate can skip identical poses). Current scene cost remained 26 draw calls / 75,726 triangles including shadow/filter passes.

The QA page now offers explicit 10-second and 60-second radio controls and reports maximum interval and >50ms counts. This clean minute did not reproduce the earlier single long-frame outlier. It does not identify that outlier's cause, establish thermal endurance, or substitute for physical mobile testing.

## Initial short samples

Measured 2026-09-12 in connected Chrome, using the production renderer imported by `artifacts/qa/frame-pacing.html`. Each sample has two seconds of warm-up and ten seconds of visible-tab observation. CSS canvas 700×380, drawing buffer 1050×570; current VSM shadow filter. This measures browser animation-frame delivery plus actual renderer invocation count, **not GPU execution time, thermal endurance or mobile performance**.

| State | Delivered FPS | Median / p95 / p99 ms | Frames >25 ms | Actual draws of scene during sample |
| --- | ---: | --- | ---: | ---: |
| Three-book library, animated | 60.00 | 16.7 / 17.6 / 17.8 | 0% | 600 |
| Mira storybook, door open, animated | 59.10 | 16.7 / 17.6 / 17.7 | 0.17% | 592 |
| Mira storybook, motion paused | 60.00 RAF callbacks | 16.7 / 17.6 / 17.8 | 0% | **0** |

The paused row does not mean 60 rendered frames per second: the benchmark receives RAF callbacks while the scene renderer correctly skips all draws after settling. The open-book run contained one >25ms frame; its cause was not isolated and this sample does not establish a worst-case latency bound.

Library per rendered frame: 34 draw calls, 52,964 triangles including shadows/filtering. Storybook: 26 calls, 75,726 triangles including shadows/filtering. Geometry budgets and frame pacing are separate checks.

Still required: longer sustained observation, slower/physical mobile devices, full-page interaction workload and final visual acceptance. Do not extrapolate these desktop samples into a universal performance claim.
