"""Authored geometry for the Story Atlas hero, executed through Blender MCP.
Only replaces a named sample scene, never other open scenes.
"""
import bpy,math,pathlib
from mathutils import Vector
ROOT=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
OUT=ROOT/'public/assets/story-models'; ART=ROOT/'artifacts/story-atlas';ART.mkdir(exist_ok=True,parents=True)
scene=bpy.data.scenes.new('Mindstone_Story_Atlas')
bpy.context.window.scene=scene
def mat(name,color,metal=0,rough=.3,emission=0):
    m=bpy.data.materials.new('Atlas_'+name);m.use_nodes=True
    c=[int(color[i:i+2],16)/255 for i in (0,2,4)];c=[v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4 for v in c]
    bs=m.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(*c,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
    bs.inputs['Coat Weight'].default_value=.35
    if emission:bs.inputs['Emission Color'].default_value=(*c,1);bs.inputs['Emission Strength'].default_value=emission
    return m
navy=mat('Midnight','1D294A',.55);gold=mat('Champagne','E5C998',.8,.23);teal=mat('Jade','53D5CF',.45,.2);coral=mat('Coral','FF806F',.3);violet=mat('Lilac','A39AF5',.4);paper=mat('Ivory','F2E6C9',.1);glow=mat('Light','80F5EC',.15,.2,2)
root=bpy.data.objects.new('StoryAtlas',None);scene.collection.objects.link(root)
def finish(o,name,m,parent=root):
    o.name=name;o.data.materials.append(m);o.parent=parent
    return o
def box(name,loc,scale,m,bevel=.04,parent=root):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    mod=o.modifiers.new('Soft machined edges','BEVEL');mod.width=bevel;mod.segments=3
    bpy.ops.object.modifier_apply(modifier=mod.name);o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return finish(o,name,m,parent)
def torus(name,r,t,loc,m,rot=(0,0,0),parent=root):
    bpy.ops.mesh.primitive_torus_add(major_radius=r,minor_radius=t,major_segments=96,minor_segments=8,location=loc,rotation=rot);o=finish(bpy.context.object,name,m,parent)
    for p in o.data.polygons:p.use_smooth=True
    return o
def cyl(name,r,depth,loc,m,parent=root):
    bpy.ops.mesh.primitive_cylinder_add(vertices=80,radius=r,depth=depth,location=loc);o=finish(bpy.context.object,name,m,parent)
    mod=o.modifiers.new('Rim bevel','BEVEL');mod.width=.025;mod.segments=3;bpy.ops.object.modifier_apply(modifier=mod.name)
    for p in o.data.polygons:p.use_smooth=True
    return o
# Floating instrument: a faceted luminous core within precision orbital rings.
cyl('Foundation',1.30,.16,(0,0,-1.20),navy)
cyl('Foundation_inlay',1.23,.035,(0,0,-1.10),gold)
cyl('Foundation_top',1.18,.045,(0,0,-1.07),navy)
torus('Pedestal_light',1.17,.012,(0,0,-1.025),glow)
for i in range(48):
    a=i*math.tau/48;o=box('Radial_inlay',(.98*math.cos(a),.98*math.sin(a),-1.035),(.08 if i%4==0 else .04,.009,.006),gold,.002);o.rotation_euler.z=a
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=.71,location=(0,0,.35));core=finish(bpy.context.object,'Mindstone_Core',teal);core.scale=(.84,.84,1.25)
core.data.materials.append(violet);core.data.materials.append(glow)
for p in core.data.polygons:p.material_index=2 if p.index%23==0 else 1 if p.index%7==0 else 0
torus('Equatorial_orbit',1.1,.023,(0,0,.35),gold,(.3,.20,0))
torus('Meridian_orbit',1.04,.015,(0,0,.35),teal,(math.pi/2,.4,.3))
torus('Outer_orbit',1.65,.011,(0,0,.1),gold,(.12,-.18,0))
for i in range(3):
    a=i*math.tau/3+.2
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=.042,location=(1.1*math.cos(a),1.1*math.sin(a),.35));finish(bpy.context.object,'Orbital_bead',glow)
# Three recognisable story objects. Names are stable interaction targets in Three.js.
for name,x,y,z,m in [('Avoidance',-1.50,-.36,.38,coral),('Procrastination',1.38,.24,.70,violet),('Perfectionism',.24,.9,1.6,teal)]:
    g=bpy.data.objects.new(name,None);scene.collection.objects.link(g);g.parent=root
    cyl(name+'_base',.39,.065,(x,y,z-.30),navy,g);torus(name+'_rim',.37,.018,(x,y,z-.26),m,parent=g)
    if name=='Avoidance':
        # Open doorway: an invitation to approach, with an inset threshold.
        for side in [-1,1]:box('Door_jamb',(x+side*.22,y,z+.02),(.055,.09,.60),gold,.015,g)
        box('Door_lintel',(x,y,z+.34),(.49,.09,.06),gold,.015,g)
        door=box('Coral_door',(x+.12,y+.10,z+.015),(.39,.055,.56),m,.02,g);door.rotation_euler.z=-.65
        box('Door_threshold',(x,y-.08,z-.25),(.48,.28,.04),paper,.015,g)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=.025,location=(x-.02,y-.04,z+.02));finish(bpy.context.object,'Door_handle',gold,g)
    elif name=='Procrastination':
        # Hourglass with glass-like tapered chambers and a fine sand stream.
        for zz in [-.2,.25]:cyl('Hourglass_cap',.22,.035,(x,y,z+zz),gold,g)
        for s in [-1,1]:
            bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=.025 if s>0 else .17,radius2=.17 if s>0 else .025,depth=.20,location=(x,y,z+.025+s*.10));finish(bpy.context.object,'Hourglass_chamber',m,g)
        for a in [0,math.tau/3,2*math.tau/3]:box('Hourglass_column',(x+.19*math.cos(a),y+.19*math.sin(a),z+.025),(.022,.022,.43),gold,.007,g)
    else:
        # A deliberately incomplete star, rather than a perfect trophy.
        verts=[]
        for j in range(10):
            a=math.pi/2+j*math.pi/5;r=.29 if j%2==0 else .13;verts.append((x+r*math.cos(a),y-.03,z+r*math.sin(a)))
        mesh=bpy.data.meshes.new('Star');mesh.from_pydata(verts,[],[tuple(range(10))]);mesh.update();o=bpy.data.objects.new('Star_of_possibility',mesh);scene.collection.objects.link(o);finish(o,o.name,m,g)
        mod=o.modifiers.new('Star thickness','SOLIDIFY');mod.thickness=.065;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
        box('Star_stem',(x,y,z-.20),(.035,.035,.2),gold,.01,g)
# Freeze modifiers, export only this scene's mesh hierarchy.
bpy.ops.object.select_all(action='DESELECT')
for o in scene.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/'story-atlas.glb'),export_format='GLB',use_selection=True,export_apply=True)
for pos,power,size in [((1,-4,5),650,5),((-4,-1,2),500,4),((2,4,3),800,3)]:
    bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,.3))-o.location).to_track_quat('-Z','Y').to_euler()
scene.world=bpy.data.worlds.new('Atlas studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.045,.065,.12,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.4
bpy.ops.object.camera_add(location=(4,-7,3.2));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=5.4;scene.camera=cam
scene.render.engine='CYCLES';scene.render.threads_mode='FIXED';scene.render.threads=4;scene.cycles.samples=32;scene.render.resolution_x=1100;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ART/'story-atlas-review.png');scene.render.film_transparent=True
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'story-atlas.blend'))
print('ATLAS_EXPORTED',str(OUT/'story-atlas.glb'))
