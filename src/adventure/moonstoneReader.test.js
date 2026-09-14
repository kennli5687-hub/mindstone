import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {comicPages} from './moonstoneReader.js';
test('replacement comic contains ten original PNGs in numeric story order',async()=>{
  assert.equal(comicPages.length,10);
  for(let i=0;i<10;i++){
    assert.ok(comicPages[i].endsWith(`/fant${i+1}.png`));
    const data=await readFile(new URL('../../public'+decodeURIComponent(comicPages[i]),import.meta.url));
    assert.equal(data.subarray(1,4).toString(),'PNG');
  }
});
test('dashboard removes quiz entry and information rail',async()=>{
  const main=await readFile(new URL('../main.js',import.meta.url),'utf8');
  assert.ok(!main.includes('data-action="open-quiz"'));
  assert.ok(!main.includes('<aside class="panel info-rail stack">'));
  assert.ok(main.includes('createMoonstoneReader'));
});
