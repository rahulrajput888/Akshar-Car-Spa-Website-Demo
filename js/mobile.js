/* ============================================================
   MOBILE-FIRST INTERACTION LAYER v2
   Touch/swipe gestures + mobile-only enhancements.
   Everything is capability-guarded — desktop stays untouched.
   ============================================================ */
(function(){
  'use strict';
  var doc = document.documentElement;
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  var smallMQ = window.matchMedia('(max-width: 820px)');
  function isSmall(){ return smallMQ.matches; }

  /* ---------- Accurate viewport height (iOS Safari fix) ---------- */
  function setVH(){ doc.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px'); }
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', function(){ setTimeout(setVH, 250); });

  if(isTouch){ doc.classList.add('is-touch'); }

  /* ---------- Data-saver / slow-connection: calm motion ---------- */
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if((conn && conn.saveData) || (conn && /2g/.test(conn.effectiveType || ''))){
    doc.classList.add('save-data');
  }

  /* ---------- Small-screen flag ---------- */
  function setSize(){ doc.classList.toggle('is-small', window.innerWidth <= 640); }
  setSize();
  window.addEventListener('resize', setSize);

  /* ---------- Image hygiene: async decode, lazy below fold ---------- */
  document.querySelectorAll('img').forEach(function(img){
    img.decoding = 'async';
    if(!img.hasAttribute('fetchpriority') && !img.hasAttribute('loading')){
      img.loading = 'lazy';
    }
  });

  /* ---------- Keep focused inputs visible above keyboards ---------- */
  document.addEventListener('focusin', function(e){
    var t = e.target;
    if(!t || !/INPUT|SELECT|TEXTAREA/.test(t.tagName)) return;
    if(window.innerWidth > 820) return;
    setTimeout(function(){
      try{ t.scrollIntoView({block:'center', behavior:'smooth'}); }catch(_){}
    }, 300);
  });

  /* ---------- Mobile menu: scroll-lock + swipe-right to close ---------- */
  var mMenu = document.querySelector('.mobile-menu');
  var burger = document.querySelector('.hamburger');
  if(mMenu && burger){
    burger.addEventListener('click', function(){ document.body.style.overflow = 'hidden'; });
    mMenu.addEventListener('click', function(e){
      if(e.target.closest('a,button')){ document.body.style.overflow = ''; }
    });
    if(isTouch){
      var mx0 = null;
      mMenu.addEventListener('touchstart', function(e){
        if(e.touches.length === 1){ mx0 = e.touches[0].clientX; }
      }, {passive:true});
      mMenu.addEventListener('touchend', function(e){
        if(mx0 === null) return;
        var dx = e.changedTouches[0].clientX - mx0;
        if(dx > 70){ mMenu.classList.remove('open'); document.body.style.overflow = ''; }
        mx0 = null;
      }, {passive:true});
    }
  }

  /* ============================================================
     BEFORE / AFTER — full-area finger drag (mobile)
     Works alongside main.js handle-drag; both set same position.
     touch-action:pan-y (CSS) keeps vertical page-scroll intact.
     ============================================================ */
  if(isTouch){
    document.querySelectorAll('.ba-box').forEach(function(box){
      var after = box.querySelector('.ba-after');
      var handle = box.querySelector('.ba-handle');
      if(!after || !handle) return;
      var dragging = false;
      function setPos(clientX){
        var r = box.getBoundingClientRect();
        var pct = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
        after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
        handle.style.left = pct + '%';
      }
      box.addEventListener('touchstart', function(e){
        if(e.touches.length === 1){ dragging = true; setPos(e.touches[0].clientX); }
      }, {passive:true});
      box.addEventListener('touchmove', function(e){
        if(dragging && e.touches.length === 1){ setPos(e.touches[0].clientX); }
      }, {passive:true});
      box.addEventListener('touchend', function(){ dragging = false; }, {passive:true});
      box.addEventListener('touchcancel', function(){ dragging = false; }, {passive:true});
    });
  }

  /* ============================================================
     TESTIMONIALS — swipe left/right (mobile)
     ============================================================ */
  if(isTouch){
    var track = document.querySelector('.testi-track');
    var prevBtn = document.querySelector('.testi-prev');
    var nextBtn = document.querySelector('.testi-next');
    if(track && prevBtn && nextBtn){
      var tx0 = null, ty0 = null;
      track.addEventListener('touchstart', function(e){
        if(e.touches.length === 1){ tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }
      }, {passive:true});
      track.addEventListener('touchend', function(e){
        if(tx0 === null) return;
        var dx = e.changedTouches[0].clientX - tx0;
        var dy = e.changedTouches[0].clientY - ty0;
        if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4){
          (dx < 0 ? nextBtn : prevBtn).click();
        }
        tx0 = ty0 = null;
      }, {passive:true});
    }
  }

  /* ============================================================
     GALLERY LIGHTBOX — tap to view, swipe to browse (≤820px only)
     ============================================================ */
  function visibleGalItems(){
    return Array.prototype.filter.call(
      document.querySelectorAll('.gal-item'),
      function(el){ return el.offsetParent !== null; }
    );
  }
  function initLightbox(){
    if(!isSmall() || !document.querySelector('.gal-item') || document.querySelector('.m-lightbox')){
      return;
    }
    var lb = document.createElement('div');
    lb.className = 'm-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML =
      '<button class="m-lb-close" aria-label="Close">✕</button>' +
      '<button class="m-lb-nav m-lb-prev" aria-label="Previous">‹</button>' +
      '<img alt="Gallery image enlarged">' +
      '<button class="m-lb-nav m-lb-next" aria-label="Next">›</button>' +
      '<div class="m-lb-cap"></div><div class="m-lb-count"></div>';
    document.body.appendChild(lb);
    var img = lb.querySelector('img');
    var cap = lb.querySelector('.m-lb-cap');
    var count = lb.querySelector('.m-lb-count');
    var idx = 0, items = [];
    function show(i){
      items = visibleGalItems();
      if(!items.length) return;
      idx = (i + items.length) % items.length;
      var src = items[idx].querySelector('img');
      /* swap to full-size image (strip the /small/ thumbnail path) */
      img.src = src.currentSrc ? src.currentSrc.replace('/small/', '/') : src.src.replace('/small/', '/');
      img.alt = src.alt || 'Gallery image';
      var c = items[idx].querySelector('.gal-cap');
      cap.textContent = c ? c.textContent : '';
      count.textContent = (idx + 1) + ' / ' + items.length;
    }
    function open(i){ show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close(){ lb.classList.remove('open'); document.body.style.overflow = ''; }
    document.addEventListener('click', function(e){
      if(!isSmall()) return;
      var item = e.target.closest('.gal-item');
      if(item){ open(visibleGalItems().indexOf(item)); }
    });
    lb.querySelector('.m-lb-close').addEventListener('click', close);
    lb.querySelector('.m-lb-prev').addEventListener('click', function(e){ e.stopPropagation(); show(idx - 1); });
    lb.querySelector('.m-lb-next').addEventListener('click', function(e){ e.stopPropagation(); show(idx + 1); });
    lb.addEventListener('click', function(e){ if(e.target === lb){ close(); } });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ close(); } });
    var lx0 = null;
    lb.addEventListener('touchstart', function(e){
      if(e.touches.length === 1){ lx0 = e.touches[0].clientX; }
    }, {passive:true});
    lb.addEventListener('touchend', function(e){
      if(lx0 === null) return;
      var dx = e.changedTouches[0].clientX - lx0;
      if(dx < -45){ show(idx + 1); } else if(dx > 45){ show(idx - 1); }
      lx0 = null;
    }, {passive:true});
  }
  initLightbox();
  if(smallMQ.addEventListener){ smallMQ.addEventListener('change', initLightbox); }

  /* ============================================================
     BOOKING MODAL — bottom-sheet drag handle + swipe-down to close
     Handle element is injected (mobile CSS styles it); desktop unaffected.
     ============================================================ */
  var modal = document.getElementById('bookModal');
  if(modal && isTouch){
    var box = modal.querySelector('.modal-box');
    var handleBar = document.createElement('div');
    handleBar.className = 'm-sheet-handle';
    handleBar.setAttribute('aria-hidden', 'true');
    box.insertBefore(handleBar, box.firstChild);
    var sy0 = null, draggingSheet = false;
    function sheetSmall(){ return window.innerWidth <= 640; }
    handleBar.addEventListener('touchstart', function(e){
      if(!sheetSmall() || e.touches.length !== 1) return;
      sy0 = e.touches[0].clientY; draggingSheet = true;
      box.style.transition = 'none';
    }, {passive:true});
    handleBar.addEventListener('touchmove', function(e){
      if(!draggingSheet || e.touches.length !== 1) return;
      var dy = e.touches[0].clientY - sy0;
      if(dy > 0){ box.style.transform = 'translateY(' + dy + 'px)'; }
    }, {passive:true});
    function sheetEnd(e){
      if(!draggingSheet) return;
      draggingSheet = false;
      box.style.transition = '';
      var dy = e.changedTouches[0].clientY - sy0;
      if(dy > 110){
        var mc = modal.querySelector('.modal-close');
        if(mc){ mc.click(); }
      }
      box.style.transform = '';
      sy0 = null;
    }
    handleBar.addEventListener('touchend', sheetEnd, {passive:true});
    handleBar.addEventListener('touchcancel', function(){ draggingSheet = false; box.style.transition = ''; box.style.transform = ''; }, {passive:true});
  }
})();

/* mobile portrait poster for the hero video (<=640px) */
(function(){
  var v = document.querySelector('.hero-video');
  if(!v) return;
  if(window.matchMedia('(max-width: 640px)').matches){ v.poster = 'images/hero-poster-mobile.jpg'; }
})();
