import bpy,pathlib
out=pathlib.Path(__file__).resolve().parents[1]/'artifacts/postbox-courtyard'
bpy.ops.wm.open_mainfile(filepath=str(out/'postbox-courtyard.blend'))
s=bpy.context.scene
s.render.threads_mode='FIXED';s.render.threads=2
s.cycles.samples=8;s.cycles.use_denoising=True
s.render.resolution_x=900;s.render.resolution_y=750;s.render.resolution_percentage=100
s.render.filepath=str(out/'courtyard-render.png')
print('Starting two-thread preview render',flush=True)
bpy.ops.render.render(write_still=True)
