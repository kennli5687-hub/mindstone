"""Three authored, character-neutral chapter bindings for the homepage."""
import bpy,math,pathlib,json
from mathutils import Vector
ROOT=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
ART=ROOT/'artifacts/story-library';ART.mkdir(parents=True,exist_ok=True)
scene=bpy.data.scenes.new('Mindstone_Story_Library');bpy.context.window.scene=scene
def mat(name,h,metal=0,rough=.4):
    m=bpy.data.materials.new('Library_'+name);m.use_nodes=True;p=m.node_tree.nodes['Principled BSDF'];c=[int(h[i:i+2],16)/255 for i in (0,2,4)];c=[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in c];p.inputs['Base Color'].default_value=(*c,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
gold=mat('Foil','E8C68A',.72,.26);paper=mat('Paper','E9D5AF',0,.7);shadow=mat('Edges','B59970',.2,.6)
lettering=mat('Letterpress ink','182A43',0,.62)
palette=[mat('Teal cloth','227D7D',.05),mat('Plum cloth','70519D',.05),mat('Coral cloth','B9505E',.05)]
# A shared, seamlessly repeating tangent normal map survives glTF export. This
# is generated material data, not a photograph or a replacement for comic art.
size=256
weave=bpy.data.images.new('LibraryClothNormal',width=size,height=size,alpha=False)
weave.colorspace_settings.name='Non-Color'
pixels=[]
for y in range(size):
    for x in range(size):
        u=x/size*math.tau*32;v=y/size*math.tau*32
        warp=.22*math.sin(u)*(1+.25*math.cos(v))
        weft=.22*math.sin(v)*(1+.25*math.cos(u))
        normal=Vector((warp,weft,1)).normalized()
        pixels.extend((normal.x*.5+.5,normal.y*.5+.5,normal.z*.5+.5,1))
weave.pixels.foreach_set(pixels);weave.pack()
for m in palette:
    n=m.node_tree.nodes;links=m.node_tree.links
    tex=n.new('ShaderNodeTexImage');tex.image=weave;tex.extension='REPEAT'
    uv=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping')
    mapping.inputs['Scale'].default_value=(8,8,1)
    links.new(uv.outputs['UV'],mapping.inputs['Vector']);links.new(mapping.outputs['Vector'],tex.inputs['Vector'])
    normal=n.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.12
    links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],n['Principled BSDF'].inputs['Normal'])
    n['Principled BSDF'].inputs['Roughness'].default_value=.52
roots=[]
def finish(o,name,m):o.name=name;o.data.materials.append(m);return o
def box(name,loc,scale,m,r=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);b=o.modifiers.new('Rounded binding','BEVEL');b.width=r;b.segments=3;bpy.ops.object.modifier_apply(modifier=b.name);o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return finish(o,name,m)
def line(name,pts,r=.005,material=None):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;s=c.splines.new('POLY');s.points.add(len(pts)-1)
    for p,co in zip(s.points,pts):p.co=(*co,1)
    o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);return finish(o,name,material or gold)
fontpath=pathlib.Path('/System/Library/Fonts/Supplemental/Georgia.ttf');font=bpy.data.fonts.load(str(fontpath)) if fontpath.exists() else None
def title(body,y,size):
    c=bpy.data.curves.new('Foil lettering','FONT');c.body=body;c.align_x='CENTER';c.size=size;c.extrude=0;c.resolution_u=3;c.render_resolution_u=3
    if font:c.font=font
    o=bpy.data.objects.new(body,c);scene.collection.objects.link(o);o.location=(0,y,.239);return finish(o,body,lettering)
for i,(id,label) in enumerate([('avoidance','Avoidance'),('procrastination','Procrastination'),('perfectionism','Perfectionism')]):
    before=set(scene.objects);m=palette[i]
    box('Cloth back cover',(0,0,.02),(1.09,1.79,.07),m,.035)
    box('Page block',(0,0,.125),(1.01,1.69,.16),paper,.018)
    # Fine paper signatures, not uniformly thick gold bars. Small deterministic
    # offsets catch grazing light without changing the silhouette into corrugation.
    for j in range(35):
        z=.052+j*.0043;offset=.0008*math.sin(j*2.37+i)
        line('Paper signature',[(-.47,-.846-offset,z),(.5,-.846-offset,z),(.505+offset,.83,z)],.00065,shadow)
    for z in [.052,.199]:
        line('Gilt page edge',[(-.47,-.849,z),(.5,-.849,z),(.506,.83,z)],.0014)
    box('Front cloth board',(0,0,.207),(1.09,1.79,.055),m,.035)
    box('Rounded cloth spine',(-.51,0,.126),(.07,1.77,.20),m,.025)
    # Recessed hinge beside the spine and woven endbands at the head/tail are
    # characteristic binding details, visible when turning the physical book.
    line('Cover hinge seam',[(-.466,-.78,.235),(-.466,.78,.235)],.002,shadow)
    for end in [-1,1]:
        for j in range(12):
            z=.063+j*.011
            line('Sewn endband',[(-.48,end*.839,z),(-.495,end*.847,z+.003),(-.48,end*.851,z+.006)],.003,paper if j%2 else gold)
    for y in [-.65,-.5,.5,.65]:box('Raised spine band',(-.527,y,.125),(.044,.029,.19),gold,.009)
    for margin,r in [(.055,.004),(.080,.0018)]:
        x=.545-margin;y=.895-margin
        line('Cover frame',[(-x,-y,.239),(x,-y,.239),(x,y,.239),(-x,y,.239),(-x,-y,.239)],r)
    for x in [-.462,.462]:
        for y in [-.812,.812]:
            sx=-1 if x>0 else 1;sy=-1 if y>0 else 1
            line('Foil corner flourish',[(x+sx*.12,y,.24),(x,y,.24),(x,y+sy*.12,.24)],.006)
            line('Corner leaf',[(x+sx*.04,y+sy*.1,.24),(x+sx*.075,y+sy*.075,.245),(x+sx*.1,y+sy*.04,.24)],.003)
    title('M I N D S T O N E',.68,.044)
    title(label,-.28,.127 if i==0 else .093)
    title('A DIFFERENT STORY',-.62,.042)
    title('0'+str(i+1),-.74,.047)
    # Fine stamped cover medallion, with a different visual grammar per chapter.
    line('Medallion',[(.275*math.cos(a),.22+.275*math.sin(a),.24) for a in [j*math.tau/80 for j in range(81)]],.003)
    if i==0:
        pts=[(-.115,.06,.24),(-.115,.29,.24)]+[(.115*math.cos(math.pi-j*math.pi/32),.29+.115*math.sin(math.pi-j*math.pi/32),.24) for j in range(33)]+[(.115,.06,.24)]
        line('Embossed threshold',pts,.009);line('Door leaf',[(-.085,.075,.242),(.072,.1,.242),(.072,.31,.242),(-.085,.35,.242),(-.085,.075,.242)],.004)
    elif i==1:
        line('Hourglass', [(-.13,.39,.24),(.13,.39,.24),(-.10,.07,.24),(.10,.07,.24),(-.13,.39,.24)],.007)
        for y in [.045,.415]:line('Hourglass cap',[(-.14,y,.24),(.14,y,.24)],.008)
    else:
        pts=[]
        for j in range(11):
            a=math.pi/2+j*math.pi/5;r=.19 if j%2==0 else .085;pts.append((r*math.cos(a),.22+r*math.sin(a),.24))
        line('Possibility star',pts,.007)
    members=set(scene.objects)-before
    for o in members:
        bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
        if o.type in {'CURVE','FONT'}:bpy.ops.object.convert(target='MESH')
        for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
    groups={}
    for o in members:groups.setdefault(o.data.materials[0].name,[]).append(o)
    root=bpy.data.objects.new('Chapter_'+id,None);scene.collection.objects.link(root);root['storyId']=id;roots.append(root)
    for key,items in groups.items():
        bpy.ops.object.select_all(action='DESELECT')
        for o in items:o.select_set(True)
        bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();items[0].parent=root;items[0].name=id+'_'+key
    root.location=((i-1)*1.16,.12 if i!=1 else -.1,.09 if i==1 else 0);root.rotation_euler.z=(i-1)*-.16
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/assets/story-models/story-library.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_extras=True,export_apply=True)
for pos,power,size in [((-3,-4,6),800,4),((3,1,5),900,3)]:
    bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Library studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[1].default_value=.4
bpy.ops.object.camera_add(location=(1.5,-4.6,5.6));o=bpy.context.object;o.rotation_euler=(Vector((0,0,.1))-o.location).to_track_quat('-Z','Y').to_euler();o.data.type='ORTHO';o.data.ortho_scale=4.6;scene.camera=o
scene.render.engine='CYCLES';scene.render.threads_mode='FIXED';scene.render.threads=4;scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.render.resolution_x=1050;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(ROOT/'public/assets/story-library-poster.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'story-library.blend'))
print('STORY_LIBRARY_SAVED')
