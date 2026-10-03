import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {comicPages,procrastinationComicPages,perfectionismComicPages} from './moonstoneReader.js';
test('story comics contain eight JPEGs in numeric order',async()=>{
  for(const pages of [comicPages,procrastinationComicPages,perfectionismComicPages]){
    assert.equal(pages.length,8);
    for(let i=0;i<pages.length;i++){
      assert.ok(pages[i].endsWith(`/${i+1}.jpg`));
      const data=await readFile(new URL('../../public'+decodeURIComponent(pages[i]),import.meta.url));
      assert.deepEqual([...data.subarray(0,3)],[0xff,0xd8,0xff]);
    }
  }
});
test('dashboard removes quiz entry and information rail',async()=>{
  const main=await readFile(new URL('../main.js',import.meta.url),'utf8');
  assert.ok(!main.includes('data-action="open-quiz"'));
  assert.ok(!main.includes('<aside class="panel info-rail stack">'));
  assert.ok(main.includes('createMoonstoneReader'));
});
