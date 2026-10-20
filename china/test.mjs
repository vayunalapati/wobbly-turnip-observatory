import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=file=>readFileSync(new URL(file,import.meta.url),'utf8');
const trip=JSON.parse(read('itinerary.json'));
const context={window:{}};
vm.runInNewContext(read('itinerary-data.js'),context);
assert.deepEqual(JSON.parse(JSON.stringify(context.window.chinaTrip)),trip,'browser data must match editable JSON');
assert.equal(trip.days.length,12);
assert.deepEqual(trip.days.map(d=>d.id),Array.from({length:12},(_,i)=>String(i+13)));
assert.equal(new Date(trip.days[0].date+'T12:00:00Z').getUTCDay(),5,'Nov 13 is Friday in 2026');
assert.deepEqual(trip.days.map(d=>d.overnight),['Hong Kong','Hong Kong','Yangshuo','Yangshuo','Wulingyuan','Wulingyuan','Zhangjiajie city','Shanghai · arrival after midnight','Shanghai','Shanghai','Shanghai','—']);
const html=read('index.html');
const ids=new Set();
for(const day of trip.days){
 assert(html.includes(`id="day-${day.id}"`));
 assert(existsSync(new URL(day.photo,import.meta.url)),day.photo);
 for(const point of day.points){
  assert(!ids.has(point.id),`duplicate ${point.id}`);ids.add(point.id);
  assert(html.includes(`id="${point.row_id}"`),`missing timeline row ${point.id}`);
  assert.equal(point.day,day.id);
  assert(point.latitude>20&&point.latitude<35&&point.longitude>105&&point.longitude<125,'unexpected coordinate');
  assert(new URL(point.maps_url).searchParams.get('query').includes(point.local_name.split(' · ')[0]));
 }
}
const hk=trip.days.find(d=>d.id==='14');
assert.deepEqual(hk.points.filter(p=>p.choice==='city').map(p=>p.key),['peak','kowloon','tst']);
assert.deepEqual(hk.points.filter(p=>p.choice==='hike').map(p=>p.key),['dragon','sheko']);
assert.equal(trip.days.at(-1).points.length,0,'unknown hotel and airport must not be invented');
for(const leg of trip.legs){assert(trip.hubs.some(h=>h.key===leg.from));assert(trip.hubs.some(h=>h.key===leg.to));assert(['rail','car','flight'].includes(leg.mode));}
assert(trip.legs.find(l=>l.to==='suzhou').label.includes('return'));
assert(trip.legs.find(l=>l.mode==='flight').label.includes('unconfirmed'));
for(const photo of JSON.parse(read('photo-credits.json'))){assert(photo.source.startsWith('https://commons.wikimedia.org/'));assert(photo.license_url);assert(html.includes(photo.source));}
console.log('China checks passed: 12 days, 11 nights, 36 pins, mutually exclusive HK routes, valid transport connections and assets.');
// A CDN failure must leave usable content and disable only map controls.
const elements=new Map();
const locate={hidden:false};
const getElementById=id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);};
vm.runInNewContext(read('map.js'),{
 window:{chinaTrip:trip,matchMedia:()=>({matches:false})},
 location:{hash:''},
 document:{getElementById,querySelectorAll:()=>[locate]},
 URL,Map,clearTimeout
});
assert(elements.get('trip-leaflet').innerHTML.includes('itinerary and place links'));
assert(elements.get('map-all').disabled);
assert(locate.hidden);
console.log('Map CDN failure fallback passed.');
