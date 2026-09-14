# Storybook homepage — ongoing quality review

This is a replacement for the rejected faceted Story Atlas, not a claim that
commercial acceptance is complete. The target remains a polished, comic-related,
interactive 3D homepage, with reliable responsive loading and accessible controls.

## Current implementation

- Authored through the installed, live Blender MCP connection.
- Curved comic page using the user's original Mira artwork; no invented protagonist.
- Layered paper signatures, padded cloth boards, gilded trim and stitches, coral
  bookmark, enamel doorway with fanlight, panel mouldings and brass handle.
- An independently hinged door opens on book click or Enter/Space. Arrow keys
  rotate; Home resets. Reduced-motion preference snaps the door to its target.
- Live asset: `public/assets/story-models/storybook-hero.glb`.
- Editable scene: `storybook-study.blend`. Do not overwrite unrelated Blender scenes.
- Current proof render: `storybook-v2.png`; this shows the closed door. Older
  `storybook-review.png0001.png` and `storybook-draft.png` are superseded studies.

## Evidence collected September 12, 2026

- Realtime asset: 1,836,408 bytes, 37,860 triangles, 11 meshes including articulated
  door parts. Browser reports 23 draws / 75,722 triangles including the shadow pass.
- Export restricted to the active scene. Original studio floor excluded even when
  Blender adds numeric name suffixes. Story interactions use exported metadata.
- Browser screenshot verifies actual WebGL render, not just poster fallback.
- Enter opens the door, and the visibly rotated leaf remains on its hinge.
- No horizontal overflow at the default 828px browser viewport.
- Homepage contains zero video elements. Meet Mira opens the introduction with
  one video, autoplay false.
- Asset tests cover one-scene export, texture embedding, stable interaction ID,
  hinge node, mesh/triangle/byte limits and exclusion of oversized studio geometry.

## Still unproven / unfinished

- Final visual acceptance against the requested comic quality. The miniature door
  and page ornament need further art-direction work; texture/micro-surface fidelity
  differs between Cycles and realtime rendering.
- Current iteration requires renewed mobile/desktop viewport checks, pointer
  drag/click checks, reduced-motion and WebGL-fallback tests.
- Sustained device performance, touch-device interaction and context-loss recovery.
- Final close-up rendering of the refined, articulated asset and licensing/source
  inventory for assets shipped in a commercial release (user supplied comic rights
  are not independently established).

Rebuild via `scripts/build_storybook_hero.py`, then
`scripts/optimize_storybook_hero.py`, both through `scripts/blender_mcp_client.py`.
Only copy the optimized GLB to the public asset after inspection and tests.
# Exported material parity

Replaced Blender-only noise/bump nodes on cover and cotton paper with a packed, periodic 128px tangent normal texture. Both materials now export their normal maps; a regression assertion checks this in the live GLB. Micrograin is intentionally subtle at homepage scale, not an additional illustration overlay.

Blender MCP rebuilt the study and realtime candidate. Live asset: 1,840,352 bytes, 37,860 triangles, 11 meshes; geometry unchanged. All 11 atlas tests pass. Chrome live screenshot inspected; Enter opens the miniature door and changes the help text; no console errors. Existing fallback poster predates this subtle micrograin pass. Commercial acceptance remains incomplete.
# Discoverable door control

Added a visible 44px-minimum door control to the loaded Mira storybook. It shares the existing articulated door action with canvas click and Enter, updates its label and pressed state, and is hidden for other chapters, absent models and unavailable/lost WebGL. Chrome verified pointer-open, Space-close, and switching to Procrastination hides the control. At 390×844, screenshot review confirms the door control and both Scenario/Explore cards remain on screen; document height equals viewport height. Browser viewport override restored after testing.
# Current fallback poster

Regenerated the transparent open-storybook fallback from the latest saved Blender study, including exported micrograin material revision. Camera direction now uses the same coordinates as the realtime camera after axis conversion. Reviewed the actual render before replacing `public/assets/storybook-poster.png`. This supersedes the earlier note that the fallback predates the micrograin pass.

Repeatable script: `scripts/render_storybook_poster.py`, run in background Blender against `artifacts/storybook-hero/storybook-study.blend`, with four render threads and 48 Cycles samples. It hides only the studio floor and does not save those scene overrides. Poster is an illustrative closed-door fallback, not a live snapshot of animation state; lighting remains the Cycles studio approximation rather than pixel-identical WebGL.
