"""Ari/attic vertical slice. Custom lofted surfaces, an exported armature and
walk clip, architectural joinery and story props. No third-party assets.
Blender --background --python scripts/build_atelier.py
"""
import bpy, math, pathlib, random
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets/story-models'
random.seed(26)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def xyz(p): return (p[0],-p[2],p[1])
palette={'skin':'BD7955','lip':'955047','hair':'172445','hairline':'33486C','coat':'B84132','seam':'762C2F','lapel':'D25F45','shirt':'E5C6A0','pants':'20334D','shoe':'D6C6A6','sole':'928671','teal':'237D80','thread':'6AB1AA','gold':'B88B41','wood':'493328','wood2':'684634','navy':'172E51','blue':'284873','stone':'BCC1BA','paper':'EAD9B6','ink':'1A1D2C','white':'F5E1C6','leaf':'387566','leaf2':'699879','glow':'FFCC79'}
M={}
for k,h in palette.items():
    c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c]
    m=bpy.data.materials.new('Atelier_'+k);m.diffuse_color=(*c,1);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*c,1)
    bs.inputs['Roughness'].default_value=.82 if k in ('coat','pants','wood') else .48
    if k=='gold':bs.inputs['Metallic'].default_value=.65
    if k=='glow':bs.inputs['Emission Color'].default_value=(*c,1);bs.inputs['Emission Strength'].default_value=2
    M[k]=m
def group(n,pos=(0,0,0)):
    o=bpy.data.objects.new(n,None);bpy.context.collection.objects.link(o);o.location=xyz(pos);return o
def surface(n,verts,faces,mat,parent=None,smooth=True):
    me=bpy.data.meshes.new(n);me.from_pydata([xyz(v) for v in verts],[],faces);me.update()
    o=bpy.data.objects.new(n,me);bpy.context.collection.objects.link(o);o.data.materials.append(M[mat]);o.parent=parent
    for f in me.polygons:f.use_smooth=smooth
    return o
def loft(n,rings,mat,parent=None,N=32):
    # Each ring is (height, x radius, depth radius, x offset, depth offset).
    v=[]
    for y,rx,rz,x,z in rings:
        for j in range(N):
            a=j*math.tau/N;v.append((x+rx*math.cos(a),y,z+rz*math.sin(a)))
    f=[tuple(range(N-1,-1,-1))]
    for i in range(len(rings)-1):
        for j in range(N):a=i*N+j;b=i*N+(j+1)%N;f.append((a,b,b+N,a+N))
    f.append(tuple(range((len(rings)-1)*N,len(rings)*N)))
    return surface(n,v,f,mat,parent)
def box(n,pos,size,mat,parent=None,bevel=.015):
    x,y,z=pos;a,b,c=[s/2 for s in size]
    v=[(x+dx*a,y+dy*b,z+dz*c) for dx,dy,dz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    o=surface(n,v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],mat,parent,False)
    if bevel:
        mod=o.modifiers.new('Edge highlights','BEVEL');mod.width=bevel;mod.segments=3
        bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
    return o
def tube(n,points,r,mat,parent=None):
    cu=bpy.data.curves.new(n,'CURVE');cu.dimensions='3D';cu.bevel_depth=r;cu.bevel_resolution=2
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
    for b,p in zip(sp.bezier_points,points):b.co=xyz(p);b.handle_left_type='AUTO';b.handle_right_type='AUTO'
    o=bpy.data.objects.new(n,cu);bpy.context.collection.objects.link(o);o.parent=parent;cu.materials.append(M[mat])
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH');return o
def ellipsoid(n,pos,size,mat,parent=None):
    rings=[]
    for i in range(17):
        a=-math.pi/2+i*math.pi/16;s=max(.002,math.cos(a))
        rings.append((pos[1]+math.sin(a)*size[1]/2,s*size[0]/2,s*size[2]/2,pos[0],pos[2]))
    return loft(n,rings,mat,parent)
def arch(n,x,y,z,w,h,parent,r=.055,mat='gold'):
    pts=[(x-w/2,y,z),(x-w/2,y+h-w/2,z)]
    pts += [(x+math.cos(math.pi-i*math.pi/24)*w/2,y+h-w/2+math.sin(math.pi-i*math.pi/24)*w/2,z) for i in range(25)]
    pts += [(x+w/2,y,z)];return tube(n,pts,r,mat,parent)
def save(n):
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/(n+'.blend')))
    bpy.ops.export_scene.gltf(filepath=str(OUT/(n+'.glb')),export_format='GLB',export_animations=True)

ari=group('Ari_Atelier');bindings=[]
def bind(o,bone):bindings.append((o,bone));return o
bind(loft('Tailored_coat',[(.64,.29,.16,0,0),(.74,.28,.16,0,0),(.92,.24,.14,0,0),(1.10,.21,.13,0,0),(1.30,.245,.145,0,0),(1.39,.235,.12,0,0),(1.43,.12,.095,0,0)],'coat',ari),'Spine')
bind(loft('Neck',[(1.39,.075,.065,0,0),(1.56,.074,.067,0,0)],'skin',ari),'Head')
bind(loft('Sculpted_face',[(1.49,.038,.062,0,.035),(1.52,.095,.085,0,.035),(1.57,.137,.102,0,.028),(1.63,.154,.119,0,.012),(1.70,.151,.122,0,0),(1.77,.14,.114,0,-.01),(1.82,.09,.08,0,-.02),(1.84,.008,.01,0,-.02)],'skin',ari,48),'Head')
# Open-backed bob surface: front stays open rather than a sphere over the face.
v=[];f=[]
for i in range(13):
    y=1.51+i*.028
    for j in range(33):
        a=.18+j*(math.pi-.36)/32;radius=.18*max(.12,1-((y-1.73)/.20)**2*.5)
        v.append((radius*math.cos(a),y,-.015-radius*math.sin(a)))
for i in range(12):
    for j in range(32):a=i*33+j;f.append((a,a+1,a+34,a+33))
bind(surface('Bob_silhouette',v,f,'hair',ari),'Head')
for s in (-1,1):
    for j in range(5):
        x=s*(.08+j*.019)
        pts=[(s*.05,1.85,-.02),(x,1.78,.035),(s*.165,1.66,-.015),(s*(.16-j*.006),1.51+j*.01,-.005)]
        bind(tube('Layered_hair_lock',pts,.022,'hair',ari),'Head')
        bind(tube('Hair_etched_highlight',[(a,b,c+.019) for a,b,c in pts],.002,'hairline',ari),'Head')
    bind(ellipsoid('Ear',(s*.151,1.635,0),(.052,.084,.041),'skin',ari),'Head')
    bind(ellipsoid('Eye_white',(s*.064,1.68,.112),(.068,.026,.013),'white',ari),'Head')
    bind(ellipsoid('Iris',(s*.062,1.68,.120),(.022,.026,.006),'wood',ari),'Head')
    bind(ellipsoid('Pupil',(s*.062,1.68,.124),(.011,.020,.004),'ink',ari),'Head')
    bind(tube('Upper_eyelid',[(s*.031,1.678,.119),(s*.063,1.695,.123),(s*.098,1.682,.109)],.004,'hair',ari),'Head')
    bind(tube('Expressive_brow',[(s*.032,1.717,.116),(s*.063,1.725,.12),(s*.103,1.715,.103)],.006,'hair',ari),'Head')
    leg='Leg_L' if s<0 else 'Leg_R';shin='Shin_L' if s<0 else 'Shin_R';arm='Arm_L' if s<0 else 'Arm_R';fore='Fore_L' if s<0 else 'Fore_R'
    bind(loft('Trouser_thigh',[(.43,.073,.075,s*.12,0),(.59,.095,.097,s*.12,0),(.82,.104,.10,s*.12,0)],'pants',ari),leg)
    bind(loft('Trouser_calf',[(.13,.055,.059,s*.12,0),(.22,.066,.065,s*.12,-.01),(.36,.071,.073,s*.12,0),(.45,.073,.076,s*.12,0)],'pants',ari),shin)
    bind(ellipsoid('Leather_boot',(s*.12,.095,.048),(.16,.18,.29),'shoe',ari),shin)
    bind(box('Boot_sole',(s*.12,.025,.04),(.17,.037,.29),'sole',ari),shin)
    for k in range(3):bind(tube('Boot_lace',[(s*.12-.038,.16-k*.015,.07+k*.023),(s*.12+.038,.16-k*.015,.07+k*.023)],.004,'white',ari),shin)
    bind(loft('Shaped_upper_sleeve',[(1.06,.065,.071,s*.286,0),(1.19,.076,.078,s*.279,0),(1.36,.09,.089,s*.245,0)],'coat',ari),arm)
    bind(loft('Sleeve_cuff',[(.85,.055,.056,s*.30,.01),(1.0,.060,.068,s*.294,.01),(1.075,.065,.071,s*.286,0)],'coat',ari),fore)
    bind(ellipsoid('Hand_palm',(s*.302,.79,.016),(.09,.13,.055),'skin',ari),fore)
    for j in range(4):bind(tube('Finger',[(s*.30-.027+j*.018,.78,.033),(s*.30-.027+j*.018,.71+(j%3)*.008,.035)],.009,'skin',ari),fore)
    bind(tube('Thumb',[(s*.30-s*.035,.81,.035),(s*.30-s*.055,.76,.065)],.014,'skin',ari),fore)
    # Sculpted lapels and narrow seams, not cream bars.
    bind(surface('Folded_lapel',[(s*.07,1.43,.105),(s*.20,1.36,.12),(s*.11,1.18,.153),(s*.055,1.28,.17)],[(0,1,2),(0,2,3)],'lapel',ari),'Spine')
    bind(tube('Coat_side_seam',[(s*.21,1.17,.045),(s*.235,.95,.095),(s*.28,.66,.10)],.003,'seam',ari),'Spine')
    bind(tube('Pocket_welt',[(s*.13,.94,.145),(s*.22,.97,.11)],.009,'lapel',ari),'Spine')
for j in range(7):
    pts=[(-.12+j*.025,1.84,.02),(-.08+j*.026,1.80,.105),(-.025+j*.023,1.735+(j%3)*.018,.119)]
    bind(tube('Swept_fringe',pts,.017,'hair',ari),'Head')
bind(surface('Nose_bridge',[(-.018,1.69,.116),(.018,1.69,.116),(0,1.622,.155),(-.025,1.624,.125),(.025,1.624,.125)],[(0,1,2),(0,2,3),(1,4,2),(3,2,4)],'skin',ari),'Head')
bind(tube('Mouth',[(-.034,1.586,.115),(0,1.583,.124),(.034,1.59,.113)],.004,'lip',ari),'Head')
bind(tube('Bag_strap',[(-.18,1.40,.135),(-.055,1.19,.163),(.13,.94,.175),(.27,.75,.18)],.016,'teal',ari),'Spine')
bind(box('Turquoise_satchel',(.255,.735,.17),(.235,.255,.115),'teal',ari,.025),'Spine')
bind(box('Folded_bag_flap',(.255,.795,.235),(.225,.12,.018),'teal',ari,.012),'Spine')
bind(tube('Bag_stitching',[(.155,.84,.245),(.155,.69,.238),(.35,.69,.238),(.35,.84,.245)],.002,'thread',ari),'Spine')
bind(box('Bag_buckle',(.255,.754,.253),(.032,.041,.012),'gold',ari,.004),'Spine')
for y in (.99,1.12):bind(ellipsoid('Coat_button',(.025,y,.15),(.019,.019,.014),'gold',ari),'Spine')

# Genuine skeleton and exported animation; knee/elbow articulation replaces
# runtime rotation of separate toy-like limb objects.
data=bpy.data.armatures.new('Ari_skeleton');rig=bpy.data.objects.new('Ari_Rig',data);bpy.context.collection.objects.link(rig);rig.parent=ari
bpy.context.view_layer.objects.active=rig;rig.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
def bone(n,head,tail,parent=None):
    b=data.edit_bones.new(n);b.head=xyz(head);b.tail=xyz(tail)
    if parent:b.parent=data.edit_bones[parent]
bone('Spine',(0,.80,0),(0,1.4,0));bone('Head',(0,1.4,0),(0,1.82,0),'Spine')
for s in (-1,1):
    suffix='L' if s<0 else 'R'
    bone('Leg_'+suffix,(s*.12,.81,0),(s*.12,.44,0),'Spine');bone('Shin_'+suffix,(s*.12,.44,0),(s*.12,.10,0),'Leg_'+suffix)
    bone('Arm_'+suffix,(s*.245,1.36,0),(s*.286,1.065,0),'Spine');bone('Fore_'+suffix,(s*.286,1.065,0),(s*.30,.78,0),'Arm_'+suffix)
bpy.ops.object.mode_set(mode='OBJECT')
for o,n in bindings:
    o.parent=rig
    vg=o.vertex_groups.new(name=n);vg.add(list(range(len(o.data.vertices))),1,'REPLACE')
    mod=o.modifiers.new('Ari skin','ARMATURE');mod.object=rig
for frame in range(1,34,4):
    phase=(frame-1)/32*math.tau
    for s in (-1,1):
        suffix='L' if s<0 else 'R';p=phase+(math.pi if s<0 else 0)
        for n,angle in [('Leg_',math.sin(p)*.35),('Shin_',max(0,-math.sin(p))*.65),('Arm_',-math.sin(p)*.22),('Fore_',-.13-max(0,math.sin(p))*.12)]:
            b=rig.pose.bones[n+suffix];b.rotation_mode='XYZ';b.rotation_euler.x=angle;b.keyframe_insert('rotation_euler',frame=frame)
rig.animation_data.action.name='Ari_Walk';bpy.context.scene.render.fps=32;bpy.context.scene.frame_set(1)
save('ari-atelier')

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
room=group('Attic_Atelier')
# Parquet, blue wall panels, continuous curved window joinery.
box('Foundation',(0,-.25,0),(12,.5,10),'navy',room)
for row in range(20):
    for col in range(6):
        box('Oak_floorboard',(-5+col*2,.015,-4.75+row*.5),(1.98,.045,.48),'wood' if (row+col)%3 else 'wood2',room,.004)
for x in (-5.5,-4.4,4.0,5.2):
    box('Wall_pier',(x,2.3,-4.85),(1.1,4.6,.34),'navy',room)
    box('Pier_inlay',(x,2.3,-4.65),(.82,4.25,.045),'blue',room)
    for dx in (-.43,.43):tube('Gold_pinstripe',[(x+dx,.25,-4.59),(x+dx,4.3,-4.59)],.012,'gold',room)
arch('Grand_window',-.6,.3,-4.8,6.4,6.0,room,.14,'navy')
arch('Inner_gold_moulding',-.6,.3,-4.57,6.1,5.8,room,.04)
for x in (-2.5,-.6,1.3):tube('Window_mullion',[(x,.3,-4.65),(x,4.6,-4.65)],.045,'navy',room)
tube('Window_transom',[(-3.6,2.3,-4.66),(2.4,2.3,-4.66)],.04,'navy',room)
box('Deep_window_sill',(-.6,.30,-4.6),(6.6,.15,.75),'wood2',room)
box('Left_cutaway_wall',(-5.9,1.8,-1.2),(.2,3.6,7.5),'navy',room)
for z in (-3.8,-2.4,-1,.4,1.8):
    box('Wall_panel',(-5.76,1.1,z),(.035,1.7,1.25),'blue',room)
    tube('Panel_trim',[(-5.72,.25,z-.59),(-5.72,1.95,z-.59),(-5.72,1.95,z+.59),(-5.72,.25,z+.59)],.018,'gold',room)
for z in (-4.7,-3.5):arch('Vault_rib',-.6,.2,z,10.2,6.5,room,.095,'wood2')
def book(x,y,z,w,h,d,mat,parent):
    box('Book_pages',(x,y+h/2,z),(w*.88,h*.94,d*.96),'paper',parent,.003)
    for dx in (-w/2,w/2):box('Book_cover',(x+dx,y+h/2,z),(.025,h,d),mat,parent,.005)
    box('Book_spine',(x,y+h/2,z+d/2),(w,h,.03),mat,parent,.005)
    for yy in (.12,.80):box('Spine_gilt',(x,y+h*yy,z+d/2+.018),(w*.8,.012,.006),'gold',parent,0)
for x in (-4.8,3.55):
    box('Library_back',(x,1.8,-4.2),(1.15,3.4,.10),'wood',room)
    for y in (.2,.95,1.7,2.45,3.2):
        box('Shelf',(x,y,-4.03),(1.3,.085,.6),'wood2',room)
        for j in range(6):book(x-.48+j*.18,y+.05,-4.0,.13,.45+random.random()*.19,.36,['navy','teal','coat'][j%3],room)
    for dx in (-.63,.63):box('Shelf_upright',(x+dx,1.75,-4.1),(.10,3.5,.55),'wood2',room)
# Story-bearing objects remain separate semantic groups for raycast interaction.
desk=group('DeskPuzzle',(0,0,-1.6));desk.parent=room
box('Desk_top',(0,1.17,0),(2.5,.14,1.2),'wood2',desk)
box('Desk_edge_inlay',(0,1.19,0),(2.53,.025,1.23),'gold',desk,.008)
for x in (-1.04,1.04):
    for z in (-.43,.43):loft('Turned_table_leg',[(.05,.065,.065,x,z),(.15,.08,.08,x,z),(.20,.045,.045,x,z),(.8,.052,.052,x,z),(1.12,.10,.1,x,z)],'wood',desk)
box('Drawer_carcass',(0,.97,0),(1.94,.28,.90),'wood',desk)
box('Drawer_front',(0,.97,.47),(1.78,.23,.06),'navy',desk)
for x in (-.50,0,.50):
    pts=[(x+math.cos(i*math.tau/32)*.095,.97+math.sin(i*math.tau/32)*.095,.515) for i in range(33)]
    tube('Puzzle_dial',pts,.018,'gold',desk)
    tube('Dial_pointer',[(x,.97,.54),(x+.045,1.02,.54)],.009,'paper',desk)
box('Unsent_letter',(.15,1.257,.1),(.72,.015,.43),'paper',desk,.002)
tube('Envelope_fold',[(-.21,1.268,-.11),(.15,1.27,.10),(.51,1.268,-.11)],.003,'gold',desk)
loft('Upside_down_cup',[(1.255,.11,.11,-.59,.02),(1.43,.085,.085,-.59,.02)],'teal',desk)
tube('Cup_handle',[(-.68,1.30,.02),(-.77,1.34,.02),(-.68,1.4,.02)],.015,'gold',desk)
tube('Fountain_pen',[(.64,1.26,.22),(.91,1.26,.34)],.012,'ink',desk)
for j in range(3):book(.63+j*.13,1.25,-.33,.10,.18,.23,'navy',desk)
lamp=group('DetailLantern',(-3.2,0,-1.1));lamp.parent=room
loft('Lamp_plinth',[(0,.35,.35,0,0),(.12,.4,.4,0,0),(.17,.27,.27,0,0)],'wood',lamp)
tube('Lamp_stem',[(0,.15,0),(0,1.5,0),(.12,1.7,0)],.025,'gold',lamp)
ellipsoid('Amber_glass',(.12,1.57,0),(.40,.48,.40),'glow',lamp)
for i in range(8):
    a=i*math.tau/8;tube('Lantern_cage',[(.12+math.cos(a)*.12,1.78,math.sin(a)*.12),(.12+math.cos(a)*.22,1.56,math.sin(a)*.22),(.12+math.cos(a)*.12,1.34,math.sin(a)*.12)],.009,'gold',lamp)
atlas=group('DetailAtlas',(3.1,0,1.3));atlas.parent=room
box('Atlas_stand',(0,.75,0),(.8,.09,.6),'wood2',atlas)
for x in (-.3,.3):box('Stand_leg',(x,.36,0),(.07,.72,.4),'wood',atlas)
book(0,.81,0,.64,.08,.46,'teal',atlas)
for x in (-5.3,2.8):
    pts=[]
    for i in range(18):
        y=4.4-i*.22;xx=x+math.sin(i*.7)*.15;pts.append((xx,y,-4.4))
        for s in (-1,1):
            surface('Ivy_leaf',[(xx,y,-4.4),(xx+s*.22,y+.06,-4.37),(xx+s*.17,y-.13,-4.33),(xx+s*.07,y-.18,-4.38)],[(0,1,2),(0,2,3)],'leaf' if i%2 else 'leaf2',room)
    tube('Trailing_ivy',pts,.012,'leaf',room)
# Layered floating-city skyline with varied heights, spires and connecting arches.
for i in range(9):
    x=-16+i*3.8;z=-11-(i%3)*4;y=-2+(i%4)*.6
    loft('Floating_rock',[(y-3,.08,.08,x,z),(y-1,1.1,1,x,z),(y,1.8,1.3,x,z)],'stone',room)
    h=2.2+(i%3)*1.1
    box('Distant_keep',(x,y+h/2,z),(1.3,h,1.1),'stone',room)
    loft('Slate_spire',[(y+h,.95,.85,x,z),(y+h+1.4,.01,.01,x,z)],'navy',room)
    arch('Distant_window',x,y+.4,z+.57,.6,1.6,room,.025,'gold')
    if i<8:arch('Sky_bridge',x+1.9,y-1,z,2.7,2,room,.14,'stone')
# Preserve interactive groups, batch remaining stationary surfaces by material.
for parent in (room,desk,lamp,atlas):
    for material in M.values():
        objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.parent==parent and o.active_material==material]
        if not objects:continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name=parent.name+'_'+material.name
save('attic-atelier')
print('Atelier models complete.')
