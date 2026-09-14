import test from 'node:test';
import assert from 'node:assert/strict';
import {fits,chapters} from './continuation.js';
test('three continuation activities follow the comic',()=>{assert.equal(chapters.length,3);assert.match(chapters[0][1],/one piece/);});
test('task blocks cannot wrap, overlap or leave the board',()=>{
 const board=Array(24).fill(0),shape=[[0,0],[1,0],[0,1]];
 assert.equal(fits(board,shape,0,0),true);
 assert.equal(fits(board,shape,5,0),false);
 assert.equal(fits(board,shape,0,3),false);
 assert.equal(fits(board,shape,-1,0),false);
 board[1]=1;assert.equal(fits(board,shape,0,0),false);
});
