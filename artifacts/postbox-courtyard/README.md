# Postbox courtyard — reference study

A fully modeled Blender scene based on the supplied *The postbox* comic panel.
This is an environment/look-development study, **not a production-quality signoff**.

Outputs:
- `postbox-courtyard.blend`: editable geometry, procedural surface relief, lights and camera.
- `courtyard-render.png`: Cycles render of the actual scene, not an AI concept image.
- `postbox-courtyard.glb`: geometry/material export for inspection. Procedural Blender bump
  networks are not baked, so the GLB is not guaranteed to reproduce the render's surface detail.

Includes lathed enamel shell, boolean-cut letter slot, brass cornices, raised lettering,
door outline, sunburst, limestone arch, modeled ivy leaves, reflective paving,
balustrade and floating-palace geometry. Ari is reused from the current character study,
not newly sculpted to match the reference pose or facial fidelity. No backdrop image is used.

Not yet complete: final character sculpt and pose, full illustrative foliage density,
production UVs/baked textures, LODs, web performance tuning and final lighting match.
Existing gameplay is intentionally unchanged.

## Second pass

`postbox-courtyard-v2.blend` and `courtyard-v2.png` add clustered buildings,
individual window recesses, cornices, copper spires, terrace bridges, layered
foliage, cloud volumes and revised actor staging/lighting. Run
`scripts/refine_postbox_courtyard.py` with Blender to rebuild from the original
scene. This pass uses four render threads to avoid overwhelming the host.
Run `scripts/grade_courtyard.py` afterward for the final sky color and actor placement.
The original render and scene remain intact. The second-pass volumes and
materials have not been baked or optimized for the browser.

Rebuild:
`/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/build_postbox_courtyard.py`
