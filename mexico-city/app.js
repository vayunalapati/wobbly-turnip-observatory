const panels = [...document.querySelectorAll('.day-panel')];
const links = [...document.querySelectorAll('.day-link')];
const overview = document.getElementById('route-overview');

function showDay() {
  const id = location.hash.slice(1);
  const selected = panels.find(panel => panel.id === id);
  overview.hidden = Boolean(selected);
  panels.forEach(panel => { panel.hidden = panel !== selected; });
  links.forEach(link => {
    if (selected && link.hash === '#' + selected.id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-view]').forEach(link => {
    if (link.dataset.view === (selected ? 'days' : 'route')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (selected) selected.scrollIntoView({ block: 'start' });
}

document.documentElement.classList.add('js');
window.addEventListener('hashchange', showDay);
showDay();
document.querySelector('#print-button').addEventListener('click', () => window.print());
