// header border on scroll
const header = document.getElementById('top');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// node graph: hover + click + keyboard
const nodes = document.querySelectorAll('.graph .nodeg');
const edges = document.querySelectorAll('.graph .edge');

function highlight(target, on) {
  edges.forEach(e => { if (e.dataset.for === target) e.classList.toggle('on', on); });
  nodes.forEach(n => { if (n.dataset.target === target) n.classList.toggle('on', on); });
}
function goTo(target) {
  const el = document.getElementById(target);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
nodes.forEach(n => {
  const t = n.dataset.target;
  n.addEventListener('mouseenter', () => highlight(t, true));
  n.addEventListener('mouseleave', () => highlight(t, false));
  n.addEventListener('click', () => goTo(t));
  n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(t); } });
});

// one orchestrated load reveal (respect reduced motion)
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  const g = document.querySelector('.graph');
  edges.forEach(e => { e.style.opacity = 0; e.style.transition = 'opacity .9s ease'; });
  nodes.forEach(n => { n.style.opacity = 0; n.style.transform = 'scale(.9)';
    n.style.transition = 'opacity .5s ease, transform .5s ease'; n.style.transformOrigin = 'center'; });
  requestAnimationFrame(() => {
    edges.forEach((e, i) => setTimeout(() => { e.style.opacity = 1; }, 250 + i * 90));
    nodes.forEach((n, i) => setTimeout(() => { n.style.opacity = 1; n.style.transform = 'scale(1)'; }, 450 + i * 110));
  });
}
