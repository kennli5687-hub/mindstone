"""Batch static draw calls; render a review sheet from the actual GLB assets."""
import bpy, pathlib
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets/story-models'
for path in sorted(OUT.glob('*.blend')):
    bpy.ops.wm.open_mainfile(filepath=str(path))
    # Palette values are authored as sRGB hex; Blender shader inputs are linear.
    for material in bpy.data.materials:
        if not material.use_nodes: continue
        shader=material.node_tree.nodes.get('Principled BSDF')
        if shader:
            c=material.diffuse_color
            shader.inputs['Base Color'].default_value=tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c[:3])+(1,)
    # Architecture is static: one mesh per material rather than hundreds of
    # tiny draw calls. Animated character pivots are intentionally untouched.
    for material in list(bpy.data.materials):
        if path.stem in ('ari','morrow'): break
        objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.active_material==material]
        if not objects: continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        bpy.ops.object.join()
        objects[0].name='Architecture_'+material.name
    bpy.ops.export_scene.gltf(filepath=str(OUT/(path.stem+'.glb')),export_format='GLB')

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(OUT/'ari.glb'))
bpy.ops.import_scene.gltf(filepath=str(OUT/'morrow.glb'))
for o in bpy.context.scene.objects:
    if o.parent is None and o.name.startswith('Morrow'):o.location=(.6,0,1.65)
bpy.ops.mesh.primitive_plane_add(size=200)
floor=bpy.context.object
m=bpy.data.materials.new('Backdrop');m.diffuse_color=(.10,.16,.26,1);floor.data.materials.append(m)
floor.location.z=-.07
bpy.ops.object.camera_add(location=(3,-5,2.7))
camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=2.8;bpy.context.scene.camera=camera
for loc,power,size in [((1,-4,5),650,5),((-3,-1,3),450,4),((0,3,4),700,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size
    light.rotation_euler=(Vector((0,0,1))-light.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=960;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.render.filepath=str(OUT/'character-preview.png')
bpy.ops.render.render(write_still=True)
