"""Dress the authored chapter bindings in a compact, character-neutral reading space.

Preserves the original library asset. All new surfaces are geometry/vertex data,
not a painted substitute for the 3D scene. Export only this new scene.
"""
import bpy, math, pathlib, json
from mathutils import Vector

ROOT=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
scene=bpy.data.scenes.new('Mindstone_Reading_Space')
bpy.context.window.scene=scene
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/story-models/story-library.glb'))
binding_objects=set(scene.objects)

def mat(name,h,metal=0,rough=.45,emission=0):
    m=bpy.data.materials.new('ReadingSpace_'+name);m.use_nodes=True
    p=m.node_tree.nodes['Principled BSDF']
    rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    rgb=[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    p.inputs['Base Color'].default_value=(*rgb,1)
    p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    p.inputs['Emission Color'].default_value=(*rgb,1);p.inputs['Emission Strength'].default_value=emission
    return m

wood=mat('Midnight lacquer','152B3E',.18,.34)
felt=mat('Blue velvet writing surface','284453',0,.86)
brass=mat('Aged champagne brass','B89557',.72,.28)
edge=mat('Polished edge','E8CB8C',.74,.23)
ivory=mat('Warm paper','EBDFC3',0,.77)
shade=mat('Opal reading lamp','FFE8AD',0,.42,.65)
wax=mat('Coral sealing wax','BD5268',.08,.4)
ink=mat('Graphite and folds','486474',.05,.6)

def finish(o,name,m):
    o.name=name;o.data.materials.append(m);return o

def box(name,loc,size,m,bevel=.02):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=bpy.context.object;o.scale=size;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    mod=o.modifiers.new('Soft machined edge','BEVEL');mod.width=bevel;mod.segments=4
    bpy.ops.object.modifier_apply(modifier=mod.name)
    mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');bpy.ops.object.modifier_apply(modifier=mod.name)
    return finish(o,name,m)

def tube(name,pts,r,m):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3
    s=c.splines.new('POLY');s.points.add(len(pts)-1)
    for p,co in zip(s.points,pts):p.co=(*co,1)
    o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);return finish(o,name,m)

def cylinder(name,loc,r,depth,m,vertices=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc)
    o=bpy.context.object;mod=o.modifiers.new('Turned rim','BEVEL');mod.width=.008;mod.segments=3
    bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in o.data.polygons:p.use_smooth=True
    return finish(o,name,m)

def ring(name,x,y,z,r,t,m):
    return tube(name,[(x+r*math.cos(i*math.tau/96),y+r*math.sin(i*math.tau/96),z) for i in range(97)],t,m)

# Broad, shallow writing tray: a real receiving surface under all three books.
box('Lacquer reading tray',(0,.15,-.135),(4.25,2.82,.23),wood,.13)
box('Velvet inset',(0,.15,-.012),(4.04,2.60,.025),felt,.11)
# The gilt line follows rounded corners instead of four disconnected bars.
def rounded_outline(w,h,r,z):
    pts=[]
    for cx,cy,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for j in range(17):
            a=math.radians(start+j*90/16)
            pts.append((cx+r*math.cos(a),cy+.15+r*math.sin(a),z))
    return pts+[pts[0]]
tube('Continuous brass tray inlay',rounded_outline(4.14,2.71,.15,-.005),.009,brass)
tube('Lower polished tray edge',rounded_outline(4.20,2.77,.14,-.17),.007,edge)

# A slender archival reading lamp lives behind the books, not across a title.
lx,ly=-1.68,1.00
cylinder('Lamp turned foot',(lx,ly,.035),.17,.07,brass)
cylinder('Lamp enamel insert',(lx,ly,.077),.134,.025,wood)
ring('Lamp foot fillet',lx,ly,.092,.122,.004,edge)
tube('Lamp curved stem',[(lx,ly,.08),(lx,ly,.75),(lx+.015,ly,.94),(lx+.08,ly,1.06),(lx+.18,ly,1.11),(lx+.31,ly,1.09),(lx+.38,ly,1.02)],.024,brass)
# Lathed, fluted opal shade; rings create a recognizable crafted fixture.
cx,cy=lx+.38,ly
profile=[(.075,1.02),(.085,1.00),(.105,.95),(.15,.90),(.22,.86),(.23,.835),(.21,.82)]
verts=[];faces=[];segments=72
for radius,z in profile:
    for j in range(segments):
        a=j*math.tau/segments;r=radius*(1+.018*math.cos(a*12))
        verts.append((cx+r*math.cos(a),cy+r*math.sin(a),z))
for row in range(len(profile)-1):
    for j in range(segments):
        a=row*segments+j;b=row*segments+(j+1)%segments
        faces.append((a,b,b+segments,a+segments))
mesh=bpy.data.meshes.new('Lathed opal shade');mesh.from_pydata(verts,[],faces);mesh.update()
o=bpy.data.objects.new('Fluted opal reading shade',mesh);scene.collection.objects.link(o);finish(o,o.name,shade)
for p in mesh.polygons:p.use_smooth=True
ring('Shade rolled lower rim',cx,cy,.835,.23,.012,brass)
ring('Shade finial collar',cx,cy,1.022,.078,.007,edge)
cylinder('Diffuser under shade',(cx,cy,.833),.205,.012,shade)
# Exported punctual light is local to the reading table; no shadow map cost.
light=bpy.data.lights.new('Reading lamp pool','POINT');light.energy=.015;light.color=(1,.74,.40);light.shadow_soft_size=.18
o=bpy.data.objects.new('Reading lamp pool',light);scene.collection.objects.link(o);o.location=(cx,cy,.79)

# A letter belongs to every story: neutral invitation, no sudden protagonist.
ex,ey=1.48,1.38
envelope=box('Letter on writing tray',(ex,ey,.018),(.54,.29,.018),ivory,.009)
tube('Envelope folded flap',[(ex-.255,ey+.13,.03),(ex,ey-.02,.031),(ex+.255,ey+.13,.03)],.002,ink)
cylinder('Coral wax seal',(ex,ey-.016,.036),.046,.012,wax,40)
ring('Wax seal impression',ex,ey-.016,.043,.032,.002,brass)
tube('Seal star',[(ex+.021*math.cos(math.pi/2+j*math.tau/5),ey-.016+.021*math.sin(math.pi/2+j*math.tau/5),.047) for j in [0,2,4,1,3,0]],.002,brass)
# A restrained brass pen, with a separately modeled nib and ferrule.
tube('Fountain pen barrel',[(.68,1.40,.036),(1.01,1.40,.036)],.014,wood)
tube('Pen gold clip',[(.69,1.392,.051),(.80,1.392,.051)],.003,edge)
tube('Pen ferrule',[(1.01,1.40,.036),(1.05,1.40,.036)],.015,brass)
mesh=bpy.data.meshes.new('Pen nib');mesh.from_pydata([(1.05,1.385,.036),(1.05,1.415,.036),(1.13,1.40,.034)],[],[(0,1,2)]);mesh.update()
o=bpy.data.objects.new('Fountain pen nib',mesh);scene.collection.objects.link(o);finish(o,o.name,edge)

# Batch only the new furniture, keeping three chapter roots independently selectable.
new_objects=set(scene.objects)-binding_objects
for o in list(new_objects):
    if o.type=='CURVE':
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
groups={}
new_lights=[o for o in new_objects if o.type=='LIGHT']
for o in new_objects:
    if o.type=='MESH':groups.setdefault(o.active_material,[]).append(o)
setting=bpy.data.objects.new('ReadingSpace',None);scene.collection.objects.link(setting);setting['part']='readingSpace'
for m,items in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in items:o.select_set(True)
    bpy.context.view_layer.objects.active=items[0]
    if len(items)>1:bpy.ops.object.join()
    items[0].parent=setting;items[0].name=m.name
for o in new_lights:o.parent=setting
bpy.ops.object.select_all(action='SELECT')
out=ROOT/'public/assets/story-models/story-library-room.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,use_active_scene=True,export_extras=True,export_lights=True)
art=ROOT/'artifacts/story-library';art.mkdir(exist_ok=True,parents=True)
bpy.ops.wm.save_as_mainfile(filepath=str(art/'story-library-reading-space.blend'))
print(json.dumps({'asset':str(out),'bytes':out.stat().st_size,'settingMaterials':len(groups)}))
