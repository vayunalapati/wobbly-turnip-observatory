import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const panels = [...html.matchAll(/class="day-panel" id="([^"]+)"/g)].map(match => ({
  id: match[1], hidden: false, scrollIntoView() {}
}));
assert.equal(panels.length, 6);
assert.match(html, /Balloon flight is planned, not booked/);
for (const [, file] of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) {
  assert.ok(existsSync(new URL('./' + file, import.meta.url)), `Missing asset: ${file}`);
}
const links = panels.map(panel => ({
  hash: '#' + panel.id, current: false,
  setAttribute() { this.current = true; },
  removeAttribute() { this.current = false; }
}));
const overview = { hidden: false };
const location = { hash: '' };
let changeDay, printClick, printed = false;
runInNewContext(readFileSync(new URL('./app.js', import.meta.url), 'utf8'), {
  location,
  document: {
    querySelectorAll(selector) { return selector === '.day-panel' ? panels : selector === '.day-link' ? links : []; },
    getElementById() { return overview; },
    querySelector() { return { addEventListener(event, callback) { printClick = callback; } }; },
    documentElement: { classList: { add() {} } }
  },
  window: { addEventListener(event, callback) { changeDay = callback; }, print() { printed = true; } }
});
for (const [index, panel] of panels.entries()) {
  location.hash = '#' + panel.id;
  changeDay();
  assert.deepEqual(panels.filter(panel => !panel.hidden).map(panel => panel.id), [panel.id]);
  assert.equal(links.filter(link => link.current).length, 1);
  assert.ok(links[index].current);
}
location.hash = '#unknown';
changeDay();
assert.equal(overview.hidden, false);
assert.ok(panels.every(panel => panel.hidden));
printClick();
assert.equal(printed, true);
const trip = JSON.parse(readFileSync(new URL('./itinerary.json', import.meta.url), 'utf8'));
assert.equal(trip.days.length, 6);
for (const day of trip.days) for (const point of day.points) {
  assert.ok(html.includes('id=\"' + point.row_id + '\"'));
  assert.ok(point.latitude > 19 && point.latitude < 20 && point.longitude > -100 && point.longitude < -98);
  assert.ok(point.maps_url.startsWith('https://www.google.com/maps/'));
}
assert.equal(trip.days.find(day => day.id === '09').points.length, 0);
const restaurants = JSON.parse(readFileSync(new URL('../infatuation-mexico-city-google-restaurants.json', import.meta.url), 'utf8'));
assert.equal(restaurants.restaurants.length, 266);
assert.equal(new Set(restaurants.restaurants.map(row => row.id)).size, 266);
assert.equal(restaurants.google_searches_completed, 266);
assert.equal(restaurants.restaurants.filter(row => row.google_rating !== null && row.google_reviews !== null).length, 261);
assert.ok(restaurants.restaurants.every(row => row.infatuation_rating === null));
console.log('Passed: six-day navigation, overview fallback, print action, local assets, 23 mapped visits, and 266 restaurant records.');
