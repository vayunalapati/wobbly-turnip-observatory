const panels = [...document.querySelectorAll('.day-panel')];
const dayLinks = [...document.querySelectorAll('.day-link')];
const overview = document.getElementById('route-overview');
const rail = document.querySelector('.day-nav');
function showDay() {
  const selected = panels.find(panel => location.hash === '#' + panel.id);
  overview.hidden = Boolean(selected);
  panels.forEach(panel => { panel.hidden = panel !== selected; });
  dayLinks.forEach(link => {
    if (selected && link.hash === '#' + selected.id) {
      link.setAttribute('aria-current', 'date');
      rail.scrollTo({left:link.offsetLeft - rail.clientWidth / 2 + link.clientWidth / 2,behavior:'instant'});
    } else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-view]').forEach(link => {
    if (link.dataset.view === (selected ? 'days' : 'route')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.getElementById('day-nav-hint').textContent = selected ? 'November ' + selected.id.replace('day-','') + ' · ' + selected.querySelector('h2').textContent : 'Choose a day to explore';
  if (!selected) rail.scrollTo({left:0,behavior:'instant'});
  if (selected) selected.scrollIntoView({block:'start',behavior:'instant'});
}
document.documentElement.classList.add('js');
window.addEventListener('hashchange', showDay);
showDay();
document.getElementById('print-button').addEventListener('click', () => window.print());
document.querySelector('.mobile-map-link').addEventListener('click', event => {
  event.preventDefault();
  document.getElementById('trip-map').scrollIntoView({block:'start',behavior:'instant'});
});
const shareButton = document.getElementById('share-button');
const shareStatus = document.getElementById('share-status');
let shareTimer;
shareButton.addEventListener('click', async () => {
  // Use the published URL even when this page is being previewed locally.
  const canonical = document.querySelector('link[rel="canonical"]').href;
  const hash = panels.some(panel => location.hash === '#' + panel.id) ? location.hash : '';
  const url = canonical + hash;
  clearTimeout(shareTimer);
  try {
    await navigator.clipboard.writeText(url);
    shareButton.textContent = 'Link copied ✓';
    shareStatus.textContent = hash ? 'Day link copied. Ready to share.' : 'Trip link copied. Ready to share.';
    shareStatus.classList.add('is-visible');
    shareTimer = setTimeout(() => { shareButton.textContent = 'Copy link ↗'; shareStatus.classList.remove('is-visible'); },2500);
  } catch {
    const field = document.getElementById('share-url');
    document.getElementById('share-fallback').hidden = false;
    field.value = url; field.focus(); field.select();
  }
});
document.getElementById('close-share').addEventListener('click', () => {
  document.getElementById('share-fallback').hidden = true;
  shareButton.focus();
});
