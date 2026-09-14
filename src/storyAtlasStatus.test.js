import test from 'node:test';
import assert from 'node:assert/strict';
import {previewStatus} from './storyAtlasStatus.js';

test('switching away from a loading Mira chapter clears its message',()=>{
  assert.match(previewStatus({selected:0,library:true}).message,/Mira/);
  assert.deepEqual(previewStatus({selected:1,library:true}),{fallback:false,message:''});
});
test('late book failure is not shown on another character’s chapter',()=>{
  assert.deepEqual(previewStatus({selected:2,library:true,bookFailed:true}),{fallback:false,message:''});
});
test('a working book remains usable when the library fails later',()=>{
  assert.deepEqual(previewStatus({selected:0,book:true,libraryFailed:true}),{fallback:false,message:''});
  assert.equal(previewStatus({selected:-1,book:true,libraryFailed:true}).fallback,true);
});
test('loaded assets cannot dismiss a lost context or unavailable renderer',()=>{
  for(const reason of ['contextLost','unavailable']){
    const status=previewStatus({[reason]:true,selected:0,book:true,library:true});
    assert.equal(status.fallback,true);
    assert.ok(status.message.length);
  }
});
test('a failed chapter keeps navigation and a visible preview',()=>{
  assert.equal(previewStatus({selected:0,bookFailed:true}).fallback,true);
  assert.equal(previewStatus({selected:0,bookFailed:true,library:true}).fallback,false);
  assert.match(previewStatus({selected:0,bookFailed:true}).message,/retry/);
});
