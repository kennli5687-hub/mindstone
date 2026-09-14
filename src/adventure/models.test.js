import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Box3,Vector3} from 'three';
import {rooms} from './rooms.js';

const root=new URL('../../public/assets/story-models/',import.meta.url);
test('moonstone repair exports three independently movable fragments',async()=>{
  const b=await readFile(new URL('moonstone-repair.glb',root));
  const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
  assert.equal(j.scenes.length,1);
  assert.deepEqual(j.nodes.filter(n=>Number.isInteger(n.extras?.repairFragment)).map(n=>n.extras.repairFragment).sort(),[0,1,2]);
  assert.ok(j.meshes.length<=12);
  const tinted=j.meshes.flatMap(m=>m.primitives).filter(p=>p.attributes.COLOR_0!==undefined);
  assert.equal(tinted.length,3,'each crystal fragment retains its pearlescent vertex colors');
  for(const p of tinted)assert.equal(j.accessors[p.attributes.COLOR_0].count,j.accessors[p.attributes.POSITION].count);
  assert.ok(b.length<1024*1024);
});
test('compressed attic delivery preserves topology and embeds local textures',async()=>{
  const read=async name=>{const b=await readFile(new URL(name,root));return {b,j:JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString())};};
  const source=await read('attic-storybook-v2.glb'),delivery=await read('attic-delivery.glb');
  const triangles=j=>j.meshes.flatMap(m=>m.primitives).reduce((sum,p)=>sum+j.accessors[p.indices].count/3,0);
  assert.equal(triangles(delivery.j),triangles(source.j));
  assert.equal(delivery.j.meshes.length,source.j.meshes.length);
  assert.equal(delivery.j.scenes.length,1);
  assert.ok(delivery.j.extensionsRequired.includes('KHR_draco_mesh_compression'));
  assert.ok(delivery.j.images.every(i=>i.bufferView!==undefined&&!i.uri));
  for(const name of ['DeskPuzzle','DetailLantern','DetailAtlas','WindowCity'])assert.ok(delivery.j.nodes.some(n=>n.name===name),name);
  assert.ok(delivery.b.length<6*1024*1024);
});
test('storybook attic embeds textures and retains puzzle targets and a batched skyline',async()=>{
  const b=await readFile(new URL('attic-storybook-v2.glb',root));
  const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
  assert.ok(json.images?.some(i=>i.bufferView!==undefined),'texture embedded in GLB');
  for(const name of ['DeskPuzzle','DetailLantern','DetailAtlas','WindowCity'])assert.ok(json.nodes.some(n=>n.name===name),name);
  assert.ok(json.meshes.length<100,'static architecture is batched');
  assert.ok(b.length<25*1024*1024,'asset size regression');
});
async function model(name){
  const bytes=await readFile(new URL(name+'.glb',root));
  return (await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength), '')).scene;
}
test('Blender Ari has walk pivots, recognizable outfit and upright dimensions',async()=>{
  const scene=await model('ari');
  for(const name of ['Ari','Leg_L','Leg_R','Arm_L','Arm_R','Turquoise_satchel','Bob_silhouette'])
    assert.ok(scene.getObjectByName(name),name);
  const size=new Box3().setFromObject(scene).getSize(new Vector3());
  assert.ok(size.y>1.7&&size.y<2.2,JSON.stringify(size));
});
test('Morrow has separately animatable wings',async()=>{
  const scene=await model('morrow');
  assert.ok(scene.getObjectByName('Wing_L'));assert.ok(scene.getObjectByName('Wing_R'));
});
test('atelier Ari exports a skinned skeleton and a playable walk clip',async()=>{
  const bytes=await readFile(new URL('ari-atelier.glb',root));
  const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  let skins=0;gltf.scene.traverse(o=>{if(o.isSkinnedMesh)skins++});
  assert.ok(skins>0);assert.ok(gltf.animations.length>0);assert.ok(gltf.animations[0].duration>0);
  for(const name of ['Leg_L','Shin_L','Arm_R','Fore_R'])assert.ok(gltf.scene.getObjectByName(name));
});
test('atelier attic keeps its three story interaction targets separate',async()=>{
  const scene=await model('attic-atelier');
  for(const name of ['DeskPuzzle','DetailLantern','DetailAtlas'])assert.ok(scene.getObjectByName(name));
});
test('comic Ari retains animation and continuous hair and weighted clothing',async()=>{
  const bytes=await readFile(new URL('ari-comic-candidate.glb',root));
  const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
  assert.ok(gltf.animations.some(a=>a.duration>0));
  for(const name of ['Continuous_comic_bob','Open_knee_length_coat','Continuous_wide_trousers','Continuous_coat_sleeve']){
    const mesh=gltf.scene.getObjectByName(name);
    assert.ok(mesh?.isSkinnedMesh,name);
    assert.ok(mesh.geometry.attributes.skinWeight,name+' weights');
  }
  assert.ok(bytes.length<5*1024*1024);
});
test('every story location has a parseable, batched Blender kit',async()=>{
  for(const room of rooms){
    const scene=await model(room.theme);let meshes=0;
    scene.traverse(o=>{if(o.isMesh)meshes++});
    assert.ok(meshes>0&&meshes<=14,`${room.theme}: ${meshes} draw meshes`);
  }
});
