"""Render the current reading-space model for its no-WebGL fallback."""
import bpy,pathlib
from mathutils import Vector
root=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
scene=bpy.context.scene
for pos,power,size,color in [((-3,-4,6),650,4,(1,.86,.68)),((3,2,5),450,3,(.65,.8,1))]:
    bpy.ops.object.light_add(type='AREA',location=pos)
    o=bpy.context.object;o.data.energy=power;o.data.size=size;o.data.color=color
    o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Reading space poster world');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.4
bpy.ops.object.camera_add(location=(1.5,-4.6,5.6))
o=bpy.context.object;o.rotation_euler=(Vector((0,0,.2))-o.location).to_track_quat('-Z','Y').to_euler()
o.data.type='ORTHO';o.data.ortho_scale=5.0;scene.camera=o
scene.render.engine='CYCLES';scene.render.threads_mode='FIXED';scene.render.threads=4
scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1050;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.filepath=str(root/'artifacts/story-library/reading-space-poster.png')
bpy.ops.render.render(write_still=True)
