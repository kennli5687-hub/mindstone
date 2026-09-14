# Multi-story homepage review

Supersedes the single-protagonist default hero. The user's correction is explicit:
Mindstone introduces different people's stories for different psychological terms;
Mira must not appear before choosing her chapter.

Implemented:
- Three Blender-authored clothbound books, unique color and gilded cover motif.
- Neutral initial state, no selected topic, no character illustration in library GLB.
- Avoidance loads the existing articulated Mira book on demand. Other topics show
  development status and keep the neutral collection, not Mira's illustration.
- All stories returns to the collection. Existing explicit sidebar selection is
  respected on remount; initialization does not overwrite it.
- Bottom entry cards describe generic Scenario / Explore functions. A visitor with
  no topic selected is directed to the topic controls instead of silently choosing Mira.
- Embedded stable storyId metadata supports raycast selection. The library has no
  external textures or protagonist artwork. Optimized file is approximately 857 KiB.

Browser evidence: neutral initial/returned state selectedStory=none, no Mira text,
zero homepage videos, loaded=true, no horizontal overflow at 828px. Choosing
Procrastination does not show Mira; choosing Avoidance shows her open book and CTA.

Still work in progress, not commercial acceptance. Cover typography is small in
the current camera composition; mobile sizing, selection transitions, device
performance, accessibility edge cases and final visual acceptance need more work.

## Composition iteration

- Orthographic camera replaces the distant perspective view. A tested frustum
  calculation preserves width across aspect ratios; this is not a substitute for
  actual mobile screenshots.
- Chapter titles use dark letterpress ink instead of low-contrast metallic lettering.
- Switching models uses a short entrance transition, skipped for reduced motion.
- Unchanged frames are not redrawn after the scene settles while paused.
- 20 Node tests and the production build pass. The large JS chunk warning remains.
- The attempted 390px viewport override did not affect the inspected tab (DOM still
  reported 828px). Mobile visual acceptance remains explicitly unverified.

## Interaction verification

- Selected closed chapters lift 0.16 world units; return settles them to their
  authored positions. Reduced-motion changes settle immediately.
- Browser pause verification: renderCount remained 809 across separate reads
  with the pause control reading Resume 3D motion.
- All stories returned selectedStory to none and keyboard focus to Procrastination.
- Both lower action cards remained within the viewport after return.
- Motion unit tests cover exact convergence at 30/60/120Hz and no overshoot after
  a stalled frame. Current production build passes (large-bundle warning remains).

## Material and responsive checks

- Cloth bindings now share one generated tangent-space normal PNG, embedded in
  glTF. KHR_texture_transform preserves 8× tiling. Normal strength is 0.12 after
  inspecting and rejecting stronger, visibly wavy/checkered material studies.
- `cloth-detail.png` and `cloth-detail-v2.png` are intermediate strength studies,
  not the final material. The current GLB and refreshed poster use reduced strength.
- Final realtime material inspected in Chrome, with no logged browser errors.
- Actual Chrome viewport override verified at 390×844. No horizontal body overflow;
  Avoidance selects and its model loads. Body content is 1959px tall, so this is
  NOT a mobile one-screen acceptance. A mobile layout iteration remains necessary.
- Chrome at 1366×768: hero children have scrollHeight=clientHeight; both lower
  action cards end at y=758. Neither action is clipped. Temporary viewport reset.
- Browser-scoped viewport capability on Chrome is effective; the previous in-app
  attempt was not. Continue responsive QA in Chrome rather than assuming an override.
- 22 Node tests passed including cloth-map embedding and texture-transform checks.

## Portrait one-screen iteration

- Added a dedicated layout for widths below 760px and heights at least 780px.
  Four category summaries form a compact row; introduction, real 3D canvas and
  two illustrated action cards retain separate allocated regions.
- The duplicate promotional intro CTA and scope-of-demo note are hidden on this
  layout; the purpose, learning sequence, therapy disclaimer and actual controls
  remain visible. This does not scale down the whole page.
- Chrome 390×844, Avoidance selected: each category summary has scrollHeight equal
  to clientHeight; intro and atlas also match. Both action cards end at y=836.
- Chrome 375×812: no horizontal overflow, hero clientHeight=scrollHeight=504,
  both actions end at y=804.
- Shorter phones and landscape retain scrolling layouts; these checks do not
  establish one-screen compliance at every possible screen size or zoom setting.

## Mobile category picker

- Actual interaction revealed that expanding the desktop details element inside
  the compact mobile row hid its options. Replaced only the mobile interaction
  with a native modal topic picker. Desktop keeps inline category expansion.
- Topic labels and preview images remain fully readable; native dialog provides
  modal keyboard focus behavior. Close, Escape, selection and teardown clean up
  the dialog and restore an appropriate category focus target.
- Chrome 390×844 verification: Behavioral Blockers opens three complete choices;
  selecting Avoidance closes the dialog, sets selectedStory=avoidance, and both
  action cards remain within the viewport. Escape also closes and restores focus.

## Exploration loading boundary

- Continuation is now a dynamic import, not part of the initial homepage module.
  Production build emits a separate 28.71kB continuation chunk (8.84kB gzip).
  Main script is 719.56kB before compression; its size warning remains.
- A generation counter invalidates pending mounts on close/re-render. Failures
  provide an alert and a retry button; stale responses do not mount into detached DOM.
- Chrome checks: first open reaches The Moonstone Workshop; closing leaves zero
  world containers and one homepage canvas; reopening reaches the workshop again.
  Browser error log is empty. Artificial slow-network/error injection remains untested.

Source: scripts/build_story_library.py, invoked through installed Blender MCP.
Editable scene: story-library.blend. Poster: public/assets/story-library-poster.png.
Live model: public/assets/story-models/story-library.glb.
# Preview feedback isolation

Preview visibility and status now derive from the selected chapter and asset availability, rather than asynchronous callback order. Switching away from Mira clears her pending/error feedback. A late library failure no longer hides an already-loaded open book. Asset success cannot dismiss WebGL context-loss fallback.

Five focused state tests pass. Chrome verified Avoidance → Procrastination → Avoidance: the development chapter has no Mira loading message, and the loaded open book returns with its canvas visible and poster hidden; no console errors. Failure sequences are unit-tested, not browser-network or GPU-failure injections. Commercial visual acceptance and physical-device performance remain outstanding.
# Binding detail pass

Rebuilt via the live Blender MCP connection: replaced the 17 thick gilt edge bars with 35 fine, subtly offset paper signatures, retained fine gilding at the page-block boundaries, and added recessed cover hinge lines and alternating sewn head/tail bands. Export remains material-batched: 15 meshes for three books. The extra material distinguishes paper-edge shadows from metal, rather than increasing object count per detail.

Chrome live preview inspected: 31 draw calls, 52,960 triangles including shadow rendering. All 11 atlas tests pass. These counts do not prove physical-device performance. Matching fallback poster regenerated in Cycles with four threads. This is a binding-detail improvement, not a claim of final commercial acceptance.
# Chapter-entry availability

Explore now describes the currently selected topic's actual availability. Missing selection produces a visible live-status prompt; unavailable topics retain selection and explain development status instead of moving focus to Avoidance without explanation. Selecting Avoidance resets feedback and shows the three-place continuation copy. Chrome verified no-selection feedback, Perfectionism → Explore with no dialog and selection preserved, and switching back to Avoidance. The feedback control remains operable rather than falsely using disabled semantics for an explanatory action.
# Actual WebGL loss/restoration verification

Added production `webglcontextrestored` handling. Regenerates PMREM lighting (GPU render-target contents cannot be reused after context loss), invalidates rendering state and restores the selected model. Listener is detached on destruction. Local QA page: `artifacts/qa/context-recovery.html`; uses production renderer and real `WEBGL_lose_context`, not synthetic DOM events or a mock renderer.

Chrome verified two actual loss/restore cycles: (1) Mira's open door remained open, fallback poster appeared during loss, recovered canvas/materials/shadows visually inspected with no console errors; (2) changed to Perfectionism while lost, recovered the neutral library with current selection retained and door control hidden. This closes the previously untested context-loss recovery path on this desktop browser, not cross-device WebGL qualification.
# Soft shadow refinement

Changed the homepage shadow filter to VSM with radius 4 / 8 blur samples at the existing 1024px map resolution; lowered ground shadow opacity from .22 to .18. Inspected both closed library and open door in Chrome: softened projected edges without removing page/door depth cues. Open book reports 26 draws versus the earlier PCF 23 (two blur passes plus receiver participation); this is a measured rendering-count tradeoff, not a frame-rate benchmark.

Repeated real context loss/restoration using the QA page after the shadow change. Recovered library lighting and shadows inspected; no console errors. Physical-device performance and full visual acceptance remain open.
# Unavailable-renderer browser check

Extended local context QA with synchronous, test-only denial of canvas WebGL context creation (original method restored in `finally`). This simulates constructor failure; it is not a claim of testing physically unsupported hardware. Chrome verified the production renderer's catch path, poster display, topic switching and successful `onStory` callback.

The test exposed stale drag/open-door instructions on static fallback artwork. Fixed fallback help and accessible label, removed the static viewport from sequential keyboard focus and stopped intercepting its rotation keys while unavailable/context-lost. Re-tested: “Preview artwork · Choose a story below”, poster visible, tabindex -1 and story callback received. Real context recovery was separately verified earlier. Final visual direction feedback requested; commercial goal remains open.
# Honest homepage entry

Removed the legacy `readProgress().memories / 10` badge from the homepage header: it tracks the superseded story and cannot describe Mira's current comic or continuation. Replaced it with “Choose a story”, an explicit navigation action, without deleting any saved progress. Both browse-story buttons now focus the selected or first 3D topic and provide a live prompt. They no longer directly expand an inline category that can be clipped in the compact mobile layout.

Chrome 390×844 verification: header action focuses Avoidance, keeps all inline categories closed, gives the selection prompt, and document height remains 844. Viewport override restored. This is not a new reading-completion tracker.
# Progressive 3D module loading

Homepage now imports a lightweight `storyAtlasLoader` rather than the renderer. Topic metadata moved to a shared non-Three module. The placeholder retains three working topic buttons and a poster; selection/focus is handed to the renderer after load. Latest-task invalidation prevents a late import mounting after navigation; a failed import exposes retry while keeping topic selection available. Legacy avatar renderer code was mechanically moved into its own lazy module, preserving it rather than deleting user work.

Production build: initial main JS 86.12KB / gzip 28.37KB, versus previous 722.19KB / gzip 192.04KB. Shared 3D dependency 624.56KB / gzip 159.53KB is still downloaded asynchronously; this is dependency-order optimization, not a claim that total payload disappeared. Shared chunk still triggers Vite's >500KB warning.

Chrome verified progressive poster/model load, Avoidance selection, door interaction and opening Scenario with no console errors. Slow import selection/focus handoff and retry need dedicated browser fault-path validation; generic request gate tests are not sufficient proof of the complete loader UI.
# Progressive loader browser fault paths

Added `artifacts/qa/atlas-loader.html`, delivering the real renderer through a controllable module promise. Production loader defaults to normal dynamic import; an optional loader function provides this deterministic QA seam. These are browser integration tests with controlled delivery/rejection, not real network throttling.

Chrome verified: selected Perfectionism before delivery, then retained both selection and focused topic after mounting; rejected first request, selected Avoidance while failed, retried successfully with the correct story and no retry button left behind; scheduled a delayed delivery then destroyed the preview, which remained empty with zero canvases after delivery. No console errors. This supersedes the earlier missing fault-path verification note for these three cases.
# Modal keyboard continuity

Added a dynamic focus boundary for active Scenario/Explore dialogs, including buttons, selectors, video controls, disclosure summaries and canvas tab stops. The homepage header is inert while a modal is active (the dashboard already was). Opening remembers the entry control; closing restores focus after the homepage rebuild. Entering through “Meet Mira” returns to its topic button, which is available even during progressive renderer loading.

Chrome verified Scenario Shift+Tab wraps to the final reading button; Tab wraps back to Close story; Escape returns to Scenario. Explore initially focuses Close Explore; Escape returns to Explore and releases header inertness. No console errors. Fullscreen Escape is explicitly left to the browser, but fullscreen video behavior was not separately exercised. This is targeted keyboard verification, not a complete accessibility certification.
