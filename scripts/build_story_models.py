"""Reproducible Blender source for the story's stylized web assets.
Run with Blender --background --python scripts/build_story_models.py.
Coordinates below are authored in Three's Y-up space, converted for export.
"""
import bpy, math, pathlib, random
from mathutils import Vector

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/story-models'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(17)
COLORS = {'ink':'17254C','blue':'284D91','gold':'DFAF59','cream':'F5DEAD',
          'coral':'D95C48','skin':'B97850','hair':'151B3D','mint':'9FEAC4',
          'teal':'238C91','leaf':'477F70','white':'FFF2D4'}
MATS = {}
for key, h in COLORS.items():
    m=bpy.data.materials.new(key); m.diffuse_color=tuple(int(h[i:i+2],16)/255 for i in (0,2,4))+(1,)
    m.use_nodes=True; bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=m.diffuse_color
    bs.inputs['Roughness'].default_value=.65
    if key=='gold': bs.inputs['Metallic'].default_value=.45
    MATS[key]=m

def p(v): return (v[0],-v[2],v[1])
def empty(name, pos=(0,0,0), parent=None):
    o=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(o)
    o.location=p(pos); o.parent=parent; return o
def shape(name,pos,size,color,kind='box',parent=None):
    if kind=='ball': bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10)
    elif kind=='cone': bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=1,radius2=.65,depth=2)
    else: bpy.ops.mesh.primitive_cube_add()
    o=bpy.context.object; o.name=name; o.parent=parent; o.location=p(pos)
    o.scale=(size[0]/2,size[2]/2,size[1]/2)
    o.data.materials.append(MATS[color])
    if kind=='box':
        bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
        mod=o.modifiers.new('Soft illustrated edges','BEVEL'); mod.width=.035; mod.segments=2
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mod.name)
    else:
        for f in o.data.polygons: f.use_smooth=True
    return o
def line(name,a,b,r,color,parent=None):
    av,bv=Vector(p(a)),Vector(p(b)); d=bv-av
    bpy.ops.mesh.primitive_cylinder_add(vertices=10,radius=r,depth=d.length)
    o=bpy.context.object; o.name=name; o.parent=parent; o.location=(av+bv)/2
    o.rotation_euler=d.to_track_quat('Z','Y').to_euler(); o.data.materials.append(MATS[color]); return o
def arch(x,y,z,w,h,parent,color='gold'):
    for s in (-1,1): line('Arch column',(x+s*w/2,y,z),(x+s*w/2,y+h-w/2,z),.065,color,parent)
    for i in range(16):
        a=i*math.pi/16;b=(i+1)*math.pi/16
        line('Curved arch',(x+math.cos(a)*w/2,y+h-w/2+math.sin(a)*w/2,z),(x+math.cos(b)*w/2,y+h-w/2+math.sin(b)*w/2,z),.065,color,parent)
def books(x,y,z,parent):
    for j in range(6): shape('Bound book',(x+j*.13,y+.22,z),(.11,.35+(j%3)*.07,.28),['blue','coral','cream'][j%3],parent=parent)
def vine(x,y,z,parent):
    for i in range(8):
        xx=x+math.sin(i)*.13
        line('Vine',(xx,y-i*.24,z),(x+math.sin(i+1)*.13,y-(i+1)*.24,z),.018,'leaf',parent)
        shape('Leaf',(xx+(-1)**i*.12,y-i*.24,z),(.23,.13,.07),'leaf','ball',parent)
def export(name):
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(name+'.blend')))
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name+'.glb')),export_format='GLB',export_yup=True)
def clear():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)

clear()
ari=empty('Ari')
shape('Long coral coat',(0,.92,0),(.66,.92,.38),'coral','cone',ari)
shape('Face',(0,1.62,.035),(.43,.53,.38),'skin','ball',ari)
shape('Bob silhouette',(0,1.74,-.08),(.53,.5,.42),'hair','ball',ari)
for s in (-1,1):
    shape('Bob side',(s*.21,1.6,-.005),(.15,.4,.3),'hair','ball',ari)
    for j in range(3):
        strand=shape('Swept fringe',(s*(.04+j*.055),1.82-j*.035,.17),(.16,.12,.10),'hair','ball',ari)
    shape('Ear',(s*.22,1.59,.02),(.09,.15,.09),'skin','ball',ari)
    shape('Eye',(s*.083,1.65,.215),(.065,.043,.025),'ink','ball',ari)
    shape('Eye glint',(s*.083-.009,1.66,.229),(.012,.012,.008),'white','ball',ari)
    line('Eyebrow',(s*.05,1.71,.207),(s*.12,1.72,.196),.012,'hair',ari)
    leg=empty('Leg_L' if s<0 else 'Leg_R',(s*.15,.61,0),ari)
    shape('Trouser',(0,-.23,0),(.20,.49,.23),'ink','cone',leg)
    shape('Cream shoe',(0,-.53,.06),(.24,.14,.39),'cream',parent=leg)
    arm=empty('Arm_L' if s<0 else 'Arm_R',(s*.31,1.28,0),ari)
    shape('Sleeve',(s*.025,-.24,0),(.21,.51,.23),'coral','cone',arm)
    shape('Hand',(s*.025,-.53,.015),(.13,.18,.13),'skin','ball',arm)
    line('Lapel',(s*.13,1.37,.19),(s*.07,1.13,.22),.032,'cream',ari)
shape('Nose',(0,1.6,.224),(.055,.07,.06),'skin','ball',ari)
line('Mouth',(-.045,1.51,.205),(.045,1.51,.205),.011,'coral',ari)
line('Satchel strap',(-.25,1.36,.22),(.29,.72,.27),.032,'teal',ari)
shape('Turquoise satchel',(.30,.7,.23),(.34,.32,.17),'teal',parent=ari)
shape('Satchel flap',(.30,.77,.327),(.32,.13,.035),'teal',parent=ari)
shape('Brass clasp',(.30,.71,.355),(.05,.055,.025),'gold',parent=ari)
for y in (.94,1.09): shape('Coat button',(0,y,.20),(.035,.035,.025),'gold','ball',ari)
export('ari')

clear(); moth=empty('Morrow')
shape('Body',(0,0,0),(.08,.25,.08),'gold','ball',moth)
shape('Head',(0,.13,0),(.11,.1,.09),'mint','ball',moth)
for s in (-1,1):
    wing=empty('Wing_L' if s<0 else 'Wing_R',(0,0,0),moth)
    shape('Upper wing',(s*.20,.055,0),(.40,.22,.035),'mint','ball',wing)
    shape('Lower wing',(s*.13,-.09,0),(.25,.14,.035),'teal','ball',wing)
    for dy in (-.04,.05,.12): line('Wing vein',(0,0,.025),(s*.32,dy,.025),.007,'cream',wing)
    line('Antenna',(s*.025,.16,0),(s*.10,.28,0),.008,'gold',moth)
    shape('Antenna tip',(s*.1,.28,0),(.03,.03,.03),'gold','ball',moth)
export('morrow')

themes=['attic','station','workshop','mirrors','observatory','garden','bridge','archive','harbor','post']
for theme in themes:
    clear(); root=empty('Story_'+theme)
    # A coherent blue-and-gold city beyond each walkable room. No collision is
    # added here: architectural detail stays outside the established play area.
    for x in (-4,-2,0,2):
        arch(x,.2,-4.68,1.65,3.9,root)
        shape('Blue spandrel',(x,3.8,-4.8),(1.85,.8,.18),'blue',parent=root)
    for x in (-5.3,3.8): vine(x,3.7,-4.55,root)
    for x in (-5,3.8):
        line('Lamp post',(x,.1,2.8),(x,2.7,2.8),.045,'ink',root)
        shape('Lantern',(x,2.6,2.8),(.25,.4,.25),'gold',parent=root)
    for i in range(7):
        x=-13+i*4;z=-12-abs(i-3)*1.2
        shape('Floating foundation',(x,-1,z),(2.4,1.8,2.4),'blue','cone',root)
        shape('Distant tower',(x,1.4,z),(.85,3.6,.9),'cream',parent=root)
        roof=shape('Golden tower crown',(x,3.5,z),(1.1,.9,1.1),'gold','cone',root)
        arch(x,.2,z+.48,.55,2,root)
    if theme in ('attic','archive','workshop'):
        for x in (-4.5,-2.5,1.5):
            for y in (.45,1.1,1.75):
                shape('Bookshelf',(x,y,-4.35),(1.2,.09,.55),'gold',parent=root);books(x-.43,y,-4.3,root)
    if theme=='attic':
        shape('Letter',(0,1.45,-1.4),(.60,.025,.4),'cream',parent=root)
        line('Envelope fold',(-.3,1.47,-1.6),(0,1.47,-1.4),.008,'gold',root)
        line('Envelope fold',(.3,1.47,-1.6),(0,1.47,-1.4),.008,'gold',root)
    if theme in ('station','post'):
        arch(0,.2,-4.1,3,4.3,root)
        for x in (-3,2): shape('Travel trunk',(x,.45,-3.9),(.85,.65,.5),'teal',parent=root)
    if theme in ('garden','harbor','bridge'):
        for i in range(8):
            x=-4.8+i*1.2
            vine(x,1.9,-4.4,root)
            shape('Stone balustrade',(x,.65,-4.5),(.13,1.2,.13),'cream',parent=root)
        line('Balustrade rail',(-5,.95,-4.5),(4,.95,-4.5),.07,'gold',root)
    if theme=='observatory':
        for i in range(12):
            a=i*math.pi/6
            shape('Constellation star',(math.cos(a)*3,3+math.sin(a)*1.5,-4.4),(.08,.08,.08),'gold','ball',root)
    if theme=='mirrors':
        for x in (-4,-2,0,2): arch(x,.25,-4.25,1.35,3.1,root)
    export(theme)
print('Exported Ari, Morrow and ten story location kits.')
