import {categories,devices,scenes,deviceStatus,consumption} from './state.js';
import {icon} from './icons.js';

// The tablet is a second view of the same simulation, never a separate state store.
export function createTablet({getState,onChange,onScene,onReset}) {
 const root=document.getElementById('tablet-panel');
 const rooms=[...new Set(devices.map(d=>d.room))];
 root.innerHTML=`<div class="tablet-intro"><div><b>Vaš dom. Na jednom zaslonu.</b><span>Isprobajte upravljanje kao na kućnom tabletu ili mobitelu.</span></div><div class="device-size" role="group" aria-label="Format upravljačkog zaslona"><button data-size="tablet" aria-pressed="true">Tablet</button><button data-size="phone" aria-pressed="false">Mobitel</button></div></div>
 <div class="tablet-shell"><div class="tablet-camera" aria-hidden="true"></div><div class="tablet-screen">
 <header class="tablet-header"><div class="tablet-brand">${icon('home')}<span>NORDIC <b>180</b><small>MOJ PAMETNI DOM</small></span></div><span class="tablet-connection"><i></i> Demo sustava</span><button class="tablet-reset" id="tablet-reset" title="Vrati demo na početne postavke">↺ <span>Reset</span></button></header>
 <div class="tablet-greeting"><div><p>ORIGIN HOME</p><h2 id="tablet-title">Dobro došli kući.</h2><span id="tablet-subtitle">Sve je na svom mjestu.</span></div><div class="tablet-home-state">${icon('hub')}<span><b>25 uređaja</b>Jedan povezan dom</span></div></div>
 <div class="tablet-alert" id="tablet-alert" role="status" hidden></div>
 <div class="tablet-overview">
 <section class="tablet-climate" aria-labelledby="tablet-climate-title"><div class="tablet-tile-heading">${icon('temperature')}<h3 id="tablet-climate-title">Klima doma</h3><span>ZADANO</span></div><div class="tablet-thermostat"><button data-temp="-0.5" aria-label="Smanji temperaturu">−</button><div class="temperature-dial"><output id="tablet-temperature">22 <small>°C</small></output><span>Željena temperatura</span></div><button data-temp="0.5" aria-label="Povećaj temperaturu">+</button></div><p id="tablet-heating">Podno grijanje uključeno</p></section>
 <section class="tablet-security" aria-labelledby="tablet-security-title"><div class="tablet-tile-heading">${icon('shield')}<h3 id="tablet-security-title">Sigurnost</h3></div><strong id="tablet-security-status">Dobro došli.</strong><p id="tablet-security-note">Ulazna vrata su otključana.</p><div class="tablet-quick-controls"><button data-quick="lock">${icon('lock')}<span>Zaključaj ulaz</span></button><button data-quick="alarm">${icon('shield')}<span>Uključi alarm</span></button></div></section>
 <section class="tablet-energy" aria-labelledby="tablet-energy-title"><div class="tablet-tile-heading">${icon('bolt')}<h3 id="tablet-energy-title">Energija</h3><span>DEMO</span></div><div class="tablet-power"><output id="tablet-consumption">1,65</output><span>kW<small>Potrošnja doma</small></span></div><dl><div><dt>${icon('sun')} Solarno</dt><dd id="tablet-solar">3,4 kW</dd></div><div><dt>${icon('battery')} Baterija</dt><dd id="tablet-battery">68 %</dd></div></dl></section>
 </div>
 <section class="tablet-scenes" aria-labelledby="tablet-scenes-title"><div class="tablet-section-title"><h3 id="tablet-scenes-title">Jedan dodir, cijeli dom.</h3><span>SCENARIJI</span></div><div class="tablet-scene-grid">${scenes.map(s=>`<button data-tablet-scene="${s.id}" aria-pressed="false">${icon(s.icon)}<span>${s.name}</span></button>`).join('')}</div></section>
 <section class="tablet-devices" aria-labelledby="tablet-devices-title"><div class="tablet-section-title"><h3 id="tablet-devices-title">Uređaji i prostorije <span id="tablet-count">25</span></h3><label class="tablet-room-label">Prostorija<select id="tablet-room"><option value="all">Cijeli dom</option>${rooms.map(r=>`<option>${r}</option>`).join('')}</select></label></div><div class="tablet-filters" role="group" aria-label="Vrsta uređaja">${categories.map(c=>`<button data-tablet-category="${c.id}" aria-pressed="${c.id==='all'}">${c.label}</button>`).join('')}</div><div class="tablet-device-grid">${devices.map(deviceCard).join('')}</div><p class="tablet-empty" hidden>U ovoj prostoriji nema uređaja odabrane vrste. Odaberite „Sve” ili drugu prostoriju.</p></section>
 <footer class="tablet-footer"><span><i></i> Promjene se prikazuju i na 3D kući.</span><span>Origin Home · interaktivni koncept</span></footer>
 <div id="tablet-feedback" class="tablet-feedback" role="status" aria-live="polite">Odaberite uređaj ili scenarij i pogledajte kako dom reagira.</div></div></div><p class="tablet-disclaimer">Ogledno Origin sučelje inspirirano upravljačkim panelima pametnog doma. Nije službena aplikacija Google Home ili Amazon Alexa i ne upravlja stvarnim uređajima. Energetske vrijednosti su ilustrativne.</p>`;
 function deviceCard(d) {
  let control='';
  if(d.type==='range')control=`<label class="tablet-range-label" for="tablet-range-${d.id}">${d.id==='blinds'?'Spuštenost sjenila':d.id==='thermostat'?'Zadana temperatura':'Jačina svjetla'}</label><input id="tablet-range-${d.id}" data-range="${d.id}" type="range" min="${d.min}" max="${d.max}" step="${d.id==='thermostat'?'.5':'1'}" value="${d.initial}"><div class="tablet-range-ends"><span>${d.min} ${d.unit}${d.id==='blinds'?' · otvoreno':''}</span><span>${d.max} ${d.unit}${d.id==='blinds'?' · zatvoreno':''}</span></div>`;
  else if(d.type==='toggle')control=`<button class="tablet-toggle" data-toggle="${d.id}" role="switch" aria-label="${d.name}" aria-checked="false"><span>Uključi</span><i aria-hidden="true"></i></button>`;
  else if(d.type==='sensor')control=`<button class="tablet-sensor" data-sensor="${d.id}">${d.action}</button>`;
  else control=`<p class="tablet-readonly">${d.type==='meter'?'Vrijednost prati uključene potrošače.':'Povezuje uređaje i izvršava scenarije.'}</p>`;
  return `<article class="tablet-device" data-card="${d.id}"><div class="tablet-card-top"><span class="tablet-device-icon">${icon(d.icon)}</span><output data-status="${d.id}"></output></div><h4>${d.name}</h4><p class="tablet-location">${d.room}</p><div class="tablet-card-control">${control}</div><details><summary>Kako radi</summary><p>${d.desc}</p><p>${d.automation}</p></details></article>`;
 }
 let filter='all';
 function filterCards(){const room=root.querySelector('#tablet-room').value;let count=0;for(const d of devices){const show=(filter==='all'||d.cat===filter)&&(room==='all'||room===d.room);root.querySelector(`[data-card="${d.id}"]`).hidden=!show;if(show)count++;}root.querySelector('#tablet-count').textContent=count;root.querySelector('.tablet-empty').hidden=count>0;}
 root.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  const s=getState();
  if(b.dataset.toggle)onChange(b.dataset.toggle,!s.values[b.dataset.toggle]);
  else if(b.dataset.sensor)onChange(b.dataset.sensor,!s.values[b.dataset.sensor]);
  else if(b.dataset.quick)onChange(b.dataset.quick,!s.values[b.dataset.quick]);
  else if(b.dataset.temp)onChange('thermostat',s.values.thermostat+Number(b.dataset.temp));
  else if(b.dataset.tabletScene)onScene(b.dataset.tabletScene);
  else if(b.dataset.tabletCategory){filter=b.dataset.tabletCategory;root.querySelectorAll('[data-tablet-category]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filterCards();}
  else if(b.dataset.size){root.classList.toggle('phone-preview',b.dataset.size==='phone');root.querySelectorAll('[data-size]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
  else if(b.id==='tablet-reset')onReset();
 });
 root.addEventListener('input',e=>{if(e.target.dataset.range)onChange(e.target.dataset.range,Number(e.target.value));});
 root.querySelector('#tablet-room').addEventListener('change',filterCards);
 function update(s){const v=s.values;
  root.querySelector('#tablet-title').textContent=scenes.find(x=>x.id===s.scene)?.title||'Vaš dom, vaše postavke.';
  root.querySelector('#tablet-subtitle').textContent=s.alert?'Provjerite upozorenje sustava.':s.scene==='away'?'Sve je spremno za vaš odlazak.':'Rasvjeta, udobnost i sigurnost pod vašom kontrolom.';
  const alert=root.querySelector('#tablet-alert');alert.hidden=!s.alert;alert.textContent=s.alert;
  root.querySelector('#tablet-temperature').innerHTML=`${v.thermostat.toLocaleString('hr-HR')} <small>°C</small>`;
  root.querySelector('#tablet-heating').textContent=v.window?'Otvoren prozor · grijanje i klima pauzirani':v.floor?'Podno grijanje uključeno':'Podno grijanje isključeno';
  root.querySelector('[data-temp="-0.5"]').disabled=v.thermostat<=16;root.querySelector('[data-temp="0.5"]').disabled=v.thermostat>=26;
  root.querySelector('#tablet-security-status').textContent=s.alert?'Potrebna je pažnja':v.alarm?(s.alarmMode==='perimeter'?'Noćna zaštita':'Alarm je aktivan'):'Alarm je neaktivan';
  root.querySelector('#tablet-security-note').textContent=v.lock?'Ulazna vrata su zaključana.':'Ulazna vrata su otključana.';
  for(const id of ['lock','alarm']){const b=root.querySelector(`[data-quick="${id}"]`);b.querySelector('span').textContent=id==='lock'?(v.lock?'Otključaj ulaz':'Zaključaj ulaz'):(v.alarm?'Isključi alarm':'Uključi alarm');b.setAttribute('aria-pressed',String(v[id]));}
  root.querySelector('#tablet-consumption').textContent=consumption(s);root.querySelector('#tablet-solar').textContent=v.solar?(s.night?'0 kW · noć':'3,4 kW'):'Isključeno';root.querySelector('#tablet-battery').textContent=v.battery?'68 %':'Isključeno';
  root.querySelectorAll('[data-tablet-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tabletScene===s.scene)));
  for(const d of devices){const card=root.querySelector(`[data-card="${d.id}"]`);card.classList.toggle('is-on',d.type==='range'?Number(v[d.id])>d.min:!!v[d.id]);card.classList.toggle('is-alert',d.type==='sensor'&&!!v[d.id]);card.querySelector('[data-status]').textContent=deviceStatus(d,s);const range=card.querySelector('[data-range]');if(range){range.value=v[d.id];range.setAttribute('aria-valuetext',deviceStatus(d,s));range.style.setProperty('--fill',((v[d.id]-d.min)/(d.max-d.min)*100)+'%');}const toggle=card.querySelector('[data-toggle]');if(toggle){toggle.setAttribute('aria-checked',String(v[d.id]));toggle.querySelector('span').textContent=v[d.id]?'Uključeno':'Isključeno';if(['lock','window','valve','alarm'].includes(d.id))toggle.querySelector('span').textContent=deviceStatus(d,s);}const sensor=card.querySelector('[data-sensor]');if(sensor){sensor.textContent=v[d.id]?'Poništi test':d.action;sensor.setAttribute('aria-pressed',String(v[d.id]));}}
 }
 update(getState());
 return {update};
}
