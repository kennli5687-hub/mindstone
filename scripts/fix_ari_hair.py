"""Close the visible scalp hole without changing the accepted body or animation."""
import bpy,pathlib,math
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'public/assets/story-models'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'ari-atelier.blend'))
rig=bpy.data.objects['Ari_Rig']
# A continuous dome extends above and behind the forehead. Its lower boundary
# sits behind the existing fringe and side locks, never across the eyes.
N=48;rows=17;verts=[];faces=[]
for i in range(rows):
    phi=i/(rows-1)*math.pi/2
    r=max(.0001,math.sin(phi))
    for j in range(N):
        a=j*math.tau/N
        verts.append((.166*r*math.cos(a),.012+.139*r*math.sin(a),1.757+.125*math.cos(phi)))
for i in range(rows-1):
    for j in range(N):a=i*N+j;b=i*N+(j+1)%N;faces.append((a,b,b+N,a+N))
me=bpy.data.meshes.new('Closed crown mesh');me.from_pydata(verts,[],faces);me.update()
cap=bpy.data.objects.new('Continuous_Hair_Crown',me);bpy.context.collection.objects.link(cap);cap.parent=rig
cap.data.materials.append(bpy.data.materials['Atelier_hair'])
for f in me.polygons:f.use_smooth=True
vg=cap.vertex_groups.new(name='Head');vg.add(list(range(len(verts))),1,'REPLACE')
mod=cap.modifiers.new('Follow head bone','ARMATURE');mod.object=rig
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.parent=rig
for mat in list(bpy.data.materials):
    objs=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.active_material==mat and o!=cap]
    if len(objs)<2:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join()
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'artifacts/fog-attic/ari-hair-fixed.blend'))
bpy.ops.export_scene.gltf(filepath=str(OUT/'ari-hair-fixed.glb'),export_format='GLB',export_animations=True)
