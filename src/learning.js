export const lessons = [
  {id: 'cycle', name: 'The relief loop', reward: 'Loop lantern', question: 'You close a difficult assignment and immediately feel better. What might this teach your mind?', options: ['Escaping discomfort brings relief, making escape more tempting next time', 'The assignment has been resolved', 'You are incapable of learning'], answer: 0, explanation: 'Short-term relief can reinforce avoidance. Notice the trigger, the escape, and what remains later. Taking an intentional break with a return plan is different from endlessly escaping.'},
  {id: 'ground', name: 'Make room for discomfort', reward: 'Grounding garden', question: 'What is a helpful purpose of grounding before a small action?', options: ['To guarantee anxiety disappears', 'To reconnect with the present while allowing some discomfort', 'To keep postponing until you feel perfect'], answer: 1, explanation: 'Grounding can help you orient to the present. You do not have to remove every uncomfortable feeling before acting. Use comfortable, ordinary breathing; stop any exercise that feels unpleasant.'},
  {id: 'step', name: 'A manageable beginning', reward: 'Stepping stones', question: 'A safe everyday task feels overwhelming. Which first step is most manageable?', options: ['Force yourself to finish everything immediately', 'Wait for complete confidence', 'Open the document and write a rough title'], answer: 2, explanation: 'Choose a small, specific action for a safe situation. Repeat manageable steps and adjust the difficulty. This practice is not a substitute for individualized treatment, especially for trauma or severe anxiety.'},
];
const storageKey = 'mindstone-learning-v1';
export function readLearning() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return {keys: Array.isArray(data.keys) ? data.keys.filter(id => lessons.some(l => l.id === id)) : []};
  } catch { return {keys: []}; }
}
export function earnKey(id) {
  const data = readLearning();
  if (!data.keys.includes(id)) data.keys.push(id);
  try { localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* Learning remains available without browser storage. */ }
  return data;
}
