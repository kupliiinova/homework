(() => {
  "use strict";

  const names = [
    "Тест пройден", "Улики найдены", "Архив изучен",
    "Память восстановлена", "Секрет раскрыт", "Любовь доказана"
  ];
  const symbols = [
    '<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 13 3 3 5-6"/>',
    '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6m-15-11a4 4 0 0 1 4-4"/>',
    '<path d="m2 6 7-3 6 3 7-3v15l-7 3-6-3-7 3Zm7-3v15m6-12v15"/>',
    '<path d="M3 9V4h6c-1-4 6-4 5 0h5v5c4-1 4 6 0 5v6h-5c1-4-6-4-5 0H3v-6c4 1 4-6 0-5Z"/>',
    '<rect x="2" y="5" width="20" height="15" rx="1"/><path d="m3 6 9 7 9-7m-18 13 6-6m12 6-6-6"/>',
    '<path d="M12 21C8 18 2 13 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 5-6 10-10 13Z"/>'
  ];
  const label = value => String(value).padStart(2, "0");
  const btn = (caption, next) => '<button type="button" class="end-action" data-end-go="' + next + '">' + caption + '</button>';

  function stamp(index, current) {
    const pathId = 'end-stamp-' + index;
    return `<li class="end-slot">
      <svg class="end-stamp ${current ? 'is-fresh' : ''}" viewBox="3.1 3.1 93.8 93.8" role="img" aria-label="Печать ${index + 1}. ${names[index]}">
        <defs><path id="${pathId}" d="M 13,50 A 37,37 0 1,1 87,50"/></defs>
        <circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="42" class="hair"/>
        <circle cx="50" cy="50" r="30" class="hair"/>
        <text class="end-arc"><textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${names[index].toUpperCase()}</textPath></text>
        <g transform="translate(34 34) scale(1.33)">${symbols[index]}</g>
        <text class="end-serial" x="50" y="86" text-anchor="middle">★ · ${label(index+1)} · ★</text>
      </svg></li>`;
  }

  function passport(count, fresh) {
    const finished = count === 6;
    const cells = names.map((_,i) => i < count ? stamp(i, fresh && i === count-1) :
      `<li class="end-slot"><span class="end-blank" aria-label="Место для печати ${i+1}">${label(i+1)}</span></li>`).join('');
    return `<div class="end-binding">
      <div class="end-book">
        <section class="end-leaf end-left">
          <p class="end-ref">Дело № 001</p>
          <h2>${finished ? 'Заключение расследования' : 'Паспорт секретного агента'}</h2>
          <dl class="end-reg"><div><dt>Имя</dt><dd>Татьяна</dd></div><div><dt>Печати</dt><dd>${count} из 6</dd></div></dl>
          <p class="end-result">${finished ? 'Татьяна признана лучшей мамой в мире.' : names[count-1] + '!'}</p>
          ${count === 1 ? '<p>Материнская квалификация подтверждена на 1000%.</p>' : ''}
          <span class="end-sign">Комиссар Мяу</span>
        </section>
        <section class="end-leaf end-right" aria-label="Печати за испытания"><div class="end-ledger">Отметки о прохождении</div><ol class="end-seals">${cells}</ol></section>
      </div></div>
      ${btn(finished ? 'Открыть последнюю страницу' : 'Следующее испытание',finished ? 'envelope' : 'next')}`;
  }

  function envelope() {
    return `<div class="end-pocket-page">
      <p class="end-ref">Последняя страница паспорта</p><h2>Письмо для мамы</h2>
      <div class="end-pocket-scene">
        <div class="end-envelope"><div class="end-fold"></div><button type="button" data-end-go="video" class="end-wax" aria-label="Открыть конверт"><span aria-hidden="true">♥</span></button></div>
        <div class="end-pocket"><span>Татьяне</span></div>
      </div>${btn('Открыть конверт','video')}</div>`;
  }

  function card() {
    return `<article class="end-postcard"><div class="end-postmark" aria-hidden="true">♥</div>
      <p class="end-ref">От дочери · лично в руки</p><h2>С Днём матери,<br><em>мамочка!</em></h2>
      <p class="end-note">Спасибо, что ты всегда рядом, даже когда между нами километры. Я тебя очень люблю!</p>
      <div class="end-sign">Твоя дочка</div></article>${btn('Пересмотреть поздравление','video')}`;
  }

  function videoContent() {
    return `<article class="end-film"><p class="end-ref">Вложение к делу № 001</p><h2>Видеопоздравление</h2>
      <div class="end-film-media"></div>${btn('Открыть открытку','card')}</article>`;
  }

  function loadVideo(frame) {
    const media = frame.querySelector('.end-film-media');
    const config = window.casebookVideo ?? {src:'media/video-letter.mp4', poster:'media/video-letter.jpg'};
    const fallback = text => { const p = document.createElement('p'); p.textContent = text; media.replaceChildren(p); };
    if (!config?.src) {
      fallback('Здесь будет твоё видеописьмо. А пока тебя ждёт открытка.');
      return;
    }
    const player = document.createElement('video');
    player.src = config.src;
    if (config.poster) player.poster = config.poster;
    player.controls = false;
    player.playsInline = true;
    player.preload = 'metadata';
    player.setAttribute('aria-label','Видеописьмо от дочери');
    if (config.captions) {
      const track = document.createElement('track');
      track.kind = 'captions';
      track.label = 'Русские субтитры';
      track.srclang = 'ru';
      track.src = config.captions;
      player.append(track);
    }
    player.addEventListener('error', () => {
      fallback('Видео не загрузилось.');
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'end-link';
      retry.textContent = 'Загрузить ещё раз';
      retry.onclick = () => loadVideo(frame);
      media.append(retry);
    }, {once:true});
    player.addEventListener('ended',() => { frame.querySelector('.end-action').textContent = 'Продолжить'; });
    const viewer=document.createElement('dialog');
    viewer.className='end-video-viewer';
    viewer.setAttribute('aria-label','Видеопоздравление');
    viewer.open=true;
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='end-video-toggle';
    toggle.innerHTML='<span aria-hidden="true">▶</span>';
    function syncPlayButton() {
      const paused=player.paused || player.ended;
      toggle.classList.toggle('playing',!paused);
      toggle.setAttribute('aria-label',paused?'Воспроизвести видео':'Приостановить видео');
    }
    for(const event of ['play','pause','ended']) player.addEventListener(event,syncPlayButton);
    syncPlayButton();
    function expand() {
      const from=player.getBoundingClientRect();
      media.style.minHeight=from.height+'px';
      viewer.close();
      viewer.classList.add('expanded');
      viewer.showModal();
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
        const to=player.getBoundingClientRect();
        const scale=Math.max(from.width/to.width,from.height/to.height);
        const dx=from.left+from.width/2-to.left-to.width/2;
        const dy=from.top+from.height/2-to.top-to.height/2;
        player.animate([{transform:'translate('+dx+'px,'+dy+'px) scale('+scale+')'},{transform:'none'}],
          {duration:380,easing:'cubic-bezier(.22,.68,.2,1)'});
      }
    }
    function collapseVideo() {
      player.pause();
      viewer.close();
      viewer.classList.remove('expanded');
      viewer.open=true;
      media.style.minHeight='';
      toggle.focus({preventScroll:true});
    }
    let start=null,swiped=false;
    toggle.addEventListener('pointerdown',event=>{
      swiped=false;
      if(!viewer.classList.contains('expanded') || !event.isPrimary)return;
      start={x:event.clientX,y:event.clientY,id:event.pointerId};
      toggle.setPointerCapture(event.pointerId);
    });
    toggle.addEventListener('pointercancel',()=>{start=null});
    toggle.addEventListener('pointerup',event=>{
      if(start?.id!==event.pointerId)return;
      const dy=event.clientY-start.y,dx=event.clientX-start.x;
      start=null;
      swiped=Math.max(Math.abs(dx),Math.abs(dy))>16;
      if(dy>65 && dy>Math.abs(dx)*1.25)collapseVideo();
    });
    toggle.onclick=event=>{
      if(swiped && event.detail){swiped=false;return}
      if(!viewer.classList.contains('expanded'))expand();
      if(player.paused || player.ended)player.play().catch(syncPlayButton);
      else player.pause();
    };
    viewer.addEventListener('cancel',event=>{event.preventDefault();collapseVideo()});
    viewer.append(player,toggle);
    media.replaceChildren(viewer);
  }

  window.showEnding = (scene, host, stamps, go) => {
    const count = Math.min(6, Math.max(1, Array.isArray(stamps) ? stamps.length : Number(stamps) || 1));
    let fresh = true;
    try {
      if (scene === 'passport') {
        fresh = sessionStorage.getItem('casebook:last-seal') !== String(count);
        sessionStorage.setItem('casebook:last-seal',String(count));
      }
    } catch {}
    const frame = document.createElement('section');
    frame.className = 'end-view end-view-' + scene;
    const views = {passport: () => passport(count,fresh), envelope, video: videoContent, card};
    frame.innerHTML = views[scene]();
    host.replaceChildren(frame);
    if (scene === 'video') loadVideo(frame);
    let opening = false;
    frame.addEventListener('click', e => {
      const button = e.target.closest('[data-end-go]');
      if (!button || opening) return;
      if (scene === 'envelope' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        opening = true;
        frame.classList.add('end-opening');
        setTimeout(() => { if (frame.isConnected) go('video'); }, 630);
      } else go(button.dataset.endGo);
    });
  };
})();
