"""Painterly surface and silhouette pass on real geometry, not a 2D overpaint."""
import bpy,math,pathlib,ast,random
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'artifacts/postbox-courtyard'
source=ast.parse((ROOT/'scripts/build_postbox_courtyard.py').read_text())
exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef)],type_ignores=[]),'helpers','exec'))
bpy.ops.wm.open_mainfile(filepath=str(OUT/'postbox-courtyard-v2.blend'))
scene=bpy.context.scene;random.seed(90)
image=bpy.data.images.load(str(OUT/'textures/painterly-atlas.png'));image.pack()

def paint(name,quadrant,strength=1):
    m=bpy.data.materials.get(name)
    if not m:return
    nt=m.node_tree;bs=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bs:return
    tc=nt.nodes.new('ShaderNodeTexCoord');separate=nt.nodes.new('ShaderNodeSeparateXYZ');combine=nt.nodes.new('ShaderNodeCombineXYZ')
    nt.links.new(tc.outputs['Generated'],separate.inputs[0]);nt.links.new(separate.outputs['X'],combine.inputs['X']);nt.links.new(separate.outputs['Z'],combine.inputs['Y'])
    mapping=nt.nodes.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY_ADD';mapping.inputs[1].default_value=(.475,.475,.475);mapping.inputs[2].default_value=(quadrant[0]*.5+.0125,quadrant[1]*.5+.0125,0)
    nt.links.new(combine.outputs[0],mapping.inputs[0]);tex=nt.nodes.new('ShaderNodeTexImage');tex.image=image;tex.extension='EXTEND';nt.links.new(mapping.outputs[0],tex.inputs['Vector'])
    mix=nt.nodes.new('ShaderNodeMixRGB');mix.inputs[0].default_value=strength;mix.inputs[1].default_value=bs.inputs['Base Color'].default_value;nt.links.new(tex.outputs['Color'],mix.inputs[2]);nt.links.new(mix.outputs[0],bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value=.65
    if name!='Brushed antique brass':bs.inputs['Metallic'].default_value=.08
    # Remove the overlarge procedural bump that made the enamel look hammered.
    for link in list(bs.inputs['Normal'].links):nt.links.remove(link)
for n,q,s in [('Weathered vermilion enamel',(0,1),.85),('Midnight blue banners',(1,1),.85),('Warm limestone',(0,0),.7),('Sunlit ivory plaster',(0,0),.75),('Atelier_teal',(1,0),.6),('Atelier_coat',(0,1),.38),('Atelier_lapel',(0,1),.3)]:paint(n,q,s)

stone=bpy.data.materials['Warm limestone'];gold=bpy.data.materials['Brushed antique brass'];blue=bpy.data.materials['Midnight blue banners']
leafmat=bpy.data.materials['Ivy 1']
# Replace flat kite leaves with curved surfaces and a gently raised center vein.
for o in list(scene.objects):
    if not o.name.startswith('Ivy leaf') or o.type!='MESH' or len(o.data.vertices)!=5:continue
    p=o.data.vertices[0].co.copy();tip=o.data.vertices[2].co.copy();axis=tip-p;length=axis.length
    if length<.01:continue
    side=Vector((-axis.y,axis.x,0)).normalized();normal=axis.cross(side).normalized()
    verts=[]
    for j in range(9):
        t=j/8;center=p+axis*t+normal*math.sin(t*math.pi)*length*.1
        width=math.sin(t*math.pi)**.85*length*.34
        for s in (-1,0,1):verts.append(center+side*s*width-normal*abs(s)*length*.06*math.sin(t*math.pi))
    faces=[]
    for j in range(8):
        for k in range(2):a=j*3+k;faces.append((a,a+1,a+4,a+3))
    me=bpy.data.meshes.new('Curved botanical leaf');me.from_pydata(verts,[],faces);me.update()
    for m in o.data.materials:me.materials.append(m)
    o.data=me
    for f in me.polygons:f.use_smooth=True

# Stone arch construction: individually beveled voussoirs rather than a tube.
old=bpy.data.objects.get('Carved stone arch')
if old:bpy.data.objects.remove(old,do_unlink=True)
for i in range(28):
    a=i*math.pi/28+.003;b=(i+1)*math.pi/28-.003;v=[]
    for y in (.72,1.28):
        for r,t in [(3.28,a),(3.72,a),(3.72,b),(3.28,b)]:v.append((r*math.cos(t),y,3.4+r*math.sin(t)))
    me=bpy.data.meshes.new('Cut arch stone');me.from_pydata(v,[],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]);me.update()
    o=bpy.data.objects.new('Limestone voussoir',me);bpy.context.collection.objects.link(o);assign(o,stone)
    mod=o.modifiers.new('Worn stone corners','BEVEL');mod.width=.016;mod.segments=2
for x in (-3.5,3.5):
    cube('Blue pier inlay',(x,.698,2.3),(.32,.025,2.55),blue,.009)
    for sx in (-.175,.175):curve('Pier inlay gold rule',[(x+sx,.67,1.02),(x+sx,.67,3.58)],.009,gold)

# Finish the open scalp with a deforming crown that shares Ari's head bone.
rig=next((o for o in scene.objects if o.type=='ARMATURE'),None)
if rig:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24)
    cap=bpy.context.object;cap.name='Finished hair crown';cap.scale=(.148,.125,.084);cap.location=(0,.006,1.795)
    bpy.ops.object.transform_apply(location=True,rotation=False,scale=True)
    cap.parent=rig;assign(cap,bpy.data.materials['Atelier_hair'])
    vg=cap.vertex_groups.new(name='Head');vg.add(list(range(len(cap.data.vertices))),1,'REPLACE')
    mod=cap.modifiers.new('Head deformation','ARMATURE');mod.object=rig
    for f in cap.data.polygons:f.use_smooth=True

water=material('Luminous falling water',(.33,.68,.84),.05,.20)
bs=water.node_tree.nodes.get('Principled BSDF');bs.inputs['Transmission Weight'].default_value=.4
for x,y,z,h in [(-5,7,2.3,3),(-1,11,4.6,4),(4,12,2.5,2.8),(8,16,4.1,4)]:
    for i in range(4):curve('Distant waterfall',[(x+.65+i*.05,y-.65,z),(x+.70+i*.05,y-.66,z-h*.5),(x+.73+i*.05,y-.65,z-h)],.015+i*.006,water)

# Restrained ink silhouettes, rendered by Blender itself.
scene.render.use_freestyle=True
fs=bpy.context.view_layer.freestyle_settings
lines=fs.linesets[0]
lines.select_silhouette=True;lines.select_border=True;lines.select_crease=False;lines.select_material_boundary=False
lines.linestyle.color=(.065,.10,.17);lines.linestyle.alpha=.45;lines.linestyle.thickness=.65
scene.render.threads_mode='FIXED';scene.render.threads=4
scene.cycles.samples=16;scene.cycles.use_denoising=True
scene.render.resolution_x=1200;scene.render.resolution_y=1200
scene.render.filepath=str(OUT/'courtyard-v3.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'postbox-courtyard-v3.blend'))
print('Rendering textured geometry and ink silhouettes',flush=True)
bpy.ops.render.render(write_still=True)
