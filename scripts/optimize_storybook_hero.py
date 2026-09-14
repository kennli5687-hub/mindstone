"""Produce a separate realtime candidate without touching the review scene."""
import bpy,pathlib,json
ROOT=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
ART=ROOT/'artifacts/storybook-hero'
source=bpy.context.scene
assert source.name.startswith('Mindstone_Storybook_Study'),source.name
scene=bpy.data.scenes.new('Mindstone_Storybook_Realtime');bpy.context.window.scene=scene
groups={}
for original in source.objects:
    if original.type!='MESH' or original.name.startswith('Studio surface'):continue
    obj=original.copy();obj.data=original.data.copy();scene.collection.objects.link(obj)
    # Modifiers applied before merging; all geometry is static for this version.
    bpy.context.view_layer.objects.active=obj;obj.select_set(True)
    for mod in list(obj.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
    if original.name.startswith(('Individual signatures','Open paper','Mira chapter illustration')):
        mod=obj.modifiers.new('Remove coplanar paper subdivisions','DECIMATE');mod.decimate_type='DISSOLVE';mod.angle_limit=.0001
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)
    role='doorLeaf' if original.name.startswith(('Inset enamel door','Recessed panel','Panel gold beading','Panel horizontal beading','Polished brass handle','Door leaf ')) else 'book'
    key=(role,tuple(m.name for m in obj.data.materials));groups.setdefault(key,[]).append(obj)
for key,objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    objects[0].name='Storybook_'+key[0]+'_'+key[1][0];objects[0]['part']=key[0]
root=bpy.data.objects.new('Avoidance',None);scene.collection.objects.link(root)
root['storyId']='avoidance'
root['artRevision']='celestial-gateway-v1';root['sourceComicPage']=8
hinge=bpy.data.objects.new('StoryDoorHinge',None);scene.collection.objects.link(hinge);hinge.parent=root;hinge.location=(.84-.27,.46,.60);hinge['part']='doorHinge'
bpy.context.view_layer.update()
for o in scene.objects:
    if o.type=='MESH':
        o.parent=hinge if o.get('part')=='doorLeaf' else root
        o.matrix_parent_inverse=o.parent.matrix_world.inverted()
for o in scene.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ART/'storybook-realtime.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_extras=True,export_image_format='JPEG',export_jpeg_quality=90)
meshes=[o for o in scene.objects if o.type=='MESH']
stats={'meshes':len(meshes),'triangles':sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes),'bytes':(ART/'storybook-realtime.glb').stat().st_size,'status':'Candidate only; browser fidelity and performance not yet verified'}
(ART/'realtime-metrics.json').write_text(json.dumps(stats,indent=2))
bpy.context.window.scene=source
print(json.dumps(stats))
