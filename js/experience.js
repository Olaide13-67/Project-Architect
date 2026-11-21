/* ============================================================
   THE ARCHITECT — experience.js
   Scroll orchestration, viewer controls, interior gallery.
   ============================================================ */

/* ============================================================
   CONTACT CONFIGURATION
   Add the studio's real destinations below. Leave a value blank
   to keep that option inactive. The contact button uses WhatsApp
   first, then email. The consultation button only appears when a
   real scheduling link is configured.
   ============================================================ */
window.ARCHITECT_CONTACT = {
  whatsapp: 'https://wa.me/2348144589405',
  email: 'olaide.frontend@gmail.com',
  portfolio: 'https://olaidedev.netlify.app',
  schedule: '',
  developer: 'https://wa.me/2348144589405'
};

(function () {
  'use strict';

  var body = document.body;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var canvas = $('#stage');
  var intro = $('#intro');
  var cue = $('#cue');
  var hud = $('#buildHud');
  var stageNum = $('#stageNum');
  var stageName = $('#stageName');
  var percentEl = $('#buildPercent');
  var barEl = $('#buildBar');
  var ticks = $$('#ticks i');
  var statusEl = $('#status');
  var loader = $('#loader');
  var viewLabel = $('#viewLabel');
  var viewer = $('#viewer');
  var tourHud = $('#tourHud');
  var tourCount = $('#tourCount');
  var tourFloor = $('#tourFloor');
  var tourRoom = $('#tourRoom');
  var tourMeta = $('#tourMeta');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var interiorReturnFocus = null;
  var interiorKeydown = null;

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  var STAGES = [
    { name: 'SITE', at: 0.0 },
    { name: 'FOUNDATION', at: 0.06 },
    { name: 'GROUND FLOOR', at: 0.17 },
    { name: 'FIRST FLOOR', at: 0.30 },
    { name: 'SECOND FLOOR', at: 0.44 },
    { name: 'ROOF', at: 0.57 },
    { name: 'ENVELOPE', at: 0.66 },
    { name: 'LANDSCAPE', at: 0.82 }
  ];

  var FLOORS = [
    {
      label: 'GROUND FLOOR',
      rooms: [
        { id: 'living', name: 'Living Room', meta: 'GARDEN ASPECT' },
        { id: 'kitchen', name: 'Kitchen', meta: 'WEST LIGHT' },
        { id: 'dining', name: 'Dining Room', meta: 'COURTYARD' }
      ]
    },
    {
      label: 'FIRST FLOOR',
      rooms: [
        { id: 'master', name: 'Master Bedroom', meta: 'PRIVATE TERRACE' },
        { id: 'bedroom2', name: 'Bedroom 02', meta: 'EAST ASPECT' },
        { id: 'bath', name: 'Bathroom', meta: 'STONE & GLASS' }
      ]
    },
    {
      label: 'SECOND FLOOR',
      rooms: [
        { id: 'guest', name: 'Guest Bedroom', meta: 'ROOF LIGHT' },
        { id: 'lounge', name: 'Private Lounge', meta: 'PANORAMIC' },
        { id: 'study', name: 'Study', meta: 'NORTH LIGHT' }
      ]
    }
  ];

  /* Camera keyframes for the scroll-driven interior walkthrough.
     room = index into the flattened FLOORS room list (-1 for transitions). */
  var TOUR_KEYS = [
    { t: 0.000, pos: [-24.4, 15.0, 34.2], target: [0, 5.8, 0], fov: 34, shell: 0.00, room: -1 },
    { t: 0.055, pos: [-9.0, 7.6, 27.0], target: [0.6, 5.2, 0], fov: 36, shell: 0.00, room: -1 },
    { t: 0.085, pos: [0.2, 2.90, 12.6], target: [0.6, 2.50, 4.0], fov: 40, shell: 0.12, room: -1 },
    { t: 0.115, pos: [0.4, 2.42, 7.2], target: [0.8, 2.15, 0.0], fov: 46, shell: 0.62, room: -1 },
    { t: 0.150, pos: [-2.8, 2.95, -4.4], target: [2.8, 1.35, 3.2], fov: 56, shell: 1.00, room: 0 },
    { t: 0.205, pos: [-1.9, 2.85, -4.0], target: [2.9, 1.32, 3.7], fov: 56, shell: 1.00, room: 0 },
    { t: 0.255, pos: [4.2, 2.38, 1.7], target: [7.2, 1.85, -4.6], fov: 50, shell: 1.00, room: 1 },
    { t: 0.325, pos: [-1.9, 2.32, 1.4], target: [-5.7, 1.78, -2.7], fov: 50, shell: 1.00, room: 2 },
    { t: 0.370, pos: [-2.2, 2.90, 10.4], target: [-3.0, 4.6, 0.0], fov: 44, shell: 0.95, room: 2 },
    { t: 0.405, pos: [-3.4, 6.45, 10.4], target: [-3.6, 5.9, 0.0], fov: 42, shell: 0.95, room: -1 },
    { t: 0.445, pos: [-2.6, 6.38, 2.9], target: [-5.2, 5.85, -2.5], fov: 52, shell: 1.00, room: 3 },
    { t: 0.505, pos: [-3.1, 6.34, 2.4], target: [-5.4, 5.82, -2.6], fov: 52, shell: 1.00, room: 3 },
    { t: 0.555, pos: [2.9, 6.38, 2.4], target: [5.4, 5.85, -2.2], fov: 52, shell: 1.00, room: 4 },
    { t: 0.615, pos: [4.6, 6.30, -1.4], target: [8.8, 5.50, 3.6], fov: 52, shell: 1.00, room: 5 },
    { t: 0.660, pos: [7.0, 7.00, 17.0], target: [4.0, 7.6, 0.0], fov: 40, shell: 0.95, room: -1 },
    { t: 0.700, pos: [3.0, 10.90, 17.0], target: [2.0, 9.7, 0.0], fov: 40, shell: 0.95, room: -1 },
    { t: 0.740, pos: [-2.9, 10.20, 2.4], target: [-5.0, 9.65, -2.3], fov: 52, shell: 1.00, room: 6 },
    { t: 0.805, pos: [6.9, 10.18, -4.2], target: [2.0, 9.45, 2.4], fov: 54, shell: 1.00, room: 7 },
    { t: 0.870, pos: [5.2, 10.35, -2.6], target: [6.9, 9.55, 3.1], fov: 48, shell: 1.00, room: 8 },
    { t: 0.925, pos: [11.0, 12.6, 22.0], target: [-1.0, 6.0, 0.0], fov: 38, shell: 0.18, room: -1 },
    { t: 1.000, pos: [-24.4, 15.0, 34.2], target: [0, 5.8, 0.0], fov: 34, shell: 0.00, room: -1 }
  ];

  var progress = 0;
  var complete = false;
  var currentMode = 'exterior';
  var currentPreset = 'threequarter';
  var currentFloor = 0;
  var currentRoom = 0;
  var floorState = [true, true, true];
  var ready = false;
  var lastTour = 0;
  var tourRoomIndex = -1;

  /* ---------- init ---------- */
  function boot() {
    if (!window.THREE) {
      fallback('The 3D experience could not load. Please use a modern browser with WebGL support.');
      return;
    }
    if (!window.Villa || typeof window.Villa.init !== 'function') {
      fallback('The architectural scene could not load. Please refresh the page.');
      return;
    }
    var canvasTest = document.createElement('canvas');
    var hasWebgl = !!(window.WebGLRenderingContext &&
      (canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl')));
    if (!hasWebgl) {
      fallback('The architectural experience requires a browser with WebGL support.');
      return;
    }
    try {
      window.Villa.init(canvas);
    } catch (err) {
      console.error(err);
      fallback('This experience requires WebGL.');
      return;
    }

    ready = true;
    window.Villa.setBuild(0);
    window.Villa.setActive(false);

    var params = new URLSearchParams(window.location.search);
    var isStatic = params.has('p') || params.has('view') || params.has('tour');
    var staticP = params.has('p') ? parseFloat(params.get('p')) : 1;

    if (isStatic) {
      document.body.classList.add('is-static');
    } else {
      // A fresh visit must always begin with an unbuilt site.
      window.scrollTo(0, 0);
      setupScroll();
    }

    setupModes();
    setupPresets();
    setupFloors();
    setupZoom();
    setupInterior();
    setupReplay();
    setupContact();
    setupResize();

    if (isStatic) {
      if (params.has('tour')) {
        var stp = parseFloat(params.get('tour'));
        applyProgress(1);
        applyTour(isFinite(stp) ? stp : 0.5, true);
      } else {
        applyProgress(isFinite(staticP) ? staticP : 1);
        var view = params.get('view');
        if (view === 'cutaway') {
          setMode('cutaway');
        } else if (view === 'interior') {
          setMode('interior');
          var fl = params.get('floor');
          if (fl !== null) {
            var fb = document.querySelector('#interiorFloors [data-floor="' + fl + '"]');
            if (fb) fb.click();
          }
          var rm = params.get('room');
          if (rm) {
            var rb = document.querySelector('#interiorRooms [data-room-id="' + rm + '"]');
            if (rb) rb.click();
          }
        } else {
          var preset = params.get('preset');
          if (preset) {
            var pb = document.querySelector('[data-preset="' + preset + '"]');
            if (pb) pb.click();
          }
        }
      }
    } else {
      applyProgress(0);
      applyTour(0);
    }

    setTimeout(function () {
      if (loader) loader.classList.add('is-done');
      if (!isStatic) refreshScroll();
    }, isStatic ? 400 : 700);

    window.addEventListener('load', function () {
      if (isStatic) return;
      window.scrollTo(0, 0);
      setTimeout(refreshScroll, 60);
    });

    // Chrome can restore scroll after `load`; force the showcase back to its
    // unbuilt start and re-sync the scroll timeline once layout is final.
    window.addEventListener('pageshow', function () {
      if (isStatic) return;
      window.scrollTo(0, 0);
      setTimeout(function () {
        window.scrollTo(0, 0);
        applyProgress(0);
        applyTour(0);
        refreshScroll();
      }, 90);
    });
  }

  function fallback(msg) {
    if (loader) {
      loader.innerHTML = '<span class="loader__mark">THE ARCHITECT</span>' +
        '<p style="font-family:var(--mono);font-size:9px;letter-spacing:.18em;color:#c6a97f;margin:18px 0 0">' + msg + '</p>';
    }
  }

  /* ---------- scroll ---------- */
  function setupScroll() {
    if (reduced) {
      var reducedOnScroll = function () {
        var buildEl = document.getElementById('build');
        var tourEl = document.getElementById('tour');
        var bp = 0;
        if (buildEl) {
          var bSpan = buildEl.offsetHeight - window.innerHeight;
          bp = bSpan > 0 ? (window.scrollY - buildEl.offsetTop) / bSpan : (window.scrollY >= buildEl.offsetTop ? 1 : 0);
        }
        applyProgress(bp);
        if (complete && tourEl) {
          var tSpan = tourEl.offsetHeight - window.innerHeight;
          var tp = tSpan > 0 ? (window.scrollY - tourEl.offsetTop) / tSpan : 0;
          applyTour(tp);
        }
      };
      window.addEventListener('scroll', reducedOnScroll, { passive: true });
      reducedOnScroll();
      return;
    }
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);

      window.ScrollTrigger.create({
        trigger: '#build',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: function (self) {
          applyProgress(self.progress);
        }
      });

      window.ScrollTrigger.create({
        trigger: '#tour',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: function (self) {
          applyTour(self.progress);
        },
        onLeaveBack: function () {
          applyTour(0);
        }
      });
    } else {
      var onScroll = function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var buildEl = document.getElementById('build');
        var tourEl = document.getElementById('tour');

        var bp = 0;
        if (buildEl) {
          var bSpan = buildEl.offsetHeight - window.innerHeight;
          bp = bSpan > 0 ? (window.scrollY - buildEl.offsetTop) / bSpan : (window.scrollY >= buildEl.offsetTop ? 1 : 0);
        }
        applyProgress(bp);

        var tp = 0;
        if (tourEl) {
          var tSpan = tourEl.offsetHeight - window.innerHeight;
          tp = tSpan > 0 ? (window.scrollY - tourEl.offsetTop) / tSpan : 0;
        }
        applyTour(tp);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  function refreshScroll() {
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  var lastStage = -1;
  var lastPct = -1;

  function applyProgress(p) {
    p = Math.max(0, Math.min(1, p));
    progress = p;

    // intro / cue
    var introT = Math.min(1, p / 0.052);
    if (intro) {
      intro.style.opacity = String(1 - introT);
      intro.style.transform = 'translateY(' + (-24 * introT).toFixed(1) + 'px)';
      intro.style.visibility = introT > 0.995 ? 'hidden' : 'visible';
    }
    if (cue) {
      cue.style.opacity = String(Math.max(0, 1 - p / 0.038));
      cue.style.visibility = p > 0.04 ? 'hidden' : 'visible';
    }

    // hud
    var idx = 0;
    for (var i = 0; i < STAGES.length; i++) {
      if (p >= STAGES[i].at) idx = i;
    }
    if (idx !== lastStage) {
      lastStage = idx;
      if (stageNum) stageNum.textContent = String(idx + 1).padStart(2, '0');
      if (stageName) stageName.textContent = STAGES[idx].name;
      ticks.forEach(function (t, ti) {
        t.classList.toggle('is-done', ti < idx);
        t.classList.toggle('is-now', ti === idx);
      });
    }

    var pct = Math.round(p * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      if (percentEl) percentEl.textContent = pct < 10 ? '0' + pct : String(pct);
    }
    if (barEl) barEl.style.width = (p * 100).toFixed(2) + '%';

    // build / completion
    if (p < 0.998) {
      if (complete) leaveComplete();
      if (ready) window.Villa.setBuild(p);
    } else if (!complete) {
      enterComplete();
    }
  }

  /* ---------- interior tour ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth01(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function applyTour(p, instant) {
    p = clamp(p, 0, 1);

    // The tour only owns the camera once the construction is finished.
    // During assembly the build path must stay in control.
    if (!complete) {
      lastTour = 0;
      body.classList.remove('is-touring', 'is-inside', 'is-reveal');
      setTourRoom(-1);
      return;
    }

    lastTour = p;

    // Continuing the scroll from a manual cutaway/interior detour always
    // returns the walkthrough to the exterior shell, without moving the camera.
    if (p > 0.001 && currentMode !== 'exterior') {
      currentMode = 'exterior';
      body.dataset.mode = 'exterior';
      setModeUI('exterior');
      setPresetUI('threequarter');
      floorState = [true, true, true];
      if (ready) {
        window.Villa.showShell();
        window.Villa.setFloors(floorState);
      }
      updateFloorUI();
    }

    var inside = p > 0.055 && p < 0.935;
    body.classList.toggle('is-touring', p > 0.001);
    body.classList.toggle('is-inside', inside);
    if (p > 0.001) body.classList.remove('is-reveal');
    else if (complete) body.classList.add('is-reveal');

    var a = TOUR_KEYS[0], b = TOUR_KEYS[TOUR_KEYS.length - 1];
    for (var i = 0; i < TOUR_KEYS.length - 1; i++) {
      if (p >= TOUR_KEYS[i].t) {
        a = TOUR_KEYS[i];
        b = TOUR_KEYS[i + 1];
      }
    }

    var span = b.t - a.t;
    var u = span > 0 ? smooth01(clamp((p - a.t) / span, 0, 1)) : 0;

    if (ready) {
      window.Villa.setPose(
        [lerp(a.pos[0], b.pos[0], u), lerp(a.pos[1], b.pos[1], u), lerp(a.pos[2], b.pos[2], u)],
        [lerp(a.target[0], b.target[0], u), lerp(a.target[1], b.target[1], u), lerp(a.target[2], b.target[2], u)],
        lerp(a.fov, b.fov, u),
        !!instant
      );
      window.Villa.setShellFade(lerp(a.shell, b.shell, u), !!instant);
    }

    var room = u < 0.55 ? a.room : b.room;
    if (!inside) room = -1;
    setTourRoom(room);

    if (statusEl && complete) {
      statusEl.textContent = inside ? 'WALKTHROUGH'
        : p > 0.93 ? 'TOUR COMPLETE'
        : p > 0.001 ? 'APPROACH'
        : 'COMPLETED';
    }
  }

  function setTourRoom(idx) {
    if (idx === tourRoomIndex) return;
    tourRoomIndex = idx;

    if (idx < 0 || !tourHud) {
      if (tourHud) tourHud.classList.remove('is-on');
      return;
    }

    var floor = Math.floor(idx / 3);
    var data = FLOORS[floor];
    if (!data) return;
    var room = data.rooms[idx % 3];

    if (tourCount) tourCount.textContent = String(floor + 1).padStart(2, '0');
    if (tourFloor) tourFloor.textContent = data.label;
    if (tourRoom) tourRoom.textContent = room.name;
    if (tourMeta) tourMeta.textContent = room.meta;
    tourHud.classList.add('is-on');
    if (viewLabel) viewLabel.textContent = 'WALKTHROUGH — ' + room.name.toUpperCase();
  }

  function exitTour() {
    body.classList.remove('is-touring', 'is-inside', 'is-reveal');
    if (tourHud) tourHud.classList.remove('is-on');
    tourRoomIndex = -1;
    if (ready) {
      window.Villa.releaseFree();
      window.Villa.setShellFade(0);
    }
  }

  function enterComplete() {
    complete = true;
    body.classList.add('is-complete');
    body.classList.add('is-reveal');
    body.classList.remove('is-building', 'is-touring', 'is-inside');
    if (hud) hud.classList.add('is-out');
    if (statusEl) statusEl.textContent = 'COMPLETED';
    floorState = [true, true, true];
    lastTour = 0;
    tourRoomIndex = -1;
    if (tourHud) tourHud.classList.remove('is-on');
    if (ready) {
      window.Villa.setBuild(1);
      window.Villa.setActive(true);
      window.Villa.setMode('exterior');
      window.Villa.setFloors(floorState);
      window.Villa.setShellFade(0, true);
    }
    updateFloorUI();
    setModeUI('exterior');
    setPresetUI('threequarter');
    if (viewLabel) viewLabel.textContent = 'EXTERIOR — THREE-QUARTER';
  }

  function leaveComplete() {
    complete = false;
    body.classList.remove('is-complete', 'is-reveal', 'is-touring', 'is-inside');
    body.classList.add('is-building');
    if (hud) hud.classList.remove('is-out');
    if (statusEl) statusEl.textContent = 'ASSEMBLY';
    closeInterior();
    lastTour = 0;
    tourRoomIndex = -1;
    if (tourHud) tourHud.classList.remove('is-on');
    if (ready) {
      window.Villa.setShellFade(0, true);
      window.Villa.setActive(false);
    }
    currentMode = 'exterior';
    body.dataset.mode = 'exterior';
  }

  /* ---------- modes ---------- */
  function setModeUI(name) {
    currentMode = name;
    body.dataset.mode = name;
    $$('.mode').forEach(function (b) {
      var on = b.getAttribute('data-mode') === name;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
  }

  function setMode(name) {
    if (name === currentMode && name !== 'interior') return;
    if (name !== 'interior') exitTour();
    setModeUI(name);
    if (name === 'interior') {
      if (ready) window.Villa.setMode('interior');
      openInterior();
      return;
    }
    closeInterior();
    if (name === 'exterior') {
      if (ready) window.Villa.setMode('exterior');
      floorState = [true, true, true];
      if (ready) window.Villa.setFloors(floorState);
      updateFloorUI();
      setPresetUI('threequarter');
      currentPreset = 'threequarter';
      if (viewLabel) viewLabel.textContent = 'EXTERIOR — THREE-QUARTER';
    } else if (name === 'cutaway') {
      if (ready) window.Villa.setMode('cutaway');
      floorState = [true, true, true];
      if (ready) window.Villa.setFloors(floorState);
      updateFloorUI();
      if (viewLabel) viewLabel.textContent = 'CUTAWAY — STRUCTURAL';
    }
  }

  function setupModes() {
    $$('.mode').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode(btn.getAttribute('data-mode'));
      });
      btn.addEventListener('keydown', function (e) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        var buttons = $$('.mode');
        var current = buttons.indexOf(btn);
        var next = current;
        if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
        if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = buttons.length - 1;
        e.preventDefault();
        buttons[next].focus();
        buttons[next].click();
      });
    });
  }

  /* ---------- presets ---------- */
  function setupPresets() {
    $$('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.getAttribute('data-preset');
        exitTour();
        currentPreset = name;
        setPresetUI(name);
        if (ready) window.Villa.setPreset(name);
        var label = name === 'threequarter' ? 'THREE-QUARTER' : name.toUpperCase();
        if (viewLabel) viewLabel.textContent = 'EXTERIOR — ' + label;
      });
    });
  }

  function setPresetUI(name) {
    $$('[data-preset]').forEach(function (b) {
      var on = b.getAttribute('data-preset') === name;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* ---------- floors ---------- */
  function setupFloors() {
    $$('[data-level]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = btn.getAttribute('data-level');
        if (val === 'all') {
          floorState = [true, true, true];
        } else {
          var i = parseInt(val, 10);
          floorState[i] = !floorState[i];
        }
        if (ready) window.Villa.setFloors(floorState);
        updateFloorUI();
      });
    });
    updateFloorUI();
  }

  function updateFloorUI() {
    $$('[data-level]').forEach(function (b) {
      var v = b.getAttribute('data-level');
      var on = v === 'all' ? (floorState[0] && floorState[1] && floorState[2]) : floorState[parseInt(v, 10)];
      b.classList.toggle('is-on', !!on);
      b.setAttribute('aria-pressed', !!on);
    });
  }

  /* ---------- zoom ---------- */
  function setupZoom() {
    var zi = $('#zoomIn'), zo = $('#zoomOut'), zr = $('#zoomReset');
    if (zi) zi.addEventListener('click', function () { if (ready) window.Villa.zoom(1); });
    if (zo) zo.addEventListener('click', function () { if (ready) window.Villa.zoom(-1); });
    if (zr) zr.addEventListener('click', function () {
      if (!ready) return;
      window.Villa.setPreset(currentMode === 'cutaway' ? 'cutaway' : currentPreset);
    });
  }

  /* ---------- interior gallery ---------- */
  function setupInterior() {
    var close = $('#interiorClose');
    var enter = $('#enterRooms');
    var overlay = $('#interior');

    if (close) close.addEventListener('click', function () { dismissInterior(); });
    if (enter) enter.addEventListener('click', function () { openInterior(); });

    $$('#interiorFloors [data-floor]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentFloor = parseInt(btn.getAttribute('data-floor'), 10);
        currentRoom = 0;
        renderFloor();
      });
      btn.addEventListener('keydown', function (e) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        var buttons = $$('#interiorFloors [data-floor]');
        var current = buttons.indexOf(btn);
        var next = current;
        if (e.key === 'ArrowRight') next = (current + 1) % buttons.length;
        if (e.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = buttons.length - 1;
        e.preventDefault();
        buttons[next].focus();
        buttons[next].click();
      });
    });

    if (overlay) {
      interiorKeydown = function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          dismissInterior();
          return;
        }
        if (e.key !== 'Tab') return;
        var focusable = Array.prototype.slice.call(overlay.querySelectorAll(
          'button:not([disabled]):not([hidden]), [href], [tabindex]:not([tabindex="-1"])'
        )).filter(function (el) { return el.offsetParent !== null; });
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      overlay.addEventListener('keydown', interiorKeydown);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) {
        dismissInterior();
      }
    });
  }

  function dismissInterior() {
    closeInterior();
    if (complete && lastTour > 0.01) {
      currentMode = 'exterior';
      body.dataset.mode = 'exterior';
      setModeUI('exterior');
      setPresetUI('threequarter');
      floorState = [true, true, true];
      if (ready) {
        window.Villa.showShell();
        window.Villa.setFloors(floorState);
      }
      updateFloorUI();
      body.classList.add('is-touring');
      applyTour(lastTour);
      return;
    }
    setMode('exterior');
  }

  function openInterior() {
    var overlay = $('#interior');
    if (!overlay) return;
    interiorReturnFocus = document.activeElement;
    setModeUI('interior');
    renderFloor();
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
    var close = $('#interiorClose');
    if (close) close.focus({ preventScroll: true });
  }

  function closeInterior() {
    var overlay = $('#interior');
    if (!overlay) return;
    var wasOpen = overlay.classList.contains('is-open');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    if (wasOpen && interiorReturnFocus) {
      var restore = interiorReturnFocus;
      interiorReturnFocus = null;
      restore.focus({ preventScroll: true });
    }
  }

  function renderFloor() {
    var floor = FLOORS[currentFloor];
    if (!floor) return;

    $$('#interiorFloors [data-floor]').forEach(function (b) {
      var on = parseInt(b.getAttribute('data-floor'), 10) === currentFloor;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
      b.setAttribute('aria-controls', 'roomScene');
    });

    var label = $('#interiorFloorLabel');
    if (label) label.textContent = floor.label;

    var list = $('#interiorRooms');
    if (list) {
      list.innerHTML = '';
      floor.rooms.forEach(function (room, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = room.name;
        b.className = i === currentRoom ? 'is-on' : '';
        b.setAttribute('data-room-id', room.id);
        b.setAttribute('aria-pressed', i === currentRoom ? 'true' : 'false');
        b.addEventListener('click', function () {
          currentRoom = i;
          renderRoom();
        });
        list.appendChild(b);
      });
    }
    renderRoom();
  }

  function renderRoom() {
    var floor = FLOORS[currentFloor];
    if (!floor) return;
    var room = floor.rooms[currentRoom];
    if (!room) return;

    $$('#interiorRooms [data-room-id]').forEach(function (b) {
      var on = b.getAttribute('data-room-id') === room.id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    var title = $('#roomTitle');
    if (title) title.textContent = room.name;
    var meta = $('#roomMeta');
    if (meta) meta.textContent = floor.label + ' / ' + room.meta;
    var idx = $('#roomIndex');
    if (idx) idx.textContent = String(currentFloor * 3 + currentRoom + 1).padStart(2, '0') + ' / 09';

    var holder = $('#roomScene');
    if (holder && window.ArchitectInteriors) {
      holder.innerHTML = window.ArchitectInteriors.render(room.id);
    }
  }

  /* ---------- contact ---------- */
  function setupContact() {
    var cfg = window.ARCHITECT_CONTACT || {};
    var primary = $('#contactUs');
    var schedule = $('#contactSchedule');
    var email = $('#contactEmail');
    var portfolio = $('#contactPortfolio');
    var note = $('#contactNote');
    var dev = $('#devLink');
    var isHttp = function (v) { return /^https?:\/\//i.test(v); };

    var primaryHref = cfg.whatsapp || '';
    var whatsappMessage = 'Hello Olaide, I explored THE ARCHITECT and I\'m interested in having something similar created for my business.';
    if (cfg.whatsapp) {
      primaryHref = cfg.whatsapp + '?text=' + encodeURIComponent(whatsappMessage);
    }
    if (!primaryHref && cfg.email) {
      primaryHref = 'mailto:' + cfg.email +
        '?subject=' + encodeURIComponent('Project enquiry — The Architect');
    }

    if (primary) {
      if (primaryHref) {
        primary.href = primaryHref;
        if (isHttp(primaryHref)) {
          primary.target = '_blank';
          primary.rel = 'noopener noreferrer';
        }
      } else {
        primary.classList.add('is-unconfigured');
        primary.setAttribute('aria-describedby', 'contactNote');
        primary.addEventListener('click', function (e) {
          e.preventDefault();
          if (note) {
            note.textContent = 'Enquiries are being connected — please check back shortly.';
            note.classList.add('is-on');
          }
        });
      }
    }

    if (schedule) {
      if (cfg.schedule) {
        schedule.href = cfg.schedule;
        if (isHttp(cfg.schedule)) {
          schedule.target = '_blank';
          schedule.rel = 'noopener noreferrer';
        }
      } else {
        // Only offer booking when a real scheduling destination exists.
        schedule.hidden = true;
      }
    }

    if (email) {
      if (cfg.email) {
        email.href = 'mailto:' + cfg.email +
          '?subject=' + encodeURIComponent('Project enquiry — The Architect');
      } else {
        email.hidden = true;
      }
    }

    if (portfolio) {
      if (cfg.portfolio) {
        portfolio.href = cfg.portfolio;
        portfolio.target = '_blank';
        portfolio.rel = 'noopener noreferrer';
      } else {
        portfolio.hidden = true;
      }
    }

    if (dev) {
      var developerHref = cfg.developer || (cfg.whatsapp || '');
      if (developerHref) {
        var developerMessage = 'Hello Olaide, I explored THE ARCHITECT and I\'m interested in having something similar created for my business.';
        dev.href = developerHref + (developerHref.indexOf('?') === -1 ? '?' : '&') +
          'text=' + encodeURIComponent(developerMessage);
        if (isHttp(developerHref)) {
          dev.target = '_blank';
          dev.rel = 'noopener noreferrer';
        }
      } else {
        dev.removeAttribute('href');
        dev.classList.add('is-plain');
      }
    }

    var section = $('#contact');
    if (!section) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          body.classList.toggle('is-contact', entry.isIntersecting);
          if (entry.intersectionRatio > 0.28) section.classList.add('is-in');
        });
      }, { threshold: [0, 0.28, 0.55] });
      io.observe(section);
    } else {
      section.classList.add('is-in');
    }

    var updateContactState = function () {
      var rect = section.getBoundingClientRect();
      var active = rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.18;
      body.classList.toggle('is-contact', active);
      if (active) section.classList.add('is-in');
    };
    window.addEventListener('scroll', updateContactState, { passive: true });
    updateContactState();
  }

  /* ---------- replay ---------- */
  function setupReplay() {
    var replay = $('#replay');
    var mark = $('.mark');
    var go = function (e) {
      if (e) e.preventDefault();
      closeInterior();
      exitTour();
      setModeUI('exterior');
      body.dataset.mode = 'exterior';
      if (ready) window.Villa.setShellFade(0, true);
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    };
    if (replay) replay.addEventListener('click', go);
    if (mark) mark.addEventListener('click', go);
  }

  /* ---------- resize ---------- */
  function setupResize() {
    var t = null;
    window.addEventListener('resize', function () {
      if (ready) window.Villa.resize();
      clearTimeout(t);
      t = setTimeout(refreshScroll, 180);
    });
  }

  /* ---------- go ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
