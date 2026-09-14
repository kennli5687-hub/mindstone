"""Versioned, physically modelled storybook art study. Run through Blender MCP.
Does not replace the live asset until the rendered study has been reviewed.
"""
import bpy, math, pathlib, random
from mathutils import Vector
ROOT=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
ART=ROOT/'artifacts/storybook-hero'; ART.mkdir(parents=True,exist_ok=True)
scene=bpy.data.scenes.new('Mindstone_Storybook_Study'); bpy.context.window.scene=scene
random.seed(14)
def material(name,h,metal=0,rough=.4):
    m=bpy.data.materials.new('Book_'+name);m.use_nodes=True
    c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in c]
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*c,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    return m
leather=material('Midnight leather','193949',.05,.42)
gold=material('Warm gilding','DCB76F',.72,.24)
ivory=material('Cotton paper','EEDBB3',0,.74)
edge=material('Paper edges','BDA078',.15,.65)
ink=material('Letterpress indigo','22334B',0,.65)
coral=material('Silk bookmark','BC4C55',.1,.34)
jade=material('Moonstone enamel','244B78',.18,.32)
foliage=material('Climbing ivy','326D65',0,.65)
lamplight=material('Opal lantern glow','FFE6AC',0,.38)
lamplight.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value=(1,.66,.25,1)
lamplight.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value=.55
# Exportable micrograin: procedural Blender-only bump nodes disappear in glTF.
# A small periodic tangent normal texture keeps the browser and studio coherent.
grain=bpy.data.images.new('StorybookMicrograin',width=128,height=128,alpha=False)
grain.colorspace_settings.name='Non-Color';pixels=[]
for y in range(128):
    for x in range(128):
        u=x/128*math.tau;v=y/128*math.tau
        normal=Vector((.16*math.sin(23*u+3*math.sin(5*v)),.16*math.sin(19*v+2*math.sin(7*u)),1)).normalized()
        pixels.extend((normal.x*.5+.5,normal.y*.5+.5,normal.z*.5+.5,1))
grain.pixels.foreach_set(pixels);grain.pack()
for m,strength in [(leather,.22),(ivory,.09)]:
    n=m.node_tree.nodes;links=m.node_tree.links
    uv=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping');mapping.inputs['Scale'].default_value=(4,4,1)
    tex=n.new('ShaderNodeTexImage');tex.image=grain;tex.extension='REPEAT'
    normal=n.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=strength
    links.new(uv.outputs['UV'],mapping.inputs['Vector']);links.new(mapping.outputs['Vector'],tex.inputs['Vector'])
    links.new(tex.outputs['Color'],normal.inputs['Color']);links.new(normal.outputs['Normal'],n['Principled BSDF'].inputs['Normal'])
def finish(o,name,m):
    o.name=name;o.data.materials.append(m);return o
def box(name,loc,scale,m,bevel=.03):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    b=o.modifiers.new('Hand finished edges','BEVEL');b.width=bevel;b.segments=4;bpy.ops.object.modifier_apply(modifier=b.name);o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return finish(o,name,m)
def line(name,pts,r,m):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3;s=c.splines.new('POLY');s.points.add(len(pts)-1)
    for p,co in zip(s.points,pts):p.co=(*co,1)
    o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);return finish(o,name,m)
def height(x):return .27+.13*math.sin(math.pi*min(1,abs(x)/1.65))-.055*math.exp(-abs(x)*12)
def sheet(name,side,z,m,image=None):
    # Curvature only varies along x; extra y subdivisions add no visible detail.
    verts=[];uv=[];faces=[];nx=48;ny=1
    for j in range(ny+1):
        for i in range(nx+1):
            u=i/nx;v=j/ny;x=side*(.045+1.53*u);y=-1.17+2.34*v
            verts.append((x,y,height(x)+z));uv.append((u if side>0 else 1-u,v))
    for j in range(ny):
        for i in range(nx):
            a=j*(nx+1)+i;f=(a,a+1,a+nx+2,a+nx+1);faces.append(f if side>0 else f[::-1])
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);finish(o,name,m)
    layer=mesh.uv_layers.new()
    for p in mesh.polygons:
        p.use_smooth=True
        for li in p.loop_indices:layer.data[li].uv=uv[mesh.loops[li].vertex_index]
    return o
for side in [-1,1]:
    box('Gilt board edges',(side*.82,0,.045),(1.70,2.57,.105),gold,.055)
    box('Padded cloth hardcover',(side*.82,0,.085),(1.68,2.55,.105),leather,.06)
    for k in range(23):sheet('Individual signatures',side,-.142+k*.006,ivory if k%4 else edge)
    sheet('Open paper',side,.01,ivory)
    # Gilded fore-edge, stitched perimeter and cast metal corner protectors.
    for y in [-1.225,1.225]:
        line('Cover foil rule',[(side*(.12+i*.029),y,.146) for i in range(52)],.009,gold)
        for i in range(26):
            x=side*(.12+i*.057);line('Saddle stitch',[(x,y-.01,.149),(x+side*.018,y-.01,.149)],.003,ivory)
    for y in [-1.23,1.23]:
        x=side*1.58
        for delta in [0,.035]:line('Engraved corner',[(x-side*.22,y,.157+delta*.05),(x,y,.157+delta*.05),(x,y-math.copysign(.22,y),.157+delta*.05)],.017 if delta==0 else .004,gold)
box('Bound spine',(0,0,.04),(.18,2.56,.17),leather,.075)
for y in [-.93,-.76,.76,.93]:box('Raised spine bands',(0,y,.045),(.20,.052,.18),gold,.02)
# Printed image is mapped onto a genuinely curved page, not used as a scene billboard.
photo=material('Mira illustrated page','FFFFFF',0,.72)
tex=photo.node_tree.nodes.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(ROOT/'public/assets/avoidance-comic/Story comic 10/fant1.png'));tex.image.pack()
photo.node_tree.links.new(tex.outputs['Color'],photo.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
sheet('Mira chapter illustration',-1,.014,photo)
def text(name,body,x,y,size,m):
    c=bpy.data.curves.new(name,'FONT');c.body=body;c.size=size;c.align_x='CENTER';c.extrude=.0004;c.space_character=1.1
    o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);o.location=(x,y,height(x)+.025);finish(o,name,m);return o
text('Chapter label','CHAPTER 01 · AVOIDANCE',.84,-.48,.063,ink)
text('Chapter title','Beyond the fog',.84,-.71,.135,ink)
text('Protagonist','M I R A ’ S  S T O R Y',.84,-.88,.059,ink)
for y in [-.34,-1.01]:line('Page ornament',[(.23+i*.024,y,height(.23+i*.024)+.025) for i in range(51)],.005,gold)
text('Page folio','01',.84,-1.10,.050,ink)
# Miniature arched doorway rises from the page: inlaid panels, mouldings, masonry.
cx=.84;cy=.46;base=.60
def arch(w,h):
    r=w/2;return [(cx-r,cy,base),(cx-r,cy,base+h-r)]+[(cx+r*math.cos(math.pi-i*math.pi/40),cy,base+h-r+r*math.sin(math.pi-i*math.pi/40)) for i in range(41)]+[(cx+r,cy,base)]
for w,h,rad,m in [(.72,.99,.055,leather),(.64,.96,.014,gold),(.80,1.03,.013,gold)]:line('Portal arch moulding',arch(w,h),rad,m)
door=box('Inset enamel door',(cx,cy+.016,base+.37),(.54,.063,.74),jade,.055)
# Fitted arched fanlight closes the empty gap; its ribs echo the comic architecture.
r=.27;spring=base+.69
pts=[(cx-r,cy+.026,spring),(cx+r,cy+.026,spring)]+[(cx+r*math.cos(i*math.pi/32),cy+.026,spring+r*math.sin(i*math.pi/32)) for i in range(33)]
me=bpy.data.meshes.new('Fanlight pane');me.from_pydata(pts,[],[tuple(range(len(pts)))]);me.update();pane=bpy.data.objects.new('Arched turquoise fanlight',me);scene.collection.objects.link(pane);finish(pane,pane.name,jade)
mod=pane.modifiers.new('Glazed inset depth','SOLIDIFY');mod.thickness=.035
for a in [math.pi/4,math.pi/2,3*math.pi/4]:line('Fanlight brass rib',[(cx,cy-.012,spring),(cx+r*math.cos(a),cy-.012,spring+r*math.sin(a))],.008,gold)
line('Transom rail',[(cx-r,cy-.015,spring),(cx+r,cy-.015,spring)],.011,gold)
for z in [base+.20,base+.49]:
    box('Recessed panel',(cx,cy-.021,z),(.39,.014,.23),leather,.025)
    for s in [-1,1]:box('Panel gold beading',(cx+s*.205,cy-.032,z),(.009,.011,.23),gold,.003)
    for s in [-1,1]:box('Panel horizontal beading',(cx,cy-.032,z+s*.115),(.41,.011,.009),gold,.003)
for x in [cx-.37,cx+.37]:
    box('Doorframe plinth',(x,cy,base+.055),(.13,.16,.11),gold,.012)
    box('Doorframe capital',(x,cy,base+.67),(.12,.14,.055),gold,.01)
for i in range(6):
    top=.43+i*.032;y=-.20+i*.115;w=.88-i*.025
    box('Blue stone stair',(cx,y,(.395+top)/2),(w,.13,top-.395),jade,.007)
    line('Stair brass nosing',[(cx-w/2+.012,y-.063,top+.002),(cx+w/2-.012,y-.063,top+.002)],.003,gold)
bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=.033,location=(cx+.16,cy-.075,base+.38));finish(bpy.context.object,'Polished brass handle',gold)
# Comic page 8: a blue-and-gold celestial threshold, flanking lanterns and vines.
# Keep title typography in front of the stairs completely unobstructed.
def front_star(name,x,y,z,r,m):
    verts=[(x,y,z)]
    for j in range(8):
        a=math.pi/2+j*math.pi/4;rad=r if j%2==0 else r*.24
        verts.append((x+rad*math.cos(a),y,z+rad*math.sin(a)))
    faces=[(0,j+1,(j+1)%8+1) for j in range(8)]
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
    o=bpy.data.objects.new(name,me);scene.collection.objects.link(o);finish(o,name,m)
    mod=o.modifiers.new('Stamped metal depth','SOLIDIFY');mod.thickness=.004
    return o

# A filled crescent medallion above the working door, not a flat painted decal.
mx,mz=cx,base+.815;outer=.097
pts=[]
for j in range(33):
    a=math.radians(55+j*250/32);pts.append((mx+outer*math.cos(a),cy-.036,mz+outer*math.sin(a)))
for j in range(1,32):
    t=j/32;z=mz-outer*math.sin(math.radians(55))+2*outer*math.sin(math.radians(55))*t
    x=mx+outer*math.cos(math.radians(55))-.091*math.sin(math.pi*t)
    pts.append((x,cy-.036,z))
me=bpy.data.meshes.new('Crescent medallion');me.from_pydata(pts,[],[tuple(range(len(pts)))]);me.update()
o=bpy.data.objects.new('Fanlight moon medallion',me);scene.collection.objects.link(o);finish(o,o.name,gold)
mod=o.modifiers.new('Cast crescent depth','SOLIDIFY');mod.thickness=.012
for dx,dz,radius in [(-.14,.77,.025),(.14,.77,.025),(0,.955,.027)]:front_star('Fanlight star',cx+dx,cy-.039,base+dz,radius,gold)

# Hinged celestial inlays travel with the leaf, including when it is open.
line('Door leaf celestial ring',[(cx+.080*math.cos(j*math.tau/48),cy-.049,base+.49+.080*math.sin(j*math.tau/48)) for j in range(49)],.004,gold)
front_star('Door leaf guiding star',cx,cy-.055,base+.49,.052,gold)
for j in range(12):
    a=j*math.tau/12
    line('Door leaf radial engraving',[(cx+.09*math.cos(a),cy-.049,base+.49+.09*math.sin(a)),(cx+.108*math.cos(a),cy-.049,base+.49+.108*math.sin(a))],.002,gold)
for dx in [-.12,.12]:front_star('Door leaf lower star',cx+dx,cy-.05,base+.20,.027,gold)

# The comic's doorway opens into warm light, not an unexplained blank paper hole.
# This shallow inset is behind the hinged leaf and remains hidden when closed.
box('Warm light beyond the threshold',(cx,cy+.08,base+.37),(.49,.018,.70),lamplight,.015)
for dx,dz,r in [(-.11,.20,.027),(.12,.43,.025),(-.06,.57,.017)]:
    front_star('Threshold light star',cx+dx,cy+.05,base+dz,r,gold)

for side in [-1,1]:
    x=cx+side*.50
    box('Stone gate buttress',(x,cy+.065,.78),(.17,.25,.77),jade,.014)
    for z,width in [(.44,.20),(.68,.185),(1.13,.205),(1.18,.18)]:
        box('Carved buttress course',(x,cy+.065,z),(width,.28,.055),gold if z==1.13 else jade,.008)
    front_star('Buttress compass star',x,cy-.067,.86,.045,gold)
    for dx in [-.055,.055]:line('Buttress front inlay',[(x+dx,cy-.066,.74),(x+dx,cy-.066,1.055)],.0025,gold)
    # Two hexagonal lanterns with real frame bars, finials and opal interiors.
    ly=cy+.05;lz=1.225
    bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=.068,depth=.10,location=(x,ly,lz+.06));finish(bpy.context.object,'Opal lantern interior',lamplight)
    for z in [lz,lz+.13]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=6,radius=.083,depth=.018,location=(x,ly,z));finish(bpy.context.object,'Lantern brass rim',gold)
    for j in range(6):
        a=j*math.tau/6;px=x+.071*math.cos(a);py=ly+.071*math.sin(a)
        line('Lantern frame bar',[(px,py,lz),(px,py,lz+.14)],.006,gold)
    bpy.ops.mesh.primitive_cone_add(vertices=6,radius1=.09,radius2=.025,depth=.07,location=(x,ly,lz+.17));finish(bpy.context.object,'Lantern pointed canopy',leather)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=.018,location=(x,ly,lz+.225));finish(bpy.context.object,'Lantern finial',gold)
    # A single gently climbing vine, with distinct leaves and sparse white flowers.
    vine=[]
    for j in range(23):
        t=j/22;vine.append((x+side*(.075+.025*math.sin(t*8)),cy-.075,.44+.64*t))
    line('Climbing vine',vine,.007,foliage)
    for j in range(10):
        t=(j+.3)/10;vx=x+side*(.075+.025*math.sin(t*8));vz=.44+.64*t
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=6,radius=1,location=(vx+side*.023,cy-.083,vz))
        leaf=finish(bpy.context.object,'Ivy leaf',foliage);leaf.scale=(.042,.012,.020);leaf.rotation_euler.y=side*(.5 if j%2 else -.5)
        if j in [1,4,8]:
            fx=vx-side*.015;fz=vz+.028
            for k in range(5):
                a=k*math.tau/5
                bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=1,location=(fx+.017*math.cos(a),cy-.108,fz+.017*math.sin(a)))
                petal=finish(bpy.context.object,'Ivory climbing blossom',ivory);petal.scale=(.015,.006,.014)
            bpy.ops.mesh.primitive_uv_sphere_add(segments=8,ring_count=4,radius=.008,location=(fx,cy-.115,fz));finish(bpy.context.object,'Flower pollen',gold)
# A loose ribbon trails over the fore-edge with a curved, forked tail.
verts=[]
for i in range(45):
    t=i/44;y=.66-2.35*t;z=height(.15)+.04 if y> -1.17 else .32-.56*((-y-1.17)/.52)
    for dx in [-.055,.055]:verts.append((.13+dx+.035*math.sin(t*6),y,z))
faces=[(2*i,2*i+1,2*i+3,2*i+2) for i in range(44)]
me=bpy.data.meshes.new('Silk ribbon');me.from_pydata(verts,[],faces);o=bpy.data.objects.new('Coral silk bookmark',me);scene.collection.objects.link(o);finish(o,o.name,coral)
sol=o.modifiers.new('Ribbon thickness','SOLIDIFY');sol.thickness=.006
# Small gold botanical ornament on the outer page, with modelled leaves.
for side in [-1,1]:
    pts=[]
    for i in range(40):
        t=i/39;pts.append((cx+side*(.37+.08*math.sin(t*math.pi)),.35-.61*t,height(cx+side*.4)+.035))
    line('Botanical foil stem',pts,.005,gold)
    for i in range(7):
        t=(i+.5)/8;x=cx+side*(.37+.08*math.sin(t*math.pi));y=.35-.61*t
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=6,radius=1,location=(x+side*.034,y,height(x)+.04));o=finish(bpy.context.object,'Gilded leaf',gold);o.scale=(.046,.013,.004);o.rotation_euler.z=side*.6
# Curated studio. Keep render and realtime export separate.
bpy.ops.object.select_all(action='DESELECT')
for o in list(scene.objects):
    if o.type in {'CURVE','FONT'}:
        o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');o.select_set(False)
for o in scene.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ART/'storybook-study.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_image_format='JPEG',export_jpeg_quality=90)
floor=material('Studio blue','111F36',0,.55);box('Studio surface',(0,0,-.31),(200,200,.1),floor)
for pos,power,size,color in [((-3,-4,6),700,4,(1,.81,.59)),((3,1,5),850,3,(.55,.78,1)),((0,4,2),550,2,(1,.57,.31))]:
    bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,0,.2))-o.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Book studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.16,.23,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.35
bpy.ops.object.camera_add(location=(2.5,-4.6,5.3));cam=bpy.context.object;cam.rotation_euler=(Vector((0,-.1,.2))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.9;scene.camera=cam
scene.render.engine='CYCLES';scene.render.threads_mode='FIXED';scene.render.threads=4;scene.cycles.samples=64;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1200;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ART/'storybook-review.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'storybook-study.blend'))
print('STORYBOOK_STUDY_SAVED')
