"""Second look-development pass. Keeps the first scene and render intact."""
import bpy, math, random, pathlib, ast
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/postbox-courtyard'
random.seed(73)
# Reuse only helper definitions, never the original scene-building side effects.
source=ast.parse((ROOT/'scripts/build_postbox_courtyard.py').read_text())
exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef)],type_ignores=[]),'courtyard_helpers','exec'))
bpy.ops.wm.open_mainfile(filepath=str(OUT/'postbox-courtyard.blend'))
gold=bpy.data.materials['Brushed antique brass'];stone=bpy.data.materials['Warm limestone'];blue=bpy.data.materials['Midnight blue banners']
leafm=[bpy.data.materials['Ivy '+str(i)] for i in range(3)];white=bpy.data.materials['Ivory petals']
scene=bpy.context.scene

# Direct the performance toward the letter slot. The previous letter was a
# floating scale placeholder; this one follows the posed hand's bone transform.
ari=bpy.data.objects.get('Ari_Atelier')
rig=next((o for o in scene.objects if o.type=='ARMATURE'),None)
if ari:ari.rotation_euler.z=0
if rig:
    rig.animation_data_clear()
    for b in rig.pose.bones:b.rotation_mode='XYZ';b.rotation_euler=(0,0,0)
    for name,rx,rz in [('Arm_R',-.55,-.12),('Fore_R',-1.05,0),('Arm_L',-.20,.10),('Fore_L',-.6,0),('Head',.05,-.10)]:
        b=rig.pose.bones.get(name)
        if b:b.rotation_euler=(rx,0,rz)
    bpy.context.view_layer.update()
    letter=bpy.data.objects.get('Letter in hand')
    hand=rig.pose.bones.get('Fore_R')
    if letter and hand:
        letter.location=rig.matrix_world@hand.tail
        letter.rotation_euler=(0,math.radians(-12),math.radians(78))
        letter.location.z+=.05

# Imported glTF skin objects can have independent roots. Stage every actor root
# together, so body, hair and skeleton all turn toward the postbox consistently.
actors=set(o for o in scene.objects if o.type=='ARMATURE' or (o.type=='MESH' and any(m and m.name.startswith('Atelier_') for m in o.data.materials)))
for o in list(actors):
    parent=o.parent
    while parent:actors.add(parent);parent=parent.parent
stage=bpy.data.objects.new('Ari staging',None);bpy.context.collection.objects.link(stage)
for o in [o for o in actors if o.parent not in actors]:
    world=o.matrix_world.copy();o.parent=stage;o.matrix_world=world
stage.rotation_euler.z=math.radians(78);stage.location=(-1.05,-.65,.05)
bpy.context.view_layer.update()
if rig and rig.pose.bones.get('Fore_R'):
    letter=bpy.data.objects.get('Letter in hand');letter.location=rig.matrix_world@rig.pose.bones['Fore_R'].tail;letter.location.z+=.045
    letter.rotation_euler=(0,math.radians(-12),math.radians(78))

# Replace the repeated cone-and-tower skyline with layered clusters and bridges.
for o in list(scene.objects):
    if o.name.startswith(('Floating island','Sky palace','Blue spire')) or (o.name.startswith('Carved stone arch') and o.location.y==0 and o.type=='CURVE' and min(p.co.y for p in o.data.splines[0].bezier_points)>5):
        bpy.data.objects.remove(o,do_unlink=True)
palace=material('Sunlit ivory plaster',(.74,.65,.45),0,.7,.05)
rock=material('Weathered island strata',(.30,.38,.40),0,.85,.22)
roof=material('Turquoise copper rooftops',(.055,.22,.24),.3,.44,.05)
window=material('Deep arched windows',(.026,.074,.105),0,.6)
grass=material('Island moss',(.17,.28,.13),0,.85)

def mesa(x,y,z,r):
    N=32;v=[]
    factors=[random.uniform(.83,1.12) for _ in range(N)]
    for dz,scale in [(-1.8,.18),(-1.1,.55),(-.6,.80),(-.18,.92),(0,1)]:
        for j in range(N):
            a=j*math.tau/N;rr=r*scale*factors[j]
            v.append((x+math.cos(a)*rr,y+math.sin(a)*rr*.65,z+dz+random.uniform(-.10,.10)))
    faces=[]
    for i in range(4):
        for j in range(N):a=i*N+j;b=i*N+(j+1)%N;faces.extend([(a,b,b+N),(a,b+N,a+N)])
    faces.append(tuple(range(4*N,5*N)))
    me=bpy.data.meshes.new('Stratified floating rock');me.from_pydata(v,[],faces);me.update()
    o=bpy.data.objects.new('Stratified island',me);bpy.context.collection.objects.link(o);assign(o,rock)
    lathe('Moss terrace',[(0,r*.9),(.08,r*.88)],(x,y,z+.04),grass,32)

def tower(x,y,z,h,w):
    cube('Palace tower',(x,y,z+h/2),(w,w*.8,h),palace,.035)
    for dz in (.10,h*.53,h-.08):cube('Limestone cornice',(x,y,z+dz),(w*1.09,w*.91,.075),stone,.012)
    lathe('Patinated spire',[(0,w*.70),(.12,w*.63),(w*.85,.035),(w,.012)],(x,y,z+h),roof,32)
    for dz in (.35,h*.58):
        for dx in (-w*.23,w*.23):
            cube('Window recess',(x+dx,y-w*.407,z+dz),(.115,.02,.30),window,.035)
            arch(x+dx,y-w*.43,z+dz-.16,.16,.36,gold,.012)
    lathe('Spire finial',[(0,.035),(.20,.01)],(x,y,z+h+w),gold,12)

for i,(x,y,z,r) in enumerate([(-5,7,2.3,1.6),(-1,11,4.6,2.0),(4,12,2.5,1.8),(8,16,4.1,1.6),(-8,16,5.6,2.0),(1,22,6.9,1.7),(9,26,7.4,1.9)]):
    mesa(x,y,z,r)
    for j in range(4):
        dx=(j%2-.5)*r*.8;dy=(j//2-.5)*r*.55
        tower(x+dx,y+dy,z+.13,1.0+(j%3)*.6,.45+(j%2)*.15)
    for j in range(7):
        a=j*math.tau/7;xx=x+math.cos(a)*r*.8;yy=y+math.sin(a)*r*.55
        lathe('Terrace parapet',[(0,.04),(.27,.04)],(xx,yy,z+.12),stone,12)
    if i<4:
        # Aqueduct-like walkways, with a clear deck and supporting arch bays.
        for bay in range(3):arch(x+r+bay*.8,y,z-.55,.82,1.2,stone,.055)
        cube('Skybridge deck',(x+r+.8,y,z+.69),(2.5,.40,.10),stone,.02)
        for sy in (-.20,.20):curve('Skybridge railing',[(x+r-.4,y+sy,z+.98),(x+r+2,y+sy,z+.98)],.02,gold)

# More layered leaves and hanging flower clusters on the near piers.
for x in (-3.50,3.47):
    for strand in range(6):
        for i in range(24):
            p=(x+random.uniform(-.36,.36),.52+random.uniform(-.13,.20),.65+i*.17)
            leaf(p,random.uniform(0,math.tau),random.uniform(.16,.32),random.choice(leafm))
            if (i+strand)%8==0:
                for k in range(5):leaf(p,k*math.tau/5,.105,white)

# Low-density true volumes: transparent edges, not opaque white spheres.
cloud=bpy.data.materials.new('Soft cloud volumes');cloud.use_nodes=True
nt=cloud.node_tree;nt.nodes.clear();output=nt.nodes.new('ShaderNodeOutputMaterial');vol=nt.nodes.new('ShaderNodeVolumePrincipled');vol.inputs['Color'].default_value=(.91,.95,1,1)
coord=nt.nodes.new('ShaderNodeTexCoord');dist=nt.nodes.new('ShaderNodeVectorMath');dist.operation='DISTANCE';dist.inputs[1].default_value=(.5,.5,.5)
nt.links.new(coord.outputs['Generated'],dist.inputs[0])
edge=nt.nodes.new('ShaderNodeMapRange');edge.inputs['From Min'].default_value=.12;edge.inputs['From Max'].default_value=.5;edge.inputs['To Min'].default_value=2.0;edge.inputs['To Max'].default_value=0;edge.clamp=True
nt.links.new(dist.outputs['Value'],edge.inputs['Value'])
noise=nt.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=5;noise.inputs['Detail'].default_value=2;nt.links.new(coord.outputs['Generated'],noise.inputs['Vector'])
mul=nt.nodes.new('ShaderNodeMath');mul.operation='MULTIPLY';nt.links.new(edge.outputs['Result'],mul.inputs[0]);nt.links.new(noise.outputs['Fac'],mul.inputs[1]);nt.links.new(mul.outputs[0],vol.inputs['Density']);nt.links.new(vol.outputs['Volume'],output.inputs['Volume'])
for i in range(10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=(-12+i*2.8,10+(i%3)*5,1.4+(i%4)*1.1))
    o=bpy.context.object;o.name='Drifting cloud bank';o.scale=(3.8,2,1.6);assign(o,cloud)

# Bright horizon gradient and warm, directional light rather than flat grey.
nt=scene.world.node_tree;nt.nodes.clear();out=nt.nodes.new('ShaderNodeOutputWorld');bg=nt.nodes.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=.7
coord=nt.nodes.new('ShaderNodeTexCoord');sep=nt.nodes.new('ShaderNodeSeparateXYZ');ramp=nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position=0;ramp.color_ramp.elements[0].color=(.16,.39,.74,1)
ramp.color_ramp.elements[1].position=.5;ramp.color_ramp.elements[1].color=(.74,.83,.91,1)
mapping=nt.nodes.new('ShaderNodeMapRange');mapping.inputs['From Min'].default_value=-.45;mapping.inputs['From Max'].default_value=.45
nt.links.new(coord.outputs['Normal'],sep.inputs[0]);nt.links.new(sep.outputs['Z'],mapping.inputs['Value']);nt.links.new(mapping.outputs['Result'],ramp.inputs[0]);nt.links.new(ramp.outputs[0],bg.inputs[0]);nt.links.new(bg.outputs[0],out.inputs[0])
sun=bpy.data.objects.get('Warm sunset');sun.rotation_euler=(math.radians(56),math.radians(-26),math.radians(-130));sun.data.energy=3.5;sun.data.color=(1,.80,.52);sun.data.angle=.08
for o in scene.objects:
    if o.type=='LIGHT' and o.data.type=='AREA':o.data.energy=850
scene.camera.location=(4.3,-8.4,2.7);scene.camera.rotation_euler=(Vector((.05,.6,2.35))-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.camera.data.lens=48
scene.render.threads_mode='FIXED';scene.render.threads=4
scene.cycles.samples=12;scene.cycles.use_denoising=True;scene.cycles.volume_bounces=1;scene.cycles.max_bounces=5
scene.render.resolution_x=1000;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.filepath=str(OUT/'courtyard-v2.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'postbox-courtyard-v2.blend'))
print('Starting courtyard second-pass render',flush=True)
bpy.ops.render.render(write_still=True)
