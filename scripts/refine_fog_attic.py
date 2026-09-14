"""Second attic environment pass: actual geometry, portable materials, no backdrop."""
import bpy,bmesh,math,pathlib,ast,random
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1];ART=ROOT/'artifacts/fog-attic';OUT=ROOT/'public/assets/story-models'
tree=ast.parse((ROOT/'scripts/build_atelier.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef)],type_ignores=[]),'helpers','exec'))
bpy.ops.wm.open_mainfile(filepath=str(ART/'fog-attic-environment.blend'))
M={m.name.removeprefix('Atelier_'):m for m in bpy.data.materials if m.name.startswith('Atelier_')}
room=bpy.data.objects['Attic_Atelier'];random.seed(812)
# Remove only the old distant island vertices, after they were batched with the room.
for o in list(bpy.context.scene.objects):
    if o.type!='MESH' or o.parent!=room:continue
    bm=bmesh.new();bm.from_mesh(o.data)
    distant=[v for v in bm.verts if (o.matrix_world@v.co).y>7]
    if distant:bmesh.ops.delete(bm,geom=distant,context='VERTS');bm.to_mesh(o.data);o.data.update()
    bm.free()
city=group('WindowCity');city.parent=room
for key,color in [('cityStone',(.68,.64,.51,1)),('cityRoof',(.055,.16,.27,1)),('cityRock',(.24,.34,.39,1)),('cityGreen',(.13,.25,.17,1))]:
    m=bpy.data.materials.new(key);m.diffuse_color=color;m.use_nodes=True;b=m.node_tree.nodes.get('Principled BSDF');b.inputs['Base Color'].default_value=color;b.inputs['Roughness'].default_value=.8;M[key]=m
def island(x,y,z,r):
    N=20;v=[];f=[]
    jitter=[random.uniform(.85,1.1) for _ in range(N)]
    for height,scale in [(-r*1.7,.13),(-r,.55),(-.25,.86),(0,1)]:
        for i in range(N):a=i*math.tau/N;v.append((x+math.cos(a)*r*scale*jitter[i],y+height,z+math.sin(a)*r*.65*scale*jitter[i]))
    for j in range(3):
        for i in range(N):a=j*N+i;b=j*N+(i+1)%N;f.extend([(a,b,b+N),(a,b+N,a+N)])
    f.append(tuple(range(3*N,4*N)));surface('Carved floating island',v,f,'cityRock',city,False)
    box('Garden terrace',(x,y+.06,z),(r*1.6,.12,r),'cityGreen',city)
def tower(x,y,z,h,w):
    box('Ivory tower',(x,y+h/2,z),(w,h,w*.85),'cityStone',city)
    for dy in (.12,h*.52,h-.10):box('Carved cornice',(x,y+dy,z),(w*1.1,.07,w*.95),'paper',city)
    loft('Copper spire',[(y+h,w*.69,w*.6,x,z),(y+h+.12,w*.58,w*.5,x,z),(y+h+w,.008,.008,x,z)],'cityRoof',city)
    for dy in (.42,h*.68):
        for dx in (-w*.22,w*.22):
            box('Recessed palace window',(x+dx,y+dy,z+w*.435),(.12,.30,.015),'ink',city,.03)
            arch('Window carving',x+dx,y+dy-.17,z+w*.45,.17,.38,city,.012)
for x,y,z,r in [(-6,1,-12,1.7),(-1,3.2,-16,2.2),(5,2,-15,1.8),(-10,4.5,-22,2.3),(8,5,-25,2.2),(0,6,-29,2.4)]:
    island(x,y,z,r)
    for j in range(5):tower(x+(j%3-1)*r*.49,y+.14,z+(j//3-.5)*r*.5,1.2+(j%3)*.65,.52+(j%2)*.13)
    for bay in range(3):arch('Floating aqueduct',x+r+bay*.85,y-.8,z,.9,1.5,city,.075,'cityStone')
    box('Bridge deck',(x+r+.85,y+.72,z),(2.7,.12,.46),'cityStone',city)
    for sy in (-.25,.25):tube('Bridge rail',[(x+r-.45,y+1,z+sy),(x+r+2.15,y+1,z+sy)],.025,'gold',city)
# Batch the new city to a handful of draw calls.
for m in set(M.values()):
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.parent==city and o.active_material==m]
    if len(objects)<2:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name='Skyline_'+m.name
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'fog-attic-v2.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'attic-storybook-v2.glb'),export_format='GLB')
bpy.ops.import_scene.gltf(filepath=str(OUT/'ari-atelier.glb'))
for o in bpy.context.selected_objects:
    if o.parent is None:o.location=(0,-1,.08)
scene=bpy.context.scene
scene.world.use_nodes=True;bg=scene.world.node_tree.nodes.get('Background');bg.inputs[0].default_value=(.18,.38,.70,1);bg.inputs[1].default_value=.6
for pos,power,size,color in [((-2,5,7),1500,4,(1,.79,.5)),((3,-3,6),450,5,(.68,.80,1))]:
    bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.data.color=color;o.rotation_euler=(Vector((0,1,1))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.light_add(type='POINT',location=(-.86,1.82,1.58));bpy.context.object.data.energy=55;bpy.context.object.data.color=(1,.5,.15);bpy.context.object.data.shadow_soft_size=.5
bpy.ops.object.camera_add(location=(5.8,-9,4.8));o=bpy.context.object;o.rotation_euler=(Vector((0,1.2,2.0))-o.location).to_track_quat('-Z','Y').to_euler();o.data.lens=35;scene.camera=o
scene.render.engine='CYCLES';scene.render.threads_mode='FIXED';scene.render.threads=4;scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.filepath=str(ART/'fog-attic-v2.png');bpy.ops.wm.save_as_mainfile(filepath=str(ART/'fog-attic-v2-review.blend'));bpy.ops.render.render(write_still=True)
