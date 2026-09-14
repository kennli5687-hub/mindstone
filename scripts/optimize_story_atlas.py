import bpy,pathlib,collections
ROOT=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
scene=bpy.context.scene
assert scene.name.startswith('Mindstone_Story_Atlas'), 'Only optimize the authored sample scene'
groups=collections.defaultdict(list)
for o in list(scene.objects):
    if o.type=='MESH' and o.name!='Mindstone_Core':
        # Preserve the three pickable story roots; batch the small inlays.
        groups[(o.parent,tuple(o.data.materials))].append(o)
for (parent,mats),objects in groups.items():
    if len(objects)<2:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    objects[0].name=(parent.name if parent else 'Atlas')+'_'+mats[0].name
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:
    if o.type in {'MESH','EMPTY'}:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/story-models/story-atlas.glb'),export_format='GLB',use_selection=True,export_apply=True)
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'artifacts/story-atlas/story-atlas.blend'))
print('Optimized mesh count',sum(o.type=='MESH' for o in scene.objects))
