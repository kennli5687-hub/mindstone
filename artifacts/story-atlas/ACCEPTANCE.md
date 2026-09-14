# Story Atlas — homepage review sample

## Blender MCP connection

- Community source: https://github.com/ahujasid/blender-mcp
- Source revision: 5f8ddaf6e987c4aa0c3467fcc548838b28f64477, package 1.9.1.
- Installed in `/Users/andrewlin/.local/share/mindstone-blender-mcp/.venv`.
- Blender addon installed and enabled in Blender 5.2 preferences; telemetry consent false.
- Codex stdio server `blender` is enabled, with `BLENDER_MCP_DISABLE_TELEMETRY=true`, `BLENDER_HOST=127.0.0.1`, `BLENDER_PORT=9876`.
- A dedicated GUI Blender instance is running the local socket. Close it to stop this instance. This is not a login service.
- Genuine MCP `initialize` and `get_scene_info` succeeded; `execute_blender_code` built and optimized the model. The current conversation used a standard Python MCP client because newly configured tools are not automatically added to its callable tool list.
- For a later session, keep Blender open and use the addon’s Connect control. Do not run a second socket on the same port. Codex may need a new session to discover the newly configured integration.
- No external asset API or paid image-to-3D service used; all sample geometry is authored locally. No scene uploads enabled.

## Deliverables

- Editable source: `story-atlas.blend`.
- Web model: `../../public/assets/story-models/story-atlas.glb`.
- Fallback render: `../../public/assets/story-atlas-poster.png`.
- Build/optimization scripts: `../../scripts/build_story_atlas.py`, `../../scripts/optimize_story_atlas.py`.
- Web renderer: `../../src/storyAtlas.js`; layout: `../../atlas.css`.

## Verified

- Real Three.js GLB rendering, not a flat rendered image pretending to be 3D.
- Browser observed 17 draw calls and 32,880 triangles; GLB approximately 1.3 MB.
- Topic buttons switch descriptive copy; unreleased 3D stories show disabled Coming soon.
- Pause control switches state. Reduced-motion preference suppresses ambient movement.
- Meet Mira opens the Scenario video introduction; homepage renderer is disposed while the modal is open.
- At 390 CSS px: document width 390, hero width 366, viewport width 328; no horizontal overflow.
- Hero and lower cards do not overlap. Default-width gap measured 24 px.
- 17 Node tests pass; production Vite build passes (existing large-JS-chunk warning remains).

## Acceptance limits

This is a reviewable art/interaction sample, not a claim of final commercial release quality.
Desktop and narrow browser layouts were checked, not physical iOS/Android devices.
Sustained FPS, low-end-device GPU behavior and simulated WebGL loss still require dedicated testing.
Only Avoidance currently links to a playable 3D story. The other objects are concept previews.
The faceted core and symbolic objects establish a visual direction; character portraits and the
full set of psychological terms are not modeled in this sample.
