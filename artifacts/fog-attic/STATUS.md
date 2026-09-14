# Fog Attic — current iteration

Scope is the opening attic, not the postbox courtyard.

Implemented: additional bookcases, chair, book piles, woven-rug geometry, trunk,
astrolabe, pencil cup, wax seal, star globe and curved ivy. The new environment
is exported as `public/assets/story-models/attic-storybook.glb` and loaded by the
game. Added collision circles for the new furniture. The six-piece picture
puzzle and story-memory gate remain in place.

The texture atlas was generated using built-in imagegen. Source and exact prompt:
`../postbox-courtyard/textures/painterly-atlas.png` and `prompt.txt`.
UV-mapped textures are embedded in GLB; editable scene and actual Cycles review
render live alongside this document. Static meshes are batched by material,
while DeskPuzzle, DetailLantern and DetailAtlas remain separate interactions.

**Not yet accepted as matching the comic's fidelity.** Ari is still the earlier
character study. The floating skyline remains too repetitive, cloth/anatomy
need more work, and lighting/composition require additional reference matching.
This iteration is not a claim of commercial-ready artwork or completion.

Rebuild: Blender --background --python scripts/finish_fog_attic.py

## Second environment pass

`refine_fog_attic.py` replaces the distant single towers with clustered palaces,
individual windows, cornices and aqueduct-like bridges. `optimize_attic.py`
then exports a reduced static web mesh (about 21 MB) while retaining full-detail
Blender sources. The app loads `attic-storybook-v2.glb`. Review render:
`fog-attic-v2.png`; editable full scene: `fog-attic-v2-review.blend`.
Browser confirmed that the v2 asset loads with textures. This is still not
accepted as matching the original comic's character/lighting fidelity.

## Lighting and character review

Web scene now includes warm directional window fill, a localized amber desk
light, and distance-based atmospheric fog. Browser review found no console
errors. The `polish_ari.py` experiment was visually rejected: sleeve deformation
and raised seams were worse at close range. Its files are retained for diagnosis,
but the game continues to load `ari-atelier.glb`. Do not present
`ari-polished.png` as accepted character art.

## Reference-led character silhouette pass

The app now loads `ari-comic-candidate.glb`, built by `build_ari_comic.py`
against `references/ari-turnaround.png`. The editable candidate is
`references/ari-comic-candidate.blend`. Actual front, side, back and stride
renders are `references/ari-comic-{front,side,back,stride}.png`.
Continuous crown removes exposed scalp; open coat, cream shirt, rolled cuffs
and continuous weighted trousers/sleeves replace segmented clothing. Lower
coat panels partially follow the thighs. Existing walk animation is retained.
Twelve tests and Vite build passed. Browser visual verification was unavailable
in this pass (CUA User unavailable); Blender views were inspected instead.
Still below the turnaround's fidelity: face anatomy, layered wavy locks,
cloth folds, shoes and comic shading need further work. This is an incremental
in-game character replacement, not final/commercial artwork.
