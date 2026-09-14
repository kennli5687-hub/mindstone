# Authored homepage reading space — September 12

## Scope and intent

The default homepage remains character-neutral: three different psychological terms, three chapter bindings. Added a compact reading desk rather than an unexplained isolated protagonist. This is a visual refinement, not final commercial-art acceptance.

## Delivered assets

- `public/assets/story-models/story-library-room.glb`: 1,392,804 bytes, one scene, three independently selectable story roots and one `readingSpace` root.
- Eight batched furniture materials supplement fifteen existing binding meshes: rounded lacquer base, velvet inset, continuous brass inlay, lathed opal lamp and stem, envelope, wax seal and fountain pen.
- Original `story-library.glb` is retained; the new build imports it without modifying the source.
- Editable `story-library-reading-space.blend` and `scripts/build_library_reading_space.py` retained.
- A matching 1050×800 transparent fallback is rendered from the same scene by `scripts/render_library_reading_space.py`, 32 Cycles samples, four CPU threads. Lighting is approximate, not pixel-identical to WebGL.

## Rejected / corrected

First lamp export overexposed the turquoise cover because Blender light power converts to glTF photometric units. Reduced power to 0.015 W before final export. Expanded the camera framing so the lamp top is not clipped. Moved the letter and pen to a visible rear strip; their initial placement was hidden behind book covers.

## Browser evidence

- Chrome desktop 1375×743: entire homepage, both Scenario and Explore buttons within one viewport; no document overflow.
- Chrome emulated 390×844: model, introduction, topic controls and both action cards fit; action bottoms at y=836, document scroll height 844. This is viewport emulation, not physical phone testing.
- Selecting Avoidance hides the reading setting and opens Mira’s existing 3D book. Draw count returns from 50 to 26; no stray lamp or furniture in that chapter.
- Runtime reported 50 draws and 85,326 rendered triangles for the library including its shadow pass.
- Ten-second animation-frame sample after offline rendering completed: 59.89 FPS, p95 17.7 ms, p99 17.8 ms, maximum 33.3 ms, zero frames above 50 ms. One frame exceeded 25 ms (0.17%). This measures delivered animation frames, not GPU execution time or sustained mobile performance.
- An earlier sample taken during simultaneous offline work was worse (55.5 FPS, max 283.3 ms). Retained here rather than silently treating it as a clean benchmark.
- Existing 34 tests pass, including material export, chapter-root preservation, updated framing bounds and prior game/loader tests. These are not an art-quality certificate.
- After returning from Mira and pausing, render count remained 3071 across a four-second observation; console errors were empty. Production build passed with the existing shared-Three chunk-size warning.

## Outstanding

Need user visual acceptance of this direction, physical-device performance checks, and broader art refinement. The playful miniature presentation remains more simplified than the original painted comic; the overall commercial-quality objective is not complete.

## Book interaction refinement — pending browser verification

Added a book hover cue, matching topic-button highlight and a 0.10-unit lift; keyboard focus on a topic gets the same preview without selecting it. Cue copy distinguishes the playable chapter from those in development. Touch does not depend on hover. The cue is decorative/hidden from accessibility APIs; equivalent descriptions are on the topic buttons. Reduced-motion handling uses the existing immediate-settle path.

Ray targeting now respects the nearest visible mesh. A desk or lamp in front of a book no longer lets a click pass through to a chapter behind it. Three new unit tests cover nested chapter resolution, furniture occlusion/empty space, and readiness-specific cue wording. All listeners added by this pass have cleanup handlers.

Browser automation failed with “User unavailable”; a follow-up inventory also reported no available browsers. Therefore actual pointer hover, keyboard preview rendering, cue dismissal and pause-after-hover are **not yet browser-verified**. Earlier desktop/mobile screenshots and performance measurements above predate this interaction pass. Do not treat those as evidence for the new behavior.

### Native Chrome follow-up

The browser-provider connection remained unavailable, but native Chrome window control worked. Verified in the actual 127.0.0.1 homepage:

- Paused motion, then Tab focused Avoidance: book lifted, corresponding button highlighted, cue read “Open this book · Story and playable world”.
- Next Tab focused Procrastination: cue and raised book changed; wording correctly said “In development”. Neither focus action selected a chapter.
- Clicking blank page space dismissed the preview and highlight.
- Direct coordinate click on the turquoise cover opened Mira’s actual 3D book. Return opened its miniature door; Escape returned to the three-book library and removed that chapter’s controls/cue.
- Direct click on the opal lamp did not select any chapter.
- Found the viewport focus outline crossing below-canvas instructions. Changed the outline to inset and reserved separate help-line spacing; a follow-up screenshot showed a visible gap and both action cards still fully inside the window.
- Restored normal motion and cleared test focus before handoff.

A native drag from outside the canvas did **not** leave an observable hover cue, so it is not counted as a hover pass. Ordinary pointer-hover entry/exit, touch behavior after this pass and render-count settling after hover remain unverified. Added an actual-GLB ancestry test: all eleven open-book meshes resolve to Avoidance; the library has five meshes per chapter and eight non-selectable furniture meshes. This supplements, but does not replace, real pointer testing.
