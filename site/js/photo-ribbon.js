/*
  Бесконечная вертикальная лента фотографий (главный экран).

  Использование:
    <div class="photo-ribbon" data-photo-ribbon></div>
    window.HERO_PHOTOS = [{ src: 'img/hero/1.jpg', alt: '…' }, …];

  Лента состоит из двух одинаковых копий набора фото и сдвигается ровно на одну копию —
  поэтому после последней фотографии бесшовно появляется первая.
*/
(function () {
  'use strict';

  const SECONDS_PER_PHOTO = 7; // скорость: чем больше, тем медленнее

  function initPhotoRibbon(root, photos) {
    if (!root || !photos || !photos.length) return;

    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', 'Фотографии с мероприятий MAGIC');

    const tilt = document.createElement('div');
    tilt.className = 'photo-ribbon__tilt';
    const track = document.createElement('div');
    track.className = 'photo-ribbon__track';
    track.style.setProperty('--ribbon-duration', photos.length * SECONDS_PER_PHOTO + 's');

    // две копии подряд: первая видна, вторая «подхватывает» её при повторе
    for (let copy = 0; copy < 2; copy++) {
      photos.forEach((p) => {
        const card = document.createElement('figure');
        card.className = 'photo-ribbon__card';
        const img = document.createElement('img');
        img.src = p.src;
        img.alt = '';
        img.decoding = 'async';
        img.draggable = false;
        card.appendChild(img);
        if (copy === 1) card.setAttribute('aria-hidden', 'true');
        track.appendChild(card);
      });
    }

    const stage = document.createElement('div');
    stage.className = 'photo-ribbon__stage';
    tilt.appendChild(track);
    stage.appendChild(tilt);
    root.appendChild(stage);
  }

  window.initPhotoRibbon = initPhotoRibbon;
})();
