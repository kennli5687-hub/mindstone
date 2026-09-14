# Mira’s celestial gateway — September 12

## Reference and scope

Inspected the supplied `fant8.png` comic page directly. Its blue-and-gold gateway, crescent/sun motifs, lit staircase, paired lanterns and climbing flowers informed this miniature. The left page still uses the supplied opening comic illustration; no unrelated character was introduced. This is a more story-specific pop-up entrance, not a claim to reproduce the painted comic at full fidelity.

## Authored changes

- Six blue stone steps with separate brass nosings; shortened botanical page ornament to avoid crossing the chapter label.
- Raised navy enamel doorway, gold crescent fanlight, star/radial door inlays, carved buttresses and two hexagonal opal lanterns.
- Modeled ivy and sparse ivory blossoms; no replacement illustration used for this new geometry.
- Hinged door ornaments are included in the `doorLeaf` batches and rotate with the handle/panels.
- A warm inset with three stars sits behind the leaf. This replaces the initially observed blank-paper opening; it is intentionally a shallow miniature light panel, not a fully modeled room behind the doorway.

## Assets and budgets

- Live: `public/assets/story-models/storybook-gateway.glb`, **2,498,132 bytes**, **49,612 triangles**, **13 batched meshes**, one scene.
- Prior `storybook-hero.glb` retained for comparison/recovery.
- Source: `artifacts/storybook-hero/storybook-study.blend`; scripts `build_storybook_hero.py` and `optimize_storybook_hero.py` retain the full authoring pipeline.
- Metadata identifies `celestial-gateway-v1` and source comic page 8. The original illustration and both exported micrograin normal materials remain embedded.
- Same-scene transparent fallback regenerated at 1050×800, 48 Cycles samples, four threads; copied to `public/assets/storybook-poster.png`. Studio and browser lighting are not identical.
- Geometry remains below the original 50k-triangle bound. The mesh bound grows from 12 to 13 for the two added surface types; the file bound grows from 2 MiB to 2.5 MiB for the added geometry. These explicit revised budgets are not a performance pass by themselves.

## Runtime verification

Browser-provider automation remained unavailable; native Chrome window control was used instead.

- Selected Avoidance on the real homepage and visually inspected the closed gateway.
- Opened the miniature door through its control, observed the leaf/inlays move together and the warm star-patterned inset appear. Buttresses, lamp frames and vines remain stationary.
- Main introduction, model, Scenario and Explore remain visible together in the desktop window. No chapter-title overlap in the rendered inspection.
- After offline rendering and tests finished, used the actual frame-pacing QA page: 700×380 CSS canvas / 1050×570 backing buffer, ten-second sample, 600 frames, **60 FPS**, median 16.7 ms, p95 17.6 ms, p99 17.7 ms, max 17.8 ms, zero frames over 25 ms or 50 ms. Reported 30 draws / 99,230 rendered triangles including shadow passes.
- All 38 tests pass, including current asset metadata/size/mesh budgets and actual GLB ancestry resolving all 13 surfaces to the chapter. These are structural checks, not art-quality certification.

## Still outstanding

Physical-device testing and sustained performance are unproven for this new asset. Native inspection did not provide a console-error audit. The entrance remains a stylized miniature, not the full painted city or a commercial-fidelity character/environment replacement. Overall commercial-quality goal remains active.
