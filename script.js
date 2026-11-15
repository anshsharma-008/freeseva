const search = document.getElementById('serviceSearch');
const cards = [...document.querySelectorAll('.service-card')];
const filters = [...document.querySelectorAll('.filter')];
let selectedCategory = 'All services';
function filterServices() {
  const query = search.value.trim().toLowerCase();
  let visible = 0;
  for (const card of cards) {
    const matches = (selectedCategory === 'All services' || card.dataset.category === selectedCategory) && card.textContent.toLowerCase().includes(query);
    card.hidden = !matches;
    if (matches) visible++;
  }
  document.getElementById('resultCount').textContent = `${visible} ${visible === 1 ? 'service' : 'services'} to explore`;
  document.getElementById('emptyState').hidden = visible > 0;
}
search.addEventListener('input', filterServices);
for (const button of filters) {
  button.addEventListener('click', () => {
    selectedCategory = button.dataset.filter;
    for (const filter of filters) {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    }
    filterServices();
  });
}
document.getElementById('resetSearch').addEventListener('click', () => {
  search.value = '';
  filters[0].click();
  search.focus();
});
document.addEventListener('keydown', event => {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
    event.preventDefault();
    search.focus();
  }
});
const menuButton = document.querySelector('.menu-toggle');
const nav = document.getElementById('mainNav');
function closeMenu() { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
document.getElementById('copyUpi').addEventListener('click', async () => {
  const status = document.getElementById('paymentStatus');
  try {
    await navigator.clipboard.writeText(document.getElementById('upiId').textContent);
    status.textContent = 'UPI ID copied. Enter ₹49 in your payment app.';
  } catch {
    status.textContent = 'Select and copy the UPI ID above: 8543893143@slc.';
  }
});
document.getElementById('upiPay').addEventListener('click', () => {
  document.getElementById('paymentStatus').textContent = 'Complete payment in your UPI app, then email your transaction reference for manual confirmation.';
});

// Keep decorative motion optional and avoid work outside the viewport.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionButton = document.querySelector('.motion-toggle');
const heroArt = document.querySelector('.hero-art');
const scene = document.querySelector('.toolkit-scene');
let motionPaused = false;
function updateMotion() {
  const disabled = motionPaused || motionPreference.matches;
  document.body.classList.toggle('motion-paused', disabled);
  motionButton.hidden = motionPreference.matches;
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.textContent = motionPaused ? 'Play animation' : 'Pause animation';
  if (disabled) tiltTargets.forEach(({ surface }) => resetTilt(surface));
}
function resetTilt(surface) {
  surface.style.removeProperty('--tilt-x');
  surface.style.removeProperty('--tilt-y');
}
const tiltTargets = [{ target: heroArt, surface: scene }, ...cards.map(card => ({ target: card, surface: card }))];
for (const { target, surface } of tiltTargets) {
  if (target !== heroArt) target.classList.add('depth-card');
  let frame = 0;
  target.addEventListener('pointermove', event => {
    if (motionPaused || motionPreference.matches || !finePointer.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (motionPaused || motionPreference.matches || !finePointer.matches) return;
      const rect = target.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
      const y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
      surface.style.setProperty('--tilt-x', `${-y * 9}deg`);
      surface.style.setProperty('--tilt-y', `${x * 12}deg`);
    });
  });
  const release = () => { cancelAnimationFrame(frame); resetTilt(surface); };
  target.addEventListener('pointerleave', release);
  target.addEventListener('pointercancel', release);
}
motionButton.addEventListener('click', () => { motionPaused = !motionPaused; updateMotion(); });
motionPreference.addEventListener('change', updateMotion);
finePointer.addEventListener('change', () => tiltTargets.forEach(({ surface }) => resetTilt(surface)));
let heroVisible = true;
function updateIdleMotion() {
  document.body.classList.toggle('motion-idle', document.hidden || !heroVisible);
}
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    updateIdleMotion();
  }).observe(heroArt);
}
document.addEventListener('visibilitychange', updateIdleMotion);
updateMotion();
