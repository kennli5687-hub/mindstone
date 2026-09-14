import bpy,json
print(json.dumps({'context':bpy.context.scene.name,'window':bpy.context.window.scene.name,'scenes':[(s.name,len(s.objects)) for s in bpy.data.scenes]},indent=2))
