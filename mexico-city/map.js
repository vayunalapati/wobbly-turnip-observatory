(() => {
  const container = document.getElementById('trip-leaflet');
  const status = document.getElementById('map-status');
  const dayButton = document.getElementById('map-day');
  const allButton = document.getElementById('map-all');
  const playButton = document.getElementById('play-route');
  const optionalInput = document.getElementById('show-optional');
  const trip = window.mexicoTrip;
  const points = trip.days.flatMap(day => day.points.map(point => ({ ...point, color: day.color })));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let allDays = !location.hash.startsWith('#day-');
  let markers = new Map();
  let timer;
  let playing = false;
  let pendingPoint;
  let activePoints = [];
  if (!window.L) {
    container.innerHTML = '<p class="map-unavailable">The interactive map could not load. The full itinerary and Google Maps links still work; connect to the internet and reload to see the map.</p>';
    status.textContent = 'Map unavailable · itinerary and Maps links are available';
    [dayButton, allButton, playButton, document.getElementById('fit-trip'), optionalInput].forEach(control => { control.disabled = true; });
    document.querySelectorAll('.locate-stop').forEach(button => { button.hidden = true; });
    return;
  }
  const map = L.map(container, { scrollWheelZoom: false }).setView([19.417, -99.16], 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
  const layers = L.layerGroup().addTo(map);
  const selectedDay = () => trip.days.find(day => location.hash === '#day-' + day.id);
  const ratingText = point => point.google_rating == null ? '' : `Google ${point.google_rating.toFixed(1)}/5${point.google_reviews == null ? '' : ' · ' + point.google_reviews.toLocaleString() + ' reviews'}`;

  function popup(point, visits) {
    const day = trip.days.find(day => day.id === point.day);
    const previous = day.points.filter(p => !p.optional && p.number < point.number).at(-1);
    const directions = new URL('https://www.google.com/maps/dir/');
    directions.searchParams.set('api', '1');
    directions.searchParams.set('destination', `${point.latitude},${point.longitude}`);
    directions.searchParams.set('destination_place_id', point.place_id);
    if (previous) directions.searchParams.set('origin', `${previous.latitude},${previous.longitude}`);
    return `${point.photo ? `<img class="popup-photo" src="${escape(point.photo)}" alt="">` : ''}<div class="trip-popup"><span class="label">NOV ${escape(point.day)} · ${escape(point.time)}${point.optional ? ' · OPTIONAL' : ''}</span><h3>${escape(point.title)}</h3><p>${escape(point.google_address)}</p><p>${escape(ratingText(point))}</p>${visits.length > 1 ? `<p>Also planned: ${visits.slice(1).map(p => 'Nov ' + escape(p.day)).join(', ')}</p>` : ''}<a href="${escape(point.maps_url)}" target="_blank" rel="noopener noreferrer">Google Maps ↗</a><a href="${escape(directions.href)}" target="_blank" rel="noopener noreferrer">${previous ? 'Directions from previous stop' : 'Directions to this stop'} ↗</a></div>`;
  }
  function stopPreview() {
    clearTimeout(timer);
    playing = false;
    playButton.textContent = '▶ Preview stops';
    playButton.setAttribute('aria-pressed', 'false');
  }
  function fit() {
    const visible = activePoints.length ? activePoints : points.filter(point => !point.optional);
    if (visible.length) map.fitBounds(visible.map(point => [point.latitude, point.longitude]), { padding: [45, 45], maxZoom: 15, animate: false });
  }
  function highlight(point, scroll) {
    document.querySelectorAll('.map-selected').forEach(row => row.classList.remove('map-selected'));
    const row = document.getElementById(point.row_id);
    if (row) {
      row.classList.add('map-selected');
      if (scroll) row.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'instant' : 'smooth' });
    }
    const marker = markers.get(point.id);
    if (marker) {
      map.setView([point.latitude, point.longitude], Math.max(map.getZoom(), 14), { animate: !reducedMotion });
      marker.openPopup();
    }
  }
  function focusPoint(point, fromMap = false) {
    stopPreview();
    allDays = false;
    if (point.optional) optionalInput.checked = true;
    pendingPoint = { point, fromMap };
    if (location.hash !== '#day-' + point.day) location.hash = 'day-' + point.day;
    else render();
  }
  function render() {
    stopPreview();
    const day = selectedDay();
    const shown = allDays || !day ? trip.days : [day];
    activePoints = shown.flatMap(day => day.points.map(point => ({ ...point, color: day.color }))).filter(point => optionalInput.checked || !point.optional);
    layers.clearLayers();
    markers = new Map();
    dayButton.disabled = !day;
    dayButton.setAttribute('aria-pressed', String(Boolean(day) && !allDays));
    allButton.setAttribute('aria-pressed', String(allDays || !day));
    document.getElementById('map-title').textContent = allDays || !day ? 'The whole trip' : day.title;
    status.textContent = activePoints.length ? `${activePoints.length} planned ${activePoints.length === 1 ? 'stop' : 'stops'} · ${allDays || !day ? 'November 4–9' : 'November ' + day.id}` : 'Hotel and airport unconfirmed · no departure route plotted';
    for (const group of shown) {
      const route = group.points.filter(point => !point.optional);
      if (route.length > 1) L.polyline(route.map(point => [point.latitude, point.longitude]), { color: group.color, weight: 3, opacity: .8, dashArray: '5 8', className: 'visit-order-line' }).addTo(layers);
    }
    const groups = new Map();
    activePoints.forEach(point => {
      const key = point.latitude.toFixed(6) + ',' + point.longitude.toFixed(6);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(point);
    });
    for (const visits of groups.values()) {
      const point = visits[0];
      const label = visits.length > 1 ? '↻' : point.optional ? '☆' : point.number;
      const icon = L.divIcon({ className: 'trip-pin-wrap', html: `<div class="trip-pin ${point.photo ? 'photo-pin' : ''} ${point.optional ? 'optional-pin' : ''}" style="--pin-color:${point.color}">${point.photo ? `<img src="${escape(point.photo)}" alt="">` : ''}<span>${label}</span></div>`, iconSize: point.photo ? [44, 44] : [30, 30], iconAnchor: point.photo ? [22, 44] : [15, 15] });
      const marker = L.marker([point.latitude, point.longitude], { icon, title: point.title, keyboard: true }).bindTooltip(escape(point.title)).bindPopup(popup(point, visits), { maxWidth: 265 });
      marker.on('click', () => focusPoint(point, true));
      marker.addTo(layers);
      visits.forEach(visit => markers.set(visit.id, marker));
    }
    map.invalidateSize({ animate: false });
    fit();
    if (pendingPoint) {
      const { point, fromMap } = pendingPoint;
      pendingPoint = undefined;
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      highlight(point, fromMap && !mobile);
      if (mobile) document.getElementById('trip-map').scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' });
    }
  }
  dayButton.addEventListener('click', () => { allDays = false; render(); });
  allButton.addEventListener('click', () => { allDays = true; render(); });
  optionalInput.addEventListener('change', render);
  document.getElementById('fit-trip').addEventListener('click', () => { stopPreview(); map.closePopup(); fit(); });
  document.querySelectorAll('[data-map-stop]').forEach(button => {
    button.addEventListener('click', () => {
      const point = points.find(point => point.id === button.dataset.mapStop);
      if (point) focusPoint(point);
    });
  });
  playButton.addEventListener('click', () => {
    if (playing) { stopPreview(); return; }
    const stops = [...new Map(activePoints.filter(point => !point.optional).map(point => [point.key, point])).values()];
    if (!stops.length) return;
    playing = true;
    playButton.textContent = '■ Stop preview';
    playButton.setAttribute('aria-pressed', 'true');
    let index = 0;
    function next() {
      if (!playing) return;
      const point = stops[index++];
      if (!point) { stopPreview(); return; }
      map.flyTo([point.latitude, point.longitude], 14, { animate: !reducedMotion, duration: reducedMotion ? 0 : 1.2 });
      markers.get(point.id)?.openPopup();
      timer = setTimeout(next, 2400);
    }
    next();
  });
  window.addEventListener('hashchange', () => { allDays = !selectedDay(); render(); });
  render();
})();
