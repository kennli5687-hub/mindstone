# Attic delivery compression

Original retained: `public/assets/story-models/attic-storybook-v2.glb`, 21,548,080 bytes.
Active continuation delivery: `public/assets/story-models/attic-delivery.glb`, 5,813,276 bytes (**73.0% smaller** before HTTP compression).

Generated through Blender MCP with Draco level 6, position 16-bit, normal 12-bit, UV 14-bit and other attributes 12/14-bit quantization. No additional decimation. Quantization is not mathematically lossless; same triangle count alone does not prove identical vertex attributes.

The local comparison page `artifacts/qa/attic-compression.html` loads both actual models with the same camera and lights. Browser-decoded results: 33 meshes and 426,660 triangles each; identical reported world bounds. Side-by-side screenshot reviewed with no obvious differences at the tested size. Actual Explore entry and repeat entry rendered the room and character without console errors.

Decoder files copied from installed Three.js 0.185.1 glTF Draco distribution and served locally with Apache license and provenance notice. WASM path adds roughly 245KB of decoder/wrapper assets on first use; JS-only fallback is roughly 500KB. Runtime reuses a maximum of two decoder workers across visits. Asset compression reduces transfer, not the 426,660-triangle GPU workload.

17 adventure tests pass including the new delivery topology/scene/texture/target/size check. The active continuation uses the new file; original and editable sources remain intact. This is delivery optimization, not a claim that the attic artwork or full game is commercially finished.
