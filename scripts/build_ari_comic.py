"""Reference-led silhouette study; preserves skeleton, eyes, hands and satchel.
Outputs a separate candidate and three actual orthographic renders.
"""
import bpy,math,pathlib,ast
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets/story-models';ART=ROOT/'artifacts/fog-attic/references'
tree=ast.parse((ROOT/'scripts/build_atelier.py').read_text());exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef)],type_ignores=[]),'helpers','exec'))
bpy.ops.wm.open_mainfile(filepath=str(OUT/'ari-atelier.blend'))
M={m.name.removeprefix('Atelier_'):m for m in bpy.data.materials if m.name.startswith('Atelier_')};rig=bpy.data.objects['Ari_Rig']
if 'shirt' not in M:
    m=bpy.data.materials.new('Atelier_shirt');m.use_nodes=True
    c=[int('E5C6A0'[i:i+2],16)/255 for i in (0,2,4)]
    c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c]
    m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*c,1)
    m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.92
    M['shirt']=m
for o in list(bpy.context.scene.objects):
    if o.type!='MESH':continue
    o.parent=rig
    if o.name.startswith(('Tailored_coat','Folded_lapel','Coat_side_seam','Pocket_welt','Bob_silhouette','Layered_hair_lock','Hair_etched','Swept_fringe','Trouser_thigh','Trouser_calf','Coat_button')):bpy.data.objects.remove(o,do_unlink=True)
def skin(o,bone):
    vg=o.vertex_groups.new(name=bone);vg.add(list(range(len(o.data.vertices))),1,'REPLACE');mod=o.modifiers.new('Character skin','ARMATURE');mod.object=rig;return o
skin(loft('Cream_shirt',[(.87,.16,.105,0,0),(1.12,.19,.12,0,0),(1.35,.21,.12,0,0),(1.42,.10,.075,0,0)],'shirt',rig),'Spine')
# Open-front coat: continuous curved cloth wraps the back, not a closed cone.
levels=[(.52,.32,.19),(.62,.31,.185),(.80,.27,.16),(1.0,.22,.14),(1.18,.23,.145),(1.34,.25,.145),(1.40,.14,.10)]
v=[];f=[];N=64
for row,(y,rx,rz) in enumerate(levels):
    for j in range(N+1):
        a=.43+(math.tau-.86)*j/N
        fold=1+.018*math.cos(a*10)*(1-(y-.52)/.9)
        v.append((rx*math.sin(a)*fold,y,rz*math.cos(a)*fold))
for row in range(len(levels)-1):
    for j in range(N):a=row*(N+1)+j;f.append((a,a+1,a+N+2,a+N+1))
coat=surface('Open_knee_length_coat',v,f,'coat',rig)
mod=coat.modifiers.new('Fabric thickness','SOLIDIFY');mod.thickness=.008;bpy.context.view_layer.objects.active=coat;bpy.ops.object.modifier_apply(modifier=mod.name);skin(coat,'Spine')
for s in (-1,1):
    skin(surface('Notched_lapel',[(s*.09,1.42,.09),(s*.21,1.33,.145),(s*.135,1.28,.16),(s*.17,1.22,.155),(s*.065,1.06,.15),(s*.068,1.30,.15)],[(0,1,2),(0,2,5),(5,2,3),(5,3,4)],'lapel',rig),'Spine')
    skin(loft('Wide_trouser_upper',[(.43,.097,.09,s*.115,0),(.58,.102,.098,s*.115,0),(.84,.103,.102,s*.115,0),(.90,.10,.09,s*.115,0)],'pants',rig),'Leg_L' if s<0 else 'Leg_R')
    skin(loft('Wide_trouser_lower',[(.11,.113,.11,s*.115,.015),(.22,.106,.103,s*.115,.01),(.35,.099,.095,s*.115,0),(.45,.098,.091,s*.115,0)],'pants',rig),'Shin_L' if s<0 else 'Shin_R')
# Full wavy bob is a closed crown plus scalloped side/back curtain. No scalp holes.
skin(loft('Closed_hair_crown',[(1.75,.153,.128,0,-.016),(1.79,.170,.140,0,-.018),(1.83,.148,.128,0,-.019),(1.875,.080,.071,0,-.018),(1.89,.001,.001,0,-.018)],'hair',rig,64),'Head')
v=[];f=[];N=72;rows=20
for i in range(rows):
    t=i/(rows-1)
    for j in range(N+1):
        a=.93+(math.tau-1.86)*j/N
        wave=math.sin(a*11+t*5)*.012*t
        rx=.166+.027*math.sin(t*math.pi*.85)+wave
        rz=.14+.018*math.sin(t*math.pi)+wave
        y=1.78-.30*t+.012*math.cos(a*11)*t*t
        v.append((rx*math.sin(a),y,-.016+rz*math.cos(a)))
for i in range(rows-1):
    for j in range(N):a=i*(N+1)+j;f.append((a,a+1,a+N+2,a+N+1))
hair=surface('Wavy_bob_curtain',v,f,'hair',rig);mod=hair.modifiers.new('Hair shell','SOLIDIFY');mod.thickness=.014;bpy.context.view_layer.objects.active=hair;bpy.ops.object.modifier_apply(modifier=mod.name);skin(hair,'Head')
# Swept fringe ribbons with taper, rather than cylindrical spaghetti strands.
for k in range(6):
    verts=[]
    for j in range(13):
        t=j/12;x=-.105+.13*t+k*.022;y=1.85-.14*t-k*.003;z=.025+.108*math.sin(t*math.pi/2)
        width=.016*math.sin(.25+t*math.pi*.9)
        verts.extend([(x-width,y,z),(x,y+.005,z+.008),(x+width,y,z)])
    faces=[]
    for j in range(12):
        for q in range(2):a=j*3+q;faces.append((a,a+1,a+4,a+3))
    skin(surface('Swept_fringe_ribbon',verts,faces,'hair',rig),'Head')
for key in ('hair','coat','lapel','pants'):M[key].node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.92
# Continuous weighted cloth removes the rigid knee and elbow seams.
for o in list(bpy.context.scene.objects):
    if o.name.startswith(('Wide_trouser_', 'Shaped_upper_sleeve', 'Sleeve_cuff', 'Closed_hair_crown', 'Wavy_bob_curtain', 'Swept_fringe_ribbon')):
        bpy.data.objects.remove(o,do_unlink=True)
def blend_skin(o,upper,lower,joint,width):
    a=o.vertex_groups.new(name=upper);b=o.vertex_groups.new(name=lower)
    for v in o.data.vertices:
        w=max(0,min(1,(v.co.z-joint)/width+.5))
        if w:a.add([v.index],w,'REPLACE')
        if w<1:b.add([v.index],1-w,'REPLACE')
    mod=o.modifiers.new('Smooth joint skin','ARMATURE');mod.object=rig
for sign in (-1,1):
    suffix='L' if sign<0 else 'R'
    o=loft('Continuous_wide_trousers',[(y,rx,rz,sign*.115,0) for y,rx,rz in [(.11,.104,.10),(.20,.102,.10),(.34,.098,.095),(.40,.098,.094),(.44,.098,.094),(.48,.10,.096),(.56,.102,.098),(.72,.104,.10),(.88,.104,.10)]],'pants',rig)
    blend_skin(o,'Leg_'+suffix,'Shin_'+suffix,.44,.22)
    o=loft('Continuous_coat_sleeve',[(y,rx,rz,sign*x,0) for y,rx,rz,x in [(.85,.060,.060,.30),(.92,.064,.068,.298),(1.02,.067,.071,.29),(1.06,.068,.072,.285),(1.12,.072,.076,.280),(1.23,.082,.082,.266),(1.32,.085,.085,.246),(1.38,.054,.057,.224),(1.40,.020,.025,.217)]],'coat',rig)
    blend_skin(o,'Arm_'+suffix,'Fore_'+suffix,1.065,.18)
    skin(loft('Rolled_cuff',[(.86,.064,.064,sign*.3,0),(.88,.071,.071,sign*.3,0),(.94,.071,.072,sign*.297,0),(.95,.064,.068,sign*.295,0)],'lapel',rig),'Fore_'+suffix)
# A single watertight crown flows into the wavy bob. Front edge exposes the face.
v=[];f=[];N=96;rows=32
for i in range(rows):
    t=i/(rows-1)
    for j in range(N):
        a=math.tau*j/N
        front=max(0,min(1,(math.cos(a)-.35)/.40))
        front=front*front*(3-2*front)
        bottom=1.49+.265*front
        crown=min(1,t/.34)
        y=1.90-.135*crown if t<.34 else 1.765+(bottom-1.765)*(t-.34)/.66
        radius=math.sqrt(max(0,1-(1-crown)**2))
        wave=.006*math.sin(a*10+t*5)*radius
        v.append(((.185*radius+wave)*math.sin(a),y+.009*math.cos(a*10)*t*t,-.016+(.155*radius+wave)*math.cos(a)))
for i in range(rows-1):
    for j in range(N):
        a=i*N+j;b=i*N+(j+1)%N;f.append((a,b,b+N,a+N))
f.append(tuple(reversed(range((rows-1)*N,rows*N))))
skin(surface('Continuous_comic_bob',v,f,'hair',rig),'Head')
# Broader overlapping locks follow the crown instead of thin straight fringe bars.
for k in range(5):
    v=[];f=[]
    for j in range(17):
        t=j/16;x=-.09+.20*t-k*.012
        y=1.83-.115*t+k*.007;z=.115+.040*math.sin(t*math.pi/2)
        w=.026*math.sin(.12+t*math.pi*.96)
        v.extend([(x-w,y,z),(x,y+.006,z+.010),(x+w,y,z)])
    for j in range(16):
        for q in range(2):a=j*3+q;f.append((a,a+1,a+4,a+3))
    skin(surface('Sculpted_swept_lock',v,f,'hair',rig),'Head')
# The old mouth was embedded inside the cheek surface.
coat=bpy.data.objects['Open_knee_length_coat']
for v in coat.data.vertices:
    # Lower panels follow their thigh part-way to avoid a rigid coat cutting through a stride.
    w=max(0,min(.72,(.95-v.co.z)/.43*.72))
    coat.vertex_groups['Spine'].add([v.index],1-w,'REPLACE')
    name='Leg_L' if v.co.x<0 else 'Leg_R'
    group=coat.vertex_groups.get(name) or coat.vertex_groups.new(name=name)
    if w:group.add([v.index],w,'REPLACE')
for o in bpy.context.scene.objects:
    if o.name.startswith('Mouth'):o.location.y-=.026
# Keep the new identifiable surfaces separate so model QA can assert their presence.
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'ari-comic-candidate.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'ari-comic-candidate.glb'),export_format='GLB',export_animations=True)
rig.animation_data_clear()
for b in rig.pose.bones:b.rotation_euler=(0,0,0)
for p,e in [((1,-4,4),280),((-3,-1,2),200),((1,3,3),350)]:
    bpy.ops.object.light_add(type='AREA',location=p);o=bpy.context.object;o.data.energy=e;o.data.size=4;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=2.1
s=bpy.context.scene;s.camera=cam;s.world.color=(.22,.22,.22);s.render.engine='CYCLES';s.render.threads_mode='FIXED';s.render.threads=4;s.cycles.samples=16;s.render.resolution_x=650;s.render.resolution_y=850;s.render.resolution_percentage=100
for name,p in [('front',(0,-5,1.10)),('side',(5,0,1.10)),('back',(0,5,1.10))]:
    cam.location=p;cam.rotation_euler=(Vector((0,0,1.0))-cam.location).to_track_quat('-Z','Y').to_euler();s.render.filepath=str(ART/('ari-comic-'+name+'.png'));bpy.ops.render.render(write_still=True)
# Check a stride as well as the neutral silhouette.
for name,angle in [('Leg_L',-.35),('Shin_L',.65),('Leg_R',.35),('Arm_L',.22),('Arm_R',-.22)]:
    rig.pose.bones[name].rotation_euler.x=angle
cam.location=(3,-5,1.5);cam.rotation_euler=(Vector((0,0,1.0))-cam.location).to_track_quat('-Z','Y').to_euler()
s.render.filepath=str(ART/'ari-comic-stride.png');bpy.ops.render.render(write_still=True)
