/* =========================================================================
   THE ARCHITECT - experience engine
   ========================================================================= */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) html.classList.add('reduced-motion');

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var hasGsap = !!(gsap && ScrollTrigger);

  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({ nullTargetWarn: false });
    ScrollTrigger.config({ ignoreMobileResize: true });
  } else {
    html.classList.add('no-gsap');
  }

  /* ---------------------------------------------------------------- MOUNT */
  var bpHost = $('.js-blueprint');
  if (bpHost && (window.ArchitectArt || window.Architect)) {
    bpHost.innerHTML = (window.ArchitectArt || window.Architect).buildBlueprint();
  }

  $$('.js-mansion').forEach(function (el, i) {
    if (!(window.ArchitectArt || window.Architect)) return;
    el.innerHTML = (window.ArchitectArt || window.Architect).build({
      variant: el.getAttribute('data-variant') || 'reveal',
      uid: el.getAttribute('data-uid') || ('m' + i)
    });
  });

  if (window.ArchitectInteriors) {
    var defsHost = $('#svgDefs');
    if (defsHost) defsHost.innerHTML = window.ArchitectInteriors.defs;
    window.ArchitectInteriors.mountAll();
  }

  /* --------------------------------------------------------------- LOADER */
  var loader = $('#loader');
  var loaderBar = $('#loaderBar');
  var loaderPct = $('#loaderPct');
  var loaderTween = null;
  var revealed = false;

  function setLoader(v) {
    var p = Math.max(0, Math.min(100, v));
    if (loaderBar) loaderBar.style.width = p + '%';
    if (loaderPct) loaderPct.textContent = (p < 10 ? '0' : '') + Math.round(p);
  }

  if (hasGsap) {
    var lo = { v: 0 };
    loaderTween = gsap.to(lo, {
      v: 94, duration: 1.6, ease: 'power2.out',
      onUpdate: function () { setLoader(lo.v); }
    });
  } else {
    setLoader(100);
  }

  function hideLoader() {
    if (!loader) return;
    if (!hasGsap || reduce) {
      loader.style.display = 'none';
      return;
    }
    if (loaderTween) loaderTween.kill();
    setLoader(100);
    gsap.timeline()
      .to(loader, { autoAlpha: 0, duration: 0.7, ease: 'power2.inOut', delay: 0.18 })
      .set(loader, { display: 'none' });
  }

  /* ---------------------------------------------------------------- INTRO */
  var heroTL = null;
  var heroTitle = $$('.hero__line > span');
  var bpDraw = $$('.bp-drawing line, .bp-drawing path');

  if (hasGsap && !reduce) {
    gsap.set(heroTitle, { yPercent: 116 });
    gsap.set(['.hero__sub', '.hero__lede', '.hero .link-arrow'], { autoAlpha: 0, y: 16 });
    gsap.set('.hero__meta > div', { autoAlpha: 0, y: 12 });
    gsap.set('.hero__top > *', { autoAlpha: 0, y: 8 });
    gsap.set('.scroll-cue', { autoAlpha: 0 });
    gsap.set('.hero__bp', { autoAlpha: 0 });
    gsap.set('.bp-dims', { autoAlpha: 0 });
    gsap.set('.bp-drawing rect', { autoAlpha: 0 });

    bpDraw.forEach(function (el) {
      if (!el.getTotalLength) return;
      var len = el.getTotalLength();
      if (!len) return;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
    });
  }

  function playIntro() {
    if (!hasGsap || reduce) return;
    heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTL
      .to('.hero__bp', { autoAlpha: 0.9, duration: 1.1 }, 0)
      .to('.bp-drawing rect', { autoAlpha: 1, duration: 0.9, stagger: 0.008 }, 0.25)
      .to(bpDraw, { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut', stagger: 0.004 }, 0.1)
      .to('.bp-dims', { autoAlpha: 1, duration: 1 }, 0.9)
      .to('.hero__top > *', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.25)
      .to(heroTitle, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.1 }, 0.45)
      .to('.hero__sub', { autoAlpha: 1, y: 0, duration: 1 }, 0.95)
      .to('.hero__lede', { autoAlpha: 1, y: 0, duration: 1 }, 1.08)
      .to('.hero .link-arrow', { autoAlpha: 1, y: 0, duration: 1 }, 1.2)
      .to('.hero__meta > div', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07 }, 1.1)
      .to('.scroll-cue', { autoAlpha: 1, duration: 0.9 }, 1.4);
  }

  /* ------------------------------------------------------------- SCROLL UI */
  var head = $('#siteHead');
  var headSection = $('#headSection');
  var pageProgress = $('#pageProgress');

  var SECTIONS = [
    { id: 'blueprint', num: '01', label: 'BLUEPRINT' },
    { id: 'foundation', num: '02', label: 'FOUNDATION' },
    { id: 'construction', num: '03', label: 'CONSTRUCTION' },
    { id: 'residence', num: '04', label: 'RESIDENCE' },
    { id: 'interiors', num: '05', label: 'INTERIORS' },
    { id: 'completion', num: '06', label: 'COMPLETION' }
  ];

  function setActive(id) {
    var s = null;
    SECTIONS.forEach(function (x) { if (x.id === id) s = x; });
    if (!s) return;
    if (headSection) headSection.textContent = s.num + ' — ' + s.label;
    $$('[data-nav]').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-nav') === id);
    });
    $$('[data-rail]').forEach(function (li) {
      li.classList.toggle('is-active', li.getAttribute('data-rail') === id);
    });
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* -------------------------------------------------------- FOUNDATION UI */
  function setupFoundation() {
    var section = $('#foundation');
    if (!section) return;
    var art = $('[data-variant="foundation"]', section);
    if (!art) return;

    var pctEl = $('#foundationPct');
    var barEl = $('#foundationBar');
    var stages = $$('[data-fstage]', section);

    var ghost = $('.m-ghost', art);
    var excavate = $('.m-excavate', art);
    var footings = $$('.m-footing > g', art);
    var slab = $('.m-slab', art);
    var columns = $$('.m-columns > g', art);
    var lights = $('.m-lights', art);

    function update(p) {
      var pct = Math.round(p * 38);
      if (pctEl) pctEl.textContent = pad(pct);
      if (barEl) barEl.style.width = (p * 100) + '%';
      var stage = 0;
      if (p > 0.62) stage = 3;
      else if (p > 0.4) stage = 2;
      else if (p > 0.17) stage = 1;
      stages.forEach(function (li, i) { li.classList.toggle('is-active', i === stage); });
    }

    if (!hasGsap || reduce) {
      update(1);
      return;
    }

    gsap.set(ghost, { opacity: 0 });
    gsap.set(excavate, { opacity: 0 });
    gsap.set(footings, { opacity: 0, y: 10, transformBox: 'fill-box', transformOrigin: '50% 100%' });
    gsap.set(slab, { opacity: 0, y: -46 });
    gsap.set(columns, {
      scaleY: 0, opacity: 1, transformBox: 'fill-box', transformOrigin: '50% 100%'
    });
    if (lights) gsap.set(lights, { opacity: 0 });

    var pinned = window.innerWidth >= 900;

    if (pinned) {
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=210%',
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { update(self.progress); }
        }
      });
      tl.to(ghost, { opacity: 0.42, duration: 0.2 }, 0)
        .to(excavate, { opacity: 1, duration: 0.22 }, 0.04)
        .to(footings, { opacity: 1, y: 0, duration: 0.26, stagger: 0.025 }, 0.22)
        .to(slab, { opacity: 1, y: 0, duration: 0.3 }, 0.44)
        .to(columns, { scaleY: 1, duration: 0.34, stagger: 0.02 }, 0.58)
        .to(lights, { opacity: 1, duration: 0.2 }, 0.86);
    } else {
      /* Mobile / tablet: play the substructure sequence once on entry. */
      var mob = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 68%',
          toggleActions: 'play none none none',
          onUpdate: function () { update(mob.progress()); }
        }
      });
      mob.to(ghost, { opacity: 0.4, duration: 0.3 }, 0)
        .to(excavate, { opacity: 1, duration: 0.4 }, 0.1)
        .to(footings, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.5)
        .to(slab, { opacity: 1, y: 0, duration: 0.5 }, 1.0)
        .to(columns, { scaleY: 1, duration: 0.6, stagger: 0.06 }, 1.4)
        .to(lights, { opacity: 1, duration: 0.3 }, 2.0);
    }
  }

  /* ------------------------------------------------------ CONSTRUCTION UI */
  var STAGES = [
    {
      title: 'Substructure',
      text: 'Reinforced footings and the ground slab establish the footprint. The structural grid is set out on a 4.2-metre module.'
    },
    {
      title: 'Ground floor',
      text: 'Load-bearing stone walls rise from the slab. The entrance is framed and the limestone facade begins to close the volume.'
    },
    {
      title: 'First floor',
      text: 'The first slab is lowered into position, carrying the upper terrace. A second storey of stone and glass is set out above.'
    },
    {
      title: 'Second floor',
      text: 'Upper volumes are completed and the cantilevered balcony is fixed, reading as a single horizontal plane.'
    },
    {
      title: 'Roof',
      text: 'A flat roof caps the composition, with a deep overhang and a planted terrace above the upper floor.'
    },
    {
      title: 'Envelope',
      text: 'Glass, timber and bronze are installed. The curtain walls are set between floor slabs and the oak blade is revealed.'
    },
    {
      title: 'Landscape',
      text: 'Pool, planting and lighting complete the residence. The house is now read as a whole, between lawn and sky.'
    }
  ];
  var STAGE_AT = [0, 0.12, 0.24, 0.36, 0.5, 0.63, 0.8];

  function setupConstruction() {
    var section = $('#construction');
    if (!section) return;
    var art = $('[data-variant="construction"]', section);
    if (!art) return;

    var pctEl = $('#constructionPct');
    var barEl = $('#constructionBar');
    var idxEl = $('#stageIndex');
    var titleEl = $('#stageTitle');
    var textEl = $('#stageText');
    var listItems = $$('[data-stage]', section);

    var walls = [
      $('.m-floor0 .m-wall', art),
      $('.m-floor1 .m-wall', art),
      $('.m-floor2 .m-wall', art)
    ].filter(Boolean);

    var slab1 = $('.m-slab1', art);
    var slab2 = $('.m-slab2', art);
    var balcony = $('.m-balcony', art);
    var roof = $('.m-roof', art);
    var glazing = $('.m-glazing', art);
    var finish = $('.m-finish', art);
    var landscape = $('.m-landscape', art);
    var lights = $('.m-lights', art);
    var camera = $('.m-camera', art);
    var excavate = $('.m-excavate', art);

    var current = -1;

    function setStage(i) {
      if (i === current) return;
      current = i;
      var s = STAGES[i];
      if (idxEl) idxEl.textContent = pad(i + 1);
      listItems.forEach(function (li, k) {
        li.classList.toggle('is-active', k === i);
        li.classList.toggle('is-done', k < i);
      });
      if (!hasGsap || reduce) {
        if (titleEl) titleEl.textContent = s.title;
        if (textEl) textEl.textContent = s.text;
        return;
      }
      gsap.timeline()
        .to([titleEl, textEl], { autoAlpha: 0, y: 10, duration: 0.22, ease: 'power2.in' })
        .add(function () {
          if (titleEl) titleEl.textContent = s.title;
          if (textEl) textEl.textContent = s.text;
        })
        .fromTo([titleEl, textEl], { autoAlpha: 0, y: -8 }, {
          autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.04
        });
    }

    function update(p) {
      if (pctEl) pctEl.textContent = Math.round(38 + p * 62);
      if (barEl) barEl.style.width = (38 + p * 62) + '%';
      var idx = 0;
      for (var i = 0; i < STAGE_AT.length; i++) {
        if (p >= STAGE_AT[i]) idx = i;
      }
      setStage(idx);
    }

    if (!hasGsap || reduce) {
      update(1);
      setStage(6);
      return;
    }

    gsap.set(walls, {
      scaleY: 0, transformBox: 'fill-box', transformOrigin: '50% 100%'
    });
    gsap.set([slab1, slab2], { opacity: 0, y: -64 });
    gsap.set(balcony, { opacity: 0, y: -28 });
    gsap.set(roof, { opacity: 0, y: -70 });
    gsap.set(glazing, { opacity: 0 });
    gsap.set(finish, { opacity: 0 });
    gsap.set(landscape, { opacity: 0, y: 26 });
    gsap.set(lights, { opacity: 0 });
    if (excavate) gsap.set(excavate, { opacity: 0 });
    if (camera) gsap.set(camera, { transformBox: 'view-box', transformOrigin: '50% 50%' });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=430%',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) { update(self.progress); }
      }
    });

    tl.to(walls[0], { scaleY: 1, duration: 1.1, ease: 'power2.out' }, 0.15)
      .to(slab1, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.25)
      .to(walls[1], { scaleY: 1, duration: 1.1, ease: 'power2.out' }, 1.95)
      .to(balcony, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 3.0)
      .to(slab2, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 3.45)
      .to(walls[2], { scaleY: 1, duration: 1.1, ease: 'power2.out' }, 4.15)
      .to(roof, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 5.25)
      .to(glazing, { opacity: 1, duration: 1.1, ease: 'power1.inOut' }, 6.0)
      .to(finish, { opacity: 1, duration: 0.9 }, 6.7)
      .to(landscape, { opacity: 1, y: 0, duration: 1.3, ease: 'power2.out' }, 7.4)
      .to(lights, { opacity: 1, duration: 0.8 }, 8.5);

    if (camera) tl.to(camera, { scale: 1.025, duration: 9, ease: 'none' }, 0);

    update(0);
    setStage(0);
  }

  /* ------------------------------------------------------- SECTION SCENES */
  function setupScenes() {
    /* hero parallax */
    gsap.to('.hero__inner', {
      yPercent: -9, autoAlpha: 0.05, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__bp', {
      yPercent: 9, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* residence */
    if ($('.res-head')) {
      gsap.from('.res-head .eyebrow, .res-head .h-display', {
        opacity: 0, y: 34, duration: 1.1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.res-head', start: 'top 82%' }
      });
      gsap.from('.res-head__aside > *', {
        opacity: 0, y: 24, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.res-head', start: 'top 78%' }
      });
      gsap.from('.res-art', {
        opacity: 0, y: 60, duration: 1.3, ease: 'power3.out',
        scrollTrigger: { trigger: '.res-art', start: 'top 88%' }
      });
      gsap.fromTo('.res-art .mansion-art', { scale: 1.07 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.res-art', start: 'top bottom', end: 'bottom top', scrub: true }
      });
      gsap.from('.res-data__item', {
        opacity: 0, y: 18, duration: 0.7, stagger: 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: '.res-data', start: 'top 90%' }
      });
      gsap.from('.res-features article', {
        opacity: 0, y: 24, duration: 0.9, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.res-features', start: 'top 88%' }
      });
    }

    /* interiors */
    $$('[data-reveal]').forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    $$('.floor-aside').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0.15 }, {
        opacity: 1, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    /* finale */
    if ($('.finale')) {
      gsap.fromTo('.finale__art svg', { scale: 1.1, yPercent: -3 }, {
        scale: 1, yPercent: 2, ease: 'none',
        scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom bottom', scrub: true }
      });
      gsap.from('.finale__line > span', {
        yPercent: 112, duration: 1.4, stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.finale__title', start: 'top 88%' }
      });
      gsap.from(['.finale .eyebrow', '.finale__copy'], {
        opacity: 0, y: 22, duration: 1, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.finale__title', start: 'top 84%' }
      });
      gsap.from('.finale__actions, .footer', {
        opacity: 0, y: 26, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.finale__actions', start: 'top 92%' }
      });
    }
  }

  /* --------------------------------------------------------------- REPLAY */
  function setupReplay() {
    var btn = $('#replayBtn');
    if (!btn) return;
    var going = false;

    btn.addEventListener('click', function () {
      going = true;
      try {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      } catch (e) {
        window.scrollTo(0, 0);
      }
      if (reduce) going = false;
    });

    window.addEventListener('scroll', function () {
      if (going && window.scrollY < 6) {
        going = false;
        setActive('blueprint');
        if (hasGsap && heroTL && !reduce) {
          heroTL.restart();
        }
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------- SETUP */
  function setupScroll() {
    if (!hasGsap || reduce) return;

    /* header state */
    ScrollTrigger.create({
      trigger: '#foundation',
      start: 'top 72px',
      onEnter: function () { head.classList.add('is-solid'); },
      onLeaveBack: function () { head.classList.remove('is-solid'); }
    });

    /* active section */
    SECTIONS.forEach(function (s) {
      var el = doc.getElementById(s.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 45%',
        end: 'bottom 45%',
        onToggle: function (self) {
          if (self.isActive) setActive(s.id);
        }
      });
    });
    setActive('blueprint');

    /* page progress */
    function onScroll() {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      if (pageProgress && max > 0) {
        pageProgress.style.width = ((window.scrollY / max) * 100).toFixed(3) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    setupFoundation();
    setupConstruction();
    setupScenes();
    setupReplay();

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { ScrollTrigger.refresh(); }, 260);
    });
  }

  /* --------------------------------------------------------------- REVEAL */
  function reveal() {
    if (revealed) return;
    revealed = true;
    hideLoader();
    if (hasGsap && !reduce) {
      playIntro();
      setupScroll();
    } else {
      /* static, fully readable experience */
      if (hasGsap) setupScroll();
      var f = $('#foundationPct');
      if (f) f.textContent = '38';
      var fb = $('#foundationBar');
      if (fb) fb.style.width = '100%';
      var c = $('#constructionPct');
      if (c) c.textContent = '100';
      var cb = $('#constructionBar');
      if (cb) cb.style.width = '100%';
      var s = $('#stageIndex');
      if (s) s.textContent = '07';
      var st = $('#stageTitle');
      if (st) st.textContent = STAGES[6].title;
      var sx = $('#stageText');
      if (sx) sx.textContent = STAGES[6].text;
      $$('[data-fstage]').forEach(function (li) { li.classList.add('is-active'); });
      $$('[data-stage]').forEach(function (li, i) {
        li.classList.remove('is-active');
        if (i === 6) li.classList.add('is-active');
      });
    }
  }

  if (doc.readyState === 'complete') {
    setTimeout(reveal, 500);
  } else {
    window.addEventListener('load', function () { setTimeout(reveal, 500); });
  }
  setTimeout(reveal, 5000);

  /* smooth anchors while keeping the header in view */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = doc.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });
})();
