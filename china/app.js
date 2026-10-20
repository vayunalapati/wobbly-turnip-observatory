const panels = [...document.querySelectorAll('.day-panel')];
const links = [...document.querySelectorAll('.day-link')];
const overview = document.getElementById('route-overview');
window.hkChoice = 'city';
window.chinaDayPoints = day => day.points.filter(point => !point.choice || point.choice === window.hkChoice);
function showDay() {
  const selected = panels.find(panel => location.hash === '#' + panel.id);
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
  if (selected) selected.scrollIntoView({block:'start'});
}
function chooseHongKong(choice) {
  window.hkChoice = choice;
  document.querySelectorAll('[data-branch]').forEach(row => { row.hidden = row.dataset.branch !== choice; });
  document.querySelectorAll('[data-choice]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.choice === choice)));
  document.getElementById('choice-status').textContent = choice === 'city' ? 'Showing the city route' : 'Showing Dragon’s Back & Shek O';
  window.dispatchEvent(new Event('choicechange'));
}
document.documentElement.classList.add('js');
document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => chooseHongKong(button.dataset.choice)));
chooseHongKong('city');
window.addEventListener('hashchange', showDay);
showDay();
document.querySelector('#print-button').addEventListener('click', () => window.print());
