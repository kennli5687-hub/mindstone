"""Render a transparent fallback from the current saved study, without saving scene overrides.

Run: Blender -b artifacts/storybook-hero/storybook-study.blend -t 4 --python scripts/render_storybook_poster.py
"""
import bpy,pathlib
from mathutils import Vector

root=pathlib.Path(__file__).resolve().parents[1]
scene=bpy.context.scene
assert scene.name.startswith('Mindstone_Storybook_Study'),scene.name
for obj in scene.objects:
    if obj.name.startswith('Studio surface'):
        obj.hide_render=True
camera=scene.camera
camera.location=(1.5,-4.6,5.6)
camera.rotation_euler=(Vector((0,0,.2))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=4.6
scene.render.engine='CYCLES'
scene.render.threads_mode='FIXED';scene.render.threads=4
scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.render.resolution_x=1050;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA'
scene.render.filepath=str(root/'artifacts/storybook-hero/storybook-poster-current.png')
bpy.ops.render.render(write_still=True)
