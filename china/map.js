(() => {
  const trip = window.chinaTrip;
  const container = document.getElementById('trip-leaflet');
  const status = document.getElementById('map-status');
  const dayButton = document.getElementById('map-day');
  const allButton = document.getElementById('map-all');
  const playButton = document.getElementById('play-route');
  const fitButton = document.getElementById('fit-trip');
  const points = trip.days.flatMap(day => day.points.map(point => ({...point, color:day.color})));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const selectedDay = () => trip.days.find(day => location.hash === '#day-' + day.id);
  const modeColors = {rail:'#52775e',car:'#b0803b',flight:'#a35c65'};
  let wholeTrip = !selectedDay();
  let markers = new Map();
  let activePoints = [];
  let pendingPoint;
  let timer;
  let playing = false;
  if (!window.L) {
    container.innerHTML = '<p class="map-unavailable">The interactive map could not load. The itinerary and place links are available below. Connect to the internet and reload to see the map.</p>';
    status.textContent = 'Map unavailable · itinerary and place links still work';
    [dayButton,allButton,playButton,fitButton].forEach(button => { button.disabled = true; });
    document.querySelectorAll('.locate-stop').forEach(button => { button.hidden = true; });
    return;
  }
  const map = L.map(container,{scrollWheelZoom:false}).setView([28,115],5);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  const layers = L.layerGroup().addTo(map);
  let tileError = false;
  tiles.on('tileerror', () => { if (!tileError) { tileError = true; status.textContent += ' · some map tiles unavailable; use place links'; } });
  function stopPreview() {
    clearTimeout(timer); playing = false;
    playButton.textContent = wholeTrip ? '▶ Preview route' : '▶ Preview stops';
    playButton.setAttribute('aria-pressed','false');
  }
  function fit() {
    if (activePoints.length) map.fitBounds(activePoints.map(p => [p.latitude,p.longitude]),{padding:[45,45],maxZoom:15,animate:false});
    else map.setView(selectedDay()?.id==='13'?[22.282,114.16]:[31.2304,121.4737],11,{animate:false});
  }
  function popup(point) {
    if (point.hub) return `${point.photo ? `<img class="popup-photo" src="${escape(point.photo)}" alt="">` : ''}<div class="trip-popup"><span class="label">THE JOURNEY</span><h3>${escape(point.title)}</h3><p>${escape(point.subtitle)}</p><a href="#day-${point.day}">Open this day ↗</a></div>`;
    return `<div class="trip-popup"><span class="label">NOV ${escape(point.day)} · ${escape(point.time)}</span><h3>${escape(point.title)}</h3><p>${escape(point.local_name)}</p><p>Approximate landmark / area pin. Use the place listing to plan your actual route.</p><a href="${escape(point.maps_url)}" target="_blank" rel="noopener noreferrer">Open place in Maps ↗</a></div>`;
  }
  function highlight(point, scroll) {
    document.querySelectorAll('.map-selected').forEach(row => row.classList.remove('map-selected'));
    const row = document.getElementById(point.row_id);
    if (row) { row.classList.add('map-selected'); if (scroll) row.scrollIntoView({block:'center',behavior:reducedMotion?'instant':'smooth'}); }
    const marker = markers.get(point.id);
    if (marker) { map.setView([point.latitude,point.longitude],Math.max(map.getZoom(),14),{animate:false}); marker.openPopup(); }
  }
  function focusPoint(point, fromMap = false) {
    stopPreview(); wholeTrip = false; pendingPoint = {point,fromMap};
    if (location.hash !== '#day-' + point.day) location.hash = 'day-' + point.day;
    else render();
  }
  function render() {
    stopPreview(); tileError = false;
    const day = selectedDay();
    wholeTrip = wholeTrip || !day;
    activePoints = wholeTrip ? trip.hubs.filter(p => !p.transit).map((p,i) => ({...p,hub:true,id:'hub-'+p.key,number:i+1,color:'#3d6654'})) : day.points.map(p => ({...p,color:day.color}));
    layers.clearLayers(); markers = new Map();
    dayButton.disabled = !day;
    dayButton.setAttribute('aria-pressed',String(!wholeTrip));
    allButton.setAttribute('aria-pressed',String(wholeTrip));
    document.getElementById('map-title').textContent = wholeTrip ? 'Follow the journey.' : day.title;
    status.textContent = wholeTrip ? `${trip.stays.length} stays · Nov 13–24 · 11 nights` : activePoints.length ? `${activePoints.length} stops · Nov ${day.id}` : day.id==='13' ? 'Night arrival · airport & hotel details needed; no arrival route plotted' : 'Flight & hotel details needed · no departure route plotted';
    playButton.disabled = !activePoints.length;
    document.querySelector('.map-day-legend').hidden = !wholeTrip;
    document.getElementById('map-explainer').textContent = wholeTrip ? 'Dashed lines show planned connections, not actual rail or road routes. Services are unconfirmed. Select a destination to explore its days. Small dots mark transfer points.' : 'Numbered pins show visit order. Dashed lines are schematic, not walking, cycling, road, or trail routes. Hotel and airport locations await booking details.';
    if (wholeTrip) {
      for (const leg of trip.legs) {
        const a = trip.hubs.find(h => h.key===leg.from), b = trip.hubs.find(h => h.key===leg.to);
        L.polyline([[a.latitude,a.longitude],[b.latitude,b.longitude]],{color:'#fff',weight:8,opacity:.85}).addTo(layers);
        L.polyline([[a.latitude,a.longitude],[b.latitude,b.longitude]],{color:modeColors[leg.mode],weight:4,opacity:1,dashArray:leg.mode==='flight'?'3 10':'7 7'}).bindTooltip(escape(leg.date+' · '+leg.label),{sticky:true}).addTo(layers);
      }
      for (const hub of trip.hubs.filter(hub => hub.transit)) {
        L.circleMarker([hub.latitude,hub.longitude],{radius:4,color:'#fff',weight:2,fillColor:'#7b8177',fillOpacity:1}).bindTooltip(escape(hub.title+' · transfer point')).addTo(layers);
      }
    } else if (activePoints.length > 1) {
      L.polyline(activePoints.map(p => [p.latitude,p.longitude]),{color:day.color,weight:3,opacity:.7,dashArray:'5 8'}).addTo(layers);
    }
    const groups = new Map();
    activePoints.forEach(p => {const key=p.latitude+','+p.longitude; if (!groups.has(key)) groups.set(key,[]); groups.get(key).push(p);});
    for (const visits of groups.values()) {
      const point = visits[0];
      const label = visits.length>1 ? visits.map(p => p.number).join('·') : point.number;
      const icon = L.divIcon({className:'trip-pin-wrap',html:`<div class="trip-pin ${point.photo?'photo-pin':''}" style="--pin-color:${point.color}">${point.photo?`<img src="${escape(point.photo)}" alt="">`:''}<span>${label}</span></div>`,iconSize:point.photo?[50,50]:[30,30],iconAnchor:point.photo?[25,50]:[15,15]});
      const marker = L.marker([point.latitude,point.longitude],{icon,title:point.title,keyboard:true}).bindPopup(popup(point),{maxWidth:265});
      marker.on('click',() => { if (point.hub) { location.hash='day-'+point.day; } else focusPoint(point,true); });
      if (!point.hub) marker.bindTooltip(escape(point.title));
      if (point.hub) {
        const left = ['wulingyuan','shanghai'].includes(point.key);
        const lower = ['zjjcity','yangshuo'].includes(point.key);
        marker.bindTooltip(escape(point.title), {permanent:true,direction:left?'left':'right',offset:left?[-18,point.key==='shanghai'?16:-24]:[18,lower?9:-8],className:'hub-label',opacity:1});
      }
      marker.addTo(layers); visits.forEach(p=>markers.set(p.id,marker));
    }
    map.invalidateSize({animate:false}); fit();
    if (pendingPoint) {
      const {point,fromMap}=pendingPoint; pendingPoint=undefined;
      const mobile = window.matchMedia('(max-width:760px)').matches;
      highlight(point,fromMap&&!mobile);
      if (mobile) document.getElementById('trip-map').scrollIntoView({block:'start',behavior:'instant'});
    }
  }
  allButton.addEventListener('click',()=>{wholeTrip=true;render();});
  dayButton.addEventListener('click',()=>{wholeTrip=false;render();});
  fitButton.addEventListener('click',()=>{stopPreview();map.closePopup();fit();});
  document.querySelectorAll('[data-map-stop]').forEach(button=>button.addEventListener('click',()=>{const p=points.find(p=>p.id===button.dataset.mapStop);if(p)focusPoint(p);}));
  playButton.addEventListener('click',()=>{
    if(playing){stopPreview();return;}
    const stops=[...new Map(activePoints.map(p=>[p.key,p])).values()];
    if(!stops.length)return;
    playing=true;playButton.textContent='■ Stop preview';playButton.setAttribute('aria-pressed','true');
    let index=0;
    function next(){if(!playing)return;const point=stops[index++];if(!point){stopPreview();return;}map.flyTo([point.latitude,point.longitude],wholeTrip?9:14,{animate:!reducedMotion,duration:reducedMotion?0:1.2});markers.get(point.id)?.openPopup();timer=setTimeout(next,2600);}
    next();
  });
  window.addEventListener('hashchange',()=>{wholeTrip=!selectedDay();render();});
  render();
})();
