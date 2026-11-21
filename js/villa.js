/* ============================================================
   THE ARCHITECT — villa.js
   Real-time 3D residence, scroll-driven assembly + viewer.
   Depends on three.min.js (global THREE).
   ============================================================ */
(function () {
  'use strict';

  var T = window.THREE;
  if (!T) {
    console.warn('[Villa] THREE missing');
    return;
  }

  /* ---------- constants ---------- */
  var Y0 = 0.70;          // top of plinth / ground floor datum
  var L0H = 3.50;
  var SLAB1 = 4.36;       // centre of slab 1
  var SLAB2 = 8.18;
  var ROOFY = 11.82;      // centre of roof slab
  var L1Y = SLAB1 + 0.18; // finished floor level 1
  var L2Y = SLAB2 + 0.18;
  var TH = 0.34;          // slab thickness

  /* ---------- state ---------- */
  var renderer, scene, camera, clock, envMap, canvasEl;
  var building, G = {};
  var A = {
    walls0: [], walls1: [], walls2: [],
    columns: [], footings: [], slabFoot: null,
    slab1: null, slab2: null, roof: null, tower: null,
    glazings: [], glassMats: [[], [], []],
    balconies: [], rails: [], doors: [],
    trees: [], hedges: [], water: null, waterTop: null,
    strips: [], shellFront: [], shellRight: [], shellAll: [],
    shellFadeMeshes: [], interiorLights: [],
    loungeChairs: [], planters: []
  };

  var state = {
    build: 0,
    mode: 'exterior',
    active: false,
    floors: [true, true, true],
    preset: 'threequarter',
    dragging: false,
    portrait: false,
    shellFade: 0,
    shellGoal: 0
  };
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.matchMedia) {
    var reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var updateReducedMotion = function (event) {
      reducedMotion = !!event.matches;
    };
    if (reducedQuery.addEventListener) reducedQuery.addEventListener('change', updateReducedMotion);
    else if (reducedQuery.addListener) reducedQuery.addListener(updateReducedMotion);
  }
  var isMobileDevice = false;
  var pageHidden = false;

  var orbit = { yaw: -0.62, pitch: 0.2, radius: 41, ty: 6.3 };
  var goal = { yaw: -0.62, pitch: 0.2, radius: 41, ty: 6.3 };

  // free cinematic camera used by the scroll-driven interior tour
  var pose = {
    on: false,
    pos: null,
    target: null,
    goalPos: null,
    goalTarget: null,
    fov: 34,
    goalFov: 34
  };

  var PRESETS = {
    threequarter: { yaw: -0.62, pitch: 0.215, radius: 43, ty: 5.8 },
    front: { yaw: 0.0, pitch: 0.10, radius: 42, ty: 5.8 },
    side: { yaw: -1.28, pitch: 0.13, radius: 44, ty: 5.8 },
    elevated: { yaw: -0.52, pitch: 0.58, radius: 49, ty: 5.4 },
    cutaway: { yaw: 0.58, pitch: 0.30, radius: 42, ty: 5.9 }
  };

  var RADIUS_FIT = 1;

  /* ---------- utils ---------- */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function seg(p, a, b) { return smooth((p - a) / (b - a)); }

  var seed = 9137;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  /* ---------- procedural textures ---------- */
  function makeTexture(kind, rx, ry) {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var x = c.getContext('2d');

    if (kind === 'concrete') {
      x.fillStyle = '#d0c9ba'; x.fillRect(0, 0, 256, 256);
      for (var i = 0; i < 3000; i++) {
        var g = 176 + Math.floor(rnd() * 46);
        x.fillStyle = 'rgba(' + g + ',' + (g - 5) + ',' + (g - 14) + ',' + (0.05 + rnd() * 0.08) + ')';
        x.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 2);
      }
      for (var y = 42; y < 256; y += 84) {
        x.strokeStyle = 'rgba(96,88,76,0.15)'; x.lineWidth = 1;
        x.beginPath(); x.moveTo(0, y); x.lineTo(256, y); x.stroke();
        x.strokeStyle = 'rgba(255,255,255,0.10)';
        x.beginPath(); x.moveTo(0, y + 1.5); x.lineTo(256, y + 1.5); x.stroke();
      }
      for (var k = 0; k < 34; k++) {
        x.fillStyle = 'rgba(112,104,92,' + (0.02 + rnd() * 0.05) + ')';
        x.beginPath(); x.arc(rnd() * 256, rnd() * 256, 5 + rnd() * 24, 0, 6.283); x.fill();
      }
    } else if (kind === 'stone') {
      x.fillStyle = '#b4a88f'; x.fillRect(0, 0, 256, 256);
      var rows = 4, rh = 256 / rows;
      for (var r = 0; r < rows; r++) {
        var off = (r % 2) * 64;
        for (var b = -1; b < 3; b++) {
          var l = 178 + Math.floor(rnd() * 12);
          x.fillStyle = 'rgb(' + l + ',' + (l - 9) + ',' + (l - 24) + ')';
          x.fillRect(b * 128 + off + 2, r * rh + 2, 124, rh - 4);
        }
      }
      for (var rr = 0; rr <= rows; rr++) {
        x.strokeStyle = 'rgba(82,72,58,0.2)'; x.lineWidth = 1.4;
        x.beginPath(); x.moveTo(0, rr * rh); x.lineTo(256, rr * rh); x.stroke();
      }
      for (var i2 = 0; i2 < 2400; i2++) {
        x.fillStyle = 'rgba(80,70,58,' + (rnd() * 0.09) + ')';
        x.fillRect(rnd() * 256, rnd() * 256, 1.5, 1.5);
      }
    } else if (kind === 'lawn') {
      x.fillStyle = '#5f7047'; x.fillRect(0, 0, 256, 256);
      for (var b0 = 0; b0 < 6; b0++) {
        x.fillStyle = b0 % 2 ? 'rgba(255,255,235,0.035)' : 'rgba(20,40,18,0.05)';
        x.fillRect(b0 * 43, 0, 43, 256);
      }
      for (var i3 = 0; i3 < 9000; i3++) {
        var gg = 74 + Math.floor(rnd() * 48);
        x.fillStyle = 'rgba(' + Math.floor(gg * 0.7) + ',' + gg + ',' + Math.floor(gg * 0.6) + ',' + (0.10 + rnd() * 0.24) + ')';
        x.fillRect(rnd() * 256, rnd() * 256, 1, 1 + rnd() * 2);
      }
    } else if (kind === 'wood') {
      x.fillStyle = '#7d5535'; x.fillRect(0, 0, 256, 256);
      for (var w = 0; w < 240; w++) {
        var v = 62 + Math.floor(rnd() * 62);
        x.strokeStyle = 'rgba(' + v + ',' + Math.floor(v * 0.6) + ',' + Math.floor(v * 0.38) + ',' + (0.10 + rnd() * 0.26) + ')';
        x.lineWidth = 0.5 + rnd() * 2.4;
        var xx = rnd() * 256;
        x.beginPath(); x.moveTo(xx, 0);
        x.bezierCurveTo(xx + (rnd() - 0.5) * 8, 85, xx + (rnd() - 0.5) * 8, 170, xx + (rnd() - 0.5) * 6, 256);
        x.stroke();
      }
      for (var kn = 0; kn < 7; kn++) {
        x.strokeStyle = 'rgba(58,34,18,0.18)'; x.lineWidth = 1;
        x.beginPath(); x.ellipse(rnd() * 256, rnd() * 256, 3 + rnd() * 5, 7 + rnd() * 9, 0, 0, 6.283); x.stroke();
      }
    } else if (kind === 'lawn') {
      x.fillStyle = '#6d7d53'; x.fillRect(0, 0, 256, 256);
      for (var i3 = 0; i3 < 9000; i3++) {
        var gg = 90 + Math.floor(rnd() * 55);
        x.fillStyle = 'rgba(' + Math.floor(gg * 0.72) + ',' + gg + ',' + Math.floor(gg * 0.62) + ',' + (0.10 + rnd() * 0.22) + ')';
        x.fillRect(rnd() * 256, rnd() * 256, 1, 1 + rnd() * 2);
      }
    } else if (kind === 'paver') {
      x.fillStyle = '#bdb4a2'; x.fillRect(0, 0, 256, 256);
      for (var py = 0; py < 4; py++) {
        for (var px = 0; px < 4; px++) {
          var l2 = 178 + Math.floor(rnd() * 28);
          x.fillStyle = 'rgb(' + l2 + ',' + (l2 - 6) + ',' + (l2 - 18) + ')';
          x.fillRect(px * 64 + 2, py * 64 + 2, 60, 60);
        }
      }
      x.strokeStyle = 'rgba(90,82,70,0.35)'; x.lineWidth = 2;
      for (var q = 0; q <= 4; q++) {
        x.beginPath(); x.moveTo(q * 64, 0); x.lineTo(q * 64, 256); x.stroke();
        x.beginPath(); x.moveTo(0, q * 64); x.lineTo(256, q * 64); x.stroke();
      }
    }

    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.encoding = T.sRGBEncoding;
    t.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    return t;
  }

  /* ---------- materials ---------- */
  var MAT = {};

  function buildMaterials() {
    var concreteMap = makeTexture('concrete', 3, 2);
    var stoneMap = makeTexture('stone', 3, 1);
    var woodMap = makeTexture('wood', 2, 4);
    var lawnMap = makeTexture('lawn', 16, 16);
    var paverMap = makeTexture('paver', 3, 14);

    MAT.concrete = new T.MeshStandardMaterial({
      map: concreteMap, bumpMap: concreteMap, bumpScale: 0.018,
      roughness: 0.9, metalness: 0.02, color: 0xd6cfc1
    });
    MAT.concreteDark = new T.MeshStandardMaterial({
      map: concreteMap, bumpMap: concreteMap, bumpScale: 0.012,
      roughness: 0.92, metalness: 0.03, color: 0xa49c8d
    });
    MAT.stone = new T.MeshStandardMaterial({
      map: stoneMap, bumpMap: stoneMap, bumpScale: 0.03,
      roughness: 0.82, metalness: 0.02, color: 0xe3d9c7
    });
    MAT.wood = new T.MeshStandardMaterial({
      map: woodMap, bumpMap: woodMap, bumpScale: 0.02,
      roughness: 0.55, metalness: 0.03, color: 0xd8c3ad
    });
    MAT.woodDark = new T.MeshStandardMaterial({
      map: woodMap, roughness: 0.62, metalness: 0.03, color: 0x9c7a58
    });
    MAT.lawn = new T.MeshStandardMaterial({
      map: lawnMap, roughness: 1, metalness: 0, color: 0x9aa17e
    });
    MAT.gravel = new T.MeshStandardMaterial({
      map: concreteMap, bumpMap: concreteMap, bumpScale: 0.02,
      roughness: 1, metalness: 0, color: 0x736d60
    });
    MAT.chalk = new T.MeshStandardMaterial({ color: 0xd8d0bd, roughness: 1 });
    MAT.paver = new T.MeshStandardMaterial({
      map: paverMap, bumpMap: paverMap, bumpScale: 0.01,
      roughness: 0.9, metalness: 0.02
    });
    MAT.interiorFloor = new T.MeshStandardMaterial({
      map: makeTexture('wood', 3, 3), roughness: 0.62, metalness: 0.02, color: 0xa98c69
    });
    MAT.interiorWall = new T.MeshStandardMaterial({ color: 0xc9c0b1, roughness: 0.95 });
    MAT.liner = new T.MeshStandardMaterial({ color: 0x6b6152, roughness: 0.92 });
    MAT.interiorDark = new T.MeshStandardMaterial({ color: 0x4e463a, roughness: 0.9 });
    MAT.bronze = new T.MeshStandardMaterial({ color: 0x3a332c, roughness: 0.38, metalness: 0.82, envMap: envMap, envMapIntensity: 0.75 });
    MAT.darkMetal = new T.MeshStandardMaterial({ color: 0x2c2925, roughness: 0.5, metalness: 0.7, envMap: envMap, envMapIntensity: 0.7 });
    MAT.glass = new T.MeshPhysicalMaterial({
      color: 0x7fa6a8, metalness: 0.32, roughness: 0.05,
      transparent: true, opacity: 0.42, envMap: envMap, envMapIntensity: 1.45,
      side: T.DoubleSide, depthWrite: false
    });
    MAT.glassRail = new T.MeshPhysicalMaterial({
      color: 0x9fc2c2, metalness: 0.18, roughness: 0.05,
      transparent: true, opacity: 0.28, envMap: envMap, envMapIntensity: 1.25,
      side: T.DoubleSide, depthWrite: false
    });
    MAT.water = new T.MeshPhysicalMaterial({
      color: 0x14565e, metalness: 0.45, roughness: 0.05,
      transparent: true, opacity: 0, envMap: envMap, envMapIntensity: 1.45,
      clearcoat: 1, clearcoatRoughness: 0.03
    });
    MAT.poolInner = new T.MeshStandardMaterial({ color: 0x1d4548, roughness: 0.7 });
    MAT.hedge = new T.MeshStandardMaterial({ color: 0x2c4026, roughness: 0.95 });
    MAT.foliage = new T.MeshStandardMaterial({ color: 0x3e5735, roughness: 0.92 });
    MAT.foliageLight = new T.MeshStandardMaterial({ color: 0x4c6740, roughness: 0.92 });
    MAT.trunk = new T.MeshStandardMaterial({ color: 0x3f3226, roughness: 0.95 });
    MAT.rug = new T.MeshStandardMaterial({ color: 0xa9a193, roughness: 1 });
    MAT.fabric = new T.MeshStandardMaterial({ color: 0xc9c1b0, roughness: 1 });
    MAT.fabricDark = new T.MeshStandardMaterial({ color: 0x7a7164, roughness: 1 });
    MAT.bedding = new T.MeshStandardMaterial({ color: 0xe4ddd0, roughness: 1 });
    MAT.ceiling = new T.MeshStandardMaterial({ color: 0xd4c9b7, roughness: 0.96 });
    MAT.marble = new T.MeshStandardMaterial({ color: 0xe7e2d8, roughness: 0.3, metalness: 0.05, envMap: envMap, envMapIntensity: 0.5 });
    MAT.emit = new T.MeshStandardMaterial({
      color: 0xffe3b0, emissive: 0xffd296, emissiveIntensity: 0,
      roughness: 0.5, metalness: 0
    });
    MAT.emitPanel = new T.MeshStandardMaterial({
      color: 0xe9d3ab, emissive: 0xffcf8c, emissiveIntensity: 0.42, roughness: 0.8
    });
  }

  /* ---------- environment ---------- */
  function makeEnv() {
    var size = 128;
    var faces = [];
    for (var f = 0; f < 6; f++) {
      var c = document.createElement('canvas');
      c.width = c.height = size;
      var x = c.getContext('2d');
      if (f === 2) { // +Y
        var g0 = x.createLinearGradient(0, 0, size, 0);
        g0.addColorStop(0, '#dcecef'); g0.addColorStop(1, '#eef3ee');
        x.fillStyle = g0; x.fillRect(0, 0, size, size);
      } else if (f === 3) { // -Y
        x.fillStyle = '#7b7d62'; x.fillRect(0, 0, size, size);
      } else {
        var g = x.createLinearGradient(0, 0, 0, size);
        g.addColorStop(0, '#b6d2da');
        g.addColorStop(0.46, '#dfe7e4');
        g.addColorStop(0.55, '#f3ecdc');
        g.addColorStop(0.62, '#c9c1a8');
        g.addColorStop(1, '#7f8168');
        x.fillStyle = g; x.fillRect(0, 0, size, size);
        // sun bloom
        var rg = x.createRadialGradient(size * 0.72, size * 0.28, 2, size * 0.72, size * 0.28, size * 0.5);
        rg.addColorStop(0, 'rgba(255,250,228,0.85)');
        rg.addColorStop(1, 'rgba(255,250,228,0)');
        x.fillStyle = rg; x.fillRect(0, 0, size, size);
      }
      faces.push(c);
    }
    var t = new T.CubeTexture(faces);
    t.needsUpdate = true;
    t.encoding = T.sRGBEncoding;
    return t;
  }

  /* ---------- mesh helpers ---------- */
  function mesh(geo, mat, x, y, z, opts) {
    var m = new T.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    opts = opts || {};
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    if (opts.shell) m.userData.shell = opts.shell;
    return m;
  }

  function box(w, h, d, mat, x, y, z, opts) {
    return mesh(new T.BoxGeometry(w, h, d), mat, x, y, z, opts);
  }

  // box whose origin is at its base (for vertical growth)
  function riseBox(w, h, d, mat, x, bottom, z, opts) {
    var g = new T.BoxGeometry(w, h, d);
    g.translate(0, h / 2, 0);
    return mesh(g, mat, x, bottom, z, opts);
  }

  function tag(obj, which) {
    if (!which) return obj;
    obj.traverse(function (o) {
      if (o.isMesh) {
        o.userData.shell = which;
        if (which === 'front') A.shellFront.push(o);
        else if (which === 'right') A.shellRight.push(o);
        else A.shellAll.push(o);
      }
    });
    return obj;
  }

  /* ---------- site ---------- */
  function buildSite() {
    G.site = new T.Group();
    building.add(G.site);

    var ground = mesh(new T.PlaneGeometry(360, 360), MAT.lawn, 0, 0, 0, { cast: false });
    ground.rotation.x = -Math.PI / 2;
    G.site.add(ground);

    // house plinth
    G.site.add(box(30, 0.22, 19.5, MAT.concreteDark, 0, 0.11, 0.6, { cast: false }));
    // pool deck
    G.site.add(box(16, 0.16, 8.2, MAT.paver, -10.4, 0.18, 9.8, { cast: false }));

    // prepared construction pad
    G.siteworks = new T.Group();
    building.add(G.siteworks);
    var pad = box(27.6, 0.055, 18.6, MAT.gravel, 0, 0.248, 0.4, { cast: false });
    G.siteworks.add(pad);
    // setting-out lines
    [[0, 9.62, 27.6, 0.07], [0, -8.82, 27.6, 0.07], [-13.77, 0.4, 0.07, 18.6], [13.77, 0.4, 0.07, 18.6]].forEach(function (l) {
      G.siteworks.add(box(l[2], 0.016, l[3], MAT.chalk, l[0], 0.282, l[1], { cast: false }));
    });
    G.siteworks.add(box(27.6, 0.014, 0.05, MAT.chalk, 0, 0.282, 0.4, { cast: false }));
    G.siteworks.add(box(0.05, 0.014, 18.6, MAT.chalk, 0, 0.282, 0.4, { cast: false }));
    var stakePos = [[-12.4, -8.1], [12.4, -8.1], [-12.4, 7.9], [12.4, 7.9]];
    stakePos.forEach(function (sp) {
      G.siteworks.add(box(0.09, 1.1, 0.09, MAT.wood, sp[0], 0.55, sp[1], { cast: false }));
      G.siteworks.add(box(0.16, 0.09, 0.16, MAT.bronze, sp[0], 1.12, sp[1], { cast: false }));
    });

    // entrance path + steps
    var path = box(4.0, 0.09, 14, MAT.paver, 0.5, 0.13, 13.4, { cast: false });
    G.site.add(path);
    for (var s = 0; s < 3; s++) {
      G.site.add(box(5.6 - s * 0.5, 0.16 * (s + 1), 0.6, MAT.concrete, 0.4, 0.08 + 0.08 * s, 6.9 + s * 0.62, { cast: false }));
    }

    // pool basin + coping
    G.pool = new T.Group();
    building.add(G.pool);
    G.pool.add(box(12.4, 0.5, 5.4, MAT.poolInner, -10.4, 0.02, 9.8, { cast: false }));

    var cw = 13.4, cd = 6.4, cx = -10.4, cz = 9.8;
    G.pool.add(box(cw, 0.16, 0.55, MAT.concrete, cx, 0.28, cz - cd / 2 + 0.27, { cast: false }));
    G.pool.add(box(cw, 0.16, 0.55, MAT.concrete, cx, 0.28, cz + cd / 2 - 0.27, { cast: false }));
    G.pool.add(box(0.55, 0.16, cd, MAT.concrete, cx - cw / 2 + 0.27, 0.28, cz, { cast: false }));
    G.pool.add(box(0.55, 0.16, cd, MAT.concrete, cx + cw / 2 - 0.27, 0.28, cz, { cast: false }));

    A.water = mesh(new T.PlaneGeometry(12.2, 5.2), MAT.water, cx, 0.30, cz, { cast: false, receive: false });
    A.water.rotation.x = -Math.PI / 2;
    G.pool.add(A.water);

    A.waterTop = mesh(new T.PlaneGeometry(12.2, 5.2), new T.MeshBasicMaterial({
      color: 0x9fd3d6, transparent: true, opacity: 0
    }), cx, 0.315, cz, { cast: false, receive: false });
    A.waterTop.rotation.x = -Math.PI / 2;
    G.pool.add(A.waterTop);

    // loungers
    var la = new T.Group();
    for (var i = 0; i < 2; i++) {
      var g = new T.Group();
      g.position.set(-17.25, 0, 8.6 + i * 3.0);
      g.add(box(0.8, 0.12, 2.4, MAT.wood, 0, 0.36, 0));
      var back = box(0.8, 0.1, 1.0, MAT.fabric, 0, 0.62, -1.15);
      back.rotation.x = -0.55;
      g.add(back);
      g.add(box(0.1, 0.36, 0.1, MAT.darkMetal, 0.3, 0.18, 0.95));
      g.add(box(0.1, 0.36, 0.1, MAT.darkMetal, -0.3, 0.18, 0.95));
      la.add(g);
      A.loungeChairs.push(g);
    }
    building.add(la);
    G.landscapeExtras = la;
  }

  /* ---------- glazing ---------- */
  function glazing(parent, level, axis, w, h, cx, bottom, cz, panes, shellTag) {
    var grp = new T.Group();
    grp.position.set(cx, bottom, cz);
    parent.add(grp);

    var gm = new T.MeshPhysicalMaterial({
      color: 0x7fa6a8, metalness: 0.32, roughness: 0.05,
      transparent: true, opacity: 0.42, envMap: envMap, envMapIntensity: 1.45,
      side: T.DoubleSide, depthWrite: false
    });
    gm.userData.base = 0.42;
    A.glassMats[level].push(gm);

    var gw = axis === 'x' ? w : 0.05;
    var gd = axis === 'x' ? 0.05 : w;
    var glass = mesh(new T.BoxGeometry(gw, h, gd), gm, 0, h / 2, 0, { cast: false, receive: false, shell: shellTag });
    grp.add(glass);
    if (shellTag === 'front') A.shellFront.push(glass);
    else if (shellTag === 'right') A.shellRight.push(glass);

    // rails
    var rw = axis === 'x' ? w : 0.15;
    var rd = axis === 'x' ? 0.15 : w;
    var top = box(rw, 0.14, rd, MAT.bronze, 0, h - 0.07, 0, { shell: shellTag });
    var bot = box(rw, 0.16, rd, MAT.bronze, 0, 0.08, 0, { shell: shellTag });
    grp.add(top); grp.add(bot);

    // mullions
    for (var i = 0; i <= panes; i++) {
      var t = -w / 2 + (w / panes) * i;
      var mw = axis === 'x' ? 0.09 : 0.17;
      var md = axis === 'x' ? 0.17 : 0.09;
      var m = box(mw, h, md, MAT.bronze, axis === 'x' ? t : 0, h / 2, axis === 'x' ? 0 : t, { shell: shellTag });
      grp.add(m);
    }

    // tag rails/mullions as shell too
    grp.children.forEach(function (o) {
      if (o !== glass) {
        o.userData.shell = shellTag;
        if (shellTag === 'front') A.shellFront.push(o);
        else if (shellTag === 'right') A.shellRight.push(o);
      }
    });

    A.glazings.push({ grp: grp, baseY: bottom, mats: [gm], start: 0.62 + level * 0.035 });
    return grp;
  }

  /* ---------- shell / structure ---------- */
  function buildStructure() {
    /* foundation */
    G.foundation = new T.Group();
    building.add(G.foundation);

    A.foundation = new T.Group();
    A.foundation.position.y = 0;
    G.foundation.add(A.foundation);
    for (var fx = -1; fx <= 1; fx++) {
      for (var fz = -1; fz <= 1; fz++) {
        var f = box(2.4, 0.5, 2.4, MAT.concreteDark, fx * 8.4, 0.25, fz * 4.8);
        A.foundation.add(f);
        A.footings.push(f);
      }
    }

    A.slabFoot = box(27.2, 0.5, 18.2, MAT.concreteDark, 0, 0.45, 0.4);
    G.foundation.add(A.slabFoot);

    // ground columns (in the façade plane)
    var colPos = [-10.7, -4.2, 2.8, 10.4];
    colPos.forEach(function (cx) {
      var c = riseBox(0.42, L0H, 0.42, MAT.concrete, cx, Y0, 6.35);
      c.castShadow = true;
      G.foundation.add(c);
      A.columns.push(c);
    });
    var backCols = [-6, 2, 9];
    backCols.forEach(function (cx) {
      var c = riseBox(0.42, L0H, 0.42, MAT.concrete, cx, Y0, -5.9);
      G.foundation.add(c);
      A.columns.push(c);
    });

    /* ---------- LEVEL 0 ---------- */
    G.l0 = new T.Group();
    building.add(G.l0);

    // stone front wall (left of entrance)
    var w0 = riseBox(6.9, L0H, 0.48, MAT.stone, -7.55, Y0, 6.35, { shell: 'front' });
    G.l0.add(w0); A.walls0.push(w0);
    tag(w0, 'front');

    // left return — split for a ribbon window
    var w0la = riseBox(0.48, L0H, 7.2, MAT.stone, -11.0, Y0, -2.9, { shell: 'left' });
    var w0lb = riseBox(0.48, L0H, 1.4, MAT.stone, -11.0, Y0, 5.8, { shell: 'left' });
    G.l0.add(w0la); G.l0.add(w0lb);
    A.walls0.push(w0la); A.walls0.push(w0lb);
    glazing(G.l0, 0, 'z', 4.6, 3.15, -10.98, 0.88, 2.8, 2, 'left');

    // back wall
    var w0b = riseBox(21.6, L0H, 0.48, MAT.stone, 0, Y0, -6.35, { shell: 'back' });
    G.l0.add(w0b); A.walls0.push(w0b);

    // right pier
    var w0r = riseBox(0.6, L0H, 0.6, MAT.stone, 10.7, Y0, 6.1, { shell: 'right' });
    G.l0.add(w0r); A.walls0.push(w0r);

    // slot window in the ground-floor stone
    G.l0.add(box(3.9, 1.15, 0.08, MAT.interiorDark, -8.0, Y0 + 1.9, 6.37, { cast: false }));
    var slot0 = box(4.0, 1.24, 0.06, MAT.glass, -8.0, Y0 + 1.9, 6.41, { cast: false, shell: 'front' });
    G.l0.add(slot0);
    A.shellFront.push(slot0);
    G.l0.add(box(4.15, 0.06, 0.10, MAT.bronze, -8.0, Y0 + 2.52, 6.42, { cast: false }));
    G.l0.add(box(4.15, 0.06, 0.10, MAT.bronze, -8.0, Y0 + 1.28, 6.42, { cast: false }));

    // entrance recess
    var recess = box(3.6, L0H, 0.25, MAT.interiorDark, -2.4, Y0 + L0H / 2, 6.15);
    G.l0.add(recess);
    tag(recess, 'front');
    var door = new T.Group();
    door.position.set(-2.4, Y0, 6.28);
    var doorPanel = box(2.3, 3.15, 0.12, MAT.wood, 0, 1.58, 0, { shell: 'front' });
    doorPanel.geometry.translate(1.15, 0, 0);
    doorPanel.position.x = -1.15;
    door.add(doorPanel);
    door.add(box(0.05, 3.2, 0.2, MAT.bronze, 1.16, 1.6, 0));
    G.l0.add(door);
    A.doors.push({ obj: door, rot: 0 });
    tag(door, 'front');

    // ground glazing front
    glazing(G.l0, 0, 'x', 10.9, 3.2, 5.15, 0.86, 6.38, 4, 'front');

    // right glazing
    glazing(G.l0, 0, 'z', 12.4, 3.2, 10.62, 0.86, 0, 4, 'right');

    // stone base curbs
    var curb0 = box(10.9, 0.38, 0.32, MAT.stone, 5.15, 0.89, 6.40);
    G.l0.add(curb0); tag(curb0, 'front');
    var curbR = box(0.32, 0.38, 12.4, MAT.stone, 10.66, 0.89, 0);
    G.l0.add(curbR); tag(curbR, 'right');
    var base0 = box(6.95, 0.26, 0.10, MAT.concreteDark, -7.55, 0.83, 6.62, { cast: false });
    G.l0.add(base0); tag(base0, 'front');

    // ground interior floor
    G.i0 = new T.Group();
    building.add(G.i0);
    G.i0.add(box(21.4, 0.12, 12.6, MAT.interiorFloor, 0, Y0 + 0.06, 0, { cast: false }));

    /* ---------- SLAB 1 ---------- */
    A.slab1 = box(23.0, TH, 15.2, MAT.concrete, 0.1, SLAB1, 0.1);
    building.add(A.slab1);
    // fascia bands
    A.slab1.add(box(23.1, 0.26, 0.18, MAT.darkMetal, 0, -0.11, 7.27, { cast: false }));
    A.slab1.add(box(0.18, 0.26, 15.2, MAT.darkMetal, 11.5, -0.11, 0, { cast: false }));
    // wood soffit at entrance
    A.slab1.add(box(5.2, 0.07, 3.2, MAT.wood, -2.3, -TH / 2 - 0.035, 1.4, { cast: false }));

    /* ---------- LEVEL 1 ---------- */
    G.l1 = new T.Group();
    building.add(G.l1);

    // stone back + left
    var w1b = riseBox(20.4, 3.4, 0.48, MAT.stone, 0.4, L1Y, -5.95, { shell: 'back' });
    G.l1.add(w1b); A.walls1.push(w1b);
    var w1la = riseBox(0.48, 3.4, 5.8, MAT.stone, -9.7, L1Y, -3.0, { shell: 'left' });
    var w1lb = riseBox(0.48, 3.4, 2.0, MAT.stone, -9.7, L1Y, 5.05, { shell: 'left' });
    G.l1.add(w1la); G.l1.add(w1lb);
    A.walls1.push(w1la); A.walls1.push(w1lb);
    glazing(G.l1, 1, 'z', 4.2, 3.1, -9.68, L1Y + 0.14, 1.9, 2, 'left');

    // timber screen front-left
    var screen = new T.Group();
    screen.position.y = L1Y;
    var nFin = 13;
    for (var i = 0; i < nFin; i++) {
      var fin = riseBox(0.13, 3.4, 0.24, MAT.wood, -9.5 + i * 0.72, 0, 5.92, { shell: 'front' });
      screen.add(fin);
    }
    G.l1.add(screen);
    tag(screen, 'front');
    A.walls1.push(screen);

    // glass front
    glazing(G.l1, 1, 'x', 10.6, 3.1, 5.4, L1Y + 0.14, 5.94, 4, 'front');

    // glass right
    glazing(G.l1, 1, 'z', 11.6, 3.1, 10.78, L1Y + 0.14, 0, 4, 'right');

    // interior
    G.i1 = new T.Group();
    building.add(G.i1);
    G.i1.add(box(20.0, 0.12, 11.6, MAT.interiorFloor, 0.3, L1Y + 0.06, 0, { cast: false }));

    /* ---------- SLAB 2 ---------- */
    A.slab2 = box(20.8, TH, 13.4, MAT.concrete, 0.5, SLAB2, 0.1);
    building.add(A.slab2);
    A.slab2.add(box(20.9, 0.24, 0.17, MAT.darkMetal, 0, -0.12, 6.57, { cast: false }));
    A.slab2.add(box(0.17, 0.24, 13.4, MAT.darkMetal, 10.88, -0.12, 0, { cast: false }));

    /* ---------- LEVEL 2 ---------- */
    G.l2 = new T.Group();
    building.add(G.l2);

    var w2b = riseBox(17.8, 3.3, 0.46, MAT.stone, 0.4, L2Y, -5.35, { shell: 'back' });
    G.l2.add(w2b); A.walls2.push(w2b);
    var w2la = riseBox(0.46, 3.3, 4.9, MAT.stone, -8.2, L2Y, -2.85, { shell: 'left' });
    var w2lb = riseBox(0.46, 3.3, 1.75, MAT.stone, -8.2, L2Y, 4.5, { shell: 'left' });
    G.l2.add(w2la); G.l2.add(w2lb);
    A.walls2.push(w2la); A.walls2.push(w2lb);
    glazing(G.l2, 2, 'z', 3.8, 3.0, -8.18, L2Y + 0.15, 1.6, 2, 'left');

    // solid stone portion of the front
    var w2f = riseBox(4.6, 3.3, 0.46, MAT.stone, -5.9, L2Y, 5.32, { shell: 'front' });
    G.l2.add(w2f); A.walls2.push(w2f);
    tag(w2f, 'front');
    // slot window in the stone
    G.l2.add(box(3.3, 0.95, 0.08, MAT.interiorDark, -5.95, L2Y + 1.72, 5.34, { cast: false }));
    var slot2 = box(3.4, 1.04, 0.06, MAT.glass, -5.95, L2Y + 1.72, 5.38, { cast: false, shell: 'front' });
    G.l2.add(slot2);
    A.shellFront.push(slot2);
    G.l2.add(box(3.55, 0.05, 0.10, MAT.bronze, -5.95, L2Y + 2.24, 5.39, { cast: false }));
    G.l2.add(box(3.55, 0.05, 0.10, MAT.bronze, -5.95, L2Y + 1.20, 5.39, { cast: false }));

    // front glazing
    glazing(G.l2, 2, 'x', 11.9, 3.0, 2.8, L2Y + 0.15, 5.34, 4, 'front');
    // right glazing
    glazing(G.l2, 2, 'z', 10.5, 3.0, 9.35, L2Y + 0.15, 0.1, 3, 'right');

    // interior
    G.i2 = new T.Group();
    building.add(G.i2);
    G.i2.add(box(18.2, 0.1, 10.4, MAT.interiorFloor, 0.3, L2Y + 0.05, 0, { cast: false }));

    /* ---------- ROOF ---------- */
    A.roof = new T.Group();
    A.roof.position.y = ROOFY;
    building.add(A.roof);
    A.roof.add(box(23.0, 0.4, 13.6, MAT.concrete, 0.4, 0, 0.1));
    // fascias
    A.roof.add(box(23.1, 0.3, 0.2, MAT.darkMetal, 0.4, -0.16, 6.84, { cast: false }));
    A.roof.add(box(0.2, 0.3, 13.7, MAT.darkMetal, 11.88, -0.16, 0.1, { cast: false }));
    // parapet
    A.roof.add(box(23.0, 0.42, 0.22, MAT.concrete, 0.4, 0.41, 6.78));
    A.roof.add(box(23.0, 0.42, 0.22, MAT.concrete, 0.4, 0.41, -6.58));
    A.roof.add(box(0.22, 0.42, 13.6, MAT.concrete, 11.9, 0.41, 0.1));
    A.roof.add(box(0.22, 0.42, 13.6, MAT.concrete, -11.1, 0.41, 0.1));
    // roof planters
    A.roof.add(box(2.4, 0.34, 1.2, MAT.concreteDark, -7.4, 0.38, -2.2));
    A.roof.add(box(2.6, 0.28, 1.0, MAT.hedge, 6.8, 0.35, -2.0));

    /* ---------- TOWER ---------- */
    A.tower = new T.Group();
    A.tower.position.y = Y0;
    building.add(A.tower);
    // full-height timber brise-soleil at the left edge
    for (var t2 = 0; t2 < 6; t2++) {
      A.tower.add(riseBox(0.17, 12.2, 0.45, MAT.wood, -10.95 + t2 * 0.34, 0, 6.72));
    }
    A.tower.add(riseBox(0.20, 12.2, 0.52, MAT.woodDark, -11.12, 0, 6.72));
    A.tower.add(box(2.08, 0.13, 0.56, MAT.darkMetal, -10.14, 12.27, 6.72, { cast: false }));
    A.tower.add(box(0.12, 12.2, 0.50, MAT.woodDark, -9.12, 6.1, 6.72, { cast: false }));

    /* ---------- BALCONIES / ENVELOPE ---------- */
    // balcony 1
    A.balcony1 = new T.Group();
    A.balcony1.position.set(5.6, 4.55, 7.0);
    A.balcony1.userData.z0 = 7.0;
    A.balcony1.add(box(10.8, 0.16, 2.3, MAT.concrete, 0, 0, 0));
    A.balcony1.add(box(10.6, 0.05, 2.2, MAT.wood, 0, -0.11, 0, { cast: false }));
    A.balcony1.add(box(10.7, 0.12, 0.14, MAT.darkMetal, 0, -0.1, 1.12, { cast: false }));
    building.add(A.balcony1);
    A.balconies.push(A.balcony1);

    // balcony 2
    A.balcony2 = new T.Group();
    A.balcony2.position.set(2.6, 8.36, 6.35);
    A.balcony2.userData.z0 = 6.35;
    A.balcony2.add(box(9.2, 0.14, 1.9, MAT.concrete, 0, 0, 0));
    A.balcony2.add(box(9.0, 0.05, 1.8, MAT.wood, 0, -0.1, 0, { cast: false }));
    A.balcony2.add(box(9.1, 0.11, 0.12, MAT.darkMetal, 0, -0.09, 0.92, { cast: false }));
    building.add(A.balcony2);
    A.balconies.push(A.balcony2);

    // railings
    makeRailing(5.6, 4.63, 8.12, 10.8, 1);
    makeRailing(2.6, 8.43, 7.28, 9.2, 1);
    makeRailing(10.95, 4.63, 7.0, 2.2, 0);
    makeRailing(7.15, 8.43, 6.35, 1.8, 0);

    /* entrance canopy */
    var canopy = new T.Group();
    canopy.position.set(-2.4, 4.42, 8.3);
    canopy.add(box(5.4, 0.22, 3.0, MAT.concrete, 0, 0, 0));
    canopy.add(box(5.3, 0.06, 2.9, MAT.wood, 0, -0.14, 0, { cast: false }));
    canopy.add(box(5.4, 0.16, 0.09, MAT.darkMetal, 0, -0.09, 1.5, { cast: false }));
    canopy.add(box(0.18, 0.18, 0.18, MAT.bronze, -2.5, -0.1, 1.35, { cast: false }));
    canopy.add(box(0.18, 0.18, 0.18, MAT.bronze, 2.5, -0.1, 1.35, { cast: false }));
    building.add(canopy);
    A.canopy = canopy;

    // emissive soffit strips
    addStrip(0.2, 4.14, 7.45, 22.4, 0.06);
    addStrip(0.2, 8.02, 6.8, 20.2, 0.06);
    addStrip(0.2, 11.66, 6.6, 22.2, 0.06);
  }

  function addStrip(x, y, z, w, h) {
    var m = mesh(new T.BoxGeometry(w, h || 0.05, 0.08), MAT.emit.clone(), x, y, z, { cast: false, receive: false });
    m.material.emissiveIntensity = 0;
    A.strips.push(m);
    building.add(m);
  }

  function makeRailing(x, y, z, w, horizontal) {
    var g = new T.Group();
    g.position.set(x, y, z);
    var grp = new T.Group();
    if (horizontal) {
      grp.add(box(w, 1.08, 0.045, MAT.glassRail, 0, 0.54, 0, { cast: false, receive: false }));
      grp.add(box(w, 0.05, 0.07, MAT.bronze, 0, 1.09, 0, { cast: false }));
      grp.add(box(w, 0.04, 0.07, MAT.bronze, 0, 0.02, 0, { cast: false }));
      for (var i = 0; i <= 4; i++) {
        grp.add(box(0.035, 1.08, 0.06, MAT.bronze, -w / 2 + (w / 4) * i, 0.54, 0, { cast: false }));
      }
    } else {
      grp.add(box(0.045, 1.08, w, MAT.glassRail, 0, 0.54, 0, { cast: false, receive: false }));
      grp.add(box(0.07, 0.05, w, MAT.bronze, 0, 1.09, 0, { cast: false }));
      grp.add(box(0.07, 0.04, w, MAT.bronze, 0, 0.02, 0, { cast: false }));
      for (var j = 0; j <= 2; j++) {
        grp.add(box(0.06, 1.08, 0.035, MAT.bronze, 0, 0.54, -w / 2 + (w / 2) * j, { cast: false }));
      }
    }
    tag(grp, 'front');
    g.add(grp);
    building.add(g);
    A.rails.push(grp);
  }

  /* ---------- interior fit-out ---------- */
  function addRug(parent, w, d, x, z, y) {
    var r = box(w, 0.03, d, MAT.rug, x, y + 0.02, z, { cast: false });
    parent.add(r);
    return r;
  }

  function addSofa(parent, x, y, z, w, rotY) {
    var g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY || 0;
    g.add(box(w, 0.42, 1.15, MAT.fabric, 0, 0.42, 0));
    g.add(box(w, 0.72, 0.22, MAT.fabric, 0, 0.72, -0.47));
    g.add(box(0.22, 0.62, 1.15, MAT.fabric, -w / 2 + 0.11, 0.55, 0));
    g.add(box(0.22, 0.62, 1.15, MAT.fabric, w / 2 - 0.11, 0.55, 0));
    g.add(box(w - 0.5, 0.14, 0.9, MAT.fabricDark, 0, 0.68, 0.02));

    // individual seat and back cushions keep the large sofa from reading flat
    var n = w > 3.6 ? 3 : 2;
    var cw = (w - 0.46) / n;
    for (var i = 0; i < n; i++) {
      var cx = -w / 2 + 0.23 + cw * (i + 0.5);
      g.add(box(cw - 0.07, 0.13, 0.82, MAT.fabricDark, cx, 0.70, 0.10));
      var back = box(cw - 0.11, 0.54, 0.15, MAT.fabricDark, cx, 0.85, -0.35);
      back.rotation.x = -0.11;
      g.add(back);
    }

    parent.add(g);
    return g;
  }

  function addChair(parent, x, y, z, rotY) {
    var g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY || 0;
    g.add(box(0.48, 0.08, 0.48, MAT.wood, 0, 0.46, 0));
    g.add(box(0.48, 0.55, 0.07, MAT.wood, 0, 0.75, -0.21));
    [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(function (p) {
      g.add(box(0.045, 0.46, 0.045, MAT.darkMetal, p[0], 0.23, p[1]));
    });
    parent.add(g);
    return g;
  }

  function addBed(parent, x, y, z, w, rotY) {
    var g = new T.Group();
    g.position.set(x, y, z);
    g.rotation.y = rotY || 0;
    g.add(box(w, 0.35, 2.25, MAT.wood, 0, 0.24, 0));
    g.add(box(w - 0.12, 0.24, 2.05, MAT.bedding, 0, 0.52, 0.08));
    g.add(box(w, 0.9, 0.14, MAT.fabricDark, 0, 0.55, -1.12));
    g.add(box(w * 0.42, 0.14, 0.5, MAT.bedding, -w * 0.22, 0.66, -0.72));
    g.add(box(w * 0.42, 0.14, 0.5, MAT.bedding, w * 0.22, 0.66, -0.72));
    parent.add(g);
    return g;
  }

  function addPlant(parent, x, y, z, s) {
    var g = new T.Group();
    g.position.set(x, y, z);
    g.scale.setScalar(s || 1);
    g.add(mesh(new T.CylinderGeometry(0.26, 0.2, 0.55, 12), MAT.concrete, 0, 0.28, 0));
    var f1 = mesh(new T.IcosahedronGeometry(0.42, 1), MAT.foliage, 0, 0.85, 0);
    f1.scale.set(1, 1.25, 1);
    g.add(f1);
    var f2 = mesh(new T.IcosahedronGeometry(0.3, 1), MAT.foliageLight, 0.16, 1.12, 0.08);
    g.add(f2);
    parent.add(g);
    return g;
  }

  function buildInteriors() {
    var i0 = G.i0, i1 = G.i1, i2 = G.i2;

    // warm interior liners behind the glazing
    i0.add(box(21.0, 3.15, 0.10, MAT.liner, 0, Y0 + 1.58, -6.02, { cast: false }));
    i1.add(box(19.6, 3.0, 0.10, MAT.liner, 0.4, L1Y + 1.5, -5.62, { cast: false }));
    i2.add(box(17.6, 2.95, 0.10, MAT.liner, 0.4, L2Y + 1.48, -5.02, { cast: false }));

    // clean ceilings
    i0.add(box(21.4, 0.06, 12.5, MAT.ceiling, 0, SLAB1 - 0.22, 0, { cast: false }));
    i1.add(box(19.8, 0.06, 11.5, MAT.ceiling, 0.4, SLAB2 - 0.22, 0, { cast: false }));
    i2.add(box(18.0, 0.06, 10.3, MAT.ceiling, 0.4, ROOFY - 0.24, 0, { cast: false }));

    // interior warmth
    var pl0 = new T.PointLight(0xffd2a0, 0.45, 16, 2);
    pl0.position.set(2.0, 3.4, 0.0);
    i0.add(pl0);
    var pl1 = new T.PointLight(0xffd2a0, 0.4, 14, 2);
    pl1.position.set(-3.0, 7.6, -1.0);
    i1.add(pl1);
    var pl2 = new T.PointLight(0xffd2a0, 0.35, 13, 2);
    pl2.position.set(3.0, 11.3, 0.0);
    i2.add(pl2);
    A.interiorLights.push(
      { light: pl0, base: 0.45 },
      { light: pl1, base: 0.4 },
      { light: pl2, base: 0.35 }
    );

    // media wall
    i0.add(box(3.4, 0.42, 0.42, MAT.wood, 2.4, Y0 + 0.42, -5.85));
    i0.add(box(2.7, 1.35, 0.06, MAT.interiorDark, 2.4, Y0 + 1.95, -5.92, { cast: false }));

    /* ---- GROUND: living / kitchen / dining ---- */
    addRug(i0, 8.0, 5.6, 2.4, 0.6, Y0);
    addSofa(i0, 2.4, Y0 + 0.05, -1.4, 4.6, Math.PI);
    var ct = box(2.2, 0.22, 1.2, MAT.marble, 2.4, Y0 + 0.4, 1.4);
    i0.add(ct);
    i0.add(box(0.16, 0.36, 0.16, MAT.darkMetal, 1.5, Y0 + 0.18, 1.0));
    i0.add(box(0.16, 0.36, 0.16, MAT.darkMetal, 3.3, Y0 + 0.18, 1.0));
    addChair(i0, 0.0, Y0 + 0.05, 2.4, 2.6);
    addChair(i0, 4.8, Y0 + 0.05, 2.4, -2.6);

    // kitchen at right
    i0.add(box(6.2, 1.05, 1.1, MAT.concreteDark, 7.0, Y0 + 0.58, -5.0));
    i0.add(box(6.3, 0.07, 1.2, MAT.marble, 7.0, Y0 + 1.15, -5.0));
    i0.add(box(4.0, 1.1, 1.3, MAT.wood, 6.9, Y0 + 0.6, -1.6));
    i0.add(box(4.2, 0.08, 1.5, MAT.marble, 6.9, Y0 + 1.19, -1.6));
    i0.add(box(0.55, 0.06, 0.44, MAT.darkMetal, 6.6, Y0 + 1.24, -1.6, { cast: false }));
    // dining at left
    i0.add(box(3.4, 0.1, 1.25, MAT.wood, -5.0, Y0 + 0.82, -2.0));
    i0.add(box(0.16, 0.78, 0.16, MAT.darkMetal, -6.4, Y0 + 0.41, -2.0));
    i0.add(box(0.16, 0.78, 0.16, MAT.darkMetal, -3.6, Y0 + 0.41, -2.0));
    addChair(i0, -5.7, Y0 + 0.05, -3.15, 0);
    addChair(i0, -4.3, Y0 + 0.05, -3.15, 0);
    addChair(i0, -5.7, Y0 + 0.05, -0.85, Math.PI);
    addChair(i0, -4.3, Y0 + 0.05, -0.85, Math.PI);

    // partitions / core
    i0.add(box(2.6, 3.0, 0.22, MAT.interiorWall, -1.4, Y0 + 1.5, -4.8));
    addPlant(i0, -9.6, Y0 + 0.05, 4.6, 1.1);
    addPlant(i0, 9.6, Y0 + 0.05, 3.9, 1.0);

    // ceiling light line
    i0.add(box(9.0, 0.04, 0.10, MAT.emitPanel, 2.0, SLAB1 - 0.32, 0.0, { cast: false, receive: false }));

    /* ---- FIRST: master / bedroom / bathroom ---- */
    addRug(i1, 6.2, 4.4, -4.6, -0.6, L1Y);
    addBed(i1, -4.6, L1Y + 0.05, -1.6, 3.3, 0);
    i1.add(box(0.55, 0.5, 0.5, MAT.wood, -7.0, L1Y + 0.3, -2.6));
    i1.add(box(0.55, 0.5, 0.5, MAT.wood, -2.2, L1Y + 0.3, -2.6));
    i1.add(box(0.18, 0.55, 0.18, MAT.darkMetal, -7.0, L1Y + 0.85, -2.6));
    i1.add(box(0.18, 0.55, 0.18, MAT.darkMetal, -2.2, L1Y + 0.85, -2.6));

    addRug(i1, 4.2, 3.4, 4.9, -1.0, L1Y);
    addBed(i1, 4.9, L1Y + 0.05, -1.9, 2.5, 0);
    i1.add(box(2.4, 2.0, 0.55, MAT.wood, 8.6, L1Y + 1.0, -5.0));

    // bathroom volume
    i1.add(box(0.16, 2.8, 3.6, MAT.glassRail, 8.0, L1Y + 1.4, 3.4, { cast: false }));
    i1.add(box(2.6, 0.52, 0.9, MAT.woodDark, 9.0, L1Y + 0.31, 3.4));
    i1.add(box(2.72, 0.08, 1.0, MAT.marble, 9.0, L1Y + 0.62, 3.4));
    i1.add(box(0.44, 0.05, 0.34, MAT.interiorDark, 8.35, L1Y + 0.67, 3.4, { cast: false }));
    i1.add(box(0.04, 0.26, 0.04, MAT.bronze, 8.35, L1Y + 0.8, 3.62, { cast: false }));
    i1.add(box(1.6, 0.5, 0.8, MAT.marble, 9.1, L1Y + 0.45, 1.7));
    i1.add(box(0.04, 0.3, 0.04, MAT.bronze, 9.5, L1Y + 0.55, 1.62, { cast: false }));
    i1.add(box(0.14, 2.2, 0.14, MAT.bronze, 7.95, L1Y + 1.1, 5.1, { cast: false }));
    // stone backdrop and mirror behind the vanity
    i1.add(box(3.0, 3.2, 0.14, MAT.stone, 9.0, L1Y + 1.6, 4.12));
    i1.add(box(2.2, 1.05, 0.05, MAT.interiorDark, 9.0, L1Y + 1.78, 4.03, { cast: false }));
    i1.add(box(2.04, 0.92, 0.03, MAT.glass, 9.0, L1Y + 1.78, 3.99, { cast: false }));
    addPlant(i1, -9.0, L1Y + 0.05, 4.6, 0.9);

    // corridor wall
    i1.add(box(6.0, 2.9, 0.2, MAT.interiorWall, 0.6, L1Y + 1.45, 0.6));
    i1.add(box(9.0, 0.04, 0.1, MAT.emitPanel, -3.5, SLAB2 - 0.32, -1.5, { cast: false, receive: false }));

    /* ---- SECOND: guest / lounge / study ---- */
    addRug(i2, 5.4, 3.8, -4.6, -0.4, L2Y);
    addBed(i2, -4.6, L2Y + 0.05, -1.5, 2.6, 0);
    i2.add(box(2.2, 1.9, 0.5, MAT.wood, -7.1, L2Y + 0.95, -4.8));

    addRug(i2, 5.0, 3.4, 3.6, -0.6, L2Y);
    addSofa(i2, 3.6, L2Y + 0.05, -1.2, 3.8, Math.PI);
    i2.add(box(1.6, 0.3, 0.9, MAT.marble, 3.6, L2Y + 0.42, 1.1));

    // study at right front
    addRug(i2, 3.4, 2.4, 6.7, 2.6, L2Y);
    i2.add(box(3.0, 0.09, 1.3, MAT.wood, 6.9, L2Y + 0.78, 2.7));
    i2.add(box(0.14, 0.74, 0.14, MAT.darkMetal, 5.6, L2Y + 0.39, 2.7));
    i2.add(box(0.14, 0.74, 0.14, MAT.darkMetal, 8.2, L2Y + 0.39, 2.7));
    i2.add(box(0.52, 0.045, 0.36, MAT.interiorDark, 7.35, L2Y + 0.85, 2.55, { cast: false }));
    i2.add(box(0.28, 0.16, 0.20, MAT.woodDark, 6.15, L2Y + 0.91, 2.85, { cast: false }));
    addChair(i2, 6.9, L2Y + 0.05, 3.9, 0);
    // study shelving / credenza
    i2.add(box(2.8, 0.34, 0.58, MAT.wood, 6.9, L2Y + 0.17, 4.86));
    i2.add(box(2.66, 1.2, 0.50, MAT.woodDark, 6.9, L2Y + 0.92, 4.88, { cast: false }));
    i2.add(box(2.72, 0.06, 0.54, MAT.wood, 6.9, L2Y + 0.52, 4.86, { cast: false }));
    i2.add(box(2.72, 0.06, 0.54, MAT.wood, 6.9, L2Y + 1.10, 4.86, { cast: false }));
    i2.add(box(2.72, 0.08, 0.56, MAT.wood, 6.9, L2Y + 1.56, 4.86, { cast: false }));
    addPlant(i2, -7.6, L2Y + 0.05, 4.3, 0.85);
    i2.add(box(7.0, 0.04, 0.09, MAT.emitPanel, 3.0, ROOFY - 0.34, 0.6, { cast: false, receive: false }));
  }

  /* ---------- landscape ---------- */
  function buildLandscape() {
    G.landscape = new T.Group();
    building.add(G.landscape);

    var hedgeSpots = [
      [-20, 0.55, -8, 8, 1.1, 1.2],
      [-6, 0.55, -10.5, 9, 1.1, 1.1],
      [12, 0.55, -9.5, 10, 1.2, 1.2],
      [21, 0.55, 4, 1.4, 1.1, 9],
      [-23.5, 0.55, 6, 1.4, 1.2, 7],
      [16, 0.55, 12, 5, 1.0, 1.1]
    ];
    hedgeSpots.forEach(function (h) {
      var g = new T.Group();
      g.position.set(h[0], 0, h[2]);
      var hw = h[3], hh = h[4], hd = h[5];
      g.add(box(hw, hh, hd, MAT.hedge, 0, hh / 2, 0));
      var along = hw >= hd ? 'x' : 'z';
      var len = along === 'x' ? hw : hd;
      var n = Math.max(2, Math.round(len / 2.1));
      for (var hi2 = 0; hi2 < n; hi2++) {
        var tpos = -len / 2 + (len / (n + 1)) * (hi2 + 1);
        var br = Math.min(hh * 0.62, 0.6);
        var bump = mesh(new T.IcosahedronGeometry(br, 1), MAT.hedge,
          along === 'x' ? tpos : 0, hh, along === 'x' ? 0 : tpos, { cast: false });
        bump.scale.set(along === 'x' ? 1.35 : 1, 0.72, along === 'x' ? 1 : 1.35);
        g.add(bump);
      }
      G.landscape.add(g);
      A.hedges.push(g);
    });

    var treeSpots = [
      [-22.0, 0.02, 11.5, 0.95],
      [-25.5, 0.02, -4.0, 1.1],
      [-17.0, 0.02, -13.0, 1.0],
      [17.5, 0.02, -5.5, 1.1],
      [23.0, 0.02, 9.5, 1.0],
      [23.0, 0.02, -10.0, 1.05],
      [-2.0, 0.02, -15.0, 0.9]
    ];
    treeSpots.forEach(function (ts) {
      var tr = makeTree(ts[3]);
      tr.position.set(ts[0], ts[1], ts[2]);
      G.landscape.add(tr);
      A.trees.push(tr);
    });

    // low planting strip along façade
    for (var i = 0; i < 6; i++) {
      var p = addPlant(G.landscape, 12.2, 0.22, -4.6 + i * 1.7, 0.75);
      p.scale.setScalar(0.001);
      A.planters.push(p);
    }
    var p2 = addPlant(G.landscape, -4.9, 0.22, 7.5, 0.9);
    p2.scale.setScalar(0.001); A.planters.push(p2);
    var p3 = addPlant(G.landscape, -0.1, 0.22, 7.5, 0.9);
    p3.scale.setScalar(0.001); A.planters.push(p3);

    // path lights
    for (var l = 0; l < 4; l++) {
      var lg = new T.Group();
      lg.position.set(2.35, 0.2, 9.0 + l * 2.6);
      lg.add(mesh(new T.CylinderGeometry(0.055, 0.07, 0.62, 8), MAT.darkMetal, 0, 0.31, 0));
      var cap = mesh(new T.CylinderGeometry(0.09, 0.09, 0.05, 8), MAT.emit, 0, 0.64, 0);
      cap.material = MAT.emit.clone();
      cap.material.emissiveIntensity = 0;
      A.strips.push(cap);
      lg.add(cap);
      G.landscape.add(lg);
    }
  }

  function buildContext() {
    G.context = new T.Group();
    building.add(G.context);

    var farFoliage = new T.MeshStandardMaterial({ color: 0x33482c, roughness: 0.95 });
    var farFoliage2 = new T.MeshStandardMaterial({ color: 0x405638, roughness: 0.95 });
    var farTrunk = new T.MeshStandardMaterial({ color: 0x45392c, roughness: 0.95 });

    var spots = [
      [-40, -20, 2.1], [-29, -31, 1.8], [-15, -38, 2.3], [2, -40, 1.9],
      [19, -35, 2.4], [33, -24, 1.7], [41, -6, 2.2], [38, 14, 1.8],
      [30, 26, 2.0], [-36, 12, 1.9], [-42, 2, 2.3], [-26, 30, 1.7]
    ];
    spots.forEach(function (sp) {
      var g = new T.Group();
      g.position.set(sp[0], 0, sp[1]);
      var s = sp[2];
      var trunk = mesh(new T.CylinderGeometry(0.22 * s, 0.4 * s, 3.4 * s, 7), farTrunk, 0, 1.7 * s, 0);
      g.add(trunk);
      var c1 = mesh(new T.IcosahedronGeometry(2.0 * s, 1), farFoliage, 0, 4.0 * s, 0);
      c1.scale.set(1, 0.85, 1);
      g.add(c1);
      var c2 = mesh(new T.IcosahedronGeometry(1.35 * s, 1), farFoliage2, 1.0 * s, 3.65 * s, 0.5 * s);
      g.add(c2);
      var c3 = mesh(new T.IcosahedronGeometry(1.15 * s, 1), farFoliage, -0.85 * s, 4.4 * s, -0.3 * s);
      g.add(c3);
      G.context.add(g);
    });

    // distant hedge line
    var h1 = box(26, 1.6, 1.6, farFoliage, -30, 0.8, -42, { cast: false });
    var h2 = box(30, 1.4, 1.6, farFoliage, 22, 0.7, -43, { cast: false });
    G.context.add(h1); G.context.add(h2);
  }

  function makeTree(s) {
    var g = new T.Group();
    var trunk = mesh(new T.CylinderGeometry(0.13 * s, 0.22 * s, 3.0 * s, 9), MAT.trunk, 0, 1.5 * s, 0);
    g.add(trunk);
    var crownMat = new T.MeshStandardMaterial({ color: 0x3d5635, roughness: 0.96 });
    var crownMat2 = new T.MeshStandardMaterial({ color: 0x4b6540, roughness: 0.96 });
    var c1 = mesh(new T.IcosahedronGeometry(1.42 * s, 1), crownMat, 0, 3.45 * s, 0);
    c1.scale.set(1.05, 0.86, 1.0);
    g.add(c1);
    var c2 = mesh(new T.IcosahedronGeometry(0.95 * s, 1), crownMat2, 0.85 * s, 3.2 * s, 0.2 * s);
    c2.scale.set(1, 0.9, 1);
    g.add(c2);
    var c3 = mesh(new T.IcosahedronGeometry(0.82 * s, 1), crownMat, -0.75 * s, 3.8 * s, -0.2 * s);
    g.add(c3);
    var c4 = mesh(new T.IcosahedronGeometry(0.72 * s, 1), crownMat2, -0.2 * s, 4.3 * s, 0.35 * s);
    g.add(c4);
    var c5 = mesh(new T.IcosahedronGeometry(0.6 * s, 1), crownMat, 0.45 * s, 4.05 * s, -0.5 * s);
    g.add(c5);
    g.scale.setScalar(1);
    return g;
  }

  /* ---------- scene build ---------- */
  function buildScene() {
    envMap = makeEnv();
    scene.fog = new T.Fog(0xc3cfc5, 62, 185);

    var hemi = new T.HemisphereLight(0xdce8ec, 0x6f6d54, 0.62);
    scene.add(hemi);

    var sun = new T.DirectionalLight(0xffe4bd, 1.55);
    sun.position.set(36, 25, 32);
    sun.castShadow = true;
    var shadowSize = isMobileDevice ? 1024 : 2048;
    sun.shadow.mapSize.set(shadowSize, shadowSize);
    sun.shadow.camera.left = -42;
    sun.shadow.camera.right = 42;
    sun.shadow.camera.top = 42;
    sun.shadow.camera.bottom = -42;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 130;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.035;
    scene.add(sun);
    sun.target.position.set(0, 3, 0);
    scene.add(sun.target);

    var fill = new T.DirectionalLight(0xbcd4e0, 0.22);
    fill.position.set(-28, 18, -14);
    scene.add(fill);

    var warm = new T.DirectionalLight(0xffd9a8, 0.12);
    warm.position.set(4, 8, 30);
    scene.add(warm);

    building = new T.Group();
    scene.add(building);

    buildMaterials();
    buildSite();
    buildStructure();
    buildLandscape();
    buildContext();
    buildInteriors();

    // ensure large site reads as grounded
    A.waterTop.material.opacity = 0;
  }

  /* ---------- build / assembly ---------- */
  function setBuild(p) {
    p = clamp(p, 0, 1);
    state.build = p;

    if (!building) return;

    // pool appears early, water late
    G.pool.visible = p > 0.025;
    if (G.siteworks) G.siteworks.visible = p < 0.92;
    if (G.landscape) G.landscape.visible = p > 0.755;
    if (G.landscapeExtras) G.landscapeExtras.visible = p > 0.82;

    var f = seg(p, 0.015, 0.075);
    A.foundation.scale.y = Math.max(0.001, f);
    A.foundation.visible = p > 0.01;

    var sf = seg(p, 0.05, 0.13);
    A.slabFoot.scale.x = A.slabFoot.scale.z = Math.max(0.001, sf);

    for (var i = 0; i < A.columns.length; i++) {
      var c = A.columns[i];
      c.scale.y = Math.max(0.001, seg(p, 0.09 + i * 0.007, 0.17 + i * 0.007));
    }

    // ground floor
    G.l0.visible = p > 0.165;
    for (var a = 0; a < A.walls0.length; a++) {
      var w = A.walls0[a];
      var t = seg(p, 0.17 + a * 0.011, 0.265 + a * 0.011);
      if (w.isGroup) {
        w.scale.y = Math.max(0.001, t);
      } else {
        w.scale.y = Math.max(0.001, t);
      }
    }
    G.i0.visible = p > 0.265;

    // slab 1
    var s1 = seg(p, 0.275, 0.335);
    A.slab1.visible = p > 0.27;
    A.slab1.position.y = SLAB1 + (1 - s1) * 8;

    // first floor
    G.l1.visible = p > 0.305;
    for (var b = 0; b < A.walls1.length; b++) {
      A.walls1[b].scale.y = Math.max(0.001, seg(p, 0.305 + b * 0.012, 0.40 + b * 0.012));
    }
    G.i1.visible = p > 0.405;

    // slab 2
    var s2 = seg(p, 0.415, 0.475);
    A.slab2.visible = p > 0.41;
    A.slab2.position.y = SLAB2 + (1 - s2) * 8;

    // second floor
    G.l2.visible = p > 0.445;
    for (var cc = 0; cc < A.walls2.length; cc++) {
      A.walls2[cc].scale.y = Math.max(0.001, seg(p, 0.445 + cc * 0.012, 0.545 + cc * 0.012));
    }
    G.i2.visible = p > 0.55;

    // tower
    A.tower.scale.y = Math.max(0.001, seg(p, 0.40, 0.58));
    A.tower.visible = p > 0.39;

    // roof
    var rf = seg(p, 0.555, 0.635);
    A.roof.visible = p > 0.55;
    A.roof.position.y = ROOFY + (1 - rf) * 8;

    // glazing
    for (var g = 0; g < A.glazings.length; g++) {
      var gl = A.glazings[g];
      var gt = seg(p, gl.start, gl.start + 0.075);
      gl.grp.visible = gt > 0.002;
      gl.grp.position.y = gl.baseY - (1 - gt) * 1.4;
      for (var mm = 0; mm < gl.mats.length; mm++) {
        gl.mats[mm].opacity = gl.mats[mm].userData.base * gt;
      }
    }

    // balcony / envelope / doors
    var envT = seg(p, 0.60, 0.68);
    for (var bi = 0; bi < A.balconies.length; bi++) {
      var bal = A.balconies[bi];
      bal.visible = envT > 0.002;
      bal.position.z = bal.userData.z0 - (1 - envT) * 3.2;
    }
    for (var ri = 0; ri < A.rails.length; ri++) {
      var rail = A.rails[ri];
      var rt = seg(p, 0.62, 0.70);
      rail.visible = rt > 0.002;
      rail.scale.y = Math.max(0.001, rt);
    }
    var doorT = seg(p, 0.60, 0.68);
    A.doors.forEach(function (d) {
      d.obj.visible = doorT > 0.002;
      d.obj.rotation.y = -(1 - doorT) * 1.25;
    });
    if (A.canopy) {
      A.canopy.visible = envT > 0.002;
      A.canopy.position.z = 8.3 - (1 - envT) * 3.4;
    }

    // emissive strips
    var lt = seg(p, 0.70, 0.84);
    for (var si = 0; si < A.strips.length; si++) {
      A.strips[si].material.emissiveIntensity = 1.6 * lt;
      A.strips[si].visible = lt > 0.01;
    }

    // landscape
    for (var hi = 0; hi < A.hedges.length; hi++) {
      var ht = seg(p, 0.79 + hi * 0.012, 0.90 + hi * 0.012);
      A.hedges[hi].scale.y = Math.max(0.001, ht);
    }
    for (var ti = 0; ti < A.trees.length; ti++) {
      var tt = seg(p, 0.80 + ti * 0.014, 0.94 + ti * 0.014);
      A.trees[ti].scale.setScalar(Math.max(0.001, tt));
    }
    for (var pi = 0; pi < A.planters.length; pi++) {
      var pt = seg(p, 0.84 + pi * 0.01, 0.96 + pi * 0.01);
      A.planters[pi].scale.setScalar(Math.max(0.001, pt));
    }
    for (var li = 0; li < A.loungeChairs.length; li++) {
      var lt2 = seg(p, 0.86, 0.96);
      A.loungeChairs[li].scale.setScalar(Math.max(0.001, lt2));
    }

    // water
    var wt = seg(p, 0.78, 0.90);
    MAT.water.opacity = 0.9 * wt;
    A.water.visible = wt > 0.01;
    if (A.waterTop) A.waterTop.material.opacity = 0.18 * wt;
  }

  /* ---------- shell dissolve (tour) ---------- */
  function prepShellFade() {
    var list = A.shellFront.concat(A.shellRight);
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (!m || !m.isMesh || !m.material || m.userData.fadeReady) continue;
      var src = m.material;
      var glassRef = (src.userData && src.userData.base != null) ? src : null;
      var mat = src.clone();
      if (glassRef) mat.userData.base = glassRef.userData.base;
      m.material = mat;
      m.userData.fadeReady = true;
      m.userData.glassRef = glassRef;
      m.userData.fadeCast = m.castShadow;
      A.shellFadeMeshes.push(m);
    }
  }

  function applyShellFade() {
    var f = state.shellFade;
    var on = f > 0.003;
    var k = 1 - 0.96 * f;

    for (var i = 0; i < A.shellFadeMeshes.length; i++) {
      var m = A.shellFadeMeshes[i];
      var mat = m.material;
      var glass = m.userData.glassRef;
      var base = glass ? glass.opacity : 1;

      mat.opacity = base * k;

      if (glass) {
        mat.transparent = true;
        mat.depthWrite = false;
      } else {
        var want = on;
        if (mat.transparent !== want) mat.transparent = want;
        mat.depthWrite = !on || f < 0.55;
        m.castShadow = m.userData.fadeCast && (!on || f < 0.4);
      }
    }

    for (var li = 0; li < A.interiorLights.length; li++) {
      var entry = A.interiorLights[li];
      entry.light.intensity = entry.base * (1 + f * 1.15);
    }
  }

  function setShellFade(v, instant) {
    state.shellGoal = clamp(v, 0, 1);
    if (instant) state.shellFade = state.shellGoal;
  }

  /* ---------- free cinematic camera ---------- */
  function setPose(p, t, fov, instant) {
    if (!camera || !pose.pos) return;
    if (!pose.on) {
      pose.pos.copy(camera.position);
      pose.target.set(0, orbit.ty, 0);
      pose.fov = camera.fov;
      pose.on = true;
      state.dragging = false;
    }
    pose.goalPos.set(p[0], p[1], p[2]);
    pose.goalTarget.set(t[0], t[1], t[2]);
    pose.goalFov = fov || 34;

    if (instant) {
      pose.pos.copy(pose.goalPos);
      pose.target.copy(pose.goalTarget);
      pose.fov = pose.goalFov + (state.portrait ? 8 : 0);
      camera.position.copy(pose.pos);
      camera.lookAt(pose.target);
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
  }

  function releaseFree() {
    if (!pose.on) return;
    pose.on = false;

    var ty = pose.target.y;
    var dx = camera.position.x, dy = camera.position.y - ty, dz = camera.position.z;
    var r = clamp(Math.sqrt(dx * dx + dy * dy + dz * dz), 8, 96);

    orbit.ty = goal.ty = ty;
    orbit.radius = goal.radius = r;
    orbit.yaw = goal.yaw = Math.atan2(dx, dz);
    orbit.pitch = goal.pitch = clamp(Math.asin(clamp(dy / r, -1, 1)), -0.75, 1.2);
  }

  /* ---------- modes ---------- */
  function setShellVisibility() {
    var hide = state.mode === 'cutaway';
    A.shellFront.forEach(function (m) { m.visible = !hide; });
    A.shellRight.forEach(function (m) { m.visible = !hide; });
  }

  function setFloors(arr) {
    state.floors = arr.slice(0, 3);
    if (G.l0) G.l0.visible = (state.build > 0.165 || state.active) && state.floors[0];
    if (G.i0) G.i0.visible = (state.build > 0.265 || state.active) && state.floors[0];
    if (G.l1) G.l1.visible = (state.build > 0.305 || state.active) && state.floors[1];
    if (G.i1) G.i1.visible = (state.build > 0.405 || state.active) && state.floors[1];
    if (G.l2) G.l2.visible = (state.build > 0.445 || state.active) && state.floors[2];
    if (G.i2) G.i2.visible = (state.build > 0.55 || state.active) && state.floors[2];
  }

  function setMode(mode) {
    releaseFree();
    state.mode = mode;
    setShellVisibility();
    setFloors(state.floors);
    if (mode === 'exterior') {
      setPreset('threequarter', true);
    } else if (mode === 'cutaway') {
      setPreset('cutaway', true);
      setFloors([true, true, true]);
    }
  }

  function showShell() {
    state.mode = 'exterior';
    setShellVisibility();
  }

  function setPreset(name, instant) {
    var pr = PRESETS[name];
    if (!pr) return;
    releaseFree();
    state.preset = name;
    state.preset = name;
    goal.yaw = pr.yaw;
    goal.pitch = pr.pitch;
    goal.radius = pr.radius * RADIUS_FIT;
    goal.ty = pr.ty;
    if (instant) {
      orbit.yaw = goal.yaw; orbit.pitch = goal.pitch;
      orbit.radius = goal.radius; orbit.ty = goal.ty;
    }
  }

  function setActive(on) {
    state.active = !!on;
    if (!on) {
      releaseFree();
      state.shellGoal = 0;
      state.shellFade = 0;
    }
    if (on) {
      setShellVisibility();
      setFloors(state.floors);
    }
  }

  /* ---------- camera ---------- */
  function applyCamera() {
    var cp = Math.cos(orbit.pitch) * orbit.radius;
    camera.position.set(
      Math.sin(orbit.yaw) * cp,
      orbit.ty + Math.sin(orbit.pitch) * orbit.radius,
      Math.cos(orbit.yaw) * cp
    );
    camera.lookAt(0, orbit.ty, 0);
  }

  function resize() {
    if (!camera) return;
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    isMobileDevice = window.innerWidth <= 768 ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    renderer.setPixelRatio(isMobileDevice ?
      Math.min(window.devicePixelRatio || 1, 1.35) :
      Math.min(window.devicePixelRatio || 1, 1.75));
    var ar = w / h;
    RADIUS_FIT = ar < 0.85 ? 1.52 : ar < 1.25 ? 1.16 : 1;
    state.portrait = ar < 0.85;
    if (!pose.on) camera.fov = state.portrait ? 40 : 34;
    camera.updateProjectionMatrix();
  }

  /* ---------- input ---------- */
  var pointers = {};
  var lastPinch = 0;

  function onDown(e) {
    if (!state.active || pose.on) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    canvasEl.setPointerCapture && canvasEl.setPointerCapture(e.pointerId);
    state.dragging = true;
  }
  function onMove(e) {
    if (!state.active || pose.on) return;
    if (!pointers[e.pointerId]) return;
    var prev = pointers[e.pointerId];
    var dx = e.clientX - prev.x;
    var dy = e.clientY - prev.y;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };

    var keys = Object.keys(pointers);
    if (keys.length >= 2) {
      var p1 = pointers[keys[0]], p2 = pointers[keys[1]];
      var dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (lastPinch > 0) {
        goal.radius = clamp(goal.radius * (lastPinch / dist), 24, 96);
      }
      lastPinch = dist;
      return;
    }
    goal.yaw -= dx * 0.0055;
    goal.pitch = clamp(goal.pitch + dy * 0.004, 0.02, 1.15);
  }
  function onUp(e) {
    delete pointers[e.pointerId];
    if (!Object.keys(pointers).length) { state.dragging = false; lastPinch = 0; }
  }
  function onTouchStart(e) {
    if (!state.active || pose.on) return;
    if (e.touches.length === 2) {
      lastPinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  }
  function onTouchMove(e) {
    if (!state.active || pose.on) return;
    if (e.touches.length === 2 && lastPinch > 0) {
      var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      goal.radius = clamp(goal.radius * (lastPinch / dist), 24, 96);
      lastPinch = dist;
      if (e.cancelable) e.preventDefault();
    }
  }

  function bind() {
    canvasEl.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    canvasEl.addEventListener('touchstart', onTouchStart, { passive: true });
    canvasEl.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      pageHidden = document.hidden;
    });
  }

  /* ---------- loop ---------- */
  function animate() {
    requestAnimationFrame(animate);
    if (!renderer || pageHidden) return;

    var dt = Math.min(clock.getDelta(), 0.05);

    state.shellFade += reducedMotion ?
      (state.shellGoal - state.shellFade) :
      (state.shellGoal - state.shellFade) * 0.11;
    if (Math.abs(state.shellGoal - state.shellFade) < 0.0015) state.shellFade = state.shellGoal;
    applyShellFade();

    if (pose.on) {
      var interiorPose = state.shellGoal > 0.5;
      var pf = pose.goalFov + (state.portrait ? (interiorPose ? 12 : 20) : 0);
      if (reducedMotion) {
        pose.pos.copy(pose.goalPos);
        pose.target.copy(pose.goalTarget);
        pose.fov = pf;
      } else {
        pose.pos.lerp(pose.goalPos, 0.17);
        pose.target.lerp(pose.goalTarget, 0.17);
        pose.fov += (pf - pose.fov) * 0.14;
      }

      if (state.portrait) {
        // Portrait screens crop the wide architectural framing. Pull the
        // camera back along its view direction and widen the lens so rooms
        // and the completed facade stay legible on phones.
        var bx = pose.pos.x - pose.target.x;
        var by = pose.pos.y - pose.target.y;
        var bz = pose.pos.z - pose.target.z;
        var bl = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
        var back = (interiorPose ? 0.8 : 9.0) / bl;
        camera.position.set(
          pose.pos.x + bx * back,
          pose.pos.y + by * back,
          pose.pos.z + bz * back
        );
        camera.lookAt(pose.target.x, pose.target.y + 0.18, pose.target.z);
      } else {
        camera.position.copy(pose.pos);
        camera.lookAt(pose.target);
      }
      if (Math.abs(camera.fov - pose.fov) > 0.005) {
        camera.fov = pose.fov;
        camera.updateProjectionMatrix();
      }
    } else {
      if (!state.active) {
        // cinematic construction path
        var e = smooth(state.build);
        goal.yaw = -1.02 + 0.42 * e;
        goal.pitch = 0.29 - 0.075 * e;
        goal.radius = (56 - 13 * e) * RADIUS_FIT;
        goal.ty = 4.3 + 1.5 * e;
      }

      var k = state.active ? 0.085 : 0.06;
      if (reducedMotion) {
        orbit.yaw = goal.yaw;
        orbit.pitch = goal.pitch;
        orbit.radius = goal.radius;
        orbit.ty = goal.ty;
      } else {
        orbit.yaw += (goal.yaw - orbit.yaw) * k;
        orbit.pitch += (goal.pitch - orbit.pitch) * k;
        orbit.radius += (goal.radius - orbit.radius) * k;
        orbit.ty += (goal.ty - orbit.ty) * k;
      }

      applyCamera();
    }

    renderer.render(scene, camera);
  }

  /* ---------- init ---------- */
  function init(canvas) {
    canvasEl = canvas;
    renderer = new T.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.87;
    renderer.setClearColor(0x000000, 0);

    scene = new T.Scene();
    camera = new T.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 500);
    clock = new T.Clock();

    pose.pos = new T.Vector3();
    pose.target = new T.Vector3();
    pose.goalPos = new T.Vector3();
    pose.goalTarget = new T.Vector3();

    resize();
    buildScene();
    prepShellFade();
    setBuild(0);
    setMode('exterior');
    applyShellFade();
    applyCamera();
    bind();
    animate();

    // debug handle
    window.__villa = { scene: scene, camera: camera, renderer: renderer, state: state, pose: pose };
  }

  window.Villa = {
    init: init,
    setBuild: setBuild,
    setMode: setMode,
    showShell: showShell,
    setPreset: setPreset,
    setFloors: setFloors,
    setActive: setActive,
    setPose: setPose,
    releaseFree: releaseFree,
    setShellFade: setShellFade,
    resize: resize,
    zoom: function (dir) {
      releaseFree();
      goal.radius = clamp(goal.radius * (dir > 0 ? 0.88 : 1.14), 18, 96);
    },
    ready: function () { return !!renderer; }
  };
})();
