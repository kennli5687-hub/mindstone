import test from 'node:test';
import assert from 'node:assert/strict';
import {settleMotion} from './storyAtlasMotion.js';
test('paused transforms reach an exact stable value at common refresh rates',()=>{
  for(const hz of [30,60,120]){
    let value=.6;
    for(let i=0;i<hz*2;i++)value=settleMotion(value,-.4,1/hz);
    assert.equal(value,-.4);
    assert.equal(settleMotion(value,-.4,1/hz),value);
  }
});
test('reduced motion changes immediately and a stalled frame cannot overshoot',()=>{
  assert.equal(settleMotion(0,1,1/60,true),1);
  const value=settleMotion(0,1,100);
  assert.ok(value>0&&value<1);
});
