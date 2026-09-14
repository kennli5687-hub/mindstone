import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chapterAtHit,chapterCue} from './storyAtlasInteraction.js';
const topics=[{id:'avoidance',name:'Avoidance',ready:true},{id:'procrastination',name:'Procrastination',ready:false}];
test('book hit resolves a nested binding to its own chapter',()=>{
  const root={userData:{storyId:'avoidance'}},cover={parent:root},foil={parent:cover};
  assert.equal(chapterAtHit([{object:foil}],topics),0);
  assert.equal(chapterAtHit([{object:{parent:{userData:{storyId:'procrastination'}}}}],topics),1);
});
test('furniture occludes books and empty space has no chapter',()=>{
  const book={userData:{storyId:'avoidance'}};
  assert.equal(chapterAtHit([{object:{userData:{part:'readingSpace'}}},{object:book}],topics),-1);
  assert.equal(chapterAtHit([],topics),-1);
  assert.equal(chapterAtHit([{object:{userData:{storyId:'unknown'}}}],topics),-1);
});
test('preview cues do not advertise unfinished worlds as playable',()=>{
  assert.match(chapterCue(topics[0]).hint,/playable world/);
  assert.match(chapterCue(topics[1]).hint,/In development/);
  assert.equal(chapterCue(null),null);
});
test('actual exported mesh ancestry separates chapter surfaces from furniture',async()=>{
  const allTopics=[...topics,{id:'perfectionism'}];
  for(const [file,expected] of [['storybook-hero.glb',{'0':11}],['storybook-gateway.glb',{'0':13}],['story-library-room.glb',{'0':5,'1':5,'2':5,'-1':8}]]){
    const b=await readFile(new URL(`../public/assets/story-models/${file}`,import.meta.url));
    const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
    const nodes=j.nodes.map(n=>({userData:n.extras||{},mesh:n.mesh}));
    j.nodes.forEach((n,i)=>(n.children||[]).forEach(child=>nodes[child].parent=nodes[i]));
    const counts={};
    for(const node of nodes.filter(n=>n.mesh!==undefined)){
      const hit=chapterAtHit([{object:node}],allTopics);counts[hit]=(counts[hit]||0)+1;
    }
    assert.deepEqual(counts,expected,file);
  }
});
