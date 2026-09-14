"""Real MCP stdio client used to validate and operate the installed Blender MCP."""
import asyncio,os,sys,json,pathlib
from mcp import ClientSession,StdioServerParameters
from mcp.client.stdio import stdio_client
async def main():
    env={**os.environ,'BLENDER_MCP_DISABLE_TELEMETRY':'true','BLENDER_HOST':'127.0.0.1','BLENDER_PORT':'9876'}
    params=StdioServerParameters(command='/Users/andrewlin/.local/share/mindstone-blender-mcp/.venv/bin/blender-mcp',env=env)
    async with stdio_client(params) as (read,write):
        async with ClientSession(read,write) as session:
            await session.initialize()
            if len(sys.argv)>1:
                code=pathlib.Path(sys.argv[1]).read_text()
                result=await session.call_tool('execute_blender_code',{'code':code,'user_prompt':'把这个3D打磨到可商用为止'})
            else:
                result=await session.call_tool('get_scene_info',{'user_prompt':'安装并连接 Blender MCP，再制作一个可验收的高质量3D主页样板'})
            for c in result.content:
                if hasattr(c,'text'):print(c.text)
            if result.isError:raise RuntimeError('Blender MCP tool failed')
asyncio.run(main())
