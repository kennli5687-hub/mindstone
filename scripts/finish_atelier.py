"""Retain skin weights while batching Ari; save reproducible asset review."""
import bpy,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets/story-models'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'ari-atelier.blend'))
rig=bpy.data.objects.get('Ari_Rig')
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.parent=rig
for m in list(bpy.data.materials):
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.active_material==m]
    if not objects:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name='Ari_'+m.name
bpy.ops.export_scene.gltf(filepath=str(OUT/'ari-atelier.glb'),export_format='GLB',export_animations=True)
