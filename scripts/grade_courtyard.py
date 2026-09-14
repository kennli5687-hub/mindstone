"""Final camera/color review of pass two, preserving the first-pass files."""
import bpy,pathlib
from mathutils import Vector
out=pathlib.Path(__file__).resolve().parents[1]/'artifacts/postbox-courtyard'
bpy.ops.wm.open_mainfile(filepath=str(out/'postbox-courtyard-v2.blend'))
s=bpy.context.scene
for n in s.world.node_tree.nodes:
    if n.type=='VALTORGB':
        n.color_ramp.elements[0].position=0;n.color_ramp.elements[0].color=(.055,.24,.64,1)
        n.color_ramp.elements[1].position=1;n.color_ramp.elements[1].color=(.45,.66,.9,1)
bpy.data.objects['Ari staging'].location=(.05,-.30,.05)
bpy.context.view_layer.update()
rig=next(o for o in s.objects if o.type=='ARMATURE')
letter=bpy.data.objects.get('Letter in hand');letter.location=rig.matrix_world@rig.pose.bones['Fore_R'].tail;letter.location.z+=.045
for n in bpy.data.materials['Polished blue marble'].node_tree.nodes:
    if n.type=='BSDF_PRINCIPLED':n.inputs['Metallic'].default_value=.15;n.inputs['Roughness'].default_value=.28
s.cycles.samples=16;s.render.threads_mode='FIXED';s.render.threads=4
bpy.ops.wm.save_as_mainfile(filepath=str(out/'postbox-courtyard-v2.blend'))
s.render.filepath=str(out/'courtyard-v2.png')
bpy.ops.render.render(write_still=True)
