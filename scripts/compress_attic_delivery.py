"""Create a compressed delivery candidate, retaining the original mesh and source asset."""
import bpy,pathlib,json
root=pathlib.Path("/Volumes/andrew's SSD/Documents/psy/mindstone")
scene=bpy.data.scenes.new('Attic_Delivery_Compression');bpy.context.window.scene=scene
bpy.ops.import_scene.gltf(filepath=str(root/'public/assets/story-models/attic-storybook-v2.glb'))
output=root/'artifacts/fog-attic/attic-delivery-candidate.glb'
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_active_scene=True,
    export_extras=True,export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,export_draco_position_quantization=16,
    export_draco_normal_quantization=12,export_draco_texcoord_quantization=14,
    export_draco_color_quantization=12,export_draco_generic_quantization=14)
print(json.dumps({'candidateBytes':output.stat().st_size,'sourceRetained':True,
    'note':'Compression with quantized attributes; no additional decimation. Requires browser fidelity validation.'}))
