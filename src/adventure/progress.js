import { rooms } from './rooms.js';
import { storyClues, storyPages } from './story.js';
const KEY = 'mindstone-letter-adventure-v1';
let volatile = { memories: [], solved: [], bookmark: 0, room: 0 };
export function normalizeProgress(data) {
  const source = data && typeof data === 'object' ? data : {};
  const memories = [...new Set(Array.isArray(source.memories) ? source.memories.filter(id => storyClues.some(c => c.id === id)) : [])];
  const solved = [];
  for (const room of rooms) {
    if (!Array.isArray(source.solved) || !source.solved.includes(room.id) || !memories.includes(room.clue)) break;
    solved.push(room.id);
  }
  return { memories, solved, bookmark: Number.isInteger(source.bookmark) ? Math.max(0, Math.min(storyPages.length - 1, source.bookmark)) : 0, room: Number.isInteger(source.room) ? Math.max(0, Math.min(rooms.length - 1, solved.length, source.room)) : 0 };
}
export function readProgress() {
  try { const raw = localStorage.getItem(KEY); if (raw) volatile = normalizeProgress(JSON.parse(raw)); } catch { /* Session progress works if storage is unavailable. */ }
  return structuredClone(volatile);
}
export function saveProgress(data) {
  volatile = normalizeProgress(data);
  try { localStorage.setItem(KEY, JSON.stringify(volatile)); } catch { /* Keep the current session usable. */ }
  return structuredClone(volatile);
}
export function rememberPage(index) {
  const progress = readProgress();
  const page = storyPages[index];
  if (!page) return progress;
  progress.bookmark = index;
  if (page.clue && !progress.memories.includes(page.clue)) progress.memories.push(page.clue);
  return saveProgress(progress);
}
export function canEnter(index, progress) { return Number.isInteger(index) && index >= 0 && index < rooms.length && (index === 0 || progress.solved.includes(rooms[index - 1].id)); }
export function checkPuzzle(room, answer) { return Array.isArray(answer) && answer.length === room.solution.length && room.solution.every((id, i) => answer[i] === id); }
export function solveRoom(index, answer) {
  const progress = readProgress(), room = rooms[index];
  if (!room || !canEnter(index, progress)) return {ok:false, reason:'locked', progress};
  if (!progress.memories.includes(room.clue)) return {ok:false, reason:'story', progress};
  if (!checkPuzzle(room, answer)) return {ok:false, reason:'answer', progress};
  if (!progress.solved.includes(room.id)) progress.solved.push(room.id);
  return {ok:true, progress:saveProgress(progress)};
}
