import test from 'node:test';
import assert from 'node:assert/strict';
import {storyFrustum} from './storyAtlasLayout.js';
test('camera reserves full book width on narrow and wide canvases',()=>{
  for(const aspect of [.4,.8,1,1.5,2.5])for(const open of [false,true]){
    const f=storyFrustum(aspect,open);
    assert.ok(f.right-f.left>=(open?4.6:5.0)-1e-8);
    assert.ok(f.top-f.bottom>=(open?3.45:3.35));
    assert.ok(Math.abs((f.right-f.left)/(f.top-f.bottom)-aspect)<1e-8);
  }
});
