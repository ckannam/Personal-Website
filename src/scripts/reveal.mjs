// Calm, quiet reveals: fade .reveal elements in as they enter the viewport.
// Under prefers-reduced-motion, everything is shown at once — no animation.

export function revealStrategy(reduced) {
  return reduced ? 'immediate' : 'observe';
}

/**
 * @param {object} [o]
 * @param {Document} [o.doc]
 * @param {MediaQueryList|{matches:boolean}} [o.mql]
 * @param {(cb:IntersectionObserverCallback)=>{observe:(el:Element)=>void}} [o.makeObserver]
 */
export function initReveals(o = {}) {
  const doc = o.doc ?? document;
  const mql = o.mql ?? window.matchMedia('(prefers-reduced-motion: reduce)');
  const els = Array.from(doc.querySelectorAll('.reveal'));

  if (revealStrategy(mql.matches) === 'immediate') {
    for (const el of els) el.classList.add('is-visible');
    return;
  }

  const makeObserver =
    o.makeObserver ??
    ((cb) => new IntersectionObserver(cb, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }));

  const io = makeObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  });
  for (const el of els) io.observe(el);
}
