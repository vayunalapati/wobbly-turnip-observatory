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
assert.deepEqual(trip.days.map(d=>d.overnight),['Hong Kong','Hong Kong','Hong Kong','Yangshuo','Yangshuo','Wulingyuan','Wulingyuan','Wulingyuan','Shanghai · arrival after midnight','Shanghai','Shanghai','—']);
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
assert.deepEqual(trip.days.find(d=>d.id==='14').points.map(p=>p.key),['central','sheung','peak','kowloon','tst','ferry']);
assert.deepEqual(trip.days.find(d=>d.id==='15').points.map(p=>p.key),['dragon','sheko']);
assert.equal(trip.stays.length,4);
assert.equal(trip.stays.reduce((sum,stay)=>sum+stay.nights,0),11);
assert.equal(trip.hubs.filter(h=>!h.transit).length,4);
assert(!trip.hubs.some(h=>h.key==='suzhou'));
assert(!html.includes('Suzhou'));
assert.equal(new Date(trip.days.find(d=>d.points.some(p=>p.key==='yugarden')).date+'T12:00:00Z').getUTCDay(),0,'Yu Garden stays on Sunday, not its Monday closure');
assert(trip.days.find(d=>d.id==='21').stops.some(s=>s.title.includes('Route C')));
assert.equal(trip.days[0].points.length,0,'night arrival must not schedule sightseeing or invent a hotel transfer');
assert(trip.days[0].intro.includes('at night'));
assert.equal(trip.days.at(-1).points.length,0,'unknown hotel and airport must not be invented');
for(const leg of trip.legs){assert(trip.hubs.some(h=>h.key===leg.from));assert(trip.hubs.some(h=>h.key===leg.to));assert(['rail','car','flight'].includes(leg.mode));}
assert.equal(trip.legs.find(l=>l.mode==='flight').date,'Nov 21');
assert(trip.legs.find(l=>l.mode==='flight').label.includes('unconfirmed'));
for(const photo of JSON.parse(read('photo-credits.json'))){assert(photo.source.startsWith('https://commons.wikimedia.org/'));assert(photo.license_url);assert(html.includes(photo.source));}
console.log('Trip checks passed: 12 days, 11 nights, 4 stays, two full HK days, one Wulingyuan hotel and Sunday Yu Garden.');
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
// Sharing from localhost must still copy a public link, with only a valid day hash.
function mockElement(extra={}) {
 const attributes=new Map();const listeners={};
 return {hidden:false,textContent:'',listeners,classList:{add(){},remove(){}},setAttribute:(k,v)=>attributes.set(k,v),removeAttribute:k=>attributes.delete(k),getAttribute:k=>attributes.get(k),addEventListener:(k,v)=>listeners[k]=v,scrollIntoView(){},focus(){},select(){},...extra};
}
const panelMocks=trip.days.map(d=>mockElement({id:'day-'+d.id,querySelector:()=>({textContent:d.title})}));
const linkMocks=trip.days.map((d,i)=>mockElement({hash:'#day-'+d.id,offsetLeft:i*66,clientWidth:62}));
const viewMocks=['route','days'].map(view=>mockElement({dataset:{view}}));
const ui=new Map();const uiGet=id=>{if(!ui.has(id))ui.set(id,mockElement());return ui.get(id);};
const copied=[];
const appContext={
 document:{documentElement:{classList:{add(){}}},querySelectorAll:selector=>selector==='.day-panel'?panelMocks:selector==='.day-link'?linkMocks:viewMocks,querySelector:selector=>selector==='link[rel="canonical"]'?{href:'https://vayunalapati.github.io/wobbly-turnip-observatory/china/'}:selector==='.day-nav'?{clientWidth:350,scrollTo(){}}:uiGet(selector),getElementById:uiGet},
 window:{addEventListener(){},print(){}},location:{hash:'#day-19'},navigator:{clipboard:{writeText:async value=>copied.push(value)}},setTimeout:()=>0,clearTimeout(){}
};
vm.runInNewContext(read('app.js'),appContext);
assert(!panelMocks[6].hidden);
assert(panelMocks.filter(p=>!p.hidden).length===1);
assert.equal(linkMocks[6].getAttribute('aria-current'),'date');
await uiGet('share-button').listeners.click();
assert.equal(copied.at(-1),'https://vayunalapati.github.io/wobbly-turnip-observatory/china/#day-19');
appContext.location.hash='#bookings';appContext.showDay();
assert(panelMocks.every(p=>p.hidden));
await uiGet('share-button').listeners.click();
assert.equal(copied.at(-1),'https://vayunalapati.github.io/wobbly-turnip-observatory/china/');
appContext.navigator.clipboard.writeText=async()=>{throw new Error('clipboard blocked');};
await uiGet('share-button').listeners.click();
assert(!uiGet('share-fallback').hidden);
assert.equal(uiGet('share-url').value,'https://vayunalapati.github.io/wobbly-turnip-observatory/china/');
console.log('Day navigation, canonical sharing links and clipboard fallback passed.');
