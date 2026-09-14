import test from 'node:test';
import assert from 'node:assert/strict';
import { rooms } from './rooms.js';
import { storyPages, storyClues } from './story.js';
import { normalizeProgress, readProgress, saveProgress, rememberPage, canEnter, solveRoom, checkPuzzle } from './progress.js';

test('drawer picture is restored by four swaps, not by choosing an answer',()=>{
  const room=rooms[0],tiles=['4','0','5','2','1','3'];
  assert.equal(room.type,'jigsaw');assert.equal(checkPuzzle(room,tiles),false);
  for(const [a,b] of [[0,1],[1,4],[2,3],[3,5]])[tiles[a],tiles[b]]=[tiles[b],tiles[a]];
  assert.equal(checkPuzzle(room,tiles),true);
  assert.equal(checkPuzzle(room,['loop']),false);
});

test('sixteen four-panel English pages connect every distinct room to a story clue', () => {
  assert.equal(storyPages.length,16);
  assert.equal(storyPages.reduce((n,p)=>n+p.panels.length,0),64);
  assert.equal(rooms.length,10);
  assert.equal(new Set(rooms.map(r=>r.theme)).size,10);
  for(const room of rooms){const clue=storyClues.find(c=>c.id===room.clue);assert.ok(clue);assert.equal(storyPages[clue.page-1].clue,clue.id);assert.ok(room.reward);}
});
test('the full journey requires story knowledge and correct application, saves and permits revisits', () => {
  let stored=null;
  globalThis.localStorage={getItem:()=>stored,setItem:(_,value)=>{stored=value;}};
  saveProgress({});
  assert.equal(canEnter(1,readProgress()),false);
  assert.equal(solveRoom(1,rooms[1].solution).reason,'locked');
  for(let index=0;index<rooms.length;index++){
    const room=rooms[index];
    assert.equal(canEnter(index,readProgress()),true);
    assert.equal(solveRoom(index,room.solution).reason,'story');
    const clue=storyClues.find(c=>c.id===room.clue);
    rememberPage(clue.page-1);rememberPage(clue.page-1);
    assert.equal(solveRoom(index,['wrong']).reason,'answer');
    assert.equal(solveRoom(index,room.solution).ok,true);
    assert.equal(solveRoom(index,room.solution).ok,true);
    assert.equal(readProgress().solved.length,index+1);
    assert.equal(readProgress().memories.length,index+1);
  }
  assert.equal(JSON.parse(stored).solved.length,10);
  assert.equal(canEnter(0,readProgress()),true);
  assert.equal(canEnter(10,readProgress()),false);
  assert.equal(canEnter(-1,readProgress()),false);
});
test('invalid saves and out-of-order completions cannot skip gates', () => {
  assert.deepEqual(normalizeProgress(null),{memories:[],solved:[],bookmark:0,room:0});
  const invalid=normalizeProgress({memories:['fake'],solved:['post'],room:9,bookmark:300});
  assert.equal(invalid.room,0);assert.deepEqual(invalid.solved,[]);assert.equal(invalid.bookmark,15);
});
test('the adventure remains usable with storage blocked', () => {
  globalThis.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
  saveProgress({});rememberPage(1);
  assert.equal(solveRoom(0,rooms[0].solution).ok,true);
  assert.equal(readProgress().solved.length,1);
});
