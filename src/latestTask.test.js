import test from 'node:test';
import assert from 'node:assert/strict';
import {createLatestTask} from './latestTask.js';
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};}
test('closing before a slow load finishes prevents a late mount',async()=>{
  const gate=createLatestTask(),load=deferred(),events=[];
  const pending=gate.run({load:()=>load.promise,commit:v=>events.push(v),fail:e=>events.push(e)});
  gate.invalidate();load.resolve('world');
  assert.equal(await pending,'stale');assert.deepEqual(events,[]);
});
test('newer load wins when requests finish out of order',async()=>{
  const gate=createLatestTask(),old=deferred(),events=[];
  const pending=gate.run({load:()=>old.promise,commit:v=>events.push(v),fail:assert.fail});
  assert.equal(await gate.run({load:async()=>'new world',commit:v=>events.push(v),fail:assert.fail}),'committed');
  old.resolve('old world');assert.equal(await pending,'stale');assert.deepEqual(events,['new world']);
});
test('late failures cannot overwrite a closed screen',async()=>{
  const gate=createLatestTask(),load=deferred();
  const pending=gate.run({load:()=>load.promise,commit:assert.fail,fail:assert.fail});
  gate.invalidate();load.reject(new Error('network failure'));
  assert.equal(await pending,'stale');
});
test('active errors report once and retry can commit successfully',async()=>{
  const gate=createLatestTask(),events=[];let canRetry;
  assert.equal(await gate.run({load:async()=>{throw new Error('offline');},commit:assert.fail,fail:(e,current)=>{events.push(e.message);canRetry=current;}}),'failed');
  assert.equal(canRetry(),true);
  assert.equal(await gate.run({load:async()=>'ready',commit:v=>events.push(v),fail:assert.fail}),'committed');
  assert.equal(canRetry(),false);assert.deepEqual(events,['offline','ready']);
});
test('detached targets are rejected even without explicit cancellation',async()=>{
  const gate=createLatestTask();assert.equal(await gate.run({load:async()=>1,isActive:()=>false,commit:assert.fail,fail:assert.fail}),'stale');
});
