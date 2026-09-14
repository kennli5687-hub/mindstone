"""Non-destructive character polish with the existing walk skeleton intact."""
import bpy,math,pathlib,ast
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets/story-models';ART=ROOT/'artifacts/fog-attic'
tree=ast.parse((ROOT/'scripts/build_atelier.py').read_text());exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef)],type_ignores=[]),'helpers','exec'))
bpy.ops.wm.open_mainfile(filepath=str(OUT/'ari-atelier.blend'))
M={m.name.removeprefix('Atelier_'):m for m in bpy.data.materials if m.name.startswith('Atelier_')}
rig=bpy.data.objects['Ari_Rig']
for o in list(bpy.context.scene.objects):
    if o.type=='MESH':o.parent=rig
def skin(o,bone):
    vg=o.vertex_groups.new(name=bone);vg.add(list(range(len(o.data.vertices))),1,'REPLACE');mod=o.modifiers.new('Skin to Ari','ARMATURE');mod.object=rig;return o
# Close the scalp gap with shaped crown rings, preserving swept fringe.
skin(loft('Continuous_hair_crown',[(1.75,.143,.115,0,-.016),(1.79,.151,.12,0,-.017),(1.83,.125,.102,0,-.019),(1.86,.070,.064,0,-.02),(1.873,.002,.002,0,-.02)],'hair',rig,48),'Head')
for s in (-1,1):
    for j in range(4):
        skin(tube('Crown_highlight',[(s*.025,1.861,-.016),(s*(.065+j*.019),1.82,-.070),(s*(.13+j*.004),1.72,-.06)],.0015,'hairline',rig),'Head')
    # Low-profile sculptural creases, not separate decorative rods.
    for j in range(3):
        x=s*(.11+j*.045)
        skin(tube('Hem_fabric_fold',[(x*.85,.98,.13),(x,.81,.145),(x*1.1,.65,.125)],.004,'lapel',rig),'Spine')
    bone='Fore_L' if s<0 else 'Fore_R'
    skin(tube('Cuff_seam',[(s*.30-.04,.89,.052),(s*.30,.887,.068),(s*.30+.04,.89,.052)],.003,'seam',rig),bone)
    skin(ellipsoid('Eye_catchlight',(s*.062-.006,1.686,.126),(.008,.008,.004),'white',rig),'Head')
# Reduce blocky transitions on sleeves by subdividing only their existing surface.
for o in list(bpy.context.scene.objects):
    if o.type=='MESH' and o.name.startswith(('Shaped_upper_sleeve','Sleeve_cuff')):
        mod=o.modifiers.new('Soft cloth silhouette','SUBSURF');mod.levels=1;mod.render_levels=1
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_move_up(modifier=mod.name);bpy.ops.object.modifier_apply(modifier=mod.name)
for key in ('coat','lapel','pants'):
    bs=M[key].node_tree.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.92
# Merge by material while retaining bone weights; export a separate asset version.
for m in M.values():
    objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.active_material==m]
    if len(objs)<2:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();objs[0].name='Ari_'+m.name
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'ari-polished.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'ari-polished.glb'),export_format='GLB',export_animations=True)
rig.animation_data_clear()
for b in rig.pose.bones:b.rotation_euler=(0,0,0)
bpy.ops.object.camera_add(location=(2,-4,2.3));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.3;bpy.context.scene.camera=cam
for p,e in [((1,-3,4),350),((-3,-1,2),180),((0,2,4),400)]:
    bpy.ops.object.light_add(type='AREA',location=p);o=bpy.context.object;o.data.energy=e;o.data.size=3;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.world.color=(.12,.15,.22);s.render.engine='CYCLES';s.render.threads_mode='FIXED';s.render.threads=4;s.cycles.samples=16;s.render.resolution_x=850;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.filepath=str(ART/'ari-polished.png');bpy.ops.render.render(write_still=True)
