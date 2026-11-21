/* =========================================================================
   THE ARCHITECT — Architectural artwork engine
   Generates a consistent layered SVG of the three-storey residence.
   Layers are grouped so GSAP can assemble the building stage by stage.
   ========================================================================= */
window.ArchitectArt = (function () {
  'use strict';

  /* ---------- palettes ------------------------------------------------ */
  const PALETTES = {
    day: {
      sky: ['#eef1ef', '#f6f2e9', '#f8f0e2'],
      sun: '#fff4dd',
      sunOpacity: 0.55,
      distant: '#a8b2a0', distant2: '#8d9a86',
      lawn: '#5d7052', lawn2: '#47593f', lawnLine: '#ffffff',
      stone: '#e9e1d2', stoneTop: '#f3ecdf', stoneShade: '#d5c9b6', stoneLine: '#c9bca7',
      concrete: '#d3cbba', concreteShade: '#bdb3a1',
      wood: '#a97a51', woodDark: '#8a603c', woodLight: '#c1946a',
      glassTop: '#d5e4e6', glassBot: '#9db6bb', glassRef: '#ffffff',
      frame: '#414a4b', interior: '#5b5045', glow: '#f2c98e', glowOp: 0.28,
      waterTop: '#48858c', waterBot: '#245059',
      leaf: '#45603f', leaf2: '#334a31', leaf3: '#5b7a4e',
      trunk: '#4c3b2d',
      shadow: '#26301f',
      light: '#ffd9a0', lightOp: 0.0,
      poolLight: '#7fd8d8', poolLightOp: 0.0
    },
    night: {
      sky: ['#0d1b24', '#1d3038', '#6b4a38'],
      sun: '#f0a960',
      sunOpacity: 0.75,
      distant: '#25362f', distant2: '#1b2a26',
      lawn: '#2c3b30', lawn2: '#1f2c24', lawnLine: '#cfd8c4',
      stone: '#8f8574', stoneTop: '#a49a87', stoneShade: '#736b5d', stoneLine: '#5f584d',
      concrete: '#7c7466', concreteShade: '#615a4f',
      wood: '#8a5a38', woodDark: '#5f3d27', woodLight: '#a97445',
      glassTop: '#f5cf95', glassBot: '#c08a55', glassRef: '#ffe9c2',
      frame: '#1c2224', interior: '#120f0d', glow: '#ffcb84', glowOp: 0.85,
      waterTop: '#1d4a52', waterBot: '#0c262e',
      leaf: '#25382a', leaf2: '#182619', leaf3: '#314a33',
      trunk: '#2b221b',
      shadow: '#0b1210',
      light: '#ffc987', lightOp: 0.9,
      poolLight: '#7fdfe0', poolLightOp: 0.65
    }
  };

  /* ---------- tiny helpers -------------------------------------------- */
  const r = (x, y, w, h, fill, extra) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;
  const line = (x1, y1, x2, y2, stroke, w, extra) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"${extra ? ' ' + extra : ''}/>`;
  const circ = (cx, cy, rad, fill, extra) =>
    `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;
  const pth = (d, fill, extra) => `<path d="${d}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;
  const txt = (x, y, s, fill, size, extra) =>
    `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="IBM Plex Mono, monospace"${extra ? ' ' + extra : ''}>${s}</text>`;

  /* A subtle vertical shading wash used on most material planes */
  function wash(id, vertical) {
    const dir = vertical === false ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="0" y2="1"';
    return `<linearGradient id="${id}" ${dir}>
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.10"/>
    </linearGradient>`;
  }

  /* ---------- tree ------------------------------------------------------ */
  function tree(x, baseY, scale, p, cls) {
    const s = scale;
    return `<g class="${cls}" transform="translate(${x} ${baseY}) scale(${s})">
      <ellipse cx="0" cy="6" rx="76" ry="12" fill="${p.shadow}" opacity="0.20"/>
      <path d="M-7 0 C-5 -60 -10 -110 -4 -160 L8 -160 C4 -108 10 -56 7 0 Z" fill="${p.trunk}"/>
      <path d="M-2 -116 C-26 -140 -40 -158 -46 -178 M4 -130 C26 -150 42 -160 52 -178" stroke="${p.trunk}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <circle cx="-44" cy="-196" r="54" fill="${p.leaf2}"/>
      <circle cx="40" cy="-206" r="62" fill="${p.leaf2}"/>
      <circle cx="4" cy="-244" r="66" fill="${p.leaf2}"/>
      <circle cx="-30" cy="-226" r="48" fill="${p.leaf}"/>
      <circle cx="34" cy="-238" r="52" fill="${p.leaf}"/>
      <circle cx="-6" cy="-272" r="44" fill="${p.leaf3}"/>
      <circle cx="-58" cy="-232" r="30" fill="${p.leaf3}" opacity="0.9"/>
      <circle cx="58" cy="-252" r="28" fill="${p.leaf3}" opacity="0.9"/>
    </g>`;
  }

  function shrub(x, y, w, h, p, cls) {
    return `<g class="${cls || ''}">
      <path d="M${x} ${y + h} C${x} ${y + h * 0.2} ${x + w * 0.18} ${y} ${x + w * 0.5} ${y}
               C${x + w * 0.84} ${y} ${x + w} ${y + h * 0.25} ${x + w} ${y + h} Z" fill="${p.leaf}"/>
      <path d="M${x + w * 0.12} ${y + h * 0.55} C${x + w * 0.3} ${y + h * 0.18} ${x + w * 0.62} ${y + h * 0.14} ${x + w * 0.86} ${y + h * 0.42}"
            stroke="${p.leaf3}" stroke-width="${Math.max(2, h * 0.08)}" fill="none" opacity="0.55" stroke-linecap="round"/>
    </g>`;
  }

  /* ---------- ground floor / levels constants -------------------------- */
  const G = {
    groundY: 780,
    lvl1: 602,
    slab1: 580,
    lvl2: 402,
    slab2: 380,
    lvl3: 222,
    roof: 198,
    parapet: 178,
    gStoneL: 505, gStoneR: 810, gGlassR: 1210,
    fStoneL: 505, fStoneR: 700, woodR: 885, fGlassR: 1192,
    sStoneL: 545, sStoneR: 730, sGlassR: 1152,
    slab1L: 455, slab1R: 1228,
    slab2L: 490, slab2R: 1208,
    roofL: 520, roofR: 1180,
    parapetL: 560, parapetR: 1140,
    towerL: 441, towerR: 505, towerTop: 150
  };

  /* ---------- glazing --------------------------------------------------- */
  function glassPane(x, y, w, h, p, uid, opts) {
    const o = opts || {};
    const cols = o.cols || Math.max(1, Math.round(w / 84));
    let out = `<g class="pane">`;
    out += r(x, y, w, h, `url(#${uid}-glass)`);
    // interior glow behind the glass
    out += r(x + 6, y + h * 0.55, w - 12, h * 0.42, p.glow, `opacity="${p.glowOp}"`);
    // faint interior silhouettes
    if (o.interior) out += o.interior;
    // reflections
    out += pth(`M${x + w * 0.12} ${y + h} L${x + w * 0.42} ${y} L${x + w * 0.56} ${y} L${x + w * 0.26} ${y + h} Z`,
      p.glassRef, `opacity="0.10"`);
    out += pth(`M${x + w * 0.62} ${y + h} L${x + w * 0.82} ${y} L${x + w * 0.88} ${y} L${x + w * 0.68} ${y + h} Z`,
      p.glassRef, `opacity="0.06"`);
    // mullions
    for (let i = 1; i < cols; i++) {
      const mx = x + (w / cols) * i;
      out += r(mx - 1.6, y, 3.2, h, p.frame, 'opacity="0.92"');
    }
    // frame
    out += r(x, y, w, 5, p.frame);
    out += r(x, y + h - 5, w, 5, p.frame);
    out += r(x, y, 5, h, p.frame);
    out += r(x + w - 5, y, 5, h, p.frame);
    out += `</g>`;
    return out;
  }

  /* ---------- main builder --------------------------------------------- */
  function build(opts) {
    const o = opts || {};
    const variant = o.variant || 'reveal';        // construction | reveal | night | foundation
    const uid = o.uid || ('m' + Math.random().toString(36).slice(2, 7));
    const night = variant === 'night';
    const foundation = variant === 'foundation';
    const p = PALETTES[night ? 'night' : 'day'];

    const stoneGrad = `${uid}-stone`, woodGrad = `${uid}-wood`, lawnGrad = `${uid}-lawn`,
      skyGrad = `${uid}-sky`, waterGrad = `${uid}-water`, glassGrad = `${uid}-glass`,
      shadeGrad = `${uid}-shade`, glowGrad = `${uid}-glow`, concreteGrad = `${uid}-conc`;

    const defs = `<defs>
      <linearGradient id="${skyGrad}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.sky[0]}"/>
        <stop offset="0.55" stop-color="${p.sky[1]}"/>
        <stop offset="1" stop-color="${p.sky[2]}"/>
      </linearGradient>
      <radialGradient id="${glowGrad}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="${p.sun}" stop-opacity="${p.sunOpacity}"/>
        <stop offset="1" stop-color="${p.sun}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${lawnGrad}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.lawn}"/>
        <stop offset="1" stop-color="${p.lawn2}"/>
      </linearGradient>
      <linearGradient id="${stoneGrad}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${p.stoneTop}"/>
        <stop offset="0.55" stop-color="${p.stone}"/>
        <stop offset="1" stop-color="${p.stoneShade}"/>
      </linearGradient>
      <linearGradient id="${concreteGrad}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.concrete}"/>
        <stop offset="1" stop-color="${p.concreteShade}"/>
      </linearGradient>
      <linearGradient id="${woodGrad}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${p.woodDark}"/>
        <stop offset="0.35" stop-color="${p.wood}"/>
        <stop offset="0.7" stop-color="${p.woodLight}"/>
        <stop offset="1" stop-color="${p.woodDark}"/>
      </linearGradient>
      <linearGradient id="${glassGrad}" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stop-color="${p.glassTop}"/>
        <stop offset="1" stop-color="${p.glassBot}"/>
      </linearGradient>
      <linearGradient id="${waterGrad}" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stop-color="${p.waterTop}"/>
        <stop offset="1" stop-color="${p.waterBot}"/>
      </linearGradient>
      <linearGradient id="${shadeGrad}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000000" stop-opacity="0"/>
        <stop offset="0.72" stop-color="#000000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.16"/>
      </linearGradient>
      <linearGradient id="${uid}-lightsweep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${p.light}" stop-opacity="0.35"/>
        <stop offset="1" stop-color="${p.light}" stop-opacity="0"/>
      </linearGradient>
      ${wash(uid + '-wash')}
      <filter id="${uid}-soft" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="${p.shadow}" flood-opacity="0.22"/>
      </filter>
      <filter id="${uid}-blur"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="${uid}-blurSm"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>`;

    /* ============ SKY / DISTANCE ============ */
    const sky = `<g class="m-sky">
      ${r(0, 0, 1440, 760, `url(#${skyGrad})`)}
      <ellipse cx="1030" cy="220" rx="430" ry="300" fill="url(#${glowGrad})"/>
      ${night ? `${[
        [180, 120, 1.2], [340, 70, 1], [520, 150, 0.9], [760, 60, 1.3], [980, 110, 0.8],
        [1200, 70, 1.1], [1340, 160, 0.9], [640, 210, 0.7], [240, 240, 0.8], [1120, 220, 0.7]
      ].map(s => circ(s[0], s[1], s[2], '#ffffff', 'opacity="0.55"')).join('')}` : `
        <g opacity="0.5" fill="#ffffff">
          <ellipse cx="360" cy="150" rx="180" ry="16"/>
          <ellipse cx="470" cy="140" rx="120" ry="12"/>
          <ellipse cx="1120" cy="98" rx="160" ry="12"/>
          <ellipse cx="1220" cy="110" rx="90" ry="9"/>
        </g>`}
      <path d="M0 690 C120 660 210 676 300 664 C420 648 500 682 620 674 C760 664 860 688 980 676
               C1100 664 1240 686 1440 660 L1440 760 L0 760 Z" fill="${p.distant}" opacity="0.55"/>
      <path d="M0 716 C140 692 230 710 340 700 C470 688 560 716 700 708 C850 700 950 722 1100 710
               C1240 700 1340 720 1440 704 L1440 790 L0 790 Z" fill="${p.distant2}" opacity="0.75"/>
    </g>`;

    /* ============ SITE ============ */
    let site = `<g class="m-site">
      ${r(0, 726, 1440, 174, `url(#${lawnGrad})`)}
      <g opacity="0.10">${Array.from({ length: 13 }, (_, i) =>
        r(0, 736 + i * 13, 1440, 6, '#ffffff', 'opacity="0.5"')).join('')}</g>
      <ellipse cx="820" cy="790" rx="470" ry="27" fill="${p.shadow}" opacity="0.28" filter="url(#${uid}-blur)"/>
      ${tree(132, 792, 1.12, p, 'm-tree-bg')}
      ${tree(1328, 786, 0.95, p, 'm-tree-bg')}
      ${tree(1236, 770, 0.52, p, 'm-tree-bg')}
      <!-- pool terrace -->
      <path d="M38 786 H624 V900 H38 Z" fill="${p.concrete}" opacity="0.95"/>
      <path d="M38 786 H624 V793 H38 Z" fill="${p.stoneTop}" opacity="0.7"/>
      <g opacity="0.45">${Array.from({ length: 9 }, (_, i) => line(38, 806 + i * 12, 624, 806 + i * 12, p.concreteShade, 1)).join('')}</g>
      ${Array.from({ length: 10 }, (_, i) => line(70 + i * 62, 793, 70 + i * 62, 900, p.concreteShade, 1, 'opacity="0.35"')).join('')}
      <!-- pool coping -->
      <rect x="70" y="804" width="432" height="92" fill="${p.stoneShade}"/>
      <rect x="74" y="808" width="424" height="84" fill="${p.stoneTop}" opacity="0.55"/>
      <rect x="82" y="816" width="408" height="68" fill="${foundation ? p.concreteShade : p.waterTop}" opacity="0.3"/>
      <!-- path -->
      <path d="M636 900 H838 L792 800 H700 Z" fill="${p.stone}" opacity="0.55"/>
      ${Array.from({ length: 4 }, (_, i) => line(640 - i * 4, 872 - i * 22, 834 + i * 3, 872 - i * 22, p.stoneLine, 1.4, 'opacity="0.5"')).join('')}
      <path d="M700 800 H792 L786 792 H706 Z" fill="${p.stoneShade}" opacity="0.7"/>
      <!-- hedges -->
      ${shrub(438, 756, 160, 30, p)}
      ${shrub(852, 756, 388, 30, p)}
      <!-- grass tufts -->
      <g stroke="${p.leaf3}" stroke-width="2" stroke-linecap="round" opacity="0.65">
        ${[[556, 900, 6], [584, 896, 4], [536, 892, 5], [864, 898, 5], [892, 894, 4], [920, 899, 6],
          [478, 780, 4], [1258, 792, 5], [1284, 786, 4], [96, 778, 4]].map(g =>
          `M${g[0]} ${g[1]} C${g[0] - 5} ${g[1] - 14} ${g[0] - 2} ${g[1] - g[2] * 3} ${g[0]} ${g[1] - g[2] * 4}
           M${g[0] + 3} ${g[1]} C${g[0] + 9} ${g[1] - 12} ${g[0] + 8} ${g[1] - g[2] * 2.4} ${g[0] + 10} ${g[1] - g[2] * 3.2}`).join(' ')}
      </g>
      <!-- distant planting line -->
      ${shrub(1216, 742, 84, 34, p)}
    </g>`;

    /* ============ FOUNDATION ============ */
    const foundationArt = `<g class="m-foundation">
      <g class="m-excavate">
        <path d="M438 780 H1240 L1252 842 H426 Z" fill="${p.shadow}" opacity="0.55"/>
        <path d="M438 780 H1240 L1252 842 H426 Z" fill="none" stroke="${p.stoneLine}" stroke-width="1.4" opacity="0.5"/>
        <g opacity="0.35" stroke="${p.stoneLine}" stroke-width="1">
          ${Array.from({ length: 12 }, (_, i) => line(452 + i * 66, 782, 470 + i * 66, 840, p.stoneLine, 1)).join('')}
        </g>
      </g>
      <g class="m-footing">
        ${Array.from({ length: 8 }, (_, i) => {
          const x = 492 + i * 92;
          return `<g>${r(x, 798, 58, 30, p.concrete)}
            ${r(x, 798, 58, 5, p.stoneTop, 'opacity="0.5"')}
            <path d="M${x + 10} 798 V758 M${x + 28} 798 V754 M${x + 46} 798 V758" stroke="${p.frame}" stroke-width="2.5" opacity="0.55"/></g>`;
        }).join('')}
        <g opacity="0.5">${Array.from({ length: 3 }, (_, i) => line(470, 806 + i * 6, 1226, 806 + i * 6, p.stoneLine, 1.2)).join('')}</g>
      </g>
      <g class="m-slab">
        ${r(455, 764, 773, 34, `url(#${concreteGrad})`)}
        ${r(455, 764, 773, 5, p.stoneTop, 'opacity="0.6"')}
        ${r(455, 794, 773, 4, p.shadow, 'opacity="0.35"')}
        ${Array.from({ length: 9 }, (_, i) => line(520 + i * 84, 770, 520 + i * 84, 796, p.stoneLine, 1, 'opacity="0.35"')).join('')}
      </g>
      <g class="m-columns">
        ${[512, 604, 696, 752, 810, 900, 1000, 1100, 1180].map((x) => `<g>
          ${r(x - 11, 602, 22, 162, `url(#${concreteGrad})`)}
          ${r(x - 11, 602, 5, 162, p.stoneTop, 'opacity="0.35"')}
          ${r(x - 15, 758, 30, 8, p.concreteShade)}
          ${r(x - 15, 600, 30, 8, p.concrete)}
        </g>`).join('')}
      </g>
      ${foundation ? `
      <g class="m-ghost" fill="none" stroke="${night ? '#d8c39a' : '#2c4646'}" stroke-width="1.6" stroke-dasharray="7 9" opacity="0.5">
        <rect x="455" y="602" width="773" height="178"/>
        <rect x="490" y="402" width="718" height="178"/>
        <rect x="520" y="222" width="660" height="158"/>
        <rect x="520" y="198" width="660" height="24"/>
        <rect x="441" y="150" width="64" height="630"/>
        <rect x="872" y="496" width="360" height="84"/>
        <g stroke-width="1" opacity="0.8">
          <path d="M455 602 H441 V780"/>
          <path d="M1228 602 H1240 V780"/>
          <path d="M441 150 H380 M441 150 V90"/>
          <path d="M872 552 H840 M1232 552 H1260"/>
        </g>
        <g fill="${night ? '#d8c39a' : '#2c4646'}" stroke="none" font-family="IBM Plex Mono, monospace" font-size="10" opacity="0.9">
          <text x="838" y="596">7730</text>
          <text x="1206" y="396">7180</text>
          <text x="1176" y="216">6600</text>
          <text x="418" y="146" text-anchor="end">+ 9.6 m</text>
        </g>
      </g>` : ''}
    </g>`;

    /* ============ INTERIOR VOIDS (visible once slabs exist) ============ */
    const interiors = `<g class="m-interiors">
      ${r(G.gStoneR, G.lvl1, G.gGlassR - G.gStoneR, G.groundY - G.lvl1, p.interior, 'opacity="0.85"')}
      ${r(G.fStoneR + 185, G.lvl2, G.fGlassR - G.fStoneR - 185, G.slab1 - G.lvl2, p.interior, 'opacity="0.82"')}
      ${r(G.sStoneR, G.lvl3, G.sGlassR - G.sStoneR, G.slab2 - G.lvl3, p.interior, 'opacity="0.8"')}
    </g>`;

    /* ============ GROUND FLOOR ============ */
    const floor0 = `<g class="m-floor0">
      <g class="m-wall">
        ${r(G.gStoneL, G.lvl1, G.gStoneR - G.gStoneL, G.groundY - G.lvl1, `url(#${stoneGrad})`)}
        ${Array.from({ length: 7 }, (_, i) => line(G.gStoneL, G.lvl1 + 22 + i * 24, G.gStoneR, G.lvl1 + 22 + i * 24, p.stoneLine, 1, 'opacity="0.45"')).join('')}
        ${r(G.gStoneL, G.lvl1, 6, G.groundY - G.lvl1, p.stoneTop, 'opacity="0.5"')}
        <!-- entrance reveal -->
        ${r(628, 668, 134, G.groundY - 668, p.interior)}
        ${r(636, 676, 118, G.groundY - 676, p.woodDark, 'opacity="0.9"')}
        <g class="m-door">
          ${r(640, 680, 54, 100, `url(#${woodGrad})`)}
          ${r(700, 680, 54, 100, `url(#${woodGrad})`)}
          ${line(697, 680, 697, 780, p.stoneShade, 2, 'opacity="0.5"')}
          ${r(688, 722, 4, 30, p.stoneTop, 'opacity="0.85"')}
          ${r(702, 722, 4, 30, p.stoneTop, 'opacity="0.85"')}
          ${r(640, 680, 54, 6, p.stoneTop, 'opacity="0.4"')}
          ${r(700, 680, 54, 6, p.stoneTop, 'opacity="0.4"')}
        </g>
        <!-- canopy -->
        <g class="m-canopy">
          ${r(606, 636, 178, 14, p.concrete)}
          ${r(606, 636, 178, 4, p.stoneTop, 'opacity="0.7"')}
          ${r(606, 650, 178, 4, p.shadow, 'opacity="0.18"')}
          ${r(612, 650, 7, 130, p.frame, 'opacity="0.85"')}
          ${r(771, 650, 7, 130, p.frame, 'opacity="0.85"')}
        </g>
        <!-- stone shadow at base -->
        ${r(G.gStoneL, G.groundY - 16, G.gStoneR - G.gStoneL, 16, p.shadow, 'opacity="0.18"')}
        <!-- entrance detailing -->
        <g class="m-door-detail">
          ${r(606, 700, 5, 26, p.woodLight)}
          ${circ(608.5, 698, 9, p.light, `opacity="${night ? 0.85 : 0.25}" filter="url(#${uid}-blurSm)"`)}
          ${r(790, 700, 5, 26, p.woodLight)}
          ${circ(792.5, 698, 9, p.light, `opacity="${night ? 0.85 : 0.25}" filter="url(#${uid}-blurSm)"`)}
          ${txt(806, 730, '01', p.stoneShade, 11, 'letter-spacing="3" opacity="0.9"')}
        </g>
      </g>
      <!-- plinth -->
      ${r(438, 780, 802, 12, p.concreteShade)}
      ${r(438, 780, 802, 3, p.stoneTop, 'opacity="0.45"')}
      <!-- steps -->
      <g class="m-steps">
        ${r(628, 780, 134, 10, p.stoneShade)}
        ${r(616, 790, 158, 10, p.stone)}
        ${r(604, 800, 182, 9, p.stoneShade)}
      </g>
    </g>`;

    /* ============ SLAB 1 + FIRST FLOOR ============ */
    const slab1Art = `<g class="m-slab1">
      ${r(G.slab1L, G.slab1, G.slab1R - G.slab1L, 22, `url(#${concreteGrad})`)}
      ${r(G.slab1L, G.slab1, G.slab1R - G.slab1L, 4, p.stoneTop, 'opacity="0.85"')}
      ${r(G.slab1L, G.slab1 + 18, G.slab1R - G.slab1L, 4, p.shadow, 'opacity="0.28"')}
      ${r(G.slab1L, G.slab1 + 22, G.slab1R - G.slab1L, 10, p.shadow, 'opacity="0.12"')}
    </g>`;

    const floor1 = `<g class="m-floor1">
      <g class="m-wall">
        ${r(G.fStoneL, G.lvl2, G.fStoneR - G.fStoneL, G.slab1 - G.lvl2, `url(#${stoneGrad})`)}
        ${Array.from({ length: 6 }, (_, i) => line(G.fStoneL, G.lvl2 + 20 + i * 25, G.fStoneR, G.lvl2 + 20 + i * 25, p.stoneLine, 1, 'opacity="0.4"')).join('')}
        <!-- timber screen -->
        <g class="m-screen">
          ${r(700, G.lvl2, 185, G.slab1 - G.lvl2, p.woodDark, 'opacity="0.28"')}
          ${Array.from({ length: 15 }, (_, i) => r(704 + i * 12.2, G.lvl2, 5, G.slab1 - G.lvl2, `url(#${woodGrad})`)).join('')}
        </g>
      </g>
    </g>`;

    /* ============ BALCONY ============ */
    const balconyArt = `<g class="m-balcony">
      ${r(872, 552, 360, 26, `url(#${concreteGrad})`)}
      ${r(872, 552, 360, 4, p.stoneTop, 'opacity="0.8"')}
      ${r(872, 578, 360, 8, p.shadow, 'opacity="0.2"')}
      <g class="m-railing">
        ${r(884, 496, 336, 54, p.glassTop, 'opacity="0.34"')}
        ${r(884, 508, 336, 30, p.glassRef, 'opacity="0.06"')}
        ${pth('M892 550 L928 500 L946 500 L910 550 Z', p.glassRef, 'opacity="0.22"')}
        ${pth('M1100 550 L1136 500 L1150 500 L1114 550 Z', p.glassRef, 'opacity="0.12"')}
        ${r(884, 493, 336, 6, p.frame)}
        ${r(884, 493, 336, 2, p.woodLight, 'opacity="0.45"')}
        ${r(884, 546, 336, 4, p.frame)}
        ${[884, 950, 1052, 1154, 1220].map(x => r(x - 2, 496, 4, 54, p.frame, 'opacity="0.9"')).join('')}
      </g>
      ${r(872, 578, 360, 8, p.shadow, 'opacity="0.22"')}
    </g>`;

    /* ============ SLAB 2 + SECOND FLOOR ============ */
    const slab2Art = `<g class="m-slab2">
      ${r(G.slab2L, G.slab2, G.slab2R - G.slab2L, 22, `url(#${concreteGrad})`)}
      ${r(G.slab2L, G.slab2, G.slab2R - G.slab2L, 4, p.stoneTop, 'opacity="0.85"')}
      ${r(G.slab2L, G.slab2 + 18, G.slab2R - G.slab2L, 4, p.shadow, 'opacity="0.26"')}
      ${r(G.slab2L, G.slab2 + 22, G.slab2R - G.slab2L, 10, p.shadow, 'opacity="0.12"')}
    </g>`;

    const floor2 = `<g class="m-floor2">
      <g class="m-wall">
        ${r(G.sStoneL, G.lvl3, G.sStoneR - G.sStoneL, G.slab2 - G.lvl3, `url(#${stoneGrad})`)}
        ${Array.from({ length: 5 }, (_, i) => line(G.sStoneL, G.lvl3 + 18 + i * 26, G.sStoneR, G.lvl3 + 18 + i * 26, p.stoneLine, 1, 'opacity="0.4"')).join('')}
        ${r(G.sStoneL, G.lvl3, 6, G.slab2 - G.lvl3, p.stoneTop, 'opacity="0.45"')}
      </g>
    </g>`;

    /* ============ ROOF ============ */
    const roofArt = `<g class="m-roof">
      ${r(G.roofL, G.roof, G.roofR - G.roofL, 24, `url(#${concreteGrad})`)}
      ${r(G.roofL, G.roof, G.roofR - G.roofL, 5, p.stoneTop, 'opacity="0.8"')}
      ${r(G.roofL, G.roof + 19, G.roofR - G.roofL, 5, p.shadow, 'opacity="0.3"')}
      <!-- parapet -->
      ${r(G.parapetL, G.parapet, G.parapetR - G.parapetL, 20, `url(#${stoneGrad})`)}
      ${r(G.parapetL - 4, G.parapet, G.parapetR - G.parapetL + 8, 5, p.stoneTop)}
      ${r(G.parapetL, G.parapet + 20, G.parapetR - G.parapetL, 3, p.shadow, 'opacity="0.3"')}
      <!-- skylight / roof plant -->
      ${r(946, 176, 128, 22, p.frame, 'opacity="0.9"')}
      ${r(950, 180, 120, 14, p.glassBot, 'opacity="0.75"')}
      ${r(1102, 182, 40, 16, p.concreteShade)}
      <!-- fin detail -->
      ${r(G.parapetR, G.parapet + 8, 14, 12, p.concreteShade)}
    </g>`;

    /* ============ GLAZING ============ */
    const glazing = `<g class="m-glazing">
      ${glassPane(G.gStoneR, G.lvl1, G.gGlassR - G.gStoneR, G.groundY - G.lvl1, p, uid, {
        cols: 5,
        interior: `<g opacity="0.35">
          ${circ(902, 690, 7, p.glow)}${circ(1010, 690, 7, p.glow)}${circ(1120, 690, 7, p.glow)}
          ${line(902, 662, 902, 682, p.frame, 2, 'opacity="0.5"')}
          ${line(1010, 662, 1010, 682, p.frame, 2, 'opacity="0.5"')}
          ${line(1120, 662, 1120, 682, p.frame, 2, 'opacity="0.5"')}
          ${r(940, 730, 210, 50, p.interior, 'opacity="0.7"')}
        </g>`
      })}
      ${glassPane(G.fStoneR + 185, G.lvl2, G.fGlassR - G.fStoneR - 185, 148, p, uid, {
        cols: 4,
        interior: `<g opacity="0.3">
          ${r(1010, 440, 60, 100, p.woodDark, 'opacity="0.5"')}
          ${circ(1110, 520, 26, p.leaf, 'opacity="0.6"')}
        </g>`
      })}
      ${glassPane(G.sStoneR, G.lvl3, G.sGlassR - G.sStoneR, 154, p, uid, {
        cols: 5,
        interior: `<g opacity="0.25">
          ${r(880, 300, 190, 76, p.interior, 'opacity="0.8"')}
          ${circ(960, 270, 6, p.glow)}
        </g>`
      })}
    </g>`;

    /* ============ FINISHES: tower, fins, bronze ============ */
    const finishes = `<g class="m-finish">
      <!-- vertical timber / stone blade -->
      <g class="m-tower">
        ${r(G.towerL, G.towerTop, G.towerR - G.towerL, G.groundY - G.towerTop, `url(#${woodGrad})`)}
        ${Array.from({ length: 5 }, (_, i) => line(G.towerL + 12 + i * 11, G.towerTop, G.towerL + 12 + i * 11, G.groundY, p.woodDark, 1.4, 'opacity="0.35"')).join('')}
        ${r(G.towerL - 6, G.towerTop - 10, G.towerR - G.towerL + 12, 10, p.concrete)}
        ${r(G.towerL - 6, G.towerTop - 10, G.towerR - G.towerL + 12, 3, p.stoneTop, 'opacity="0.7"')}
        ${r(456, 306, 18, 150, p.interior, 'opacity="0.85"')}
        ${r(456, 306, 18, 5, p.frame)}
        ${r(456, 451, 18, 5, p.frame)}
        ${r(G.towerL, G.groundY - 18, G.towerR - G.towerL, 18, p.shadow, 'opacity="0.22"')}
      </g>
      <!-- shading fins on upper glazing -->
      <g class="m-fins">
        ${[760, 838, 916, 994, 1072, 1130].map(x => `<g>
          ${r(x, G.lvl3 - 4, 7, 158, p.wood)}
          ${r(x, G.lvl3 - 4, 3, 158, p.woodLight, 'opacity="0.5"')}
        </g>`).join('')}
      </g>
      <!-- bronze fascia lines -->
      ${line(455, 602, 1228, 602, p.wood, 2, 'opacity="0.5"')}
      ${line(490, 402, 1208, 402, p.wood, 2, 'opacity="0.35"')}
      <!-- soffit shadows cast on glazing -->
      <g class="m-soffits">
        ${r(810, 602, 400, 14, p.shadow, 'opacity="0.20"')}
        ${r(885, 402, 307, 12, p.shadow, 'opacity="0.18"')}
        ${r(730, 222, 422, 12, p.shadow, 'opacity="0.18"')}
        ${r(872, 580, 360, 10, p.shadow, 'opacity="0.16"')}
        ${r(520, 222, 660, 6, p.shadow, 'opacity="0.12"')}
      </g>
      <!-- downpipes -->
      ${r(1196, 402, 4, 178, p.frame, 'opacity="0.35"')}
      ${r(1196, 602, 4, 178, p.frame, 'opacity="0.35"')}
    </g>`;

    /* ============ LANDSCAPE (added at the end of construction) ============ */
    const landscape = `<g class="m-landscape">
      ${shrub(452, 752, 130, 34, p, 'm-hedge')}
      ${shrub(866, 752, 200, 34, p, 'm-hedge')}
      ${shrub(1086, 752, 154, 34, p, 'm-hedge')}
      <g class="m-planters">
        ${[540, 560, 580].map((x, i) => `<g>
          ${r(x, 742 + i, 12, 26 - i * 2, p.concreteShade)}
          ${circ(x + 6, 738 + i, 12, p.leaf)}
          ${circ(x + 2, 732 + i, 8, p.leaf3, 'opacity="0.8"')}
        </g>`).join('')}
      </g>
      <!-- pool water -->
      <g class="m-pool">
        <rect x="82" y="816" width="408" height="68" fill="url(#${waterGrad})"/>
        <g opacity="0.30" stroke="${p.glassRef}" stroke-width="1.4" stroke-linecap="round">
          ${[[100, 834, 58], [182, 848, 86], [288, 828, 54], [352, 860, 76], [412, 840, 44], [126, 868, 40]]
            .map(s => `M${s[0]} ${s[1]} h${s[2]}`).join(' ')}
        </g>
        <g opacity="${night ? 0.55 : 0.30}" filter="url(#${uid}-blurSm)">
          ${r(120, 818, 22, 64, p.sun)}
          ${r(176, 816, 10, 68, p.sun)}
          ${r(232, 818, 30, 64, p.sun)}
          ${r(304, 816, 14, 68, p.sun)}
          ${r(356, 820, 24, 60, p.sun)}
          ${r(412, 816, 12, 68, p.sun)}
        </g>
        <rect x="82" y="816" width="408" height="3" fill="${p.stoneTop}" opacity="0.55"/>
        <rect x="78" y="812" width="416" height="6" fill="${p.stoneTop}" opacity="0.35"/>
        ${r(70, 880, 432, 16, p.concreteShade, 'opacity="0.85"')}
        ${r(70, 880, 432, 4, p.stoneTop, 'opacity="0.4"')}
      </g>
      <!-- loungers on the terrace -->
      <g class="m-loungers">
        ${[530, 588].map((x) => `<g>
          ${r(x, 848, 48, 8, p.wood, 'rx="2"')}
          ${r(x + 4, 838, 40, 6, p.stone)}
          ${pth(`M${x + 8} 856 L${x + 4} 880 H${x + 10} L${x + 15} 856 Z`, p.frame, 'opacity="0.7"')}
          ${pth(`M${x + 40} 856 L${x + 44} 880 H${x + 50} L${x + 45} 856 Z`, p.frame, 'opacity="0.7"')}
        </g>`).join('')}
      </g>
      ${tree(1246, 780, 0.42, p, 'm-tree-new')}
      ${tree(1230, 776, 0.3, p, 'm-tree-new')}
    </g>`;

    /* ============ LIGHTING ============ */
    const lights = `<g class="m-lights" opacity="${night ? 1 : 0.55}">
      <g class="m-window-glow">
        ${r(G.gStoneR + 6, G.lvl1 + 6, G.gGlassR - G.gStoneR - 12, 14, p.light, 'opacity="0.35"')}
      </g>
      <!-- facade uplights -->
      <g class="m-uplights" opacity="${p.lightOp}">
        ${[700, 940, 1090].map(x => `<g>
          <path d="M${x} 790 L${x - 22} 640 H${x + 22} Z" fill="url(#${uid}-lightsweep)" opacity="0.5"/>
          <ellipse cx="${x}" cy="792" rx="20" ry="5" fill="${p.light}" opacity="0.7"/>
        </g>`).join('')}
        <path d="M460 790 L430 470 H500 Z" fill="url(#${uid}-lightsweep)" opacity="0.35"/>
      </g>
      <!-- bollards -->
      ${[[584, 862], [612, 884], [846, 858], [876, 880]].map(a => `<g>
        ${r(a[0], a[1] - 20, 5, 20, p.frame)}
        <circle cx="${a[0] + 2.5}" cy="${a[1] - 22}" r="7" fill="${p.light}" opacity="${night ? 0.9 : 0.3}" filter="url(#${uid}-blurSm)"/>
      </g>`).join('')}
      <!-- pool lights -->
      <g class="m-poollight" opacity="${p.poolLightOp}">
        <ellipse cx="170" cy="856" rx="30" ry="16" fill="${p.poolLight}" filter="url(#${uid}-blurSm)" opacity="0.7"/>
        <ellipse cx="360" cy="852" rx="26" ry="14" fill="${p.poolLight}" filter="url(#${uid}-blurSm)" opacity="0.6"/>
      </g>
      ${night ? `<g opacity="0.85">
        <ellipse cx="1080" cy="700" rx="150" ry="60" fill="${p.light}" opacity="0.10" filter="url(#${uid}-blur)"/>
        <ellipse cx="700" cy="710" rx="120" ry="50" fill="${p.light}" opacity="0.08" filter="url(#${uid}-blur)"/>
      </g>` : ''}
    </g>`;

    /* ============ ASSEMBLY ============ */
    let body = `${sky}${site}${foundationArt}`;
    if (!foundation) {
      body += `${interiors}${floor0}${slab1Art}${floor1}${balconyArt}${slab2Art}${floor2}${roofArt}${glazing}${landscape}${finishes}${lights}`;
    } else {
      body += lights;
    }

    return `<svg class="mansion-art mansion-art--${variant}" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${defs}
      <g class="m-camera">${body}
        <rect x="0" y="0" width="1440" height="900" fill="url(#${shadeGrad})" pointer-events="none"/>
      </g>
    </svg>`;
  }

  /* ============ BLUEPRINT LINE ART ============ */
  function buildBlueprint() {
    const lines = [];
    const dims = [];
    const L = (x1, y1, x2, y2, cls) => { lines.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls || 'bp-line'}"/>`); };
    const P = (d, cls) => { lines.push(`<path d="${d}" class="${cls || 'bp-line'}"/>`); };
    const R = (x, y, w, h, cls) => { lines.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls || 'bp-line'}"/>`); };

    // datum
    L(120, 640, 1090, 640, 'bp-line bp-line--strong');
    L(120, 646, 1090, 646, 'bp-line bp-line--faint');
    // tower
    R(196, 118, 62, 522);
    P('M196 118 H258 V92 H196 Z');
    R(216, 286, 20, 128, 'bp-line bp-line--faint');
    // volumes
    R(260, 480, 682, 160);
    R(300, 320, 622, 160);
    R(358, 180, 522, 140);
    // slabs
    R(246, 466, 712, 14);
    R(286, 306, 650, 14);
    R(340, 166, 556, 14);
    // parapet
    R(376, 142, 490, 24);
    // roof plant
    R(760, 130, 70, 12);
    // balcony
    R(668, 430, 286, 12);
    R(676, 398, 270, 32, 'bp-line bp-line--faint');
    L(676, 398, 946, 398, 'bp-line bp-line--strong');
    // entrance
    R(396, 556, 92, 84);
    L(442, 556, 442, 640);
    P('M396 540 H488 V556 H396 Z');
    L(392, 552, 392, 640);
    L(492, 552, 492, 640);
    // glazing mullions
    for (let i = 0; i < 6; i++) {
      const x = 566 + i * 62;
      L(x, 492, x, 640, 'bp-line bp-line--faint');
    }
    for (let i = 0; i < 5; i++) {
      const x = 500 + i * 84;
      L(x, 332, x, 480, 'bp-line bp-line--faint');
    }
    for (let i = 0; i < 5; i++) {
      const x = 470 + i * 84;
      L(x, 192, x, 320, 'bp-line bp-line--faint');
    }
    // timber screen hatching
    for (let i = 0; i < 13; i++) {
      L(330 + i * 12, 336, 330 + i * 12, 466, 'bp-line bp-line--faint');
    }
    // roof shading fins
    for (let i = 0; i < 5; i++) {
      L(470 + i * 86, 176, 470 + i * 86, 186, 'bp-line bp-line--strong');
    }
    // dimension lines — left
    const dimY = [180, 320, 480, 640];
    dimY.forEach((y, i) => {
      L(150, y, 174, y, 'bp-dim');
      if (i) L(150, dimY[i - 1], 150, y, 'bp-dim');
    });
    dimY.forEach((y) => {
      L(146, y - 5, 154, y + 5, 'bp-dim');
    });
    dims.push(`<text x="138" y="${300}" class="bp-text" transform="rotate(-90 138 300)">3 200</text>`);
    dims.push(`<text x="138" y="${420}" class="bp-text" transform="rotate(-90 138 420)">3 200</text>`);
    dims.push(`<text x="138" y="${580}" class="bp-text" transform="rotate(-90 138 580)">3 200</text>`);
    // dimension top
    L(260, 80, 942, 80, 'bp-dim');
    L(260, 72, 260, 88, 'bp-dim');
    L(942, 72, 942, 88, 'bp-dim');
    dims.push(`<text x="562" y="70" class="bp-text">24 400</text>`);
    L(358, 96, 880, 96, 'bp-dim');
    L(358, 90, 358, 102, 'bp-dim');
    L(880, 90, 880, 102, 'bp-dim');
    dims.push(`<text x="566" y="112" class="bp-text">21 600</text>`);
    // level markers
    dims.push(`<text x="1000" y="644" class="bp-text bp-text--accent">± 0.00</text>`);
    dims.push(`<text x="1000" y="484" class="bp-text">+ 3.20</text>`);
    dims.push(`<text x="1000" y="324" class="bp-text">+ 6.40</text>`);
    dims.push(`<text x="1000" y="184" class="bp-text">+ 9.60</text>`);
    // annotations
    dims.push(`<text x="676" y="424" class="bp-note">CANTILEVERED BALCONY — 2.4 m</text>`);
    dims.push(`<text x="566" y="664" class="bp-note">GLASS CURTAIN WALL</text>`);
    dims.push(`<text x="206" y="112" class="bp-note">TIMBER BLADE</text>`);
    dims.push(`<text x="260" y="688" class="bp-note">MAIN VOLUME / LIMESTONE</text>`);
    // registration marks
    [[120, 92], [1092, 92], [120, 704], [1092, 704]].forEach(([x, y]) => {
      lines.push(`<g class="bp-mark"><line x1="${x - 8}" y1="${y}" x2="${x + 8}" y2="${y}"/><line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}"/></g>`);
    });
    // plan diagram (bottom right)
    const px = 930, py = 470;
    dims.push(`<g class="bp-plan" transform="translate(930 468) scale(0.62)">
      <rect x="0" y="0" width="220" height="130" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="14" width="70" height="52" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="96" y="14" width="108" height="74" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="14" y="78" width="70" height="36" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <line x1="0" y1="106" x2="220" y2="106" stroke="currentColor" stroke-width="1" opacity="0.5"/>
      <circle cx="180" cy="112" r="14" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6"/>
    </g>`);
    dims.push(`<text x="930" y="568" class="bp-note">GROUND FLOOR PLAN / 1:200</text>`);

    return `<svg class="blueprint-svg" viewBox="0 0 1200 760" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g class="bp-grid">
        ${Array.from({ length: 25 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="760"/>`).join('')}
        ${Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="1200" y2="${i * 50}"/>`).join('')}
      </g>
      <g class="bp-drawing">${lines.join('')}</g>
      <g class="bp-dims">${dims.join('')}</g>
    </svg>`;
  }

  return { build, buildBlueprint, PALETTES };
})();
