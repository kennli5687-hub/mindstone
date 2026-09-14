import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {atlasTopics,storybookAsset,libraryAsset} from './storyAtlas.js';
test('default library is a character-neutral collection with three selectable chapters',async()=>{
  const b=await readFile(new URL(`../public${libraryAsset}`,import.meta.url));
  const json=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)).trim());
  assert.equal(json.scenes.length,1);
  assert.deepEqual(json.nodes.filter(n=>n.extras?.storyId).map(n=>n.extras.storyId).sort(),atlasTopics.map(t=>t.id).sort());
  assert.equal(json.images.length,1,'Only a shared material texture, no protagonist artwork');
  assert.ok(json.images[0].name.startsWith('LibraryClothNormal'));
  assert.equal(json.images[0].mimeType,'image/png');
  assert.ok(json.materials.every(m=>!m.pbrMetallicRoughness?.baseColorTexture),'No illustrated protagonist on any cover');
  assert.equal(json.materials.filter(m=>m.normalTexture).length,3,'Every cloth binding has an exported normal map');
  for(const m of json.materials.filter(m=>m.normalTexture))assert.deepEqual(m.normalTexture.extensions.KHR_texture_transform.scale,[8,8],'Fine weave scale survives export');
  assert.ok(json.nodes.some(n=>n.extras?.part==='readingSpace'),'Books have an authored reading surface and lamp');
  assert.ok(json.extensionsUsed.includes('KHR_lights_punctual'),'Reading lamp retains its local light');
  assert.ok(json.meshes.length<=23); // fifteen binding batches plus eight furniture materials
  assert.ok(b.length<3*1024*1024);
});
test('live storybook exports one scene, embedded artwork and bounded geometry',async()=>{
  const b=await readFile(new URL(`../public${storybookAsset}`,import.meta.url));
  assert.equal(b.toString('ascii',0,4),'glTF');
  const json=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)).trim());
  assert.equal(json.scenes.length,1,'No unrelated Blender scenes in the payload');
  assert.ok(json.nodes.some(n=>n.extras?.storyId==='avoidance'));
  assert.ok(json.nodes.some(n=>n.extras?.artRevision==='celestial-gateway-v1'&&n.extras.sourceComicPage===8),'Current entrance is derived from the comic’s celestial gate');
  assert.ok(json.images.some(i=>i.mimeType==='image/jpeg'&&i.bufferView!==undefined));
  assert.ok(json.images.every(i=>i.uri===undefined),'Artwork is embedded, with no runtime external dependency');
  assert.equal(json.materials.filter(m=>m.normalTexture).length,2,'Paper and cover micrograin must survive glTF export');
  for(const mesh of json.meshes)for(const primitive of mesh.primitives){
    const positions=json.accessors[primitive.attributes.POSITION];
    assert.ok([...positions.min,...positions.max].every(v=>Math.abs(v)<5),'No studio floor hidden in the live model');
  }
  assert.ok(json.nodes.some(n=>n.extras?.part==='doorHinge'),'Door is articulated, not fused to the book');
  assert.ok(json.meshes.length<=13);
  const triangles=json.meshes.flatMap(m=>m.primitives).reduce((sum,p)=>sum+json.accessors[p.indices].count/3,0);
  assert.ok(triangles<50000,`${triangles} triangles`);
  assert.ok(b.length<2.5*1024*1024,`${b.length} bytes`);
});
test('homepage atlas is a compact Blender model with three selectable concept roots',async()=>{
  const b=await readFile(new URL('../public/assets/story-models/story-atlas.glb',import.meta.url));
  const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
  for(const t of atlasTopics)assert.ok(g.scene.getObjectByName(t.node),t.node);
  let meshes=0;g.scene.traverse(o=>{if(o.isMesh)meshes++;});
  assert.ok(meshes<=20,`${meshes} meshes`);assert.ok(b.length<2*1024*1024);
  assert.equal(atlasTopics.filter(t=>t.ready).length,1);
  assert.equal(atlasTopics[0].id,'avoidance');
});
