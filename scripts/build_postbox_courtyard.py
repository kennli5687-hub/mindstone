"""Reference-driven, fully 3D courtyard study. Z-up Blender authoring.
Outputs editable scene, GLB and a matching-camera render; no image backdrop.
"""
import bpy, math, random, pathlib
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts/postbox-courtyard';OUT.mkdir(parents=True,exist_ok=True)
random.seed(44)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,color,metal=0,rough=.5,noise=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    nt=m.node_tree;b=nt.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=(*color,1);b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
    if noise:
        tex=nt.nodes.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=65;tex.inputs['Detail'].default_value=3
        bump=nt.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=noise;bump.inputs['Distance'].default_value=.025
        nt.links.new(tex.outputs['Fac'],bump.inputs['Height']);nt.links.new(bump.outputs['Normal'],b.inputs['Normal'])
    return m
red=material('Weathered vermilion enamel',(.40,.047,.033),.32,.32,.14)
gold=material('Brushed antique brass',(.66,.36,.075),.78,.26,.08)
stone=material('Warm limestone',(.69,.65,.51),0,.65,.17)
blue=material('Midnight blue banners',(.018,.054,.13),0,.85)
floor=material('Polished blue marble',(.085,.16,.24),.35,.20,.055)
dark=material('Recess interior',(.009,.006,.007),0,.9)
leafm=[material('Ivy '+str(i),c,0,.64) for i,c in enumerate([(.07,.19,.085),(.15,.29,.10),(.30,.38,.095)])]
white=material('Ivory petals',(.92,.83,.55),0,.55)
def assign(o,m):o.data.materials.append(m);return o
def cube(n,p,s,m,bevel=.025):
    bpy.ops.mesh.primitive_cube_add(size=1,location=p);o=bpy.context.object;o.name=n;o.scale=s
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new('Crafted edge','BEVEL');mod.width=bevel;mod.segments=3
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
    return assign(o,m)
def lathe(n,profile,p,m,N=96):
    v=[(p[0]+r*math.cos(j*math.tau/N),p[1]+r*math.sin(j*math.tau/N),p[2]+z) for z,r in profile for j in range(N)]
    f=[]
    for i in range(len(profile)-1):
        for j in range(N):a=i*N+j;b=i*N+(j+1)%N;f.append((a,b,b+N,a+N))
    f.extend([tuple(range(N-1,-1,-1)),tuple(range((len(profile)-1)*N,len(profile)*N))])
    me=bpy.data.meshes.new(n);me.from_pydata(v,[],f);me.update();o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o);assign(o,m)
    for poly in me.polygons:poly.use_smooth=len(poly.vertices)==4
    return o
def curve(n,pts,r,m):
    cu=bpy.data.curves.new(n,'CURVE');cu.dimensions='3D';cu.bevel_depth=r;cu.bevel_resolution=3
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(pts)-1)
    for b,p in zip(sp.bezier_points,pts):b.co=p;b.handle_left_type='AUTO';b.handle_right_type='AUTO'
    o=bpy.data.objects.new(n,cu);bpy.context.collection.objects.link(o);cu.materials.append(m);return o
def text(n,body,p,size,m):
    cu=bpy.data.curves.new(n,'FONT');cu.body=body;cu.align_x='CENTER';cu.size=size;cu.space_character=1.2;cu.extrude=.001;cu.bevel_depth=.0006
    o=bpy.data.objects.new(n,cu);bpy.context.collection.objects.link(o);o.location=p;o.rotation_euler=(math.pi/2,0,0);cu.materials.append(m);return o
def arch(x,y,z,w,h,m,r=.08):
    pts=[(x-w/2,y,z),(x-w/2,y,z+h-w/2)]
    pts += [(x+math.cos(math.pi-i*math.pi/24)*w/2,y,z+h-w/2+math.sin(math.pi-i*math.pi/24)*w/2) for i in range(25)]
    pts += [(x+w/2,y,z)];return curve('Carved stone arch',pts,r,m)

# The letter slot is genuinely recessed in the mesh, not painted on the front.
px,py=1.0,.35
body=lathe('Postbox cast shell',[(.15,.72),(.26,.78),(.36,.75),(.42,.65),(2.72,.65),(2.80,.72),(2.88,.73),(2.95,.67),(3.08,.55),(3.12,.08)],(px,py,0),red)
cutter=cube('Slot tool',(px,py-.62,2.51),(.88,.45,.20),dark,.028)
mod=body.modifiers.new('Open letter slot','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
bpy.context.view_layer.objects.active=body;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
cube('Dark letter cavity',(px,py-.44,2.51),(.84,.025,.17),dark,.02)
for z,r,h in [(.16,.75,.065),(.36,.76,.04),(.46,.665,.025),(2.74,.682,.035),(2.87,.735,.045),(3.02,.60,.025)]:
    lathe('Rolled brass cornice',[(0,r),(h*.3,r+.015),(h*.7,r+.015),(h,r)],(px,py,z),gold)
for x in (px-.48,px+.48):cube('Slot brass jamb',(x,py-.634,2.51),(.043,.06,.24),gold,.012)
for z in (2.39,2.63):cube('Slot brass lip',(px,py-.646,z),(.985,.07,.045),gold,.012)
# Door seam conforms to the cylindrical shell.
def front(x,z,offset=.009):return (px+x,py-math.sqrt(.65**2-x*x)-offset,z)
pts=[front(-.47,.55),front(-.47,2.23),front(-.43,2.28),front(.43,2.28),front(.47,2.23),front(.47,.55),front(.42,.50),front(-.42,.50),front(-.47,.55)]
curve('Inset door perimeter',pts,.011,gold)
for i in range(12):
    a=i*math.tau/12;r=.21 if i%2 else .28
    curve('Sunburst engraved ray',[front(math.sin(a)*.095,1.97+math.cos(a)*.095,.018),front(math.sin(a)*r,1.97+math.cos(a)*r,.018)],.008,gold)
for i,t in enumerate(['LETTERS','TO','A KINDER','TOMORROW']):text('Cast lettering',t,(px,py-.66,1.45-i*.15),.105,gold)
for x in (-.40,.40):
    for z in (.62,2.18):lathe('Brass rivet',[(0,.017),(.014,.012)],front(x,z),gold,16)

# Stone promenade, inset tile joints, balustrade and an ivy-covered arch.
cube('Promenade',(0,0,-.17),(11,8,.30),stone)
for i in range(11):
    for j in range(8):cube('Marble paving',(-5+i,-3.5+j,-.005),(.985,.985,.06),floor,.009)
for x in [-4.8,-3.6,-2.4,-1.2,0,1.2,2.4,3.6,4.8]:
    lathe('Baluster',[(0,.13),(.12,.16),(.22,.09),(.57,.055),(.68,.12),(.78,.10)],(x,2.8,.05),stone,24)
cube('Balustrade cap',(0,2.8,.91),(10.3,.34,.16),stone)
for x in (-3.5,3.5):
    cube('Pier foot',(x,1,.17),(.85,.9,.34),stone)
    cube('Pier',(x,1,2.15),(.48,.55,3.7),stone)
    cube('Pier capital',(x,1,4.02),(.75,.8,.20),stone)
arch(0,1,.3,7,6.6,stone,.24)
cube('Hanging banner',(-3.05,.67,2.65),(.67,.035,2.0),blue,.005)
for x in (-3.36,-2.74):curve('Banner gold edge',[(x,.64,1.66),(x,.64,3.65)],.009,gold)
for i,t in enumerate(['KINDER','PEOPLE','BRIGHTER','TOMORROWS']):text('Banner motto',t,(-3.05,.64,3.1-i*.18),.085,gold)

def leaf(p,a,scale,m):
    direction=Vector((math.cos(a),math.sin(a),.35));side=Vector((-math.sin(a),math.cos(a),0));p=Vector(p)
    points=[p,p+direction*scale*.5+side*scale*.35,p+direction*scale,p+direction*scale*.5-side*scale*.35,p+direction*scale*.48+Vector((0,0,.06))]
    me=bpy.data.meshes.new('Heart ivy leaf');me.from_pydata(points,[],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)]);me.update()
    o=bpy.data.objects.new('Ivy leaf',me);bpy.context.collection.objects.link(o);assign(o,m)
for x in (-3.52,3.46):
    for strand in range(5):
        pts=[]
        for i in range(24):
            z=4.7-i*.18;xx=x+math.sin(i*.55+strand)*.18;yy=.72+strand*.09;pts.append((xx,yy,z))
            leaf((xx,yy-.05,z),random.uniform(0,math.tau),random.uniform(.17,.30),random.choice(leafm))
            if i%5==0:
                for k in range(5):leaf((xx,yy-.07,z),k*math.tau/5,.10,white)
        curve('Climbing ivy stem',pts,.008,leafm[0])

# Distant geometry, all modeled rather than a composited background image.
for i in range(13):
    x=-11+i*1.8;y=7+(i%4)*3;z=.8+(i%5)*.8
    lathe('Floating island',[(0,.02),(1,.5),(1.4,1.1),(1.5,1.15)],(x,y,z),stone,32)
    h=.9+(i%3)*.5
    cube('Sky palace',(x,y,z+1.5+h/2),(.7,.65,h),stone)
    lathe('Blue spire',[(0,.48),(.7,.01)],(x,y,z+1.5+h),blue,32)
    arch(x,y-.34,z+1.6,.32,.68,gold,.025)
    if i<12:arch(x+.9,y,z+.2,1.8,1.3,stone,.10)

# Reuse the current Ari study for scale only; it is explicitly not a finished
# character recreation. Keep her separate in the editable file.
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/story-models/ari-atelier.glb'))
ari=bpy.data.objects.get('Ari_Atelier')
if ari:
    ari.location=(-1.15,-.40,.05);ari.rotation_euler.z=math.radians(-42);ari.scale=(1.12,1.12,1.12)
cube('Letter in hand',(-.90,-.86,1.36),(.30,.014,.19),white,.002)

scene=bpy.context.scene
world=bpy.data.worlds.new('Clear blue afternoon');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.26,.47,.78,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=world
bpy.ops.object.light_add(type='SUN',location=(5,6,5));sun=bpy.context.object;sun.name='Warm sunset';sun.rotation_euler=(math.radians(48),math.radians(-25),math.radians(145));sun.data.energy=2.2;sun.data.angle=.13;sun.data.color=(1,.78,.48)
bpy.ops.object.light_add(type='AREA',location=(-3,-4,5));light=bpy.context.object;light.data.energy=550;light.data.shape='DISK';light.data.size=5;light.rotation_euler=(Vector((0,0,1.6))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(5.1,-9.8,3.1));camera=bpy.context.object;camera.rotation_euler=(Vector((-.1,.6,2.0))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=46;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True
scene.render.threads_mode='FIXED';scene.render.threads=4
scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(OUT/'courtyard-render.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'postbox-courtyard.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'postbox-courtyard.glb'),export_format='GLB',export_cameras=False,export_lights=False)
bpy.ops.render.render(write_still=True)
