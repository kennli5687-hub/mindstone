# Continuation lighting and idle rendering

Added ACES tone mapping, cooler hemisphere fill, warm shadow-casting key and cool rim. PCF shadows use a 1024px map, radius 2.5 and reduced .72 intensity to retain visibility in shadow. Imported avatar/room and generated street meshes cast and receive shadows. Street key follows the walking character; resetting a room resets light placement. Shadow resources are disposed with the scene.

Rendering now tracks model arrival/revision, camera pose, viewport size and avatar position. Static states render only on change; walking continues rendering. Shadow maps regenerate for scene/character changes, not every camera-only movement.

Chrome actual Explore screenshot inspected: character, desk and shelving now have projected shadows. Initial load drew four frames; four additional idle seconds left render count at four. Opening the fragment activity still updates UI. This is an idle-render check, not a moving-camera or street-walking performance benchmark. Latest shadow-updating frame reported 184 draw calls (includes avatar and shadow pass); the added GPU workload requires separate moving-scene measurement.

Character fidelity, detailed environmental art and full commercial acceptance remain incomplete. Lighting refinement does not establish parity with the original comic.
