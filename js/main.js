/* Akshar Car Spa — Demo interactions */
(function(){
  'use strict';

  /* ---------- Footer year ---------- */
  document.querySelectorAll('.js-year').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  /* ---------- Navbar scroll effect ---------- */
  var nav = document.querySelector('.navbar');
  function onScrollNav(){ if(nav){ nav.classList.toggle('scrolled', window.scrollY > 30); } }
  window.addEventListener('scroll', onScrollNav, {passive:true}); onScrollNav();

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector('.hamburger');
  var mMenu = document.querySelector('.mobile-menu');
  var mmClose = document.querySelector('.mm-close');
  if(burger && mMenu){
    burger.addEventListener('click', function(){ mMenu.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); });
    if(mmClose){ mmClose.addEventListener('click', function(){ mMenu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); }
    mMenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ mMenu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, {threshold:.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else { revealEls.forEach(function(el){ el.classList.add('visible'); }); }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if(counters.length && 'IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '';
        var dur = 1600, start = null;
        function tick(ts){
          if(!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target * eased;
          el.textContent = (target % 1 !== 0 ? val.toFixed(1) : Math.round(val).toLocaleString('en-IN')) + suf;
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, {threshold:.4});
    counters.forEach(function(el){ cio.observe(el); });
  }

  /* ---------- Testimonial slider ---------- */
  var slides = document.querySelectorAll('.testi-slide');
  var dotsWrap = document.querySelector('.testi-dots');
  var idx = 0, timer = null;
  function showSlide(n){
    if(!slides.length) return;
    idx = (n + slides.length) % slides.length;
    slides.forEach(function(s,i){ s.classList.toggle('active', i === idx); });
    if(dotsWrap){
      dotsWrap.querySelectorAll('span').forEach(function(d,i){ d.classList.toggle('active', i === idx); });
    }
  }
  if(slides.length){
    if(dotsWrap){
      slides.forEach(function(_,i){
        var d = document.createElement('span');
        if(i===0) d.classList.add('active');
        d.addEventListener('click', function(){ showSlide(i); restartAuto(); });
        dotsWrap.appendChild(d);
      });
    }
    var prev = document.querySelector('.testi-prev'), next = document.querySelector('.testi-next');
    if(prev) prev.addEventListener('click', function(){ showSlide(idx-1); restartAuto(); });
    if(next) next.addEventListener('click', function(){ showSlide(idx+1); restartAuto(); });
    function restartAuto(){ if(timer) clearInterval(timer); timer = setInterval(function(){ showSlide(idx+1); }, 6000); }
    restartAuto();
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq').forEach(function(faq){
    var q = faq.querySelector('.faq-q'), a = faq.querySelector('.faq-a');
    if(!q || !a) return;
    q.addEventListener('click', function(){
      var isOpen = faq.classList.contains('open');
      var parent = faq.parentElement;
      if(parent){
        parent.querySelectorAll('.faq.open').forEach(function(o){ o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; o.querySelector('.faq-q').setAttribute('aria-expanded', 'false'); });
      }
      if(!isOpen){ faq.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Before / After slider ---------- */
  document.querySelectorAll('.ba-box').forEach(function(box){
    var after = box.querySelector('.ba-after'), handle = box.querySelector('.ba-handle');
    if(!after || !handle) return;
    var dragging = false;
    function move(clientX){
      var r = box.getBoundingClientRect();
      var pct = Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100));
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', Math.round(pct));
    }
    handle.addEventListener('pointerdown', function(e){ dragging = true; handle.setPointerCapture(e.pointerId); });
    handle.addEventListener('pointermove', function(e){ if(dragging) move(e.clientX); });
    handle.addEventListener('pointerup', function(){ dragging = false; });
    handle.addEventListener('pointercancel', function(){ dragging = false; });
    box.addEventListener('pointerdown', function(e){ if(e.target.closest('.ba-handle')) return; move(e.clientX); });
    handle.addEventListener('keydown', function(e){
      var step = e.key === 'ArrowLeft' ? -6 : e.key === 'ArrowRight' ? 6 : 0;
      if(!step) return;
      e.preventDefault();
      var r = box.getBoundingClientRect();
      var cur = parseFloat(handle.style.left) || 50;
      move(r.left + ((cur + step) / 100) * r.width);
    });
  });

  /* ---------- Booking modal ---------- */
  var modal = document.getElementById('bookModal');
  var lastFocus = null;
  function openModal(){
    if(!modal) return;
    lastFocus = document.activeElement;
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
    window.trackEvent('booking_modal_open', {});
    setTimeout(function(){ var f = modal.querySelector('input,select,textarea'); if(f) f.focus(); }, 80);
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('open'); document.body.style.overflow = '';
    if(lastFocus && lastFocus.focus){ try{ lastFocus.focus(); }catch(_){} }
  }
  document.querySelectorAll('[data-book]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); openModal(); }); });
  if(modal){
    modal.querySelector('.modal-bg').addEventListener('click', closeModal);
    var mc = modal.querySelector('.modal-close');
    if(mc) mc.addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
      if(e.key === 'Tab' && modal.classList.contains('open')){
        var vis = Array.prototype.filter.call(modal.querySelectorAll('button,input,select,textarea,a[href]'), function(el){ return el.offsetParent !== null; });
        if(!vis.length) return;
        var first = vis[0], last = vis[vis.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(msg){
    var t = document.getElementById('toast');
    if(!t) return;
    t.querySelector('.t-msg').textContent = msg;
    t.classList.add('show');
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 4200);
  }

  /* ================ LEAD CONFIG (TODO — OWNER ACTION REQUIRED) ================
     1. Create a free inbox at https://web3forms.com and paste its access key below.
     2. Until then, forms keep working via WhatsApp handoff (nothing breaks).
     ============================================================================ */
  var FORM_ENDPOINT = 'https://api.web3forms.com/submit';
  var FORM_KEY = 'TODO — PASTE WEB3FORMS ACCESS KEY';

  /* ================= ANALYTICS (TODO — GA4 MEASUREMENT ID) =================
     Paste the GA4 measurement ID (G-XXXXXXX) to enable tracking.
     Empty/TODO value = analytics disabled. Consent flag: window.ACS_ANALYTICS
     ========================================================================== */
  var GA4_ID = 'TODO — GA4 MEASUREMENT ID';
  window.ACS_ANALYTICS = (typeof window.ACS_ANALYTICS === 'undefined') ? true : window.ACS_ANALYTICS;
  (function initGA(){
    if(!window.ACS_ANALYTICS || !GA4_ID || GA4_ID.indexOf('TODO') === 0 || GA4_ID.indexOf('G-') !== 0) return;
    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
  })();
  window.trackEvent = function(name, params){
    try{ if(window.gtag && window.ACS_ANALYTICS){ window.gtag('event', name, params || {}); } }catch(_){}
  };

  /* ---------- Forms (lead endpoint + inline status + WhatsApp handoff) ---------- */
  function formStatus(form, msg, ok){
    var el = form.querySelector('.form-status');
    if(!el){ el = document.createElement('p'); el.className = 'form-status'; el.setAttribute('role', 'status'); form.appendChild(el); }
    el.textContent = msg;
    el.classList.toggle('ok', !!ok);
    el.classList.toggle('err', !ok);
  }
  function postLead(data){
    if(!FORM_KEY || FORM_KEY.indexOf('TODO') === 0) return Promise.resolve({skipped:true});
    var ctrl = null, timer = null;
    try{ ctrl = new AbortController(); timer = setTimeout(function(){ ctrl.abort(); }, 6000); }catch(_){}
    var opt = {method:'POST', headers:{'Content-Type':'application/json', 'Accept':'application/json'}, body: JSON.stringify(data)};
    if(ctrl) opt.signal = ctrl.signal;
    return fetch(FORM_ENDPOINT, opt).then(function(r){ return {ok:r.ok}; }).catch(function(){ return {ok:false}; })
      .then(function(res){ if(timer) clearTimeout(timer); return res; });
  }
  function handleForm(form, type){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      function val(n){ var el = form.querySelector('[name=' + n + ']'); return el ? (el.value || '').trim() : ''; }
      var name = val('name'), phone = val('phone'), service = val('service'), branch = val('branch'),
          date = val('date'), message = val('message'), vehicle = val('vehicle_size'),
          carmodel = val('carmodel'), timeslot = val('timeslot');
      if(!/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''))){
        formStatus(form, 'Please enter a valid 10-digit mobile number.', false);
        toast('Please enter a valid 10-digit mobile number.');
        return;
      }
      var lines = type === 'book'
        ? ['Hello Akshar Car Spa! I want to book an appointment.', 'Name: ' + name, 'Phone: ' + phone, 'Service: ' + service, 'Branch: ' + branch, 'Date: ' + date, 'Time: ' + timeslot, 'Vehicle: ' + vehicle, 'Car: ' + carmodel]
        : ['Hello Akshar Car Spa! I have an enquiry.', 'Name: ' + name, 'Phone: ' + phone, 'Service: ' + service, 'Branch: ' + branch, 'Message: ' + message];
      var waUrl = 'https://wa.me/918511510254?text=' + encodeURIComponent(lines.filter(function(l){ return l.split(': ')[1] !== ''; }).join('\n'));
      var payload = {access_key: FORM_KEY, name: name, phone: phone, service: service, branch: branch, date: date, message: message, vehicle_size: vehicle, car_model: carmodel, time_slot: timeslot, page_url: location.href, form_type: type, submitted_at: new Date().toISOString()};
      var btn = form.querySelector('[type=submit]');
      if(btn) btn.disabled = true;
      formStatus(form, 'Sending your request…', true);
      postLead(payload).then(function(res){
        var okMsg = type === 'book' ? 'Appointment request received! Opening WhatsApp to confirm…' : 'Thank you ' + (name.split(' ')[0] || 'friend') + '! Opening WhatsApp…';
        if(res && res.ok === false){ okMsg = 'Saved! If WhatsApp does not open, please call 85115 10254.'; }
        formStatus(form, okMsg, true);
        toast(okMsg);
        window.trackEvent('generate_lead', {service: service, branch: branch, form_type: type});
        form.reset();
        closeModal();
        setTimeout(function(){ window.location.href = waUrl; }, 900);
        if(btn) setTimeout(function(){ btn.disabled = false; }, 2000);
      });
    });
  }
  document.querySelectorAll('form[data-form="book"]').forEach(function(f){ handleForm(f, 'book'); });
  document.querySelectorAll('form[data-form="contact"]').forEach(function(f){ handleForm(f, 'contact'); });

  /* ---------- Gallery filter ---------- */
  var fBtns = document.querySelectorAll('.filter-btns button');
  var gItems = document.querySelectorAll('.gal-item');
  fBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      fBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var cat = btn.getAttribute('data-filter');
      gItems.forEach(function(it){
        var show = cat === 'all' || it.getAttribute('data-cat') === cat;
        it.style.display = show ? '' : 'none';
      });
    });
  });

  /* ---------- Back to top ---------- */
  var toTop = document.querySelector('.to-top');
  window.addEventListener('scroll', function(){
    if(toTop){ toTop.classList.toggle('show', window.scrollY > 600); }
  }, {passive:true});
  if(toTop){ toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); }); }

  /* ---------- Min date = today for booking ---------- */
  var today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type=date]').forEach(function(d){ d.min = today; });

  /* ---------- Scroll progress bar ---------- */
  var spBar = document.getElementById('scrollProgress');
  function updateProgress(){
    if(!spBar) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    spBar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, {passive:true}); updateProgress();

  /* ---------- Mobile sticky call bar (expert local-business UX) ---------- */
  if(!document.querySelector('.callbar')){
    var cb = document.createElement('nav');
    cb.className = 'callbar';
    cb.setAttribute('aria-label', 'Quick contact');
    cb.innerHTML = '<a class="cb-call" href="tel:+918511510254"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>Call</a>' +
      '<a class="cb-wa" href="https://wa.me/918511510254?text=Hi!%20I%20want%20to%20book%20a%20car%20spa%20service." target="_blank"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.1 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.58-.35zM12.05 21.8h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.82 9.82 0 016.99 2.9 9.82 9.82 0 012.9 7c0 5.45-4.45 9.87-9.9 9.87z"/></svg>WhatsApp</a>' +
      '<a class="cb-book" href="#" id="cbBook">Book Now</a>';
    document.body.appendChild(cb);
    document.getElementById('cbBook').addEventListener('click', function(e){ e.preventDefault(); openModal(); });
  }

  /* ---------- PPF journey scrollytelling ---------- */
  var jWrap = document.getElementById('ppfJourney');
  if(jWrap && 'IntersectionObserver' in window){
    var jImgs = jWrap.querySelectorAll('.j-visual img');
    var jSteps = jWrap.querySelectorAll('.j-step');
    var jNum = document.getElementById('jNum');
    var jLabel = document.getElementById('jLabel');
    var jBar = document.getElementById('jBar');
    function activate(i){
      jSteps.forEach(function(s,k){ s.classList.toggle('active', k === i); });
      jImgs.forEach(function(im,k){ im.classList.toggle('active', k === i); });
      if(jNum) jNum.textContent = ('0' + (i + 1)).slice(-2);
      if(jLabel && jSteps[i]) jLabel.textContent = jSteps[i].getAttribute('data-label') || '';
      if(jBar) jBar.style.width = ((i + 1) / jSteps.length * 100) + '%';
    }
    var jio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var i = Array.prototype.indexOf.call(jSteps, e.target);
          if(i > -1) activate(i);
        }
      });
    }, {rootMargin:'-42% 0px -42% 0px', threshold:0});
    jSteps.forEach(function(s){ jio.observe(s); });
    activate(0);
  }

})();

/* hero video: play ONCE, freeze on last frame (no loop); resume if interrupted */
(function(){
  var hv = document.querySelector('.hero-video');
  if(!hv) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){ hv.removeAttribute('autoplay'); hv.pause(); return; }
  hv.removeAttribute('loop');
  try{ var vc = navigator.connection || navigator.mozConnection || navigator.webkitConnection; if(vc && (vc.saveData || /2g/.test(vc.effectiveType || ''))){ hv.removeAttribute('autoplay'); hv.pause(); return; } }catch(_){}
  function tryPlay(){ if(hv.ended) return; var p = hv.play(); if(p && p.catch){ p.catch(function(){}); } }
  if(document.getElementById('loader')){ try{ hv.pause(); }catch(_){} window.addEventListener('acs:ready', tryPlay); }
  hv.addEventListener('ended', function(){ hv.pause(); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting && !document.body.classList.contains('is-loading')){ tryPlay(); } else if(!hv.ended){ hv.pause(); } });
    }, {threshold:.12}).observe(hv);
  }
})();

/* ---------- Cinematic loader: 2-2.5s first visit, quick pass after ---------- */
(function(){
  document.body.classList.add('pre-load');
  var loader = document.getElementById('loader');
  function done(){
    document.body.classList.remove('pre-load');
    document.body.classList.add('loaded');
    window.dispatchEvent(new Event('acs:ready'));
  }
  if(!loader){ done(); return; }
  var first = true;
  try{ first = !sessionStorage.getItem('acs_seen'); }catch(_){}
  var MIN = first ? 500 : 300, MAX = first ? 800 : 600, t0 = Date.now(), over = false;
  var liteConn = null;
  try{ liteConn = navigator.connection || navigator.mozConnection || navigator.webkitConnection; }catch(_){}
  var liteMode = window.matchMedia('(prefers-reduced-motion: reduce)').matches || (liteConn && (liteConn.saveData || /2g/.test(liteConn.effectiveType || '')));
  if(liteMode){ MIN = 0; MAX = 250; }
  document.body.classList.add('is-loading');
  function hide(){
    if(over) return; over = true;
    setTimeout(function(){
      loader.classList.add('done');
      document.body.classList.remove('is-loading');
      done();
      try{ sessionStorage.setItem('acs_seen','1'); }catch(_){}
      setTimeout(function(){ if(loader.parentNode){ loader.parentNode.removeChild(loader); } }, 600);
    }, Math.max(0, MIN - (Date.now() - t0)));
  }
  if(document.readyState === 'complete'){ hide(); }
  else{ window.addEventListener('load', hide); setTimeout(hide, MAX); }
})();

/* ---------- RPM: one car, three experiences (click + hover) ---------- */
(function(){
  var pane = document.getElementById('rpmPane');
  if(!pane) return;
  var RPM = [
    {tag:'01 · Restore', img:'images/paint-correction.jpg', alt:'Paint correction in progress', title:'Back to better than new.', desc:'Machine-led paint correction that erases years of swirls, haze and oxidation.', list:['Paint Correction','Swirl & Oxidation Removal','Headlight Restoration'], href:'services.html', link:'Explore Detailing →'},
    {tag:'02 · Protect', img:'images/ceramic-coating.jpg', alt:'Ceramic coating protection', title:'Lock in the shine for years.', desc:'PPF, ceramic and graphene systems that shield paint from the real world.', list:['Paint Protection Film','Ceramic & Graphene Coating','Windshield & Alloy Coating'], href:'ppf.html', link:'Explore Protection →'},
    {tag:'03 · Maintain', img:'images/foam-wash.jpg', alt:'Maintenance foam wash', title:'Flawless, effortlessly.', desc:'Coating-safe maintenance that keeps protection performing at its peak.', list:['Maintenance Wash','Interior Upkeep','Periodic Checkups'], href:'services.html', link:'Explore Maintenance →'}
  ];
  var opts = Array.prototype.slice.call(document.querySelectorAll('.rpm-opt'));
  var img = document.getElementById('rpmImg'), visual = img.parentNode, tag = document.getElementById('rpmTag');
  var title = document.getElementById('rpmTitle'), desc = document.getElementById('rpmDesc');
  var list = document.getElementById('rpmList'), link = document.getElementById('rpmLink');
  var cur = 0, busy = false;
  RPM.forEach(function(d){ var pre = new Image(); pre.src = d.img; });
  function activate(i){
    if(i === cur || busy) return; busy = true; cur = i;
    var d = RPM[i];
    opts.forEach(function(b, j){
      b.classList.toggle('active', j === i);
      b.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
    pane.classList.add('swap'); visual.classList.add('swap');
    setTimeout(function(){
      title.textContent = d.title; desc.textContent = d.desc; tag.textContent = d.tag;
      list.innerHTML = d.list.map(function(x){ return '<li>' + x + '</li>'; }).join('');
      link.href = d.href; link.textContent = d.link;
      img.src = d.img; img.alt = d.alt;
      var pic = img.parentNode.querySelector('source');
      if(pic){ var w = d.img.replace('.jpg', '.webp'); pic.srcset = w.replace('images/', 'images/small/') + ' 480w, ' + w + ' 1024w'; }
      img.srcset = 'images/small/' + d.img.split('/')[1].replace('.jpg','') + '.jpg 480w, ' + d.img + ' 1024w';
      pane.classList.remove('swap'); visual.classList.remove('swap'); busy = false;
    }, 230);
  }
  opts.forEach(function(b){
    var i = +b.getAttribute('data-rpm');
    b.addEventListener('click', function(){ activate(i); });
  });
  if(window.matchMedia('(hover:hover)').matches){
    opts.forEach(function(b){
      b.addEventListener('mouseenter', function(){ activate(+b.getAttribute('data-rpm')); });
    });
  }
})();

/* ---------- Locations: selectable studio list ---------- */
(function(){
  var wrap = document.querySelector('.loc-wrap');
  if(!wrap) return;
  var LOCS = [
    {tag:'Head Office', name:'Karelibaug', addr:'Aashish Park Society, A-8, VIP Rd, Opp. The Bright School, Karelibagh, Vadodara 390018', phone:'tel:+917778857187', num:'77788 57187', dir:'https://maps.app.goo.gl/1LebAeTbuKiXCMzs5', map:'https://www.google.com/maps?q=Akshar%20Car%20Spa%20VIP%20Road%20Karelibagh%20Vadodara&output=embed'},
    {tag:'Branch', name:'Akota', addr:'A-18, Shrenik Park Society, Opp. Jain Mandir, Akota, Vadodara 390020', phone:'tel:+918511510254', num:'85115 10254', dir:'https://goo.gl/maps/TYtxghgAZuKrZ5V36', map:'https://www.google.com/maps?q=Shrenik%20Park%20Society%20Akota%20Vadodara&output=embed'},
    {tag:'Branch', name:'Manjalpur', addr:'Shop 2, Samanvay Saptaarshi, Old More Mega Store Campus, Opp. Amarnath Puram Soc., Manjalpur 390011', phone:'tel:+918511510254', num:'85115 10254', dir:'https://goo.gl/maps/Z7rQLhvrysPUhE3a9', map:'https://www.google.com/maps?q=Samanvay%20Saptaarshi%20Manjalpur%20Vadodara&output=embed'},
    {tag:'Branch', name:'New Manjalpur', addr:'16, Subh Enclave, Opp. Royal Green Bungalows, Vadsar–Vishwamitri Rd, Vadodara 390010', phone:'tel:+918511510254', num:'85115 10254', dir:'https://goo.gl/maps/PmFkbsyYviQXqSmcA', map:'https://www.google.com/maps?q=Vadsar%20Vishwamitri%20Road%20New%20Manjalpur%20Vadodara&output=embed'}
  ];
  var btns = wrap.querySelectorAll('.loc-btn');
  var elTag = document.getElementById('locTag'), elName = document.getElementById('locName'),
      elAddr = document.getElementById('locAddr'), elPhone = document.getElementById('locPhone'),
      elNum = document.getElementById('locPhoneNum'), elDir = document.getElementById('locDir'),
      elMap = document.getElementById('locMap');
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      var d = LOCS[+b.getAttribute('data-loc')];
      btns.forEach(function(x){
        var on = x === b;
        x.classList.toggle('active', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      elTag.textContent = d.tag; elName.textContent = d.name; elAddr.textContent = d.addr;
      elPhone.href = d.phone; elNum.textContent = d.num; elDir.href = d.dir;
      if(elMap.getAttribute('src') !== d.map){ elMap.src = d.map; }
    });
  });
})();

/* ---------- Process timeline: scroll progress ---------- */
(function(){
  var tl = document.getElementById('processTimeline');
  if(!tl || !('IntersectionObserver' in window)) return;
  var steps = tl.querySelectorAll('.tl-step');
  var bar = document.getElementById('tlBar');
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('lit');
        if(bar){ bar.style.height = Math.round((tl.querySelectorAll('.tl-step.lit').length / steps.length) * 100) + '%'; }
      }
    });
  }, {threshold:.4});
  steps.forEach(function(s){ io.observe(s); });
})();

/* ---------- Context-aware WhatsApp (per-page message) ---------- */
(function(){
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var MSGS = {
    'ppf.html': 'Hi! I want a PPF quote for my car.',
    'coatings.html': 'Hi! I want to know more about ceramic/graphene coating.',
    'services.html': 'Hi! I want details about your car spa services.',
    'gallery.html': 'Hi! I saw your work gallery and want a quote.',
    'booking.html': 'Hi! I want to book an appointment.',
    'contact.html': 'Hi! I have a question for Akshar Car Spa.',
    'about.html': 'Hi! I want to know more about Akshar Car Spa.',
    'interior-detailing.html': 'Hi! I want interior detailing for my car.',
    'polishing.html': 'Hi! I want rubbing/polishing for my car.',
    'car-wash.html': 'Hi! I want a premium car wash slot.',
    'headlight-restoration.html': 'Hi! I want headlight restoration for my car.'
  };
  var msg = MSGS[page] || 'Hi! I want to book a car spa service.';
  document.querySelectorAll('a[href*="wa.me/"]').forEach(function(a){
    try{
      var u = new URL(a.href);
      var t = u.searchParams.get('text') || '';
      if(t.indexOf('I want to book a car spa service') !== -1 || t.indexOf('I want to book an appointment') !== -1){
        u.searchParams.set('text', msg);
        a.href = u.toString();
      }
    }catch(_){}
  });
})();

/* ---------- Analytics events (delegated: phone / whatsapp / directions) ---------- */
(function(){
  document.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(!a) return;
    var href = a.getAttribute('href') || '';
    if(href.indexOf('tel:') === 0){ window.trackEvent('phone_click', {location: href}); }
    else if(href.indexOf('wa.me/') !== -1){ window.trackEvent('whatsapp_click', {page: location.pathname}); }
    else if(href.indexOf('goo.gl/maps') !== -1 || href.indexOf('maps.app.goo.gl') !== -1){ window.trackEvent('directions_click', {location: href}); }
  });
})();

/* ---------- Find nearest studio (needs owner GPS coords) ---------- */
(function(){
  /* TODO — OWNER: BRANCH GEO COORDINATES (Google Maps → right-click studio → lat,lng) */
  var GEO = [null, null, null, null]; /* [karelibaug, akota, manjalpur, new-manjalpur] as {lat:..,lng:..} */
  var NAMES = ['Karelibaug', 'Akota', 'Manjalpur', 'New Manjalpur'];
  var btn = document.getElementById('locNear');
  if(!btn || GEO.some(function(g){ return !g; })) return;
  btn.hidden = false;
  function distKm(a, b, c, d){
    var R = 6371, r = Math.PI / 180;
    var h = Math.sin((c - a) * r / 2), k = Math.sin((d - b) * r / 2);
    var s = h * h + Math.cos(a * r) * Math.cos(c * r) * k * k;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  btn.addEventListener('click', function(){
    if(!navigator.geolocation){ btn.textContent = 'Location unavailable'; return; }
    btn.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(function(pos){
      var best = 0, bd = Infinity;
      GEO.forEach(function(g, i){
        var x = distKm(pos.coords.latitude, pos.coords.longitude, g.lat, g.lng);
        if(x < bd){ bd = x; best = i; }
      });
      var all = document.querySelectorAll('.loc-btn');
      if(all[best]) all[best].click();
      btn.textContent = 'Nearest: ' + NAMES[best] + ' ✓';
      window.trackEvent('nearest_studio', {index: best});
    }, function(){ btn.textContent = 'Location denied — pick a studio ↓'; }, {timeout: 8000});
  });
})();
