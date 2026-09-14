"""Dedicated local-only GUI Blender for Mindstone MCP; no existing scene touched."""
import bpy,addon_utils
addon_utils.enable('blender_mcp',default_set=True)
import blender_mcp as addon
server=getattr(bpy.types,'blendermcp_server',None) or addon.BlenderMCPServer(host='127.0.0.1',port=9876)
server.start()
if not server.running:raise RuntimeError('MCP server did not start')
bpy.types.blendermcp_server=server
print('MINDSTONE_BLENDER_MCP_READY',flush=True)
