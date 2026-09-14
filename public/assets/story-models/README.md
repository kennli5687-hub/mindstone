# Story models — first stylized pass

Original Blender-built interpretations of Ari, Morrow, and the ten places in
the English comic *A Letter to Tomorrow*. These are simplified sculptural
models, not a frame-for-frame reproduction of the illustrations.

- `ari.glb`: indigo bob, coral coat, teal satchel, cream shoes. Named limb
  pivots drive procedural walking in Three.js; this is not a skinned rig.
- `morrow.glb`: mint wings, gold antennae, independently animated wing pivots.
- Ten location GLBs: blue/gold arches, floating towers, vines, books and
  location-specific details. These supplement the existing interactive room
  geometry; collisions, puzzle objects and gates remain owned by the game.
- `.blend` files retain editable separate objects and the authored palette.
- `character-preview.png` is rendered from the exported GLBs in Blender.

Rebuild from the repository root:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/build_story_models.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/finish_story_models.py
```

The finish pass converts the authored sRGB palette to linear shader values,
batches static architecture by material, and exports the optimized web files.
It deliberately leaves character pivots unmerged. Re-run both stages after
editing the generator. No texture downloads or third-party model licenses.

Remaining art refinements include expressive faces, cloth/rigged animation,
more bespoke architecture per comic panel, and additional supporting NPCs.
