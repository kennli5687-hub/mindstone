"""Pack the new 2D design into a Blender reference workspace, not a fake 3D model."""
import bpy,pathlib,math
root=pathlib.Path(__file__).resolve().parents[1];folder=root/'artifacts/fog-attic/references'
bpy.ops.wm.read_factory_settings(use_empty=True)
im=bpy.data.images.load(str(folder/'ari-turnaround.png'));im.pack()
board=bpy.data.objects.new('Ari_2D_turnaround_REFERENCE_ONLY',None);bpy.context.collection.objects.link(board)
board.empty_display_type='IMAGE';board.data=im;board.empty_display_size=6;board.rotation_euler=(math.pi/2,0,0);board.location=(0,1,2)
board.color[3]=.85;board.show_in_front=False;board.hide_render=True
note=bpy.data.texts.new('READ_ME')
note.write('This is a packed 2D image reference workspace, not a reconstructed character.\nModel new geometry against the silhouettes; do not mistake the reference image for a finished model.\nResolve bag to character-left hip/right shoulder. Generated views are illustrative, not exact orthographic measurements.\nFull scalp coverage, chin-length wavy bob, knee-length open coral coat and wide navy trousers are key design targets.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(folder/'ari-modeling-reference.blend'))
