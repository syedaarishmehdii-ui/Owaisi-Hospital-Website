(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Footer year ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Scroll progress bar + cursor glow ---------- */
  var progress = document.createElement('div');
  progress.className = 'progress';
  document.body.appendChild(progress);

  var glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) {
    document.addEventListener('mousemove', function (e) {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', function () { glow.style.opacity = '0'; });
  }

  /* ---------- Header, progress, back-to-top ---------- */
  var header = $('header');
  var toTop = $('.to-top');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 30);
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (toTop) toTop.classList.toggle('show', y > 500);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $('.menu-toggle');
  var nav = $('#navlinks');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('open')) toggle.click();
    });
  }

  /* ---------- Scroll reveal animations ---------- */
  var revealEls = $$('.slide-l,.slide-r,.slide-up,.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Number counters ---------- */
  var counters = $$('[data-count]');

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var plain = el.getAttribute('data-plain') === '1';
    var dur = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = (plain ? String(val) : val.toLocaleString('en-IN')) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          runCounter(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || '');
    });
  }

  /* ---------- Card spotlight glow ---------- */
  document.addEventListener('mousemove', function (e) {
    var card = e.target.closest && e.target.closest('.card');
    if (card) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }
  });

  /* ---------- Hero slider ---------- */
  var slides = $$('.hs');
  var dots = $$('.hero-dots button');

  if (slides.length > 1) {
    var hi = 0;
    var htimer;

    var showSlide = function (i) {
      hi = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('active', n === hi); });
      dots.forEach(function (d, n) { d.classList.toggle('active', n === hi); });
    };

    var startHero = function () {
      clearInterval(htimer);
      htimer = setInterval(function () { showSlide(hi + 1); }, 6000);
    };

    dots.forEach(function (d, n) {
      d.addEventListener('click', function () {
        showSlide(n);
        startHero();
      });
    });

    startHero();
  }

  /* ---------- Enquiry form (opens email app) ---------- */
  var form = $('#enquiry-form');
  var note = $('#form-note');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var email = form.elements.email.value.trim();
      var msg = form.elements.message.value.trim();

      if (!name || !phone || !msg) {
        note.textContent = 'Please fill in your name, phone number and message.';
        return;
      }
      if ((phone.match(/\d/g) || []).length < 7) {
        note.textContent = 'Please enter a valid phone number.';
        return;
      }
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        note.textContent = 'Please enter a valid email address or leave it blank.';
        return;
      }

      var body = 'Name: ' + name + '\nPhone: ' + phone +
        (email ? '\nEmail: ' + email : '') + '\n\nMessage:\n' + msg;

      var url = 'mailto:info@owaisihospital.com?subject=' +
        encodeURIComponent('Website enquiry from ' + name) +
        '&body=' + encodeURIComponent(body);

      note.textContent = 'Opening your email app… If nothing opens, please email info@owaisihospital.com directly.';
      window.location.href = url;
    });
  }

  /* ---------- Virtual tour ---------- */
  var vt = $('#vt');

  if (vt) {

    /* ===== ADD / EDIT YOUR TOUR PHOTOS HERE =====
       Copy one line to add a photo. Upload the image to assets/tour/ */
    var scenes = [
      { title: 'Campus Exterior', text: 'Approach the hospital and see the main building.',  local: 'assets/tour/campus.jpg' },
      { title: 'Main Entrance',   text: 'The welcoming entrance for patients and visitors.', local: 'assets/tour/entrance.jpg' },
      { title: 'Emergency Wing',  text: 'Open around the clock for urgent care.',            local: 'assets/tour/emergency.jpg' },
      { title: 'Reception',       text: 'Registration and guidance from our front desk.',    local: 'assets/tour/reception.jpg' },
      { title: 'Patient Ward',    text: 'Calm, clean rooms where patients recover.',         local: 'assets/tour/ward.jpg' }
    ];

    var stage = $('#vtStage');
    var pan = $('#vtPan');
    var img = $('#vtImg');
    var cap = $('.vt-cap', vt);
    var vTitle = $('#vtTitle');
    var vText = $('#vtText');
    var vCount = $('#vtCount');
    var bar = $('#vtBar');
    var playBtn = $('#vtPlay');
    var fsBtn = $('#vtFs');

    /* build thumbnails automatically from the scenes list */
    var thumbWrap = $('#vtThumbs');
    thumbWrap.innerHTML = '';
    scenes.forEach(function (s, n) {
      var b = document.createElement('button');
      b.className = 'thumb';
      b.innerHTML = '<span class="thumb-img"></span><b>' +
        String(n + 1).padStart(2, '0') + '</b><em></em>';
      $('em', b).textContent = s.title;
      thumbWrap.appendChild(b);
    });
    var thumbs = $$('.thumb', vt);

    var cur = 0, x = 0, minX = 0;
    var playing = false, dragging = false, needCenter = true;
    var startX = 0, startOff = 0, t0 = 0, dir = -1, token = 0;
    var DUR = 7000;

    var apply = function () {
      pan.style.transform = 'translate3d(' + x + 'px,0,0)';
    };

    var bounds = function () {
      var sw = stage.clientWidth;
      if (!sw) return;
      img.style.minWidth = sw + 'px';   /* photo always fills the frame */
      var iw = img.clientWidth;
      if (!iw) return;

      minX = Math.min(0, sw - iw);
      if (needCenter) {
        x = minX / 2;
        needCenter = false;
      }
      x = Math.max(minX, Math.min(0, x));
      apply();
    };

    var go = function (i) {
      if (!scenes.length) return;

      cur = (i + scenes.length) % scenes.length;
      var s = scenes[cur];
      var my = ++token;

      img.classList.remove('in');
      img.alt = s.title;

      img.onerror = function () {
        img.onerror = null;
        if (s.fallback) img.src = s.fallback;
      };

      img.onload = function () {
        if (my !== token) return;
        needCenter = true;
        bounds();
        requestAnimationFrame(function () { img.classList.add('in'); });
      };

      img.src = s.local;

      vTitle.textContent = s.title;
      vText.textContent = s.text;
      vCount.textContent =
        String(cur + 1).padStart(2, '0') + ' / ' + String(scenes.length).padStart(2, '0');

      cap.classList.remove('swap');
      void cap.offsetWidth;
      cap.classList.add('swap');

      thumbs.forEach(function (t, n) { t.classList.toggle('active', n === cur); });

      t0 = performance.now();
      bar.style.width = '0%';
    };

    /* thumbnail images + clicks */
    thumbs.forEach(function (t, n) {
      var ti = $('.thumb-img', t);
      if (scenes[n] && ti) ti.style.backgroundImage = 'url("' + scenes[n].local + '")';
      t.addEventListener('click', function () { go(n); });
    });

    $('#vtPrev').addEventListener('click', function () { go(cur - 1); });
    $('#vtNext').addEventListener('click', function () { go(cur + 1); });

    /* drag to look around */
    stage.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      dragging = true;
      startX = e.clientX;
      startOff = x;
      stage.classList.add('drag');
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
    });

    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      x = Math.max(minX, Math.min(0, startOff + (e.clientX - startX)));
      apply();
    });

    var endDrag = function () {
      dragging = false;
      stage.classList.remove('drag');
    };

    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* keyboard */
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        x = Math.min(0, x + 80);
        apply();
        e.preventDefault();
      }
      if (e.key === 'ArrowRight') {
        x = Math.max(minX, x - 80);
        apply();
        e.preventDefault();
      }
    });

    /* auto tour */
    playBtn.addEventListener('click', function () {
      playing = !playing;
      playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      $('span', playBtn).textContent = playing ? 'Pause' : 'Auto tour';
      t0 = performance.now();
      if (!playing) bar.style.width = '0%';
    });

    /* full screen */
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (stage.requestFullscreen) {
        stage.requestFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', function () {
      needCenter = true;
      $('span', fsBtn).textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
      setTimeout(bounds, 80);
    });

    /* animation loop */
    var loop = function (now) {
      if (!vt.offsetParent) {
        t0 = now;
      } else if (playing && !dragging) {
        var p = (now - t0) / DUR;
        bar.style.width = Math.min(100, p * 100) + '%';

        if (p >= 1) {
          go(cur + 1);
        } else if (minX < 0) {
          x += dir * 0.3;
          if (x <= minX) { x = minX; dir = 1; }
          if (x >= 0) { x = 0; dir = -1; }
          apply();
        }
      }
      requestAnimationFrame(loop);
    };

    window.addEventListener('resize', bounds);
    go(0);
    requestAnimationFrame(loop);
  }

  /* ---------- Single-page router ---------- */
  var pages = $$('.page');
  var links = $$('#navlinks a[href^="#"]');
  var base = 'Owaisi Hospital & Research Centre';

  function showPage() {
    var id = location.hash.slice(1);
    if (id === 'main' || id === 'top') return;
    if (!pages.some(function (p) { return p.id === id; })) id = 'home';

    pages.forEach(function (p) { p.hidden = (p.id !== id); });

    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    document.title = document.getElementById(id).dataset.title + ' | ' + base;

    var t = $('.menu-toggle');
    if (t && t.getAttribute('aria-expanded') === 'true') t.click();

    window.scrollTo(0, 0);
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 60);
  }

  window.addEventListener('hashchange', showPage);
  showPage();
})();
