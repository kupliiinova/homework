(function () {
  'use strict';

  const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const MONTHS_PREP = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
  const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  /* ---------- помощники ---------- */
  const plural = (n, one, few, many) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };
  const rub = (n) => n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';
  const sessionDate = (s) => new Date(s.date + 'T' + s.time + ':00');
  const formatDate = (s) => {
    const d = sessionDate(s);
    return d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + ', ' + WEEKDAYS[d.getDay()] + ' · ' + s.time;
  };
  const priceLabel = (f) => {
    if (f.variants && f.variants.length) return 'от ' + rub(Math.min(...f.variants.map((v) => v.price)));
    return rub(f.price) + (f.pair ? ' за пару' : '');
  };
  const lightsHtml = (left) => {
    const n = Math.min(left, 6);
    return '<span class="lights' + (left <= 3 ? ' is-low' : '') + '" aria-hidden="true">' + '<i></i>'.repeat(n) + '</span>';
  };
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Фото: если файла нет или он не загрузился — аккуратная заглушка в цветах гало */
  function photoFallback(img) {
    const ph = document.createElement('div');
    ph.className = 'photo-fallback';
    ph.textContent = img.dataset.fallback || img.alt || '';
    img.replaceWith(ph);
  }
  function watchImages(root) {
    root.querySelectorAll('img[data-fallback]').forEach((img) => {
      if (img.complete && img.naturalWidth === 0) photoFallback(img);
      else img.addEventListener('error', () => photoFallback(img), { once: true });
    });
  }

  /* ---------- данные афиши ---------- */
  const afisha = window.AFISHA;
  const contacts = window.CONTACTS || {};
  // «сегодня»: настоящая дата; страница preview.html может подставить свою (только для предпросмотра)
  const now = window.MAGIC_TODAY ? new Date(window.MAGIC_TODAY + 'T12:00:00') : new Date();

  function upcomingSessions() {
    const list = [];
    afisha.formats.forEach((f) => (f.sessions || []).forEach((s) => {
      if (sessionDate(s) > now) list.push({ format: f, session: s });
    }));
    return list.sort((a, b) => sessionDate(a.session) - sessionDate(b.session));
  }

  /* ---------- главный экран: строка фактов ---------- */
  function renderFacts() {
    const el = document.querySelector('[data-hero-facts]');
    if (!el || !afisha) return;
    let count = 0;
    let min = Infinity;
    afisha.formats.forEach((f) => {
      count += (f.sessions || []).length;
      const prices = f.variants ? f.variants.map((v) => v.price) : [f.price];
      if ((f.sessions || []).length) min = Math.min(min, ...prices);
    });
    if (!count) { el.textContent = 'Пространство творчества и самопознания'; return; }
    el.textContent = count + ' ' + plural(count, 'встреча', 'встречи', 'встреч') + ' в ' + MONTHS_PREP[afisha.month] +
      ' · от ' + rub(min) + ' · 1,5–2 часа';
  }

  /* ---------- главный экран: карточка «Ближайшее» ---------- */
  function renderNearest() {
    const box = document.querySelector('[data-nearest]');
    if (!box) return;
    box.classList.remove('is-loading');

    // Ошибка: афиша не загрузилась
    if (!afisha || !Array.isArray(afisha.formats)) {
      box.classList.add('nearest--message');
      box.innerHTML = '<p>Не получилось загрузить ближайшее мероприятие. Все встречи — в разделе ниже ↓</p>' +
        '<a class="btn btn--dark nearest__btn" href="#events">К афише</a>';
      return;
    }

    const next = upcomingSessions().find((x) => x.session.left > 0);

    // Пусто: будущих встреч с местами нет
    if (!next) {
      box.classList.add('nearest--message');
      box.innerHTML = '<p>Афиша на следующий месяц уже готовится ✦ Следите за анонсами в Telegram</p>' +
        '<a class="btn btn--dark nearest__btn" href="' + escapeHtml(contacts.telegramChannel || '#') + '" target="_blank" rel="noopener">Telegram</a>';
      const cta = document.querySelector('[data-hero-cta]');
      if (cta) { cta.textContent = 'Узнать первой'; cta.href = contacts.telegramChannel || '#'; cta.target = '_blank'; }
      return;
    }

    const f = next.format, s = next.session;
    box.innerHTML =
      '<div class="nearest__photo"><img src="img/events/' + f.id + '.jpg" alt="" data-fallback=" "></div>' +
      '<div class="nearest__info">' +
        '<span class="nearest__label">Ближайшее</span>' +
        '<span class="nearest__title">' + escapeHtml(f.title) + '</span>' +
        '<span class="nearest__meta">' + formatDate(s) + ' · ' + priceLabel(f) + '<br>' +
          lightsHtml(s.left) + 'осталось ' + s.left + ' ' + plural(s.left, 'место', 'места', 'мест') + '</span>' +
      '</div>' +
      '<a class="btn btn--dark nearest__btn" href="#events" data-book="' + f.id + '" data-date="' + s.date + '">Записаться</a>';
    watchImages(box);
  }

  /* ---------- свечение за курсором: большое мягкое пятно + маленький огонёк ---------- */
  function initGlow() {
    const hero = document.querySelector('.hero');
    if (!hero || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ease — насколько быстро догоняет курсор: пятно плывёт, огонёк идёт почти вплотную
    const followers = [
      { el: hero.querySelector('.hero__glow'), ease: 0.08, x: 0, y: 0 },
      { el: hero.querySelector('.hero__spark'), ease: 0.22, x: 0, y: 0 }
    ].filter((f) => f.el);

    let tx = 0, ty = 0, raf = null;
    const tick = () => {
      let moving = false;
      followers.forEach((f) => {
        f.x += (tx - f.x) * f.ease;
        f.y += (ty - f.y) * f.ease;
        f.el.style.transform = 'translate(' + f.x + 'px,' + f.y + 'px)';
        if (Math.abs(tx - f.x) + Math.abs(ty - f.y) > 0.5) moving = true;
      });
      raf = moving ? requestAnimationFrame(tick) : null;
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!hero.classList.contains('has-pointer')) {
        followers.forEach((f) => { f.x = tx; f.y = ty; });
        hero.classList.add('has-pointer');
      }
      if (!raf) raf = requestAnimationFrame(tick);
    });
    hero.addEventListener('pointerleave', () => hero.classList.remove('has-pointer'));
  }

  /* ---------- контакты: подставляем ссылки из CONTACTS ---------- */
  function fillContacts() {
    document.querySelectorAll('[data-contact]').forEach((a) => {
      const url = contacts[a.dataset.contact];
      if (url) a.href = url;
    });
    document.querySelectorAll('[data-contact-text]').forEach((el) => {
      el.textContent = contacts[el.dataset.contactText] || '';
    });
  }

  /* ---------- шапка ---------- */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    // логотип не загрузился — текстом тем же цветом
    const logo = header.querySelector('[data-logo]');
    if (logo) logo.addEventListener('error', () => {
      const t = document.createElement('span');
      t.className = 'site-header__logo-text';
      t.textContent = 'MAGIC';
      logo.replaceWith(t);
    }, { once: true });

    // прячется при прокрутке вниз, возвращается при прокрутке вверх
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 10);
      const menuOpen = document.body.classList.contains('menu-open');
      if (!menuOpen && Math.abs(y - lastY) > 6) {
        header.classList.toggle('is-hidden', y > lastY && y > 140);
        lastY = y;
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    // подсветка пункта текущей секции
    const links = header.querySelectorAll('[data-nav]');
    const sections = [...links].map((l) => document.getElementById(l.dataset.nav)).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((l) => l.classList.toggle('is-active', l.dataset.nav === e.target.id));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => io.observe(s));
      // над главным экраном ни один пункт не подсвечен
      const hero = document.querySelector('.hero');
      if (hero) new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) links.forEach((l) => l.classList.remove('is-active'));
      }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
    }
  }

  /* ---------- мобильное меню ---------- */
  function initMenu() {
    const menu = document.querySelector('[data-menu]');
    const burger = document.querySelector('[data-burger]');
    if (!menu || !burger) return;
    const closeBtn = menu.querySelector('[data-menu-close]');

    const open = () => {
      menu.hidden = false;
      document.body.classList.add('menu-open');
      burger.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      closeBtn.focus();
    };
    const close = (returnFocus) => {
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      setTimeout(() => { menu.hidden = true; }, 350);
      if (returnFocus) burger.focus();
    };

    burger.addEventListener('click', open);
    closeBtn.addEventListener('click', () => close(true));
    // нажатие на пункт — закрыть и прокрутить к секции
    menu.querySelectorAll('.mobile-menu__nav a').forEach((a) => a.addEventListener('click', () => close(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) close(true);
    });
    // свайп вверх закрывает меню
    let startY = null;
    menu.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    menu.addEventListener('touchend', (e) => {
      if (startY !== null && e.changedTouches[0].clientY - startY < -70 && menu.scrollTop <= 0) close(false);
      startY = null;
    });
    // если экран стал широким — меню не нужно
    matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches && !menu.hidden) close(false); });
  }

  /* =====================================================================
     МЕРОПРИЯТИЯ: каталог, лента дней, окно мероприятия, форма записи
     ===================================================================== */
  const PREPAY = 500; // предоплата за одного участника
  const dateKey = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'нояб', 'дек'];
  const shortDate = (s) => { const d = sessionDate(s); return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()] + ' · ' + s.time; };
  const upcoming = (f) => (f.sessions || []).filter((s) => sessionDate(s) > now);
  const available = (f) => upcoming(f).filter((s) => s.left > 0);
  const contactBtns = (cls) =>
    '<a class="btn ' + (cls || 'btn--dark') + ' btn--sm" href="' + escapeHtml(contacts.telegram || '#') + '" target="_blank" rel="noopener">Telegram</a>' +
    '<a class="btn btn--ghost btn--sm" href="' + escapeHtml(contacts.max || '#') + '" target="_blank" rel="noopener">Max</a>';

  let selectedDay = null;

  function cardHtml(f) {
    const up = upcoming(f);
    const inactive = up.length === 0;
    const photo = '<img src="img/events/' + f.id + '.jpg" alt="" loading="lazy" data-fallback="' + escapeHtml(f.title) + '">';
    const monthName = MONTHS_PREP[afisha.month];

    if (inactive) {
      const hadDates = (f.sessions || []).length > 0;
      return '<article class="ev-card is-inactive" data-id="' + f.id + '">' +
        '<button class="ev-card__photo" type="button" data-open="' + f.id + '" aria-label="Подробнее: ' + escapeHtml(f.title) + '">' + photo + '</button>' +
        '<div class="ev-card__body">' +
          '<h3 class="ev-card__title"><button type="button" data-open="' + f.id + '">' + escapeHtml(f.title) + '</button></h3>' +
          '<p class="ev-card__short">' + escapeHtml(f.short) + '</p>' +
          '<span class="ev-card__off">' + (hadDates ? 'В ' + monthName + ' больше не проводим' : 'В ' + monthName + ' не проводим') + '</span>' +
          (hadDates ? '<div class="ev-card__dates ev-card__dates--past">' + f.sessions.map((s) =>
            '<span class="chip is-past" aria-label="' + shortDate(s) + ', уже закончилось">' + shortDate(s) + ' · закончилось</span>').join('') + '</div>' : '') +
          '<p class="ev-card__ask">Узнайте у менеджера, когда будет</p>' +
          '<div class="ev-card__foot">' + contactBtns() + '</div>' +
        '</div></article>';
    }

    const soldOut = up.every((s) => s.left <= 0);
    // все даты месяца: прошедшие видны, но подписаны «закончилось» и не нажимаются
    const chips = (f.sessions || []).map((s) => {
      if (sessionDate(s) <= now) {
        return '<button class="chip is-past" type="button" disabled aria-label="' + shortDate(s) + ', уже закончилось">' + shortDate(s) + ' · закончилось</button>';
      }
      return '<button class="chip' + (s.left > 0 && s.left <= 3 ? ' is-low' : '') + '" type="button" data-open="' + f.id + '" data-date="' + s.date + '"' +
        (s.left <= 0 ? ' disabled' : '') + '>' + shortDate(s) + (s.left <= 0 ? ' · мест нет' : '') + '</button>';
    }).join('');
    const more = up.length > 1 ? '<span class="ev-card__more">+ ещё ' + (up.length - 1) + ' ' + plural(up.length - 1, 'дата', 'даты', 'дат') + '</span>' : '';
    const foot = soldOut
      ? '<p class="ev-card__soldout"><b>Мест нет.</b> <a href="' + escapeHtml(contacts.telegram || '#') + '" target="_blank" rel="noopener">Напишите менеджеру</a> — вдруг освободится</p>'
      : '<button class="btn btn--dark" type="button" data-open="' + f.id + '" data-to-form>Записаться</button>';

    return '<article class="ev-card" data-id="' + f.id + '" data-days="' + up.map((s) => s.date).join(' ') + '">' +
      '<button class="ev-card__photo" type="button" data-open="' + f.id + '" aria-label="Подробнее: ' + escapeHtml(f.title) + '">' + photo +
        '<span class="ev-card__plate" aria-hidden="true"><span>' + priceLabel(f) + '</span><span>Подробнее</span></span></button>' +
      '<div class="ev-card__body">' +
        '<h3 class="ev-card__title"><button type="button" data-open="' + f.id + '">' + escapeHtml(f.title) + '</button></h3>' +
        '<p class="ev-card__short">' + escapeHtml(f.short) + '</p>' +
        '<p class="ev-card__meta"><b>' + priceLabel(f) + '</b>' + (f.duration ? ' · ' + f.duration : '') + '</p>' +
        '<div class="ev-card__dates">' + chips + more + '</div>' +
        '<div class="ev-card__foot">' + foot + '</div>' +
      '</div></article>';
  }

  function renderEvents() {
    const grid = document.querySelector('[data-events-grid]');
    if (!grid) return;
    const notice = document.querySelector('[data-events-notice]');
    const inactiveBox = document.querySelector('[data-events-inactive]');
    const monthEl = document.querySelector('[data-events-month]');

    // Ошибка: афиша не загрузилась
    if (!afisha || !Array.isArray(afisha.formats)) {
      document.querySelector('[data-days]').hidden = true;
      notice.hidden = false;
      notice.innerHTML = '<p>Не получилось загрузить мероприятия. Обновите страницу или напишите менеджеру</p>' +
        '<div class="btns"><button class="btn btn--light btn--sm" type="button" onclick="location.reload()">Обновить</button>' + contactBtns('btn--light') + '</div>';
      grid.innerHTML = '';
      return;
    }

    monthEl.textContent = 'сейчас: ' + ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'][afisha.month];

    const active = afisha.formats.filter((f) => upcoming(f).length)
      .sort((a, b) => sessionDate(upcoming(a)[0]) - sessionDate(upcoming(b)[0]));
    const inactive = afisha.formats.filter((f) => !upcoming(f).length);

    // Пусто: встречи этого месяца закончились
    if (!active.length) {
      notice.hidden = false;
      notice.innerHTML = '<p>Встречи в ' + MONTHS_PREP[afisha.month] + ' закончились ✦ Афиша на следующий месяц появится совсем скоро — анонсы первыми в Telegram</p>' +
        '<div class="btns"><a class="btn btn--light btn--sm" href="' + escapeHtml(contacts.telegramChannel || '#') + '" target="_blank" rel="noopener">Открыть Telegram</a></div>';
    }

    grid.innerHTML = active.map(cardHtml).join('');

    // неактивные: на компьютере — в конце сетки, на телефоне — в раскрывающемся блоке
    if (inactive.length) {
      const mobile = matchMedia('(max-width: 860px)').matches;
      if (mobile) {
        inactiveBox.hidden = false;
        inactiveBox.outerHTML = '<details class="events__inactive" data-events-inactive><summary>Не проводим в ' + MONTHS_PREP[afisha.month] + ' (' + inactive.length + ')</summary>' +
          '<div class="events__grid">' + inactive.map(cardHtml).join('') + '</div></details>';
      } else {
        grid.insertAdjacentHTML('beforeend', inactive.map(cardHtml).join(''));
      }
    }

    watchImages(document.querySelector('.events'));
    renderDays();
    initCardSway();
  }

  /* лента дней месяца */
  function renderDays() {
    const box = document.querySelector('[data-days]');
    if (!box) return;
    const daysWithEvents = new Set();   // будущие встречи — день можно выбрать
    const daysHadEvents = new Set();    // прошедшие встречи — день виден, но не выбирается
    afisha.formats.forEach((f) => (f.sessions || []).forEach((s) => (sessionDate(s) > now ? daysWithEvents : daysHadEvents).add(s.date)));
    const total = new Date(afisha.year, afisha.month + 1, 0).getDate();
    let html = '';
    for (let d = 1; d <= total; d++) {
      const date = new Date(afisha.year, afisha.month, d);
      const key = dateKey(date);
      const past = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const has = daysWithEvents.has(key);
      const had = !has && daysHadEvents.has(key);
      html += '<button class="day' + (past || had ? ' is-past' : '') + '" type="button" data-day="' + key + '"' + (has ? '' : ' disabled') +
        ' aria-label="' + d + ' ' + MONTHS_GEN[afisha.month] + (has ? ', есть встречи' : had ? ', встречи уже закончились' : ', встреч нет') + '" aria-pressed="false">' +
        '<span class="day__num">' + d + '</span><span class="day__wd">' + WEEKDAYS[date.getDay()] + '</span>' +
        (has || had ? '<span class="day__dot"></span>' : '') + '</button>';
    }
    box.innerHTML = html;
  }

  /* горизонтальные ленты на компьютере (дни, отзывы): прокрутка колёсиком мыши и перетаскиванием */
  function initDaysScroll() {
    initHScroll(document.querySelector('[data-days]'));
  }
  function initHScroll(box) {
    if (!box || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // края растворяются только с той стороны, куда ещё можно листать
    const edges = () => {
      const max = box.scrollWidth - box.clientWidth;
      box.classList.toggle('is-scrolled', box.scrollLeft > 2);
      box.classList.toggle('is-end', box.scrollLeft >= max - 2);
    };
    box.addEventListener('scroll', edges, { passive: true });
    window.addEventListener('resize', edges);
    edges();

    // колёсико: вертикальная прокрутка превращается в горизонтальную, пока лента может двигаться.
    // Лента плавно «догоняет» цель, а не прыгает рывками.
    let target = box.scrollLeft, raf = null;
    const glide = () => {
      const diff = target - box.scrollLeft;
      if (Math.abs(diff) < 0.5) { box.scrollLeft = target; raf = null; return; }
      box.scrollLeft += diff * 0.14;
      raf = requestAnimationFrame(glide);
    };
    box.addEventListener('wheel', (e) => {
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) delta *= 40;          // прокрутка «строками»
      const max = box.scrollWidth - box.clientWidth;
      if (max <= 0) return;
      if (!raf) target = box.scrollLeft;
      const atStart = target <= 0 && delta < 0;
      const atEnd = target >= max - 1 && delta > 0;
      if (atStart || atEnd) return; // на краю — отдаём прокрутку странице
      e.preventDefault();
      target = Math.max(0, Math.min(max, target + delta * 1.2));
      if (!raf) raf = requestAnimationFrame(glide);
    }, { passive: false });

    // перетаскивание мышью
    let startX = 0, startScroll = 0, dragging = false, moved = false;
    box.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; moved = false;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      startX = e.clientX; startScroll = box.scrollLeft;
    });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; box.classList.add('is-dragging'); }
      if (moved) box.scrollLeft = startScroll - dx;
    });
    window.addEventListener('pointerup', () => {
      dragging = false;
      box.classList.remove('is-dragging');
    });
    // после перетаскивания не засчитывать нажатие на день
    box.addEventListener('click', (e) => {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
  }

  function selectDay(key) {
    selectedDay = selectedDay === key ? null : key;
    document.querySelectorAll('[data-day]').forEach((b) => {
      const on = b.dataset.day === selectedDay;
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    const grid = document.querySelector('[data-events-grid]');
    const old = grid.querySelector('.events__divider');
    if (old) old.remove();
    const cards = [...grid.querySelectorAll('.ev-card')];
    if (!selectedDay) {
      cards.forEach((c) => { c.classList.remove('is-match'); c.style.order = ''; });
      return;
    }
    let matches = 0;
    cards.forEach((c) => {
      const match = (c.dataset.days || '').split(' ').includes(selectedDay);
      c.classList.toggle('is-match', match);
      c.style.order = match ? '-2' : '0';
      if (match) matches++;
    });
    // подходящие поднимаются наверх, остальные — под подписью
    if (matches && matches < cards.length) {
      const d = document.createElement('p');
      d.className = 'events__divider';
      d.style.order = '-1';
      d.textContent = 'Другие мероприятия';
      grid.appendChild(d);
    }
  }

  /* на телефоне карточка слегка покачивается, когда появляется на экране */
  function initCardSway() {
    if (!matchMedia('(max-width: 860px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-mobile-sway'); io.unobserve(e.target); }
    }), { threshold: .6 });
    document.querySelectorAll('.ev-card:not(.is-inactive)').forEach((c) => io.observe(c));
  }

  /* ---------- окно мероприятия и форма записи ---------- */
  const drafts = {}; // черновики формы по мероприятию — сохраняются при закрытии окна
  const savedContact = (() => { try { return JSON.parse(sessionStorage.getItem('magic-contact')) || {}; } catch (e) { return {}; } })();

  function formatPhone(digits) {
    const d = digits.slice(0, 10);
    let out = '+7';
    if (d.length) out += ' (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
  }
  // 10 цифр номера без +7: понимает ввод с маской, «8 914…», «+7914…» и вставку целого номера
  const phoneDigits = (v) => {
    let d = v.replace(/^\s*\+7/, '').replace(/\D/g, '');
    if (d.length === 11 && /^[78]/.test(d)) d = d.slice(1);
    return d.slice(0, 10);
  };

  function openEvent(id, opts) {
    const f = afisha.formats.find((x) => x.id === id);
    const modal = document.querySelector('[data-ev-modal]');
    if (!f || !modal) return;
    opts = opts || {};
    const content = modal.querySelector('[data-ev-content]');
    const up = upcoming(f);
    const avail = up.filter((s) => s.left > 0);
    const monthName = MONTHS_PREP[afisha.month];
    const draft = drafts[id] || {};
    const st = {
      date: (opts.date && avail.some((s) => s.date === opts.date)) ? opts.date : (draft.date || (avail.length === 1 ? avail[0].date : null)),
      variant: draft.variant != null ? draft.variant : 0,
      guests: draft.guests || 1
    };

    // показать окно (общая часть для всех вариантов содержимого)
    const show = (form) => {
      watchImages(content);
      if (!modal.open) {
        lastFocus = document.activeElement;
        modal.showModal();
        document.body.classList.add('menu-open');
      }
      content.scrollTop = 0;
      const body = content.querySelector('.ev-modal__body');
      if (body) body.scrollTop = 0;
      if (form && opts.toForm) {
        const target = st.date ? form : content.querySelector('[data-dates]');
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
      }
    };
    content.onclick = null;

    const head =
      '<div class="ev-modal__photo"><img src="img/events/' + f.id + '.jpg" alt="" data-fallback="' + escapeHtml(f.title) + '"></div>' +
      '<div class="ev-modal__body">' +
        '<h2 class="ev-modal__title" id="ev-modal-title">' + escapeHtml(f.title) + '</h2>' +
        '<p class="ev-modal__meta"><b>' + priceLabel(f) + '</b>' + (f.duration ? ' · ' + f.duration : '') + '</p>' +
        '<div><p class="ev-modal__label">Что будет</p><p class="ev-modal__desc">' + escapeHtml(f.desc || f.short) + '</p></div>';

    // кнопки-даты: все даты месяца; прошедшие — «уже закончилось», без мест — «мест нет»
    const dateChips = (f.sessions || []).map((s) => {
      const d = sessionDate(s);
      const label = d.getDate() + ' ' + MONTHS_GEN[d.getMonth()] + ', ' + WEEKDAYS[d.getDay()] + ' · ' + s.time;
      const past = d <= now;
      const sub = past ? 'уже закончилось' : (s.left > 0 ? 'осталось ' + s.left + ' ' + plural(s.left, 'место', 'места', 'мест') : 'мест нет');
      return '<button class="chip' + (past ? ' is-past' : '') + (!past && s.left > 0 && s.left <= 3 ? ' is-low' : '') + (st.date === s.date ? ' is-selected' : '') +
        '" type="button" data-pick-date="' + s.date + '"' + (past || s.left <= 0 ? ' disabled' : '') + ' aria-pressed="' + (st.date === s.date) + '">' +
        label + '<small>' + (!past && s.left > 0 ? lightsHtml(s.left) : '') + sub + '</small></button>';
    }).join('');

    // неактивное мероприятие или все места заняты
    if (!up.length || !avail.length) {
      const text = !up.length
        ? '<b>В ' + monthName + ' ' + ((f.sessions || []).length ? 'больше ' : '') + 'не проводим.</b> Узнайте у менеджера, когда будет'
        : '<b>Мест нет.</b> Напишите менеджеру — вдруг освободится';
      content.innerHTML = head +
        ((f.sessions || []).length ? '<div><p class="ev-modal__label">Дата</p><div class="ev-modal__dates">' + dateChips + '</div></div>' : '') +
        '<div class="ev-modal__off"><p>' + text + '</p><div class="btns">' + contactBtns() + '</div></div></div>';
      show(null);
      return;
    }

    const variants = f.variants
      ? '<div><p class="ev-modal__label">Что делаем</p><div class="ev-modal__variants">' + f.variants.map((v, i) =>
          '<button class="chip' + (st.variant === i ? ' is-selected' : '') + '" type="button" data-pick-variant="' + i + '" aria-pressed="' + (st.variant === i) + '">' + escapeHtml(v.name) + ' — ' + rub(v.price) + '</button>').join('') + '</div></div>'
      : '';

    content.innerHTML = head +
      '<div><p class="ev-modal__label">Дата</p><div class="ev-modal__dates" data-dates>' + dateChips + '</div>' +
        '<p class="field__error" data-err="date"></p></div>' +
      variants +
      '<form class="book" novalidate data-book-form>' +
        '<div class="book__row">' +
          field('name', 'Имя', 'text', 'name', draft.name || savedContact.name || '', '') +
          field('phone', 'Телефон', 'tel', 'tel', draft.phone || savedContact.phone || '', '+7 (___) ___-__-__') +
        '</div>' +
        field('email', 'Почта', 'email', 'email', draft.email || savedContact.email || '', 'name@mail.ru', 'Пришлём подтверждение записи') +
        '<div class="field"><label id="guests-label">' + (f.pair ? 'Количество пар' : 'Количество гостей') + '</label>' +
          '<div class="counter" role="group" aria-labelledby="guests-label"><button type="button" data-guests="-1" aria-label="Меньше">−</button>' +
          '<output data-guests-out>' + st.guests + '</output><button type="button" data-guests="1" aria-label="Больше">+</button></div>' +
          '<p class="field__error" data-err="guests"></p></div>' +
        '<p class="book__total" data-total></p>' +
        '<label class="check"><input type="checkbox" name="consent"' + (draft.consent ? ' checked' : '') + '> <span>Согласна на обработку персональных данных и принимаю <a href="privacy.html" target="_blank">политику конфиденциальности</a></span></label>' +
        '<p class="field__error" data-err="consent"></p>' +
        '<div data-alert></div>' +
        '<div class="book__submit"><button class="btn btn--dark" type="submit" data-pay>Оплатить</button></div>' +
      '</form></div>';

    const form = content.querySelector('[data-book-form]');
    const people = () => st.guests * (f.pair ? 2 : 1);
    const unitPrice = () => (f.variants ? f.variants[st.variant].price : f.price);
    const leftFor = () => { const s = up.find((x) => x.date === st.date); return s ? s.left : Math.max(...avail.map((x) => x.left)); };

    function update() {
      const pay = PREPAY * people();
      const rest = Math.max(0, unitPrice() * st.guests - pay);
      content.querySelector('[data-total]').innerHTML = 'Предоплата: ' + rub(PREPAY) + ' × ' + people() + ' = <b>' + rub(pay) + '</b>. Остальное (' + rub(rest) + ') — на месте';
      content.querySelector('[data-pay]').textContent = 'Оплатить ' + rub(pay);
      content.querySelector('[data-guests-out]').textContent = st.guests;
      const max = Math.min(leftFor(), 10);
      content.querySelector('[data-guests="-1"]').disabled = st.guests <= 1;
      content.querySelector('[data-guests="1"]').disabled = st.guests >= max;
      const gErr = content.querySelector('[data-err="guests"]');
      if (st.guests > leftFor()) {
        gErr.innerHTML = 'Осталось только ' + leftFor() + ' ' + plural(leftFor(), 'место', 'места', 'мест') + ' — <a href="#" data-fix-guests>изменить количество?</a>';
      } else gErr.textContent = '';
      saveDraft();
    }
    function saveDraft() {
      drafts[id] = {
        date: st.date, variant: st.variant, guests: st.guests,
        name: form.name.value, phone: form.phone.value, email: form.email.value, consent: form.consent.checked
      };
    }

    // выбор даты / варианта / количества (onclick — один обработчик, не копится при повторных открытиях)
    content.onclick = (e) => {
      const dBtn = e.target.closest('[data-pick-date]');
      if (dBtn && !dBtn.disabled) {
        st.date = dBtn.dataset.pickDate;
        content.querySelectorAll('[data-pick-date]').forEach((b) => { const on = b === dBtn; b.classList.toggle('is-selected', on); b.setAttribute('aria-pressed', on); });
        content.querySelector('[data-err="date"]').textContent = '';
        update();
      }
      const vBtn = e.target.closest('[data-pick-variant]');
      if (vBtn) {
        st.variant = +vBtn.dataset.pickVariant;
        content.querySelectorAll('[data-pick-variant]').forEach((b) => { const on = b === vBtn; b.classList.toggle('is-selected', on); b.setAttribute('aria-pressed', on); });
        update();
      }
      const gBtn = e.target.closest('[data-guests]');
      if (gBtn && !gBtn.disabled) { st.guests = Math.max(1, st.guests + +gBtn.dataset.guests); update(); }
      if (e.target.closest('[data-fix-guests]')) { e.preventDefault(); st.guests = leftFor(); update(); }
    };

    // маска телефона
    form.phone.addEventListener('input', () => {
      const digits = phoneDigits(form.phone.value);
      form.phone.value = digits.length ? formatPhone(digits) : '';
    });
    form.phone.addEventListener('focus', () => { if (!form.phone.value) form.phone.value = '+7 ('; });
    form.phone.addEventListener('blur', () => { if (!phoneDigits(form.phone.value).length) form.phone.value = ''; });
    if (form.phone.value) form.phone.value = formatPhone(phoneDigits(form.phone.value));

    // проверка поля при уходе с него
    const checks = {
      name: () => form.name.value.trim().length >= 2 ? '' : 'Как к вам обращаться?',
      phone: () => phoneDigits(form.phone.value).length === 10 ? '' : 'Проверьте номер — нужно 10 цифр после +7',
      email: () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim()) ? '' : 'Проверьте почту — кажется, в ней опечатка',
      consent: () => form.consent.checked ? '' : 'Отметьте согласие, чтобы продолжить'
    };
    const showErr = (name) => {
      const msg = checks[name]();
      const el = content.querySelector('[data-err="' + name + '"]');
      if (el) el.textContent = msg;
      const wrap = form[name] && form[name].closest('.field');
      if (wrap) wrap.classList.toggle('is-error', !!msg);
      if (form[name]) form[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
      return msg;
    };
    ['name', 'phone', 'email'].forEach((n) => {
      form[n].addEventListener('blur', () => { if (form[n].value) showErr(n); });
      form[n].addEventListener('input', () => { if (form[n].closest('.field').classList.contains('is-error')) showErr(n); saveDraft(); });
    });
    form.consent.addEventListener('change', () => { showErr('consent'); saveDraft(); });

    // оплата
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errs = ['name', 'phone', 'email', 'consent'].map(showErr);
      const dateErr = st.date ? '' : 'Выберите дату';
      content.querySelector('[data-err="date"]').textContent = dateErr;
      const alert = content.querySelector('[data-alert]');
      alert.innerHTML = '';
      if (dateErr || errs.some(Boolean)) {
        const firstBad = dateErr ? content.querySelector('[data-dates]') : form.querySelector('[aria-invalid="true"]') || form.consent;
        if (firstBad) { firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (firstBad.focus) firstBad.focus({ preventScroll: true }); }
        return;
      }
      if (st.guests > leftFor()) { update(); return; }

      try { sessionStorage.setItem('magic-contact', JSON.stringify({ name: form.name.value.trim(), phone: form.phone.value, email: form.email.value.trim() })); } catch (err) { /* без сохранения */ }

      // Демонстрация: настоящая оплата подключается вместе с платёжной системой
      alert.innerHTML = '<p class="book__alert book__alert--info">Демо-режим: здесь откроется страница оплаты ' + rub(PREPAY * people()) +
        '. Онлайн-оплату подключим вместе с платёжной системой.</p>';
      alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    update();
    show(form);
  }

  function field(name, label, type, autocomplete, value, placeholder, hint) {
    return '<div class="field"><label for="f-' + name + '">' + label + '</label>' +
      '<input id="f-' + name + '" name="' + name + '" type="' + type + '" autocomplete="' + autocomplete + '"' +
      (type === 'tel' ? ' inputmode="tel"' : '') + (type === 'email' ? ' inputmode="email"' : '') +
      ' value="' + escapeHtml(value) + '" placeholder="' + escapeHtml(placeholder) + '" aria-describedby="e-' + name + '">' +
      (hint ? '<p class="field__hint">' + hint + '</p>' : '') +
      '<p class="field__error" id="e-' + name + '" data-err="' + name + '"></p></div>';
  }

  let lastFocus = null;
  function initModal() {
    const modal = document.querySelector('[data-ev-modal]');
    if (!modal) return;
    const close = () => { if (modal.open) modal.close(); };
    modal.addEventListener('close', () => {
      document.body.classList.remove('menu-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    });
    modal.querySelector('[data-ev-close]').addEventListener('click', close);
    // клик мимо окна
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    // свайп вниз по шторке (на телефоне) — когда содержимое прокручено к началу
    const content = modal.querySelector('[data-ev-content]');
    const sheet = modal.querySelector('[data-ev-sheet]');
    let y0 = null, dy = 0;
    sheet.addEventListener('touchstart', (e) => { y0 = content.scrollTop <= 0 ? e.touches[0].clientY : null; dy = 0; }, { passive: true });
    sheet.addEventListener('touchmove', (e) => {
      if (y0 === null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      modal.style.transform = dy ? 'translateY(' + dy + 'px)' : '';
    }, { passive: true });
    sheet.addEventListener('touchend', () => {
      modal.style.transform = '';
      if (dy > 110) close();
      y0 = null; dy = 0;
    });
  }

  // все кнопки «открыть мероприятие» на странице
  document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-open]');
    if (open) {
      e.preventDefault();
      openEvent(open.dataset.open, { date: open.dataset.date, toForm: open.hasAttribute('data-to-form') || !!open.dataset.date });
      return;
    }
    const book = e.target.closest('[data-book]');
    if (book) {
      e.preventDefault();
      openEvent(book.dataset.book, { date: book.dataset.date, toForm: true });
      return;
    }
    const day = e.target.closest('[data-day]');
    if (day && !day.disabled) selectDay(day.dataset.day);
  });

  /* =====================================================================
     О НАС: рейтинг, рисованные линии, стопка работ, отзывы
     ===================================================================== */
  function renderRating() {
    const el = document.querySelector('[data-rating]');
    if (!el || !contacts.dgisRating) return;
    const n = contacts.dgisCount || 0;
    el.innerHTML = '<b>' + contacts.dgisRating + ' ★</b> ' + (n ? n + ' ' + plural(n, 'оценка', 'оценки', 'оценок') + ' в 2ГИС · ' : '') +
      '<a href="' + escapeHtml(contacts.dgis || '#') + '" target="_blank" rel="noopener">читать отзывы</a>';
  }

  /* «Пространство MAGIC»: появление блока при прокрутке — заголовок из размытия, текст, лента */
  function initSpace() {
    const story = document.querySelector('[data-space]');
    if (!story) return;
    initSpaceArc(story.querySelector('[data-space-arc]'));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { story.classList.add('is-in'); return; }
    story.classList.add('is-pending');
    const check = () => {
      if (story.getBoundingClientRect().top < innerHeight * .8) {
        story.classList.add('is-in');
        removeEventListener('scroll', check);
        removeEventListener('resize', check);
      }
    };
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    requestAnimationFrame(check);
  }

  /* Изогнутая лента фото — как внутренняя стенка цилиндра.
     Геометрия задана в «единицах кадра»: кадр 1440 ед. на компьютере и 640 ед. на телефоне, растянутый на ширину экрана.
     Лента сама плывёт справа налево (50 ед./с), её можно тянуть — после броска катится по инерции и снова плывёт сама. */
  function initSpaceArc(box) {
    const photos = window.SPACE_PHOTOS || [];
    if (!box) return;
    if (!photos.length) { box.hidden = true; return; }

    const PITCH = 196, BAND = 430, R = 15;   // шаг карточек, высота ленты, скругление углов
    const AUTO = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 50;
    const count = Math.max(photos.length, 10), loop = count * PITCH;

    const cards = [];
    for (let i = 0; i < count; i++) {
      const p = photos[i % photos.length];
      const el = document.createElement('figure');
      el.className = 'space-card';
      el.innerHTML = '<img src="' + escapeHtml(p.src) + '" alt="' + escapeHtml(p.alt || '') + '" draggable="false" decoding="async" data-fallback=" ">';
      const img = el.firstChild;
      if (img.complete && img.naturalWidth) img.classList.add('is-ready');
      else img.addEventListener('load', () => img.classList.add('is-ready'), { once: true });
      box.appendChild(el);
      cards.push(el);
    }
    watchImages(box);

    let F = 1440, u = 1, C = 720, HALF = 706;
    const measure = () => {
      const w = box.clientWidth || innerWidth;
      F = w <= 820 ? 640 : 1440;
      u = w / F; C = F / 2; HALF = F * 706 / 1440;
      box.style.setProperty('--u', u + 'px');
    };

    // скруглённый четырёхугольник для clip-path
    const roundedQuad = (pts) => {
      let d = '';
      for (let k = 0; k < 4; k++) {
        const P = pts[k], A = pts[(k + 3) % 4], B = pts[(k + 1) % 4];
        const toward = (Q) => { const dx = Q[0] - P[0], dy = Q[1] - P[1], len = Math.hypot(dx, dy) || 1, r = Math.min(R * u, len / 2);
          return (P[0] + dx / len * r).toFixed(1) + ' ' + (P[1] + dy / len * r).toFixed(1); };
        d += (k ? ' L' : 'M') + toward(A) + ' Q' + P[0].toFixed(1) + ' ' + P[1].toFixed(1) + ' ' + toward(B);
      }
      return "path('" + d + " Z')";
    };

    const render = (offset) => {
      cards.forEach((el, i) => {
        const t = (((i * PITCH - offset) % loop) + loop) % loop - loop / 2;   // смещение от центра до «выталкивания»
        const x = C + t * (1 + 0.083 * (t / HALF) ** 2);
        const d = Math.abs(x - C) / HALF;
        const w = 170 + 48 * d * d;
        const xl = x - w / 2, xr = x + w / 2;
        if (xr < -40 || xl > F + 40) { el.style.visibility = 'hidden'; return; }
        const edgeH = (ex) => 280 + 92 * (Math.abs(ex - C) / HALF) ** 2.6;
        const hl = edgeH(xl), hr = edgeH(xr), hm = Math.max(hl, hr);
        const cy = BAND / 2 - 12 * d * d;   // центральная карточка ровно посередине ленты: воздух сверху и снизу одинаковый
        el.style.visibility = '';
        el.style.width = w * u + 'px';
        el.style.height = hm * u + 'px';
        el.style.transform = 'translate(' + (xl * u).toFixed(1) + 'px,' + ((cy - hm / 2) * u).toFixed(1) + 'px)';
        const W = w * u, top = (hm - hl) / 2 * u, topR = (hm - hr) / 2 * u;
        el.style.clipPath = roundedQuad([[0, top], [W, topR], [W, topR + hr * u], [0, top + hl * u]]);
      });
    };

    // движение: авто-прокрутка + инерция после броска (скорость гаснет на ~95% за секунду)
    let offset = 0, vel = 0, dragging = false, last = 0, visible = true, raf = null;
    const frame = (ts) => {
      const dt = last ? Math.min((ts - last) / 1000, .05) : 0;
      last = ts;
      if (!dragging) { offset += (AUTO + vel) * dt; vel *= Math.pow(.05, dt); }
      render(offset);
      raf = visible ? requestAnimationFrame(frame) : null;
    };
    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };

    let lastX = 0, lastT = 0, dragVel = 0;
    box.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      dragging = true; lastX = e.clientX; lastT = performance.now(); dragVel = 0;
      box.classList.add('is-grabbing');
      try { box.setPointerCapture(e.pointerId); } catch (err) { /* без захвата тоже работает */ }
      start();
    });
    box.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now(), dx = (e.clientX - lastX) / u, dt = Math.max((now - lastT) / 1000, .001);
      offset -= dx;                                         // лента идёт ровно за пальцем
      dragVel = dragVel * .3 + (-dx / dt) * .7;
      lastX = e.clientX; lastT = now;
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      box.classList.remove('is-grabbing');
      const idle = performance.now() - lastT > 80;          // задержала палец — броска нет
      vel = idle ? 0 : Math.max(-4000, Math.min(4000, dragVel)) - AUTO;
    };
    box.addEventListener('pointerup', release);
    box.addEventListener('pointercancel', release);
    box.addEventListener('dragstart', (e) => e.preventDefault());

    // за экраном лента не крутится
    const watch = () => {
      const r = box.getBoundingClientRect();
      // на телефоне лента скрыта (там просто фото) — тогда не крутится вовсе
      visible = box.offsetParent !== null && r.bottom > -100 && r.top < innerHeight + 100;
      if (visible) start();
    };
    addEventListener('scroll', watch, { passive: true });
    addEventListener('resize', () => { measure(); render(offset); watch(); });
    measure(); render(offset); watch();
  }

  function renderReviews() {
    const box = document.querySelector('[data-reviews]');
    const list = window.REVIEWS || [];
    if (!box || !list.length) return; // нет отзывов — блок скрыт
    box.hidden = false;
    box.querySelector('[data-reviews-list]').innerHTML = list.map((r) =>
      '<article class="review">' +
        (r.img ? '<img class="review__img" src="' + escapeHtml(r.img) + '" alt="" loading="lazy" data-fallback=" ">' : '') +
        '<div class="review__body">' +
          '<div class="review__head">' + (r.name ? '<b class="review__name">' + escapeHtml(r.name) + '</b>' : '') +
            '<span class="review__stars" aria-label="Оценка ' + (r.stars || 5) + ' из 5">' + '★'.repeat(r.stars || 5) + '</span></div>' +
          '<p class="review__text">' + escapeHtml(r.text) + '</p>' +
          (r.text.length > 180 ? '<button class="review__more" type="button" data-review-more aria-expanded="false">читать полностью</button>' : '') +
          '<span class="review__src">отзыв в 2ГИС' + (r.date ? ' · ' + escapeHtml(r.date) : '') + '</span>' +
        '</div></article>').join('');
    watchImages(box);
    initHScroll(box.querySelector('[data-reviews-list]'));
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-review-more]');
      if (b) {
        const open = b.closest('.review').classList.toggle('is-open');
        b.textContent = open ? 'свернуть' : 'читать полностью';
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    });
  }

  /* стопка работ: перетащить верхнюю карточку — она улетает вниз стопки */
  function initWorks() {
    const box = document.querySelector('[data-works]');
    const block = document.querySelector('[data-works-block]');
    const list = (window.WORKS || []).filter((w) => w.img);
    if (!box) return;
    if (!list.length) { if (block) block.hidden = true; return; } // работ нет — блок скрыт
    const titleOf = (id) => { const f = afisha && afisha.formats.find((x) => x.id === id); return f ? f.title : ''; };
    const TILTS = [-5, 4, -2, 6, -6, 3, -3, 5];

    const cards = list.map((w, i) => {
      const fig = document.createElement('figure');
      fig.className = 'polaroid';
      fig.dataset.tilt = TILTS[i % TILTS.length];
      fig.innerHTML = '<img src="' + escapeHtml(w.img) + '" alt="Работа участницы: ' + escapeHtml(titleOf(w.event)) + '" draggable="false" data-fallback="Работа участницы">' +
        '<figcaption>' + escapeHtml(titleOf(w.event)) + '</figcaption>';
      fig.work = w;
      box.appendChild(fig);
      return fig;
    });
    watchImages(box);
    const order = cards.slice();
    const count = document.querySelector('[data-works-count]');

    function layout() {
      order.forEach((c, p) => {
        const tilt = +c.dataset.tilt * (p === 0 ? .35 : 1);
        c.style.transform = 'translate(-50%, -50%) translate(' + (p * 6) + 'px, ' + (p * 8) + 'px) rotate(' + tilt + 'deg)';
        c.style.zIndex = String(100 - p);
        c.style.opacity = p < 4 ? '1' : '0';
        const top = p === 0;
        c.classList.toggle('is-top', top);
        c.tabIndex = top ? 0 : -1;
        c.setAttribute('role', top ? 'button' : 'presentation');
        if (top) c.setAttribute('aria-label', 'Открыть работу: ' + titleOf(c.work.event));
        else c.removeAttribute('aria-label');
      });
      if (count) count.textContent = (cards.indexOf(order[0]) + 1) + ' / ' + cards.length;
    }

    let busy = false;
    function flyAway(dir) {
      if (busy) return;
      busy = true;
      const top = order[0];
      top.style.transform = 'translate(-50%, -50%) translate(' + (dir * box.clientWidth * .9) + 'px, -30px) rotate(' + (dir * 18) + 'deg)';
      setTimeout(() => {
        order.push(order.shift());
        top.style.zIndex = '1';
        layout();
        setTimeout(() => { busy = false; }, 350);
      }, 320);
    }
    function back() {
      if (busy) return;
      order.unshift(order.pop());
      layout();
    }

    // перетаскивание верхней карточки (мышь и палец)
    let drag = null;
    box.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.polaroid');
      if (!card || card !== order[0] || busy) return;
      drag = { card, x: e.clientX, y: e.clientY, dx: 0, moved: false, id: e.pointerId };
      card.setPointerCapture(e.pointerId);
    });
    box.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(drag.dx) > 6) { drag.moved = true; drag.card.classList.add('is-dragging'); }
      if (drag.moved) drag.card.style.transform = 'translate(-50%, -50%) translate(' + drag.dx + 'px, ' + (Math.abs(drag.dx) * -.05) + 'px) rotate(' + (drag.dx * .05) + 'deg)';
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      d.card.classList.remove('is-dragging');
      if (!d.moved) { openWork(d.card.work); return; }
      if (Math.abs(d.dx) > 90) flyAway(Math.sign(d.dx));
      else layout();
    };
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', (e) => { if (drag && e.pointerId === drag.id) { drag.card.classList.remove('is-dragging'); drag = null; layout(); } });

    // клавиатура и кнопки
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openWork(order[0].work); }
      if (e.key === 'ArrowRight') { flyAway(1); setTimeout(() => order[0].focus(), 700); }
      if (e.key === 'ArrowLeft') { back(); order[0].focus(); }
    });
    const nextBtn = document.querySelector('[data-works-next]');
    const prevBtn = document.querySelector('[data-works-prev]');
    if (nextBtn) nextBtn.addEventListener('click', () => flyAway(-1));
    if (prevBtn) prevBtn.addEventListener('click', back);

    layout();
  }

  // работа крупно + «Хочу так же»
  function openWork(w) {
    const view = document.querySelector('[data-work-view]');
    if (!view || !w) return;
    const f = afisha && afisha.formats.find((x) => x.id === w.event);
    view.querySelector('[data-work-body]').innerHTML =
      '<img src="' + escapeHtml(w.img) + '" alt="Работа участницы' + (f ? ': ' + escapeHtml(f.title) : '') + '">' +
      '<div class="work-view__foot"><p>' + (f ? escapeHtml(f.title) : 'Работа участницы') + '</p>' +
      (f ? '<button class="btn btn--dark" type="button" data-want="' + f.id + '">Хочу так же →</button>' : '') + '</div>';
    view.showModal();
  }
  function initWorkView() {
    const view = document.querySelector('[data-work-view]');
    if (!view) return;
    view.querySelector('[data-work-close]').addEventListener('click', () => view.close());
    view.addEventListener('click', (e) => {
      if (e.target === view) { view.close(); return; }
      const want = e.target.closest('[data-want]');
      if (want) { view.close(); openEvent(want.dataset.want, { toForm: false }); }
    });
  }

  /* ---------- сертификаты: реальное фото, если есть; покачивание при появлении на телефоне ---------- */
  function initCerts() {
    const visual = document.querySelector('[data-cert-visual]');
    if (!visual) return;
    const photo = visual.querySelector('[data-cert-photo]');
    const card = visual.querySelector('[data-cert-card]');
    const showPhoto = () => { photo.hidden = false; card.hidden = true; };
    if (photo.complete && photo.naturalWidth) showPhoto();
    else photo.addEventListener('load', showPhoto, { once: true });

    if (matchMedia('(hover: none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { visual.classList.add('is-swaying'); io.disconnect(); }
      }, { threshold: .6 });
      io.observe(visual);
    }
  }

  /* ---------- футер: буквы MAGIC загораются, когда до них долистали ---------- */
  function initFooterBrand() {
    const brand = document.querySelector('[data-footer-brand]');
    if (!brand) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { brand.classList.add('is-lit'); return; }
    // зажечь, когда хотя бы треть надписи на экране (проверка при прокрутке — надёжнее во всех браузерах)
    const check = () => {
      const r = brand.getBoundingClientRect();
      if (r.top < innerHeight - r.height / 3 && r.bottom > 0) {
        brand.classList.add('is-lit');
        removeEventListener('scroll', check);
        removeEventListener('resize', check);
      }
    };
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    check();
  }

  fillContacts();
  initHeader();
  initMenu();
  watchImages(document);
  if (window.initPhotoRibbon) window.initPhotoRibbon(document.querySelector('[data-photo-ribbon]'), window.HERO_PHOTOS);
  renderFacts();
  renderNearest();
  renderEvents();
  initDaysScroll();
  initModal();
  renderRating();
  renderReviews();
  initWorks();
  initWorkView();
  initSpace();
  initCerts();
  initFooterBrand();
  initGlow();
})();
