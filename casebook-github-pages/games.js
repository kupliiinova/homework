(() => {
  'use strict';
  const questions = [
    ['С чего лучше начать утро вдвоём?', 'С фильтр-кофе', 'С чашки пуэра', 'С разговора, пока чайник греется'],
    ['С чем мама скорее всего попросит дочку помочь?', 'Разобраться с телефоном', 'Найти потерянную вещь', 'Решить, что надеть'],
    ['Что у дочки больше всего похоже на маму?', 'Выражение лица, когда что-то не нравится', 'Ответственность', 'Умение стоять на своём'],
    ['Что мама помнит о детстве дочки лучше самой дочки?', 'Какая игрушка была у неё любимой', 'Как она смешно произносила некоторые слова', 'Что она вытворяла, когда в доме вдруг становилось тихо'],
    ['Что из маминого дочка охотнее всего забрала бы себе?', 'Способ сохранить спокойствие, когда всё идёт не по плану', 'Умение стоять на своём', 'Терпеливость'],
    ['Как мама понимает, что дочке нужна поддержка?', 'По голосу', 'По сообщению «Мам, можешь поговорить?»', 'Ещё до того, как дочка сама это поняла'],
    ['Как лучше всего провести день, если у нас наконец-то обеих выходной?', 'Пойти гулять без плана', 'Смотреть весь вечер фильм', 'Болтать без остановки']
  ];
  const ink = {
    phone: '<path fill="#28231e" d="m12 52 10-24 33 1 10 24-4 5-45 1z"/><path fill="#514438" d="M9 20q1-12 28-13 28-1 29 11l-1 9-12 1-4-9-23 1-4 9-13-2z"/><ellipse cx="38" cy="38" rx="12" ry="10" fill="#b3996d"/><ellipse cx="38" cy="38" rx="6" ry="5" fill="#463a2a"/>',
  };
  // Positions in the original 76 × 68 illustration coordinate system.
  const frames={coffee:[14,6,52,55],tea:[13,16,46,37],photo:[8,12,56,42],letter:[4,16,67,42]};
  function draw(key) {
    const svg='<svg class="evidence-drawing" viewBox="0 0 76 68" aria-hidden="true"';
    if(key==='phone')return svg+' fill="none" stroke="#59442c" stroke-width="1.5" stroke-linejoin="round">'+ink.phone+'</svg>';
    const [x,y,width,height]=frames[key];
    return svg+'><image x="'+x+'" y="'+y+'" width="'+width+'" height="'+height+'" href="media/office-'+key+'.webp"/></svg>';
  }
  const objects = [
    ['phone','Телефон','Один звонок — и можно поговорить обо всём на свете.',20,84,33,61,'wide'],
    ['coffee','Фильтр-кофе','Хороший повод сделать паузу и продолжить разговор.',75,80,51,66,'both'],
    ['tea','Пуэр','Знакомый чай для неспешного вечера.',42,69,56,37,'both'],
    ['photo','Фотография из поездки','У нас есть места, которые мы вспоминаем вместе.',62,26,37,23,'both'],
    ['letter','Письмо','Некоторые мамины советы остаются с тобой надолго.',83,83,84,73,'both'],
    ['lamp','Лампа','',31,38,17,49,'none'],
    ['books','Книги','',33,66,70,38,'none'],
    ['clock','Часы','',72,67,69,20,'none']
  ];
  const cities=['Санкт-Петербург','Москва','Ессентуки','Хабаровск','Комсомольск-на-Амуре'];
  const notes=[
    ['Поддержка','Мама, даже когда мы далеко друг от друга, я знаю, что могу тебе позвонить. Спасибо, что ты всегда на моей стороне.'],
    ['Сила','Спасибо, что стараешься меня защитить и веришь, что я справлюсь. Мне спокойнее от того, что ты рядом.'],
    ['Терпение','Мам, спасибо, что даёшь мне время разобраться и всегда готова выслушать. С тобой можно начать разговор с самого начала.']
  ];
  const mapArt='<svg class="travel-ink" viewBox="0 0 800 350" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="atlas-grid" width="42" height="36" patternUnits="userSpaceOnUse"><path d="M42 0H0V36" fill="none" stroke="#889382" stroke-width=".6"/></pattern><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" fill="none" stroke="#b19e7c" stroke-width=".55"/></pattern></defs><rect width="800" height="350" fill="#d0d8ce"/><path fill="#ded4b7" stroke="#9a9275" stroke-width="2" d="M0 109l35-8 21-42 17 11 5 27 19-3 12 19 49-13 31-27 15 6 23-23 21 13 21-37 15 10 8 28 17-5 7-21 21 17 22-38 33 16 11 21 46 5 25-15 22 21 21-7 15 21 63-1 24 13 25-11 28 21 32-4 9 19 26-11 29 15-21 25-29 4-19 25-33 2-20 28 19 12 20-9-15 45-22 25-11-25-22 17-18 34-9-7-4-42-31 4-33 36-43-7-22 17-35 3-19 19-59-22-26 15-65-19-29 15-38-22-39 5-26-17-39 13-28-15-47 12-39-27-44 8z"/><path d="m196 140 38 13 18 40 47 9 35 20m8-109 20 22 8 29 38 26m73-72-24 28 10 26 49 22m-242 55 53-24 39 9 51-20 42 12m31-10 46-17 46 12 39-26" fill="none" stroke="#99b0ac" stroke-width="2"/><rect width="800" height="350" fill="url(#atlas-grid)"/><path d="M102 98Q140 120 177 166T159 254Q381 84 657 232L694 165" fill="none" stroke="#a23f35" stroke-dasharray="4 7" stroke-width="2"/><g transform="translate(741 48)" fill="#796b55"><path d="m0-22 4 20 15 2-15 3-4 21-4-21-15-3 15-2z"/><circle r="4" fill="#e6d7b4"/></g></svg>';

  function addButton(parent, label, handler, style = 'g-action') {
    const btn = document.createElement('button');
    btn.type='button'; btn.className=style; btn.textContent=label; btn.onclick=handler; parent.append(btn);
    return btn;
  }
  function popup(root, content, closeLabel, onClose) {
    const dialog=document.createElement('dialog');
    dialog.className='g-popup'; dialog.innerHTML=content;
    addButton(dialog,closeLabel,()=>dialog.close());
    dialog.addEventListener('close',()=>{dialog.remove(); onClose();},{once:true});
    root.append(dialog);dialog.showModal();return dialog;
  }
  function quiz(root, s, save, finish) {
    s.answers??=[];
    function render() {
      const n=s.answers.length;
      if(n>=questions.length){finish();return;}
      const [question,...choices]=questions[n];
      root.innerHTML='<div class="g-sheet g-quiz"><div class="g-meta">Анкета Татьяны <span>Вопрос '+(n+1)+' / 7</span></div><div class="g-meter"><i style="width:'+((n+1)/7*100)+'%"></i></div><fieldset><legend>'+question+'</legend></fieldset></div>';
      const sheet=root.firstElementChild, group=sheet.querySelector('fieldset');
      const next=addButton(sheet,'Далее',()=>{const checked=group.querySelector(':checked'); if(!checked)return; s.answers.push(+checked.value); delete s.choice;save();render();});
      choices.forEach((text,i)=>{
        const label=document.createElement('label');label.className='g-choice';
        label.innerHTML='<input type="radio" name="mama-quiz" value="'+i+'"><span>'+text+'</span>';
        const input=label.firstElementChild;input.checked=s.choice===i;
        input.onchange=()=>{s.choice=i;save();next.disabled=false};group.append(label);
      });next.disabled=s.choice==null;
      if(n>0){group.tabIndex=-1;group.focus({preventScroll:true});}
    }
    render();
  }
  function office(root,s,save,finish) {
    s.found??=[];
    root.innerHTML='<div class="g-room"><picture><source media="(max-width:600px)" srcset="media/office-tall.jpg"><img src="media/office-wide.jpg" alt="Кабинет Комиссара с рабочим столом, лампой и бумагами"></picture></div>';
    const room=root.firstElementChild;
    objects.forEach(([id,name,desc,x,y,mx,my,art])=>{
      const btn=addButton(room,'',()=>{
        if(!desc){btn.animate([{filter:'brightness(1)'},{background:'radial-gradient(ellipse, #fff2a666, transparent 70%)',transform:'translate(-50%,-50%) rotate(3deg)'},{filter:'brightness(1)'}],{duration:450});return;}
        popup(root,'<div class="g-exhibit" data-clue="'+id+'"><img src="media/clue-'+id+'.webp" alt="'+({phone:'Дисковый телефон',coffee:'Кофейные зёрна',tea:'Рассыпной пуэр',photo:'Фотоаппарат',letter:'Конверт с сургучной печатью'})[id]+'"></div><p class="g-kicker">Вещественная улика</p><h3>'+name+'</h3><p>'+desc+'</p>','Закрыть',()=>{
          if(!s.found.includes(id))s.found.push(id);save();if(s.found.length===5)finish();
        });
      },'g-object obj-'+id+' art-'+art);
      btn.setAttribute('aria-label','Осмотреть предмет — '+name);
      btn.style.cssText='--x:'+x+'%;--y:'+y+'%;--mx:'+mx+'%;--my:'+my+'%';
      if(desc)btn.innerHTML=draw(id);
    });
  }
  const cityAlbums={
    'Ессентуки':['Вдвоём на фоне снежных гор','У деревянного домика в горах','Совместное селфи в самолёте','В кабине канатной дороги']
      .map((alt,i)=>({src:'media/essentuki-'+(i+1)+'.webp',alt})),
    'Хабаровск':['Селфи в магазине с фиолетовой плюшевой игрушкой','Портрет вдвоём на экране фотоаппарата','Селфи на празднике']
      .map((alt,i)=>({src:'media/khabarovsk-'+(i+1)+'.webp',alt})),
    'Комсомольск-на-Амуре':[
      'Вдвоём у ограды в розовой и голубой косынках',
      'Селфи у окна на веранде',
      'Совместное селфи у витрины',
      'В обнимку у бирюзовой стены',
      'Селфи втроём дома',
      'Вдвоём на фоне зелени',
      'Селфи в красной толстовке',
      'На прогулке в узорчатых косынках',
      'У цветника с зелёной игрушкой'
    ].map((alt,i)=>({src:'media/komsomolsk-'+(i+1)+'.webp',alt}))
  };
  function archive(root,s,save,finish) {
    s.visited??=[];
    root.innerHTML='<div class="g-map">'+mapArt+'</div>';
    const map=root.firstElementChild;
    cities.forEach((city,i)=>{
      const btn=addButton(map,city,()=>{
        const markVisited=()=>{
          if(!s.visited.includes(i))s.visited.push(i);
          save();btn.classList.add('visited');btn.setAttribute('aria-label',city+', альбом просмотрен');
          if(s.visited.length===cities.length)finish();
        };
        const photos=cityAlbums[city] || [];
        const seen=(s.albumViews??={})[city]??=(city==='Ессентуки' ? s.essentukiSeen || [] : []);
        const firstUnseen=photos.findIndex((_,index)=>!seen.includes(index));
        const dialog=popup(root,'<div class="album-mount"></div>','Закрыть альбом',()=>{
          unmount();
          if(photos.every((_,index)=>seen.includes(index)))markVisited();
        });
        dialog.setAttribute('aria-label','Фотоальбом — '+city);
        const unmount=window.mountCityAlbum(dialog.firstElementChild,city,photos,Math.max(0,firstUnseen),index=>{
          if(dialog.open && !seen.includes(index)){seen.push(index);save();}
        });
      },'g-pin pin-'+i);if(s.visited.includes(i)){btn.classList.add('visited');btn.setAttribute('aria-label',city+', альбом просмотрен')}
    });
  }
  function puzzle(root,s,save,finish) {
    s.fixed??=[]; s.order??=[4,1,6,8,0,5,3,7,2];let selected=null;
    function drawPiece(i, trayPiece, showPhoto) {
      const col=i%3, row=Math.floor(i/3), x=col*100, y=row*100;
      const polarity=(row+col)%2===0 ? 1 : -1;
      // Trace clockwise. Adjacent pieces traverse each shared curve in reverse.
      let px=x, py=y, path='M'+x+' '+y;
      function edge(dx,dy,bulge){
        const pt=(t,h=0)=>(px+dx*t-dy*h*bulge)+' '+(py+dy*t+dx*h*bulge);
        if(bulge)path+=' L'+pt(.38)+' C'+pt(.23,.39)+' '+pt(.77,.39)+' '+pt(.62);
        path+=' L'+pt(1);px+=dx;py+=dy;
      }
      edge(100,0,row ? -polarity : 0);
      edge(0,100,col<2 ? polarity : 0);
      edge(-100,0,row<2 ? -polarity : 0);
      edge(0,-100,col ? polarity : 0);
      path+=' Z';
      const clip=(trayPiece?'tray':'board')+'-piece-'+i;
      const pad=trayPiece?32:0;
      return '<svg aria-hidden="true" viewBox="'+[x-pad,y-pad,100+2*pad,100+2*pad].join(' ')+'"><defs><clipPath id="'+clip+'"><path d="'+path+'"/></clipPath></defs><path fill="#f5eddf" d="'+path+'"/>'+
        (showPhoto?'<image href="media/puzzle.webp" width="300" height="300" clip-path="url(#'+clip+')"/>':'')+
        '<path fill="none" stroke="#76624b" stroke-width="1.3" d="'+path+'"/></svg>';
    }
    function place(i){
      if(selected===null||s.fixed.includes(i))return;
      if(i!==selected){root.querySelector('.g-feedback').textContent='Этот фрагмент подходит к другой клетке.';return;}
      s.fixed.push(i);selected=null;save();render(s.fixed.length===9);
    }
    function select(i){
      selected=i;
      root.querySelectorAll('.g-tile').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.piece===i)));
      root.querySelector('.g-feedback').textContent='Нажмите на место для выбранного фрагмента.';
    }
    function render(reveal=false){
      root.innerHTML='<div class="g-puzzle"><section><h3>Лист воспоминания</h3><div class="g-board"></div></section><section><h3>Фрагменты</h3><div class="g-tray"></div><p class="g-feedback" role="status">Выберите фрагмент, затем его место на поле.</p></section></div>';
      const board=root.querySelector('.g-board'), tray=root.querySelector('.g-tray');
      for(let i=0;i<9;i++){
        const fixed=s.fixed.includes(i),slot=addButton(board,String(i+1),()=>place(i),'g-slot'+(fixed?' fixed':''));
        slot.innerHTML=drawPiece(i,false,fixed);slot.dataset.slot=i;slot.setAttribute('aria-label','Клетка '+(i+1)+(fixed?', собрана':''));slot.disabled=fixed;
      }
      s.order.filter(i=>!s.fixed.includes(i)).forEach(i=>{
        const tile=addButton(tray,String(i+1),()=>select(i),'g-tile');tile.innerHTML=drawPiece(i,true,true);tile.dataset.piece=i;tile.setAttribute('aria-label','Фрагмент '+(s.order.indexOf(i)+1));tile.setAttribute('aria-pressed','false');
        let origin;
        tile.onpointerdown=e=>{origin=[e.clientX,e.clientY];tile.setPointerCapture(e.pointerId)};
        tile.onpointermove=e=>{if(!origin)return;const dx=e.clientX-origin[0],dy=e.clientY-origin[1];if(Math.hypot(dx,dy)>5){tile.style.transform='translate('+dx+'px,'+dy+'px)';tile.style.zIndex=3}};
        tile.onpointerup=e=>{if(!origin)return;const moved=Math.hypot(e.clientX-origin[0],e.clientY-origin[1])>5;origin=null;tile.style.transform='';tile.style.zIndex='';if(!moved)return;const slot=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-slot]');select(i);if(slot)place(+slot.dataset.slot);};
        tile.onpointercancel=()=>{origin=null;tile.style.transform='';tile.style.zIndex=''};
      });
      if(s.fixed.length===9){
        const photo=new Image();
        photo.src='media/puzzle.webp';
        photo.alt='Осенняя фотография: мама и дочка в обнимку';
        photo.className='g-complete-photo'+(reveal?' reveal':'');
        board.append(photo);
        root.querySelector('.g-puzzle').classList.add('assembled');root.querySelector('.g-feedback').textContent='Воспоминание восстановлено!';addButton(tray.parentNode,'Получить печать',finish);}
    }
    render();
  }
  function scratch(root,s,save,finish){
    s.revealed??=[];s.masks??={};
    root.innerHTML='<div class="g-scratch"></div>';const grid=root.firstElementChild;
    const done=addButton(root,'Готово',finish);
    function render(){
      grid.replaceChildren();done.disabled=s.revealed.length!==3;
      notes.forEach(([title,text],i)=>{
        const card=document.createElement('section');card.className='g-note';
        const open=s.revealed.includes(i);card.innerHTML='<h3>'+title+'</h3><div class="g-coating"><p>'+text+'</p></div>';grid.append(card);
        if(open)return;
        const wrap=card.querySelector('.g-coating');wrap.querySelector('p').setAttribute('aria-hidden','true');
        function reveal(){if(s.revealed.includes(i))return;s.revealed.push(i);delete s.masks[i];save();render();}
        const canvas=document.createElement('canvas');canvas.width=400;canvas.height=240;canvas.setAttribute('aria-hidden','true');wrap.append(canvas);
        const ctx=canvas.getContext('2d');const mask=new Set(s.masks[i]||[]);
        if(ctx){
          const labelFont='600 18px "Golos Text", Arial, sans-serif';
          function paintCoating(){
            const grad=ctx.createLinearGradient(0,0,400,200);
            grad.addColorStop(0,'#c9ad80');grad.addColorStop(.32,'#edddba');grad.addColorStop(.64,'#d4bb91');grad.addColorStop(1,'#e4d0aa');
            ctx.fillStyle=grad;ctx.fillRect(0,0,400,240);
            ctx.strokeStyle='#fff5dd38';ctx.lineWidth=1;for(let n=-250;n<420;n+=6){ctx.beginPath();ctx.moveTo(n,0);ctx.lineTo(n+220,240);ctx.stroke();}
            // Keep the lettering proportional inside the responsive scratch surface.
            const rect=canvas.getBoundingClientRect();
            ctx.save();ctx.translate(200,120);ctx.scale(400/rect.width,240/rect.height);
            ctx.fillStyle='#473728';ctx.font=labelFont;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Стереть',0,0);ctx.restore();
            mask.forEach(k=>ctx.clearRect(k%40*10,Math.floor(k/40)*10,10,10));
          }
          paintCoating();
          document.fonts.load(labelFont,'Стереть').then(()=>{if(canvas.isConnected)paintCoating()});
          let last=null;
          function erase(e){
            const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*40,y=(e.clientY-rect.top)/rect.height*24;
            const [px,py]=last||[x,y],steps=Math.max(1,Math.ceil(Math.hypot(x-px,y-py)));
            for(let t=1;t<=steps;t++){
              const cx=px+(x-px)*t/steps,cy=py+(y-py)*t/steps;
              for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++){
                if(dx*dx+dy*dy>8)continue;
                const col=Math.floor(cx)+dx,row=Math.floor(cy)+dy,k=row*40+col;
                if(col<0||col>=40||row<0||row>=24||mask.has(k))continue;
                mask.add(k);ctx.clearRect(col*10,row*10,10,10);
              }
            }
            last=[x,y];if(mask.size>=672)reveal();
          }
          canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);last=null;erase(e)};
          canvas.onpointermove=e=>{if(last&&canvas.hasPointerCapture(e.pointerId))erase(e)};
          canvas.onlostpointercapture=()=>{last=null;if(!s.revealed.includes(i)){s.masks[i]=Array.from(mask);save();}};
        }
        addButton(card,'Открыть признание',reveal,'g-link');
      });
    }
    render();
  }
  function hearts(root,s,save,finish){
    s.hits??=0;s.still??=matchMedia('(prefers-reduced-motion:reduce)').matches;
    root.innerHTML='<div class="g-hearts"><div class="g-heart-bar"><strong aria-live="polite"></strong><label><input type="checkbox"> Без движения</label></div><div class="g-sky"></div></div>';
    const bar=root.querySelector('strong'),toggle=root.querySelector('input'),sky=root.querySelector('.g-sky');
    function update(){bar.textContent='Поймано '+s.hits+' / 15'}
    function target(col){
      const heart=addButton(sky,'♥',()=>{
        if(s.hits>=15||!heart.isConnected)return;
        s.hits++;save();update();if(s.hits>=15){finish();return;}heart.remove();target(col);
      },'g-heart');heart.setAttribute('aria-label','Поймать сердечко');heart.style.setProperty('--lane',(7+col*24+Math.random()*6)+'%');heart.style.setProperty('--delay',(-1-col*1.5)+'s');heart.style.setProperty('--speed',(5+Math.random()*3)+'s');heart.style.setProperty('--tilt',(Math.random()*25-12)+'deg');
    }
    function field(){sky.replaceChildren();sky.classList.toggle('still',s.still);for(let i=0;i<(s.still?1:4);i++)target(i);}
    toggle.checked=s.still;toggle.onchange=()=>{s.still=toggle.checked;save();field()};update();field();
  }
  const games=[quiz,office,archive,puzzle,scratch,hearts];
  window.playGame=(number,host,state,save,finish)=>{
    const titles=['Проверка на звание лучшей мамы','Кабинет Комиссара Мяу','Архив путешествий','Секретное воспоминание','Засекреченные признания','Поймать сердечки'];
    const header=document.createElement('header');header.className='g-heading';header.innerHTML='<p class=\u0022g-kicker\u0022>Дело № 001 · Испытание 0'+number+' / 06</p><h1>'+titles[number-1]+'</h1>';
    const root=document.createElement('div');root.className='case-game game-'+number;host.replaceChildren(header,root);
    games[number-1](root,state,save,finish);
  };
})();

