import { storyPages, storyClues, storyTitle } from './story.js';
import { readProgress, saveProgress, rememberPage } from './progress.js';

export function createStoryReader(host, options = {}) {
  let index = Math.max(0, Math.min(storyPages.length - 1, options.page ?? readProgress().bookmark));
  let zoom = false;
  function render() {
    const page = storyPages[index];
    const progress = readProgress();
    const clue = storyClues.find(item => item.id === page.clue);
    const remembered = clue && progress.memories.includes(clue.id);
    host.innerHTML = `
      <header class="novel-header"><div><span class="novel-eyebrow">SCENARIO · AN ORIGINAL GRAPHIC STORY</span><h1>${storyTitle}</h1></div><button data-reader="close" aria-label="Close story">×</button></header>
      <div class="novel-toolbar"><span>PAGE ${index + 1} / ${storyPages.length} · ${page.title}</span><button data-reader="zoom">${zoom ? 'Fit page' : 'Enlarge artwork'}</button></div>
      <div class="novel-scroll ${zoom ? 'is-enlarged' : ''}">
        <img class="novel-art" src="/assets/letter-story/page-${String(index + 1).padStart(2, '0')}.png" alt="Page ${index + 1}: ${page.title}. Four illustrated panels with English dialogue. Full transcript follows below." />
        <div class="novel-reading-notes">
          ${clue ? `<section class="novel-memory"><span>✧ A detail to carry with you</span><h2>${clue.title}</h2><p>${clue.memory}</p><button data-reader="remember">${remembered ? '✓ In your notebook' : 'Keep this memory'}</button></section>` : ''}
          <details class="novel-transcript"><summary>Read the English transcript</summary>${page.panels.map(([speaker,line],i) => `<p><small>PANEL ${i + 1} · ${speaker}</small>${line}</p>`).join('')}</details>
          ${index === 0 ? `<details class="novel-transcript"><summary>Before the story: what is avoidance?</summary><video controls muted playsinline preload="metadata" src="/assets/what-avoidance-is-silent.mp4" aria-label="Introduction to avoidance"></video><p>Avoidance means pulling away from something because it feels uncomfortable. It can offer immediate relief while leaving the difficulty unresolved. It is a pattern, not a diagnosis by itself. Rest and avoiding actual danger can be healthy.</p></details>` : ''}
          ${index === storyPages.length - 1 ? '<p class="novel-care">This is a story and a learning experience, not treatment. For persistent distress or difficulties with everyday life, consider support from a qualified professional.</p>' : ''}
        </div>
      </div>
      <footer class="novel-footer"><button data-reader="prev" ${index === 0 ? 'disabled' : ''}>← Previous</button><label class="novel-page-select">Page <select aria-label="Story page">${storyPages.map((item,i) => `<option value="${i}" ${index === i ? 'selected' : ''}>${i + 1} · ${item.title}</option>`).join('')}</select></label><button data-reader="next" ${index === storyPages.length - 1 ? 'disabled' : ''}>Next →</button><button class="novel-explore" data-reader="world">${options.fromWorld ? 'Back to your room' : 'Explore the city'} ↗</button></footer>`;
    // A missing asset leaves an explicit message and a complete readable transcript.
    host.querySelector('img').addEventListener('error', event => {
      event.target.hidden = true;
      const notice = document.createElement('p');
      notice.className = 'novel-asset-error';
      notice.textContent = 'The artwork could not load. The complete English transcript is available below.';
      host.querySelector('.novel-scroll').prepend(notice);
      host.querySelector('.novel-transcript').open = true;
    });
  }
  function turn(next) {
    index = Math.max(0, Math.min(storyPages.length - 1, next));
    const progress = readProgress(); progress.bookmark = index; saveProgress(progress);
    render();
  }
  function onClick(event) {
    const button = event.target.closest('[data-reader]');
    if (!button) return;
    const action = button.dataset.reader;
    if (action === 'prev') turn(index - 1);
    if (action === 'next') turn(index + 1);
    if (action === 'zoom') { zoom = !zoom; render(); }
    if (action === 'remember') { rememberPage(index); render(); }
    if (action === 'close') options.onClose?.();
    if (action === 'world') options.onWorld?.();
  }
  function onChange(event) { if (event.target.matches('select')) turn(Number(event.target.value)); }
  function onKey(event) {
    if (event.target.matches('select, input, textarea') || event.target.closest('video')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); turn(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); turn(index - 1); }
    if (event.key === 'Escape') options.onClose?.();
  }
  host.addEventListener('click', onClick);
  host.addEventListener('change', onChange);
  host.addEventListener('keydown', onKey);
  render();
  host.querySelector('[data-reader="close"]').focus();
  return { destroy() { host.removeEventListener('click', onClick); host.removeEventListener('change', onChange); host.removeEventListener('keydown', onKey); host.replaceChildren(); } };
}
