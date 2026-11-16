import { test } from 'node:test';
import assert from 'node:assert/strict';
import { revealStrategy, initReveals } from '../src/scripts/reveal.mjs';

test('reduced motion → immediate reveal (no scroll animation registered)', () => {
  assert.equal(revealStrategy(true), 'immediate');
});

test('motion allowed → observe (animations registered on scroll)', () => {
  assert.equal(revealStrategy(false), 'observe');
});

test('initReveals under reduced motion shows all elements at once, observing nothing', () => {
  const marked = [];
  const fakeEl = (id) => ({ id, classList: { add: (c) => marked.push(`${id}:${c}`) } });
  const els = [fakeEl('a'), fakeEl('b')];
  let observerCreated = false;
  const fakeDoc = { querySelectorAll: () => els };
  const fakeMql = { matches: true }; // prefers-reduced-motion: reduce
  const fakeMakeObserver = () => {
    observerCreated = true;
    return { observe() {} };
  };

  initReveals({ doc: fakeDoc, mql: fakeMql, makeObserver: fakeMakeObserver });

  assert.deepEqual(marked, ['a:is-visible', 'b:is-visible']);
  assert.equal(observerCreated, false, 'no IntersectionObserver should be created under reduced motion');
});
