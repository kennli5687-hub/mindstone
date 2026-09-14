"""Comic-derived moonstone repair apparatus: three independently movable fragments."""
import bpy,math,pathlib,json
from mathutils import Vector
root=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
scene=bpy.data.scenes.new('Mira_Moonstone_Repair');bpy.context.window.scene=scene
def material(name,color,metal=0,rough=.4,glow=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;p=m.node_tree.nodes['Principled BSDF']
 rgb=[int(color[i:i+2],16)/255 for i in (0,2,4)];rgb=[c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4 for c in rgb]
 p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 p.inputs['Emission Color'].default_value=(*rgb,1);p.inputs['Emission Strength'].default_value=glow;return m
gold=material('Repair apparatus — brushed gold','EAC67E',.7,.28)
navy=material('Repair apparatus — enamel','172F62',.25,.3)
stone=[material('Moonstone violet','858ED6',.12,.32,.14),material('Moonstone lavender','B7ABE7',.08,.34,.14),material('Moonstone blue','667EC2',.1,.3,.14)]
seam=material('Moonstone repaired seam','FFD69A',.45,.25,.45)
def finish(o,name,m,parent=None):o.name=name;o.data.materials.append(m);o.parent=parent;return o
def cylinder(name,r,depth,z,m):
 bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=r,depth=depth,location=(0,0,z));o=finish(bpy.context.object,name,m)
 b=o.modifiers.new('Machined edge','BEVEL');b.width=.012;b.segments=3;bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name);return o
def tube(name,points,r,m,parent=None):
 c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=2;s=c.splines.new('POLY');s.points.add(len(points)-1)
 for p,co in zip(s.points,points):p.co=(*co,1)
 o=bpy.data.objects.new(name,c);scene.collection.objects.link(o);return finish(o,name,m,parent)
cylinder('Moonstone repair pedestal',.50,.065,.04,gold)
cylinder('Indigo instrument tray',.455,.055,.092,navy)
for r,z in [(.465,.13),(.40,.16)]:tube('Concentric brass rim',[(r*math.cos(j*math.tau/80),r*math.sin(j*math.tau/80),z) for j in range(81)],.012,gold)
for j in range(24):
 a=j*math.tau/24
 tube('Engraved calibration',[(.415*math.cos(a),.415*math.sin(a),.13),(.44*math.cos(a),.44*math.sin(a),.13)],.0025,gold)
cylinder('Central cup',.16,.13,.18,gold)
radius=.37;center=.60
def point(phi,theta,r=radius):
 theta+=.11*math.sin(5*phi)+.035*math.sin(13*phi)
 r*=1+.025*math.sin(3*theta+phi)*math.sin(phi)
 return (r*math.sin(phi)*math.cos(theta),r*math.sin(phi)*math.sin(theta),center+r*math.cos(phi))
for i in range(3):
 group=bpy.data.objects.new('MoonstoneFragment_'+str(i),None);scene.collection.objects.link(group);group['repairFragment']=i
 verts=[];faces=[];nt=12;np=18;start=i*math.tau/3+.007;end=(i+1)*math.tau/3-.007
 for p in range(np+1):
  phi=.002+(math.pi-.004)*p/np
  for t in range(nt+1):verts.append(point(phi,start+(end-start)*t/nt))
 for p in range(np):
  for t in range(nt):
   a=p*(nt+1)+t;faces.extend([(a,a+1,a+nt+2),(a,a+nt+2,a+nt+1)])
 # Close fracture faces back to the center axis rather than an open thin shell.
 axis=len(verts);verts.append((0,0,center))
 for t in [0,nt]:
  for p in range(np):
   a=p*(nt+1)+t;b=(p+1)*(nt+1)+t;faces.append((a,b,axis) if t==nt else (b,a,axis))
 mesh=bpy.data.meshes.new('Moonstone crystalline surface');mesh.from_pydata(verts,[],faces);mesh.update()
 # Continuous pearlescent mottling survives glTF as vertex data. This avoids
 # relying on Blender-only procedural shaders or a large extra texture.
 colors=mesh.color_attributes.new(name='CrystalTint',type='FLOAT_COLOR',domain='CORNER')
 for loop in mesh.loops:
  x,y,z=mesh.vertices[loop.vertex_index].co
  blend=.28+.22*math.sin(x*13+z*9)*math.sin(y*15-z*12)
  low=(.24,.29,.51);high=(.68,.72,.86)
  colors.data[loop.index].color=(*(a+(b-a)*blend for a,b in zip(low,high)),1)
 nodes=stone[i].node_tree.nodes;colorNode=nodes.new('ShaderNodeVertexColor');colorNode.layer_name='CrystalTint'
 stone[i].node_tree.links.new(colorNode.outputs['Color'],nodes['Principled BSDF'].inputs['Base Color'])
 obj=bpy.data.objects.new('Violet crystal fragment',mesh);scene.collection.objects.link(obj);finish(obj,obj.name,stone[i],group)
 for theta in [start,end]:tube('Golden repair boundary',[point(.02+(math.pi-.04)*p/36,theta,.373) for p in range(37)],.006,seam,group)
 # Interior veins break up broad facets with the celestial detailing in the comic.
 for k in range(2):
  tube('Crystal vein',[point(.3+j*.20,start+(end-start)*(.3+k*.35)+.1*math.sin(j*1.7+k),.374) for j in range(13)],.003,seam,group)
for obj in list(scene.objects):
 if obj.type=='CURVE':
  bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
# Batch static details by material, preserving each fragment's movable root.
groups={}
for obj in list(scene.objects):
 if obj.type=='MESH':groups.setdefault((obj.parent,obj.active_material),[]).append(obj)
for objects in groups.values():
 bpy.ops.object.select_all(action='DESELECT')
 for obj in objects:obj.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 if len(objects)>1:bpy.ops.object.join()
bpy.ops.object.select_all(action='SELECT')
out=root/'public/assets/story-models/moonstone-repair.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,use_active_scene=True,export_extras=True)
art=root/'artifacts/moonstone-repair';art.mkdir(exist_ok=True,parents=True)
bpy.ops.wm.save_as_mainfile(filepath=str(art/'moonstone-repair.blend'))
print(json.dumps({'bytes':out.stat().st_size,'fragments':3,'purpose':'Mira comic pages 9–10 repair activity'}))
