"""Complete the attic environment kit and render its real 3D composition.
Keeps the earlier atelier assets intact. Texture UVs are portable to glTF.
"""
import bpy,math,pathlib,random,ast
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets/story-models';ART=ROOT/'artifacts/fog-attic';ART.mkdir(parents=True,exist_ok=True)
random.seed(137)
tree=ast.parse((ROOT/'scripts/build_atelier.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef)],type_ignores=[]),'atelier_helpers','exec'))
bpy.ops.wm.open_mainfile(filepath=str(OUT/'attic-atelier.blend'))
M={m.name.removeprefix('Atelier_'):m for m in bpy.data.materials if m.name.startswith('Atelier_')}
room=bpy.data.objects['Attic_Atelier'];desk=bpy.data.objects['DeskPuzzle']

def star(n,x,y,z,r,parent):
    pts=[]
    for i in range(9):
        a=i*math.pi/4;rr=r if i%2==0 else r*.2;pts.append((x+math.cos(a)*rr,y+math.sin(a)*rr,z))
    return surface(n,pts,[tuple(range(8))],'gold',parent,False)
def ring(n,pos,r,parent,plane='xy'):
    pts=[]
    for i in range(49):
        a=i*math.tau/48
        pts.append((pos[0]+math.cos(a)*r,pos[1]+(math.sin(a)*r if plane=='xy' else 0),pos[2]+(math.sin(a)*r if plane=='xz' else 0)))
    return tube(n,pts,.012,'gold',parent)

# Layered rug: decorative geometry is flush with the floor and never blocks walking.
box('Woven midnight rug',(0,.065,1.0),(4.5,.025,3.6),'navy',room,.005)
for x in (-2.15,2.15):box('Rug border',(x,.081,1),(.025,.007,3.4),'gold',room,0)
for z in (-.65,2.65):box('Rug border',(0,.081,z),(4.30,.007,.025),'gold',room,0)
for x in (-1.6,0,1.6):
    for z in (.1,1.8):
        s=star('Woven compass',x,z,0,.19,room)
        # star helper lies in XY; rotate its generated vertices onto the floor.
        for v in s.data.vertices:
            xx,_,yy=v.co;v.co=(xx,-yy,.084)

# Furniture joins, reading chair and layered book piles around the focal desk.
chair=group('ReadingChair',(0,0,-3.0));chair.parent=room
box('Chair seat',(0,.52,0),(.62,.10,.56),'wood2',chair)
for x in (-.25,.25):
    for z in (-.22,.22):loft('Chair leg',[(0,.032,.032,x,z),(.50,.046,.046,x,z)],'wood',chair)
    tube('Chair back post',[(x,.50,-.23),(x,1.28,-.28)],.035,'wood2',chair)
box('Chair top rail',(0,1.28,-.28),(.62,.09,.065),'wood2',chair)
for x in (-.12,0,.12):tube('Chair spindle',[(x,.55,-.23),(x,1.26,-.28)],.014,'wood',chair)

def stack(x,z,count,parent):
    y=.10
    for i in range(count):
        w=.45+random.random()*.12;d=.31+random.random()*.13;h=.065+random.random()*.04
        color=['navy','teal','coat','wood2'][i%4]
        box('Stacked pages',(x,y+h/2,z),(w*.94,h,d*.95),'paper',parent,.004)
        for dy in (0,h):box('Book board',(x,y+dy,z),(w,.012,d),color,parent,.004)
        box('Horizontal spine',(x,y+h/2,z+d/2),(w,h,.018),color,parent,.003)
        y+=h+.017
stack(-1.7,-2.4,8,room);stack(1.7,-2.6,6,room)

# Two further shelves along the left wall, creating a room rather than an empty stage.
for z in (-1.8,.5):
    shelf=group('SideLibrary',(-5.4,0,z));shelf.parent=room;shelf.rotation_euler.z=math.pi/2
    box('Shelf back',(0,1.65,-.25),(1.7,3.2,.08),'navy',shelf)
    for y in (.25,.95,1.65,2.35,3.05):
        box('Shelf ledge',(0,y,0),(1.82,.065,.56),'wood2',shelf)
        for j in range(8):book(-.7+j*.19,y+.04,0,.13,.42+random.random()*.14,.32,['navy','teal','coat'][j%3],shelf)
    for x in (-.89,.89):box('Shelf column',(x,1.65,0),(.075,3.2,.58),'wood2',shelf)

# A trunk and star-patterned cloth on the right are part of the walkable layout.
trunk=group('TravelTrunk',(4.0,0,2.8));trunk.parent=room
box('Trunk body',(0,.40,0),(1.25,.72,.70),'wood',trunk,.07)
box('Trunk lid',(0,.82,0),(1.28,.16,.73),'navy',trunk,.05)
for x in (-.43,.43):box('Trunk brass strap',(x,.43,.365),(.055,.70,.018),'gold',trunk,.005)
box('Trunk lock',(0,.56,.38),(.15,.14,.03),'gold',trunk,.01)
for x in (-.40,0,.40):star('Trunk inlaid star',x,.29,.365,.10,trunk)

# Desk props from the comic: astrolabe, star globe, pens and wax seal.
astrolabe=group('DeskAstrolabe',(.78,1.255,-.10));astrolabe.parent=desk
loft('Astrolabe base',[(0,.16,.16,0,0),(.05,.16,.16,0,0),(.09,.09,.09,0,0)],'gold',astrolabe)
tube('Astrolabe stem',[(0,.05,0),(0,.26,0)],.018,'gold',astrolabe)
ring('Armillary outer',(0,.45,0),.21,astrolabe)
r=ring('Armillary tilted',(0,.45,0),.17,astrolabe);r.rotation_euler.z=.60
ring('Armillary equator',(0,.45,0),.19,astrolabe,'xz')
ellipsoid('Astrolabe sun',(0,.45,0),(.085,.085,.085),'gold',astrolabe)
orb=group('DeskStarGlobe',(-.86,1.255,-.22));orb.parent=desk
loft('Star globe stand',[(0,.15,.15,0,0),(.05,.16,.16,0,0),(.11,.07,.07,0,0)],'gold',orb)
ellipsoid('Amber globe',(0,.31,0),(.39,.39,.39),'glow',orb)
for x,y,z in [(-.09,.35,.14),(.07,.27,.18),(0,.44,.13),(.12,.37,.12)]:star('Globe star',x,y,z,.045,orb)
loft('Pencil cup',[(1.26,.075,.075,.30,-.38),(1.44,.075,.075,.30,-.38)],'teal',desk)
for i in range(5):tube('Drawing pencil',[(.27+i*.015,1.35,-.38),(.25+i*.025,1.62+(i%2)*.035,-.39)],.008,'wood2' if i%2 else 'navy',desk)
ellipsoid('Envelope wax seal',(.15,1.275,.12),(.075,.015,.075),'gold',desk)

# Dense trailing plants with curved surfaces rather than flat triangular cards.
for x in (-4.0,2.7):
    for strand in range(4):
        pts=[]
        for i in range(19):
            y=5-i*.22;xx=x+math.sin(i*.6+strand)*.17+strand*.09;z=-4.36+strand*.06;pts.append((xx,y,z))
            length=.21+random.random()*.10;v=[]
            for j in range(7):
                t=j/6;w=math.sin(t*math.pi)*length*.45
                for side in (-1,0,1):v.append((xx+(-1)**i*t*length,y-t*.13+side*w,z+.04*math.sin(t*math.pi)*(1-abs(side))))
            faces=[]
            for j in range(6):
                for k in range(2):a=j*3+k;faces.append((a,a+1,a+4,a+3))
            surface('Curved ivy',v,faces,'leaf' if i%2 else 'leaf2',room)
        tube('Ivy stem',pts,.009,'leaf',room)

# The surfaces use actual UV texture coordinates; no renderer-only mapping nodes.
atlas=bpy.data.images.load(str(ROOT/'artifacts/postbox-courtyard/textures/painterly-atlas.png'));atlas.pack()
quadrants={'navy':(1,1),'blue':(1,1),'stone':(0,0),'teal':(1,0)}
for key,q in quadrants.items():
    m=M[key];bs=m.node_tree.nodes.get('Principled BSDF');im=m.node_tree.nodes.new('ShaderNodeTexImage');im.image=atlas;m.node_tree.links.new(im.outputs['Color'],bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value=.8
for o in list(bpy.context.scene.objects):
    if o.type!='MESH':continue
    mats=o.data.materials
    if not any(m and m.name.removeprefix('Atelier_') in quadrants for m in mats):continue
    uv=o.data.uv_layers.active or o.data.uv_layers.new(name='HandpaintedUV')
    bounds=[(min(v.co[i] for v in o.data.vertices),max(v.co[i] for v in o.data.vertices)) for i in range(3)]
    for poly in o.data.polygons:
        key=mats[poly.material_index].name.removeprefix('Atelier_');q=quadrants.get(key)
        if not q:continue
        axes=sorted(range(3),key=lambda i:abs(poly.normal[i]))[:2]
        for li in poly.loop_indices:
            co=o.data.vertices[o.data.loops[li].vertex_index].co;val=[]
            for axis in axes:
                lo,hi=bounds[axis];val.append((co[axis]-lo)/max(.001,hi-lo))
            uv.data[li].uv=(q[0]*.5+.015+val[0]*.47,q[1]*.5+.015+val[1]*.47)

# Flatten noninteractive furniture without moving it; batch it with the room.
for o in list(bpy.context.scene.objects):
    if o.type=='MESH' and o.parent not in (room,desk,bpy.data.objects['DetailLantern'],bpy.data.objects['DetailAtlas']):
        ancestor=o.parent
        while ancestor and ancestor!=desk:ancestor=ancestor.parent
        target=desk if ancestor==desk else room
        world=o.matrix_world.copy();o.parent=target;o.matrix_world=world
# Retain the separate interactive groups while batching stationary decorations.
for parent in [room,desk,bpy.data.objects['DetailLantern'],bpy.data.objects['DetailAtlas']]:
    for m in M.values():
        objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.parent==parent and o.active_material==m]
        if len(objects)<2:continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name=parent.name+'_'+m.name
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'fog-attic-environment.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'attic-storybook.glb'),export_format='GLB')

# The rendered scene and the exported environment share exactly the same geometry.
bpy.ops.import_scene.gltf(filepath=str(OUT/'ari-atelier.glb'))
roots=[o for o in bpy.context.selected_objects if o.parent is None]
for o in roots:o.location=(0,-1.0,.08)
bpy.ops.object.light_add(type='AREA',location=(0,3.8,5.0));light=bpy.context.object;light.data.energy=1100;light.data.shape='DISK';light.data.size=5;light.rotation_euler=(Vector((0,0,0))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.light_add(type='AREA',location=(1,-4,6));light=bpy.context.object;light.data.energy=600;light.data.size=5;light.data.color=(.72,.84,1);light.rotation_euler=(Vector((0,1,0))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.light_add(type='POINT',location=xyz((-.86,1.58,-1.82)));bpy.context.object.data.energy=45;bpy.context.object.data.color=(1,.62,.22);bpy.context.object.data.shadow_soft_size=.6
bpy.ops.object.camera_add(location=(7,-10,6));camera=bpy.context.object;camera.rotation_euler=(Vector((0,1.1,1.7))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.lens=36;bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.24,.43,.72,1);scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.65;scene.render.engine='CYCLES';scene.render.threads_mode='FIXED';scene.render.threads=4;scene.cycles.samples=16;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.filepath=str(ART/'fog-attic-review.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'fog-attic-review.blend'))
bpy.ops.render.render(write_still=True)
