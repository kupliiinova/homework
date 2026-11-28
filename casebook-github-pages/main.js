const paths={
paw:'<ellipse cx="6" cy="10" rx="2" ry="3" transform="rotate(-26 6 10)"/><ellipse cx="10" cy="6" rx="2" ry="3"/><ellipse cx="16" cy="6" rx="2" ry="3"/><ellipse cx="20" cy="11" rx="2" ry="3" transform="rotate(22 20 11)"/><path d="M6 17c1-3 4-6 7-6s7 4 7 7c0 4-4 3-7 2-3 1-8 2-7-3z"/>',
phone:'<path d="m6 3 4 4-2 3c2 3 3 4 6 6l3-2 4 4-2 3C12 23 1 12 3 5z"/>',
file:'<path d="M3 6h7l2 2h9v12H3z"/><path d="M3 6V4h8l2 2h7v2"/>',
quiz:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 12l3 3 5-6"/>',
search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/>',
puzzle:'<path d="M3 5h6c-2-5 6-5 4 0h6v6c5-2 5 5 0 4v5h-6c2-5-6-5-4 0H3v-6c5 2 5-6 0-4z"/>',
mail:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
heart:'<path d="M12 21 3.8 12.5C-2 5.3 7.3-.4 12 7c4.7-7.4 14-1.7 8.2 5.5z"/>',
book:'<path d="M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2zM12 6v15"/>',
wave:'<path d="M2 10v4m4-7v10m4-13v16m4-12v8m4-11v14m4-9v4"/>',
lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'
};
function icon(name){return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="'+(name==='paw'?'currentColor':'none')+'" stroke="currentColor" stroke-width="'+(name==='paw'?0:1.65)+'" stroke-linecap="round" stroke-linejoin="round">'+paths[name]+'</svg>'}
document.querySelector('[data-icon]').innerHTML=icon('paw');
const games=['Проверка на звание лучшей мамы','Кабинет Комиссара Мяу','Архив путешествий','Восстановить секретное воспоминание','Засекреченные признания','Поймать сердечки'];
const instructions=['Ответьте на семь вопросов о вас и вашей дочери. Любой ответ приблизит вас к первой печати.','Осмотрите кабинет и найдите пять предметов, связанных с вами. Нажимайте на вещи, чтобы изучить их.','Откройте все пять городов на карте и загляните в каждый семейный альбом.','Разложите девять фрагментов по местам. Выберите фрагмент и его клетку или перетащите его.','Проведите пальцем по золотистому слою и прочитайте три послания от дочки.','Поймайте 15 сердечек. Можно играть в своём темпе или включить режим без движения.'];
const symbols=['quiz','search','map','puzzle','mail','heart'];
const key='tatiana-casebook-v1';
const initial=()=>({scene:'incoming',stamps:0,game:{}});
let data=initial(), returning=false;
try{const prior=JSON.parse(localStorage.getItem(key));if(prior&&Number.isInteger(prior.stamps)&&prior.stamps>=0&&prior.stamps<=6&&['incoming','intro','cover','rules','game','passport','envelope','video','card'].includes(prior.scene)){data=prior;returning=prior.scene!=='incoming'}}catch{}
const main=document.querySelector('main');
function save(){try{localStorage.setItem(key,JSON.stringify(data))}catch{}}
function go(scene){returning=false;data.scene=scene==='next'?'rules':scene;save();if(data.scene==='card') startMusic();render();main.focus({preventScroll:true});window.scrollTo(0,0)}
function collage(){return `<div class="collage" aria-label="Портрет Комиссара Мяу из личного дела"><div class="behind"></div><div class="slip"><span>АРХИВ • 001</span><div class="bars"></div></div><div class="portrait"><i class="tape"></i><div class="gridphoto"><img src="media/commissioner.png" alt="Рыжий кот в шляпе и плаще с лупой"></div><div class="signature">Комиссар Мяу</div></div><div class="roundseal" aria-hidden="true"><small>СЕМЕЙНОЕ БЮРО</small>${icon('paw')}<small>ЛИЧНОЕ ДЕЛО</small></div><span class="scrawl" aria-hidden="true">главный следователь</span></div>`}
function passportStrip(){return `<aside class="strip" aria-label="Прогресс расследования"><div class="strip-title"><span class="passport-icon">${icon('book')}</span><div><strong>Паспорт агента</strong><small>Печатей собрано: ${data.stamps} из 6</small></div></div><div class="track">${symbols.map((s,i)=>`<span title="${games[i]}" class="${i<data.stamps?'ink':''}">${icon(s)}</span>`).join('')}</div></aside>`}
function folder(content){return `<div class="folder-wrap"><div class="foldertab">${icon('file')} ДЕЛО № 001</div><div class="folder"><div class="holes" aria-hidden="true"><i></i><i></i><i></i></div><div class="story">${content}</div>${collage()}</div></div>${passportStrip()}`}
function action(label,target,symbol=''){return '<button class="primary" data-go="'+target+'">'+(symbol?icon(symbol):'')+label+'</button>'}
function isPhone() {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|Kindle|Silk\//i.test(ua)) return false;
  if (/iPhone|iPod|Windows Phone|Android.*Mobile/i.test(ua)) return true;
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') return navigator.userAgentData.mobile;
  // Some mobile browsers request desktop pages. Keep small touch devices usable in either orientation.
  return navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches &&
    Math.min(screen.width, screen.height) < 600 && !/Windows NT|CrOS/i.test(ua);
}
function renderPhoneNotice() {
  main.className='device-notice';
  main.innerHTML=`<article class="phone-letter"><div class="foldertab">${icon('file')} ДЕЛО № 001</div><div class="phone-paper"><div class="phone-portrait"><img src="media/commissioner.png" alt=""><span>Комиссар Мяу</span></div><div><p class="eyebrow">ЛИЧНО ДЛЯ ТАТЬЯНЫ</p><h1>Откройте историю<br><em>на телефоне</em></h1><p class="phone-instruction">Откройте на телефоне ссылку из приглашения. Комиссар Мяу ждёт вашего ответа.</p></div></div></article>`;
}
// One soundtrack for the whole visit, independent of scene rendering.
const music = new Audio();
music.loop = true;
music.preload = 'none';
music.src = 'media/george-street-shuffle.mp3';
let musicContext, musicGain;
function mixMusic() {
  const speaking = [...main.querySelectorAll('audio,video')].some(el => !el.paused && !el.ended && !el.error);
  const level = speaking ? 0.025 : 0.11;
  if (musicGain) musicGain.gain.setTargetAtTime(level,musicContext.currentTime,0.35);
  else music.volume = level;
}
function startMusic() {
  if (!isPhone() || data.scene==='video' || main.querySelector('.end-opening') || document.hidden) return;
  if (!musicContext && window.AudioContext) {
    musicContext = new AudioContext();
    musicGain = musicContext.createGain();
    musicGain.gain.value = 0;
    musicContext.createMediaElementSource(music).connect(musicGain).connect(musicContext.destination);
  }
  if (musicContext?.state === 'suspended') musicContext.resume().catch(()=>{});
  if (music.paused) music.play().catch(()=>{});
  mixMusic();
}
main.addEventListener('click',event=>{
  const target=event.target.closest('[data-go],[data-end-go]');
  if(target && (target.dataset.go==='video' || target.dataset.endGo==='video')) music.pause();
  else startMusic();
},true);
for (const event of ['play','pause','ended','error']) main.addEventListener(event,mixMusic,true);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) music.pause();
  else if(music.currentTime>0) startMusic();
});
function playCommissionerCall() {
  const message = main.querySelector('.call-outcome');
  const recording = document.createElement('audio');
  message.before(recording);
  function unavailable() {
    if (!recording.isConnected || recording.ended || message.childElementCount) return;
    message.innerHTML = '<p>Не удалось воспроизвести звонок.</p>' + action('Вернуться к звонку','incoming');
    message.querySelector('button').onclick = () => go('incoming');
  }
  recording.onended = () => {
    if (!recording.isConnected) return;
    message.innerHTML = action('Открыть дело','cover','file');
    message.querySelector('button').onclick = () => go('cover');
  };
  recording.onerror = unavailable;
  recording.src = 'media/commissioner-call.mp3';
  recording.play().catch(unavailable);
}
function render(){
if (!isPhone()) { renderPhoneNotice(); return; }
const scene=data.scene,n=Math.min(data.stamps,5);
if(scene==='video') music.pause();
main.className=(returning||['incoming','intro','cover','rules'].includes(scene))?'paper-shell':'play-shell';
if(returning){main.innerHTML=folder(`<div class="eyebrow">ЛИЧНОЕ ДЕЛО ТАТЬЯНЫ</div><h1>${data.stamps===6?'Все печати собраны':'С возвращением, Татьяна!'}</h1><p>В паспорте сохранено печатей: ${data.stamps} из 6.</p>${action('Продолжить',scene)} <button class="plain" id="restart">Начать заново</button>`);document.querySelector('#restart').onclick=()=>{if(confirm('Начать с первого звонка? Сохранённое прохождение будет сброшено.')){data=initial();go('incoming')}}}
else if(scene==='incoming'){main.innerHTML=folder(`<div class="eyebrow"><i class="livelight"></i> ВХОДЯЩИЙ ЗВОНОК</div><h1>Операция<br><em>«Лучшая мама»</em></h1><div class="little-rule"><i></i>✦<i></i></div><p>Татьяна, вам звонит Комиссар Мяу.<br>У него для вас особо важное семейное дело.</p>${action('Ответить','intro','phone')}<div class="to-line">Лично в руки <span>Татьяне</span></div>`)}
else if(scene==='intro'){main.innerHTML=folder(`<div class="eyebrow">${icon('wave')} НА СВЯЗИ</div><h1 class="smaller">Комиссар Мяу <em>слушает!</em></h1><div class="transcript"><p>«Татьяна? На связи Комиссар Мяу, великий следователь по особо важным семейным делам.</p><p>В деле номер ноль-ноль-один упоминается лучшая мама в мире. Все улики указывают на вас.</p><p>Я уже поставил печать… Ой. По инструкции сначала полагается провести шесть проверок. Пройдёте их — получите все печати и узнаете, что скрывается в деле».</p></div><div class="call-outcome" aria-live="polite"></div>`);playCommissionerCall()}
else if(scene==='cover'||scene==='rules'){main.innerHTML=folder(`<div class="eyebrow">ИСПЫТАНИЕ 0${n+1} / 06</div><h1 class="smaller">${games[n]}</h1><p>${instructions[n]}</p>${action(n?'Приступить':'Начать расследование','game',symbols[n])}`)}
else if(scene==='game'){main.innerHTML='<section id="gameHost"></section>';window.playGame(n+1,main.firstElementChild,data.game,save,()=>{if(data.scene!=='game')return;data.stamps=n+1;data.game={};go('passport')})}
else {main.innerHTML='<section id="endingHost"></section>';window.showEnding(scene,main.firstElementChild,data.stamps,go)}
mixMusic();
main.querySelectorAll('[data-go]').forEach(button=>button.onclick=()=>go(button.dataset.go));
}
render();

