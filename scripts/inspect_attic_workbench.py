import bpy,json
from mathutils import Vector
objects=[o for o in bpy.context.scene.objects if o.name.startswith('DeskPuzzle')]
for obj in objects:
    points=[obj.matrix_world@Vector(p) for p in obj.bound_box] if obj.type=='MESH' else []
    print(json.dumps({'name':obj.name,'location':list(obj.matrix_world.translation),
        'min':[min(p[i] for p in points) for i in range(3)] if points else None,
        'max':[max(p[i] for p in points) for i in range(3)] if points else None}))
