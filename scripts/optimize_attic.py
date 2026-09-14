"""Create a lighter web mesh; preserve the full-detail Blender source."""
import bpy,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(root/'artifacts/fog-attic/fog-attic-v2.blend'))
for o in list(bpy.context.scene.objects):
    if o.type!='MESH' or len(o.data.polygons)<800:continue
    bpy.context.view_layer.objects.active=o
    mod=o.modifiers.new('Web triangle budget','DECIMATE');mod.ratio=.40;mod.use_collapse_triangulate=True
    bpy.ops.object.modifier_apply(modifier=mod.name)
bpy.ops.export_scene.gltf(filepath=str(root/'public/assets/story-models/attic-storybook-v2.glb'),export_format='GLB')
