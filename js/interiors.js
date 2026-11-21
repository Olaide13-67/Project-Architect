/* =========================================================================
   THE ARCHITECT â€” Interior room illustrations
   Twelve distinct rooms rendered as editorial architectural scenes.
   ========================================================================= */
window.ArchitectInteriors = (function () {
  'use strict';

  const SH = 'filter="url(#art-soft)"';
  const SH2 = 'filter="url(#art-soft2)"';
  const r = (x, y, w, h, fill, extra) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;
  const c = (cx, cy, rad, fill, extra) =>
    `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;
  const l = (x1, y1, x2, y2, stroke, w, extra) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}"${extra ? ' ' + extra : ''}/>`;
  const p = (d, fill, extra) => `<path d="${d}" fill="${fill}"${extra ? ' ' + extra : ''}/>`;

  /* ---------- shared defs ---------------------------------------------- */
  function defs() {
    return `<svg width="0" height="0" aria-hidden="true" style="position:absolute">
      <defs>
        <filter id="art-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#1d1a15" flood-opacity="0.26"/>
        </filter>
        <filter id="art-soft2" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#1d1a15" flood-opacity="0.22"/>
        </filter>
        <filter id="art-blur"><feGaussianBlur stdDeviation="12"/></filter>
        <filter id="art-blur-sm"><feGaussianBlur stdDeviation="4"/></filter>
        <linearGradient id="view-garden" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#cfdedd"/><stop offset="0.55" stop-color="#e8ebdd"/><stop offset="1" stop-color="#d8dcc7"/>
        </linearGradient>
        <linearGradient id="view-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8d9aa6"/><stop offset="0.5" stop-color="#d9b193"/><stop offset="1" stop-color="#b99179"/>
        </linearGradient>
        <linearGradient id="view-city" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1d2a33"/><stop offset="1" stop-color="#43555f"/>
        </linearGradient>
        <linearGradient id="view-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0b1620"/><stop offset="0.7" stop-color="#1d3038"/><stop offset="1" stop-color="#2c3b3b"/>
        </linearGradient>
        <linearGradient id="view-court" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#dfe6e0"/><stop offset="1" stop-color="#cdc6b3"/>
        </linearGradient>
        <linearGradient id="view-trees" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#b9cbb6"/><stop offset="0.6" stop-color="#8da683"/><stop offset="1" stop-color="#5c7556"/>
        </linearGradient>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#b9b2a4"/><stop offset="0.4" stop-color="#e3ddd1"/><stop offset="1" stop-color="#a9a294"/>
        </linearGradient>
      </defs>
    </svg>`;
  }

  /* ---------- views ----------------------------------------------------- */
  function view(type, x, y, w, h, clipId) {
    let inner = '';
    const hz = y + h * 0.58;
    if (type === 'garden' || type === 'courtyard') {
      inner += r(x, hz, w, y + h - hz, type === 'garden' ? '#7c9169' : '#c9bda4');
      if (type === 'garden') {
        inner += r(x, hz, w, 6, '#93a67c', 'opacity="0.8"');
        inner += p(`M${x} ${hz + 26} L${x + w} ${hz + 14} L${x + w} ${y + h} L${x} ${y + h} Z`, '#6d8259');
        // trees
        for (let i = 0; i < 4; i++) {
          const cx = x + w * (0.12 + i * 0.26);
          const cy = hz - 26 - (i % 2) * 14;
          inner += c(cx, cy, 30 + (i % 3) * 8, i % 2 ? '#4f6a4a' : '#5c7a52', 'opacity="0.9"');
          inner += c(cx + 18, cy + 12, 22, '#6d8a5d', 'opacity="0.75"');
        }
        inner += p(`M${x} ${hz + 2} Q${x + w * 0.3} ${hz - 22} ${x + w * 0.55} ${hz + 2} Q${x + w * 0.8} ${hz + 20} ${x + w} ${hz - 4} L${x + w} ${hz + 40} L${x} ${hz + 40} Z`, '#435a38', 'opacity="0.85"');
      } else {
        inner += p(`M${x + 30} ${hz} L${x + 30} ${hz - 82} L${x + 54} ${hz - 82} L${x + 54} ${hz} Z`, '#b7ae95', 'opacity="0.7"');
        inner += c(x + w * 0.78, hz - 58, 42, '#6b7f57', 'opacity="0.85"');
        inner += c(x + w * 0.88, hz - 36, 28, '#7c8f63', 'opacity="0.85"');
        inner += l(x + 40, hz, x + w - 20, hz + 30, '#b8ad94', 2, 'opacity="0.5"');
      }
    } else if (type === 'dusk') {
      inner += c(x + w * 0.68, hz - 40, 26, '#f4c896', 'opacity="0.9"');
      inner += p(`M${x} ${hz + 8} Q${x + w * 0.3} ${hz - 30} ${x + w * 0.55} ${hz - 2} Q${x + w * 0.8} ${hz + 18} ${x + w} ${hz - 10} L${x + w} ${y + h} L${x} ${y + h} Z`, '#7f7265', 'opacity="0.85"');
      inner += p(`M${x} ${hz + 52} Q${x + w * 0.4} ${hz + 20} ${x + w} ${hz + 44} L${x + w} ${y + h} L${x} ${y + h} Z`, '#5a5148', 'opacity="0.9"');
      inner += `<g fill="#3f3a34">${Array.from({ length: 6 }, (_, i) => r(x + 20 + i * (w / 7), hz + 10 + (i % 3) * 12, 12, 22)).join('')}</g>`;
    } else if (type === 'city') {
      const blocks = [[0, 0.30, '#33434c'], [0.14, 0.46, '#2a3942'], [0.26, 0.22, '#3b4d56'], [0.38, 0.52, '#25333b'], [0.55, 0.34, '#33434c'], [0.68, 0.58, '#22303a'], [0.82, 0.40, '#2d3d46']];
      blocks.forEach((b) => {
        inner += r(x + w * b[0], y + h - h * b[1] - 20, w * 0.14, h * b[1], b[2]);
        for (let i = 0; i < 5; i++) {
          inner += r(x + w * b[0] + 8, y + h - h * b[1] + i * 14, 3, 4, '#f2cf9a', 'opacity="0.65"');
        }
      });
      inner += c(x + w * 0.22, y + 70, 18, '#e8dcc3', 'opacity="0.35"');
    } else if (type === 'night') {
      inner += r(x, y + h * 0.52, w, h * 0.48, '#16252a');
      inner += p(`M${x} ${y + h * 0.52} Q${x + w * 0.3} ${y + h * 0.46} ${x + w * 0.5} ${y + h * 0.53} Q${x + w * 0.78} ${y + h * 0.6} ${x + w} ${y + h * 0.5} L${x + w} ${y + h} L${x} ${y + h} Z`, '#1d3137');
      inner += c(x + w * 0.7, y + 54, 16, '#f5e6c4', 'opacity="0.7"');
      for (let i = 0; i < 4; i++) inner += const_star(x + 30 + i * 42, y + 30 + (i % 3) * 16);
      inner += r(x + w * 0.18, y + h * 0.56, w * 0.64, 4, '#e8b878', 'opacity="0.5"');
      inner += c(x + w * 0.3, y + h * 0.66, 22, '#ffd39a', 'opacity="0.18"', 'filter="url(#art-blur-sm)"');
    } else if (type === 'trees') {
      inner += r(x, y + h * 0.55, w, h * 0.45, '#5f7555');
      for (let i = 0; i < 5; i++) {
        inner += c(x + w * (0.1 + i * 0.21), y + h * (0.42 + (i % 2) * 0.08), 36 + (i % 3) * 10, i % 2 ? '#6d865e' : '#546c4a', 'opacity="0.9"');
      }
      inner += c(x + w * 0.5, y + h * 0.18, 60, '#7f9570', 'opacity="0.55"');
      inner += c(x + w * 0.22, y + h * 0.1, 42, '#93a681', 'opacity="0.45"');
    }
    return `<g clip-path="url(#${clipId})">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#view-${type === 'courtyard' ? 'court' : type})"/>
      ${inner}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#art-sky-sheen)" opacity="0.10"/>
    </g>`;
  }
  function const_star(x, y) {
    return `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff" opacity="0.6"/>`;
  }

  /* ---------- window ---------------------------------------------------- */
  function win(cfg, o) {
    const x = o.x, y = o.y, w = o.w, h = o.h;
    const clipId = `${cfg.id}-clip`;
    const cols = o.cols || 3;
    let mull = '';
    for (let i = 1; i < cols; i++) mull += r(x + (w / cols) * i - 2, y, 4, h, cfg.frame);
    mull += r(x, y + h * 0.62, w, 3, cfg.frame, 'opacity="0.6"');
    return `<g class="window">
      <defs><clipPath id="${clipId}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>
      ${view(cfg.view, x, y, w, h, clipId)}
      ${mull}
      ${r(x - 8, y - 8, w + 16, 8, cfg.frame)}
      ${r(x - 8, y + h, w + 16, 8, cfg.frame)}
      ${r(x - 8, y, 8, h, cfg.frame)}
      ${r(x + w, y, 8, h, cfg.frame)}
      ${p(`M${x + w * 0.08} ${y + h} L${x + w * 0.4} ${y} L${x + w * 0.52} ${y} L${x + w * 0.2} ${y + h} Z`, '#ffffff', 'opacity="0.10"')}
      ${p(`M${x + w * 0.6} ${y + h} L${x + w * 0.82} ${y} L${x + w * 0.87} ${y} L${x + w * 0.65} ${y + h} Z`, '#ffffff', 'opacity="0.06"')}
    </g>`;
  }

  function curtains(x, y, w, h, col) {
    return `<g opacity="0.55">
      ${p(`M${x} ${y} Q${x + 26} ${y + h * 0.4} ${x + 10} ${y + h} L${x - 14} ${y + h} L${x - 14} ${y} Z`, col)}
      ${p(`M${x + w} ${y} Q${x + w - 30} ${y + h * 0.45} ${x + w - 8} ${y + h} L${x + w + 18} ${y + h} L${x + w + 18} ${y} Z`, col)}
    </g>`;
  }

  /* ---------- furniture ------------------------------------------------ */
  function sofa(x, base, w, h, col) {
    const y = base - h;
    const cushions = [0, 1, 2].map(i => {
      const cw = (w - 44) / 3;
      return r(x + 16 + i * (cw + 6), y + 22, cw, 22, col.light, 'rx="5"');
    }).join('');
    return `<g ${SH}>
      ${r(x, y + 6, w, h - 6, col.body, 'rx="10"')}
      ${r(x + 10, y, w - 20, 30, col.body, 'rx="8"')}
      ${cushions}
      ${r(x - 10, y + 18, 16, h - 24, col.dark, 'rx="6"')}
      ${r(x + w - 6, y + 18, 16, h - 24, col.dark, 'rx="6"')}
      ${r(x + 8, y + h - 26, w - 16, 16, col.dark, 'opacity="0.28"')}
      ${r(x + 8, y + h - 4, 6, 4, col.leg)}
      ${r(x + w - 14, y + h - 4, 6, 4, col.leg)}
      <g transform="rotate(-8 ${x + 66} ${y + 16})">${r(x + 44, y + 2, 30, 30, col.accent, 'rx="4"')}</g>
      <g transform="rotate(6 ${x + 106} ${y + 18})">${r(x + 92, y + 6, 26, 26, col.accent2, 'rx="4"')}</g>
    </g>`;
  }

  function armchair(x, base, w, h, col) {
    const y = base - h;
    return `<g ${SH}>
      ${r(x, y + 8, w, h - 8, col.body, 'rx="9"')}
      ${r(x + 8, y, w - 16, 26, col.body, 'rx="7"')}
      ${r(x + 8, y + 24, w - 16, 22, col.light, 'rx="6"')}
      ${r(x - 7, y + 14, 12, h - 22, col.dark, 'rx="5"')}
      ${r(x + w - 5, y + 14, 12, h - 22, col.dark, 'rx="5"')}
      ${r(x + 6, y + h - 14, 4, 14, col.leg)}
      ${r(x + w - 10, y + h - 14, 4, 14, col.leg)}
    </g>`;
  }

  function rug(x, y, w, h, fill) {
    return `<g opacity="0.9">${r(x, y, w, h, fill, 'rx="2"')}
      ${r(x + 8, y + 8, w - 16, h - 16, 'none', `stroke="${fill}" stroke-opacity="0.5"`)}
    </g>`;
  }

  function table(x, y, w, h, col) {
    return `<g ${SH2}>
      ${r(x, y, w, 8, col.top, 'rx="2"')}
      ${r(x + 10, y + 8, 8, h, col.leg)}
      ${r(x + w - 18, y + 8, 8, h, col.leg)}
      ${r(x + 10, y + h + 4, w - 20, 5, col.leg, 'opacity="0.8"')}
    </g>`;
  }

  function pendant(x, y, drop, col, big) {
    const s = big ? 20 : 15;
    return `<g>
      ${l(x, y, x, y + drop, col.cord, 2)}
      ${p(`M${x - s} ${y + drop} Q${x} ${y + drop + 24} ${x + s} ${y + drop} Z`, col.shade)}
      ${c(x, y + drop + 20, s * 0.55, col.light, 'filter="url(#art-blur-sm)" opacity="0.7"')}
      ${c(x, y + drop + 14, 3, '#fff6df')}
    </g>`;
  }

  function plant(x, base, s, col) {
    return `<g ${SH2} transform="translate(${x} ${base}) scale(${s})">
      <path d="M-6 0 L-9 -40 H9 L6 0 Z" fill="${col.pot}"/>
      <path d="M-9 -40 H9 V-46 H-9 Z" fill="${col.potLip}"/>
      <g fill="${col.leaf}">
        <path d="M0 -46 C-28 -66 -38 -96 -20 -116 C-4 -96 -2 -66 0 -46"/>
        <path d="M0 -46 C28 -64 36 -100 16 -118 C4 -94 0 -66 0 -46"/>
        <path d="M0 -46 C-6 -78 4 -110 20 -128 C22 -96 12 -66 0 -46" opacity="0.85"/>
        <path d="M0 -46 C-20 -80 -22 -104 -8 -124 C2 -98 2 -70 0 -46" opacity="0.75"/>
      </g>
    </g>`;
  }

  function art(x, y, w, h, palette, type) {
    let inner = '';
    if (type === 'line') inner = `<path d="M${x + w * 0.18} ${y + h * 0.72} C${x + w * 0.38} ${y + h * 0.2} ${x + w * 0.6} ${y + h * 0.86} ${x + w * 0.82} ${y + h * 0.3}" stroke="${palette[0]}" stroke-width="1.6" fill="none"/>`;
    else if (type === 'shape') inner = `${c(x + w * 0.4, y + h * 0.46, h * 0.2, palette[0])}${r(x + w * 0.52, y + h * 0.3, w * 0.3, h * 0.4, palette[1], 'opacity="0.7"')}`;
    else inner = `<path d="M${x + 10} ${y + h * 0.8} L${x + w * 0.4} ${y + h * 0.3} L${x + w * 0.62} ${y + h * 0.62} L${x + w * 0.78} ${y + h * 0.4} L${x + w - 10} ${y + h * 0.82} Z" fill="${palette[0]}" opacity="0.55"/>`;
    return `<g ${SH2}>
      ${r(x - 4, y - 4, w + 8, h + 8, '#f7f3ea')}
      ${r(x, y, w, h, palette[2] || '#e7e0d2')}
      ${inner}
    </g>`;
  }

  function floorLamp(x, base, h, col) {
    return `<g>
      ${l(x, base, x, base - h, col.metal, 3)}
      ${p(`M${x - 26} ${base - h} Q${x} ${base - h - 24} ${x + 26} ${base - h} Z`, col.shade)}
      ${c(x, base - h + 6, 18, '#ffe9c2', 'opacity="0.35"', 'filter="url(#art-blur-sm)"')}
      ${r(x - 16, base - 4, 32, 4, col.metal, 'rx="2"')}
    </g>`;
  }

  function bookshelf(x, y, w, h, col) {
    let rows = '';
    const shelves = 4;
    for (let i = 0; i < shelves; i++) {
      const sy = y + (h / shelves) * i + h / shelves - 6;
      rows += r(x, sy, w, 5, col.wood);
      for (let b = 0; b < 6; b++) {
        const bw = 3 + ((i * 7 + b * 5) % 6);
        rows += r(x + 8 + b * ((w - 16) / 6), sy - 26, bw, 24, [col.accent, '#8b6f52', '#4c5b4a', '#b9a489'][(i + b) % 4], 'opacity="0.85"');
      }
    }
    return `<g ${SH2}>${r(x, y, w, h, col.woodDark)}${r(x + 6, y + 6, w - 12, h - 12, col.wood, 'opacity="0.35"')}${rows}
      ${r(x, y, 6, h, col.woodDark)}${r(x + w - 6, y, 6, h, col.woodDark)}</g>`;
  }

  function bed(x, base, w, col) {
    const h = 118, y = base - h;
    return `<g ${SH}>
      ${r(x - 10, y - 54, w + 20, 74, col.headboard, 'rx="4"')}
      ${r(x - 10, y - 54, 4, 74, '#ffffff', 'opacity="0.14"')}
      ${r(x, y + 26, w, 58, '#f2ede3', 'rx="5"')}
      ${r(x, y + 52, w, 32, col.duvet, 'rx="4"')}
      ${r(x + 8, y + 18, w * 0.42, 26, '#faf6ee', 'rx="7"')}
      ${r(x + w * 0.48, y + 18, w * 0.42, 26, '#faf6ee', 'rx="7"')}
      ${r(x + 6, y + 62, w - 12, 6, col.duvetDark, 'opacity="0.5"')}
      ${r(x + 18, y + 46, w * 0.3, 10, col.throw, 'rx="3"', 'opacity="0.9"')}
      ${r(x, y + 84, w, 8, col.frame)}
      ${r(x + 6, y + 92, 6, 8, col.frame)}
      ${r(x + w - 12, y + 92, 6, 8, col.frame)}
    </g>`;
  }

  function nightstand(x, base, col) {
    return `<g ${SH2}>${r(x, base - 46, 54, 46, col.wood)}${r(x, base - 46, 54, 4, col.woodDark)}
      ${r(x + 8, base - 34, 38, 3, col.woodDark, 'opacity="0.6"')}
      ${r(x + 14, base - 62, 26, 16, '#f7f2e7')}
      ${r(x + 12, base - 64, 30, 4, col.metal)}</g>`;
  }

  function wardrobe(x, y, w, h, col) {
    let inner = '';
    for (let i = 0; i < 4; i++) {
      const cw = w / 4;
      inner += r(x + i * cw + 4, y + 8, cw - 8, h - 16, col.wood, 'opacity="0.55"');
      inner += r(x + i * cw + 4, y + 8, cw - 8, 3, '#ffe2ae', 'opacity="0.6"');
      for (let j = 0; j < 4; j++) {
        inner += r(x + i * cw + 12 + j * 7, y + 26, 4, 58, [col.accent, '#d8cbb6', '#7c8a76', '#5b4a3c'][j % 4], 'opacity="0.85"');
      }
      inner += r(x + i * cw + 8, y + h - 42, cw - 16, 26, col.woodDark, 'opacity="0.6"');
      inner += l(x + i * cw + 8, y + 18, x + i * cw + 8, y + h - 20, col.metal, 2);
    }
    return `<g ${SH2}>${r(x, y, w, h, col.woodDark, 'opacity="0.9"')}${inner}</g>`;
  }

  function diningSet(x, base, w, col) {
    const y = base - 86;
    const chairs = [0, 1, 2, 3, 4].map(i => {
      const cx = x + 20 + i * ((w - 40) / 4);
      return `<g>
        ${r(cx - 21, y + 10, 42, 11, col.chair, 'rx="3"')}
        ${r(cx - 21, y - 34, 5, 44, col.chair, 'rx="2"')}
        ${r(cx + 16, y - 34, 5, 44, col.chair, 'rx="2"')}
        ${r(cx - 21, y - 38, 42, 22, col.chairDark, 'rx="5"')}
        ${r(cx - 18, y + 21, 4, 52, col.chair)}
        ${r(cx + 14, y + 21, 4, 52, col.chair)}
        ${r(cx - 18, y + 46, 36, 3, col.chair)}
      </g>`;
    }).join('');
    return `<g ${SH}>
      ${r(x - 6, y - 6, w + 12, 14, col.table, 'rx="2"')}
      ${r(x - 6, y + 8, w + 12, 5, col.tableDark, 'opacity="0.55"')}
      ${r(x + 34, y + 12, 14, base - y - 12, col.tableDark, 'opacity="0.85"')}
      ${r(x + w - 48, y + 12, 14, base - y - 12, col.tableDark, 'opacity="0.85"')}
      ${r(x + 70, y - 10, 74, 6, '#f7f3e8', 'opacity="0.9"')}
      ${r(x + 90, y - 18, 46, 10, '#f7f3e8', 'opacity="0.8"')}
      ${c(x + w - 76, y - 14, 11, col.accent, 'opacity="0.9"')}
      ${chairs}
    </g>`;
  }

  function kitchenIsland(x, base, w, col) {
    const y = base - 118;
    return `<g ${SH}>
      ${r(x, y, w, 12, col.stone, 'rx="1"')}
      ${r(x, y + 12, 34, 106, col.stone, 'opacity="0.95"')}
      ${r(x + w - 34, y + 12, 34, 106, col.stone, 'opacity="0.95"')}
      ${r(x + 34, y + 16, w - 68, 102, col.wood)}
      ${Array.from({ length: 7 }, (_, i) => l(x + 34, y + 26 + i * 13, x + w - 34, y + 26 + i * 13, col.woodDark, 1, 'opacity="0.35"')).join('')}
      ${r(x + 34, y + 16, w - 68, 5, col.woodDark, 'opacity="0.4"')}
      ${r(x + w * 0.3, y + 5, 70, 6, '#3d4442', 'opacity="0.8"')}
      ${r(x + w * 0.6, y + 2, 40, 10, col.metal)}
      ${r(x + w * 0.6 + 10, y - 6, 7, 10, col.metal)}
      ${r(x + 20, y + 12, 14, 106, '#f4efe5', 'opacity="0.35"')}
    </g>`;
  }

  function stool(x, base, col) {
    return `<g>
      ${r(x - 20, base - 68, 40, 10, col.seat, 'rx="5"')}
      ${r(x - 15, base - 58, 5, 58, col.metal)}
      ${r(x + 10, base - 58, 5, 58, col.metal)}
      ${r(x - 15, base - 30, 30, 4, col.metal)}
    </g>`;
  }

  function bathtub(x, base, col) {
    return `<g ${SH}>
      ${p(`M${x} ${base - 46} q0 -22 30 -22 h90 q30 0 30 22 v28 q0 20 -30 20 h-90 q-30 0 -30 -20 Z`, col.tub)}
      ${p(`M${x + 8} ${base - 42} q0 -14 24 -14 h86 q24 0 24 14 v20 q0 12 -24 12 h-86 q-24 0 -24 -12 Z`, col.water, 'opacity="0.55"')}
      ${r(x + 4, base - 50, 152, 5, '#ffffff', 'opacity="0.4"')}
      ${r(x + 150, base - 78, 4, 34, col.metal)}
      ${p(`M${x + 154} ${base - 78} q18 0 18 16`, 'none', `stroke="${col.metal}" stroke-width="4" fill="none"`)}
      ${r(x - 8, base - 4, 172, 4, '#000', 'opacity="0.12"')}
    </g>`;
  }

  function vanity(x, base, w, col) {
    return `<g ${SH2}>
      ${r(x, base - 70, w, 70, col.wood)}
      ${r(x, base - 72, w, 8, col.stone)}
      ${r(x + w * 0.2, base - 80, w * 0.6, 12, col.basin, 'rx="6"')}
      ${r(x + w * 0.35, base - 96, 5, 18, col.metal)}
      ${r(x + w * 0.35, base - 96, 22, 4, col.metal)}
      ${r(x + w * 0.5 - 2, base - 66, 4, 12, col.metal)}
      ${r(x, base - 66, w, 2, col.woodDark, 'opacity="0.5"')}
    </g>`;
  }

  function desk(x, base, w, col) {
    return `<g ${SH2}>
      ${r(x, base - 74, w, 7, col.wood)}
      ${r(x + 12, base - 67, 6, 67, col.metal)}
      ${r(x + w - 18, base - 67, 6, 67, col.metal)}
      ${r(x + 24, base - 84, 64, 10, col.woodDark, 'opacity="0.5"')}
      ${r(x + 30, base - 92, 34, 8, col.metal)}
      ${r(x + w - 80, base - 92, 40, 26, '#262c2c', 'rx="2"')}
      ${r(x + w - 78, base - 90, 36, 22, '#3d4a4c', 'rx="1"')}
      ${r(x + w - 64, base - 63, 8, 10, col.metal)}
    </g>`;
  }

  function officeChair(x, base, col) {
    return `<g ${SH2}>
      ${r(x - 22, base - 56, 44, 10, col.chair, 'rx="4"')}
      ${r(x - 20, base - 104, 40, 50, col.chairDark, 'rx="12"')}
      ${r(x - 4, base - 48, 8, 34, col.metal)}
      ${r(x - 22, base - 16, 44, 4, col.metal, 'rx="2"')}
      ${r(x - 22, base - 16, 4, 12, col.metal)}
      ${r(x + 18, base - 16, 4, 12, col.metal)}
    </g>`;
  }

  function shelves(x, y, w, h, col) {
    let out = '';
    for (let i = 0; i < 4; i++) {
      out += r(x + i * (w / 4), y, 6, h, col.woodDark);
    }
    out += r(x, y, w, 6, col.woodDark);
    out += r(x, y + h - 6, w, 6, col.woodDark);
    return out;
  }

  function television(x, y, w, h, col) {
    return `<g ${SH2}>
      ${r(x - 6, y - 6, w + 12, h + 12, '#1a1d1d')}
      ${r(x, y, w, h, '#101414')}
      ${r(x + 10, y + 10, w * 0.44, h * 0.34, '#2b4147', 'opacity="0.6"')}
      ${r(x + w * 0.5, y + h * 0.5, w * 0.32, h * 0.22, '#3f3527', 'opacity="0.5"')}
    </g>`;
  }

  function staircase(x, base, col) {
    let steps = '';
    for (let i = 0; i < 9; i++) {
      const sx = x + i * 26;
      const sy = base - 26 - i * 23;
      const sw = 168 - i * 8;
      steps += `<g>
        ${r(sx, sy, sw, 9, col.wood)}
        ${r(sx, sy + 9, sw, 5, col.woodDark, 'opacity="0.45"')}
        ${r(sx, sy - 6, sw, 6, col.woodDark, 'opacity="0.55"')}
      </g>`;
    }
    return `<g>${steps}
      <path d="M${x + 96} ${base - 206} L${x + 100} ${base - 206} L${x + 200} ${base} L${x + 196} ${base} Z" fill="${col.glass}" opacity="0.30"/>
      <path d="M${x + 98} ${base - 206} L${x + 198} ${base}" stroke="${col.metal}" stroke-width="5" fill="none"/>
      <path d="M${x + 98} ${base - 206} L${x + 198} ${base}" stroke="${col.metal}" stroke-width="2" fill="none" opacity="0.55"/>
      <path d="M${x + 98} ${base - 206} L${x + 26} ${base - 26}" stroke="${col.metal}" stroke-width="4" fill="none"/>
    </g>`;
  }

  function ceilingStrip(x1, x2, y, col) {
    return `<g>
      ${r(x1, y, x2 - x1, 6, col, 'opacity="0.7"')}
      ${r(x1, y + 6, x2 - x1, 10, '#ffe6bb', 'opacity="0.18"', 'filter="url(#art-blur-sm)"')}
    </g>`;
  }

  function sunlight(x1, x2, yTop, yBottom, w) {
    return `<g opacity="0.35" filter="url(#art-blur)">
      <path d="M${x1} ${yTop} L${x2} ${yTop} L${x2 + w} ${yBottom} L${x1 + w * 0.6} ${yBottom} Z" fill="#fff0cf"/>
    </g>`;
  }

  /* ---------- room definitions ----------------------------------------- */
  const ROOMS = {
    foyer: {
      floor: '01', view: 'courtyard',
      wall: '#ece5d9', wallSide: '#e0d8ca', wallSide2: '#e5ddd0', floorA: '#d5c3a9', floorB: '#bca98d',
      frame: '#3d3b36', metal: '#9b8257',
      build: (cfg) => `
        ${win(cfg, { x: 600, y: 120, w: 150, h: 350, cols: 2 })}
        ${curtains(600, 120, 150, 350, '#efeae0')}
        ${staircase(120, 470, { wood: '#b08a63', woodDark: '#8f6c4a', glass: '#c9d6d5', metal: '#4b4a45' })}
        ${r(112, 470, 240, 6, '#8f6c4a', 'opacity="0.25"')}
        ${art(224, 178, 96, 128, ['#9b7b56', '#c9bda6', '#e3dccd'], 'shape')}
        <g ${SH2}>
          ${r(700, 402, 190, 6, '#efe9dd')}
          ${r(700, 408, 190, 62, '#a87f57')}
          ${r(700, 408, 190, 3, '#c39a6f')}
          ${l(716, 470, 716, 470, '#6b543c', 0)}
          ${r(714, 462, 5, 12, '#6b543c')}
          ${r(872, 462, 5, 12, '#6b543c')}
          ${r(726, 380, 16, 22, '#d8c7ab')}
          ${r(748, 386, 12, 16, '#b08a63')}
          ${r(768, 376, 10, 26, '#8f6c4a')}
        </g>
        ${c(760, 372, 14, '#d8c7ab')}
        ${pendant(726, 60, 190, { cord: '#4b4a45', shade: '#8f704b', light: '#ffdfaa' }, true)}
        ${pendant(760, 60, 244, { cord: '#4b4a45', shade: '#8f704b', light: '#ffdfaa' })}
        ${pendant(794, 60, 176, { cord: '#4b4a45', shade: '#8f704b', light: '#ffdfaa' })}
        ${plant(930, 470, 0.9, { pot: '#8b7f6b', potLip: '#a3977f', leaf: '#48603f' })}
        ${ceilingStrip(300, 560, 78, '#f7f2e8')}
        ${r(560, 140, 6, 330, '#8f704b', 'opacity="0.35"')}
      `
    },
    living: {
      floor: '01', view: 'garden',
      wall: '#f0eade', wallSide: '#e7dfd1', wallSide2: '#e9e2d5', floorA: '#cfae88', floorB: '#a9855f',
      frame: '#3b3a35', metal: '#9c7c52',
      build: (cfg) => `
        ${win(cfg, { x: 470, y: 96, w: 330, h: 344, cols: 4 })}
        ${sunlight(470, 800, 96, 470, 120)}
        ${art(200, 160, 150, 110, ['#8d6a4a', '#c2b39b', '#e6ded0'], 'line')}
        <g ${SH2}>
          ${r(214, 400, 180, 46, '#a98a64')}
          ${r(214, 400, 180, 4, '#c6a782')}
          ${l(232, 446, 232, 470, '#6f5640', 4)}
          ${l(376, 446, 376, 470, '#6f5640', 4)}
          ${r(240, 384, 26, 16, '#c9b79c')}
          ${r(272, 388, 18, 12, '#8d6a4a')}
        </g>
        ${sofa(420, 500, 320, 126, { body: '#d9cdb9', light: '#e6dccb', dark: '#c3b49d', leg: '#5a4b3b', accent: '#8e6c4c', accent2: '#d8c3a4' })}
        ${rug(360, 516, 470, 62, '#b9a687')}
        ${table(540, 566, 150, 24, { top: '#8a6543', leg: '#6d4f35' })}
        ${c(570, 560, 9, '#c9bda5')}
        ${c(600, 560, 6, '#8d6a4a')}
        ${armchair(788, 502, 86, 96, { body: '#c9b59a', light: '#dccdb6', dark: '#b09a7f', leg: '#5a4b3b' })}
        ${floorLamp(892, 500, 136, { metal: '#6a5b49', shade: '#e3d7c2' })}
        ${plant(330, 500, 1.15, { pot: '#8d816d', potLip: '#a79a83', leaf: '#40573a' })}
        ${ceilingStrip(240, 640, 52, '#f8f3e9')}
        ${pendant(860, 52, 120, { cord: '#4b4a45', shade: '#7d6446', light: '#ffdfaa' })}
      `
    },
    kitchen: {
      floor: '01', view: 'garden',
      wall: '#ede7dc', wallSide: '#e4ddd0', wallSide2: '#e8e1d5', floorA: '#cdb394', floorB: '#ab8b6c',
      frame: '#3a3a36', metal: '#a08a63',
      build: (cfg) => `
        ${win(cfg, { x: 640, y: 150, w: 190, h: 240, cols: 2 })}
        <g ${SH2}>
          ${r(150, 150, 330, 80, '#dad3c5')}
          ${r(150, 230, 330, 14, '#cfc7b7')}
          ${Array.from({ length: 4 }, (_, i) => r(158 + i * 82, 158, 74, 66, '#e2dbcf')).join('')}
          ${Array.from({ length: 4 }, (_, i) => r(188 + i * 82, 186, 14, 3, '#8b8172')).join('')}
          ${r(380, 156, 92, 70, '#3a3d3d')}
          ${r(390, 164, 72, 30, '#5b6668', 'opacity="0.7"')}
          ${r(150, 214, 330, 18, '#cdb79b')}
        </g>
        ${r(150, 244, 330, 6, '#f1c98f', 'opacity="0.55"')}
        ${r(150, 250, 330, 8, '#ffe6bb', 'opacity="0.22"', 'filter="url(#art-blur-sm)"')}
        <g ${SH2}>
          ${r(150, 400, 300, 70, '#cdbb9e')}
          ${r(150, 396, 300, 6, '#e7e1d4')}
          ${r(150, 400, 300, 3, '#000', 'opacity="0.08"')}
          ${Array.from({ length: 3 }, (_, i) => r(162 + i * 96, 412, 84, 48, '#d8c7a9', 'opacity="0.8"')).join('')}
          ${r(162, 416, 84, 3, '#a58c6b', 'opacity="0.5"')}
        </g>
        ${kitchenIsland(290, 600, 420, { stone: '#e7e1d4', wood: '#b18c62', woodDark: '#8e6b47', metal: '#9b8a6a' })}
        ${stool(380, 628, { seat: '#b59673', metal: '#7c7263' })}
        ${stool(500, 628, { seat: '#b59673', metal: '#7c7263' })}
        ${stool(620, 628, { seat: '#b59673', metal: '#7c7263' })}
        ${pendant(380, 70, 268, { cord: '#3a3a36', shade: '#d9cdb8', light: '#ffe2b0' })}
        ${pendant(500, 70, 296, { cord: '#3a3a36', shade: '#d9cdb8', light: '#ffe2b0' })}
        ${pendant(620, 70, 264, { cord: '#3a3a36', shade: '#d9cdb8', light: '#ffe2b0' })}
        ${plant(900, 470, 0.9, { pot: '#8f8574', potLip: '#a49a86', leaf: '#4a6142' })}
        ${r(880, 470, 90, 4, '#b49c7f')}
      `
    },
    dining: {
      floor: '01', view: 'dusk',
      wall: '#e9e1d4', wallSide: '#ded5c6', wallSide2: '#e4dbcc', floorA: '#c2a17e', floorB: '#9d7b5b',
      frame: '#3b3934', metal: '#9c7c52',
      build: (cfg) => `
        ${win(cfg, { x: 620, y: 110, w: 250, h: 330, cols: 3 })}
        ${art(190, 200, 130, 150, ['#7c8b70', '#b9a88c', '#e6dfd1'], 'shape')}
        ${diningSet(290, 560, 440, { table: '#8e6847', tableDark: '#6e4f35', chair: '#57664f', chairDark: '#43523e', accent: '#b79b6f' })}
        ${pendant(400, 74, 258, { cord: '#3b3934', shade: '#2f3730', light: '#ffdfaa' }, true)}
        ${pendant(520, 74, 258, { cord: '#3b3934', shade: '#2f3730', light: '#ffdfaa' }, true)}
        ${r(436, 322, 128, 5, '#2f3730')}
        ${r(380, 202, 140, 5, '#2f3730')}
        ${r(190, 380, 190, 90, '#b08a63')}
        ${r(190, 380, 190, 5, '#c9a67e')}
        ${l(206, 470, 206, 492, '#6e533a', 4)}
        ${l(364, 470, 364, 492, '#6e533a', 4)}
        ${plant(900, 470, 1, { pot: '#827662', potLip: '#998c76', leaf: '#3f5639' })}
        ${rug(280, 512, 470, 62, '#a8977d')}
        ${ceilingStrip(260, 560, 60, '#f4efe4')}
      `
    },
    master: {
      floor: '02', view: 'trees',
      wall: '#e7e0d4', wallSide: '#dbd3c5', wallSide2: '#e2dacc', floorA: '#b18f6d', floorB: '#8c6d50',
      frame: '#3a3833', metal: '#9c8058',
      build: (cfg) => `
        ${win(cfg, { x: 150, y: 130, w: 260, h: 300, cols: 3 })}
        ${curtains(150, 130, 260, 300, '#ded5c6')}
        <g>${r(470, 168, 360, 202, '#c9bca8', 'rx="2"')}
          ${r(470, 168, 8, 202, '#d8ccb9')}
          ${Array.from({ length: 7 }, (_, i) => l(470 + i * 52, 168, 470 + i * 52, 370, '#b6a893', 1, 'opacity="0.5"')).join('')}
        </g>
        ${bed(470, 516, 330, { headboard: '#8e7860', frame: '#6f5c46', duvet: '#e6ddcd', duvetDark: '#c8bca8', throw: '#8f7554' })}
        ${nightstand(392, 516, { wood: '#9a7a55', woodDark: '#7c6043', metal: '#a08763' })}
        ${nightstand(818, 516, { wood: '#9a7a55', woodDark: '#7c6043', metal: '#a08763' })}
        ${pendant(452, 78, 96, { cord: '#3a3833', shade: '#c8b593', light: '#ffe0ae' })}
        ${pendant(852, 78, 96, { cord: '#3a3833', shade: '#c8b593', light: '#ffe0ae' })}
        ${rug(440, 534, 470, 62, '#a08a70')}
        ${armchair(872, 522, 82, 92, { body: '#b9a68b', light: '#ccbca3', dark: '#a08d74', leg: '#5c4b39' })}
        ${floorLamp(958, 516, 126, { metal: '#6d5e4b', shade: '#e2d6c1' })}
        ${plant(360, 470, 0.9, { pot: '#8a7d68', potLip: '#a0947d', leaf: '#42583c' })}
      `
    },
    wardrobe: {
      floor: '02', view: 'trees',
      wall: '#e4dccf', wallSide: '#d8cec0', wallSide2: '#ded5c7', floorA: '#a98866', floorB: '#876749',
      frame: '#3b3833', metal: '#b08a58',
      build: (cfg) => `
        ${wardrobe(120, 130, 360, 340, { wood: '#a9845c', woodDark: '#7f6042', accent: '#8d6f52', metal: '#c7a778' })}
        ${wardrobe(520, 130, 360, 340, { wood: '#a9845c', woodDark: '#7f6042', accent: '#8d6f52', metal: '#c7a778' })}
        ${win(cfg, { x: 462, y: 180, w: 42, h: 240, cols: 1 })}
        <g ${SH2}>
          ${r(330, 520, 340, 60, '#a9845c')}
          ${r(330, 514, 340, 10, '#c7a778')}
          ${Array.from({ length: 5 }, (_, i) => r(350 + i * 60, 528, 42, 12, '#7f6042', 'opacity="0.7"')).join('')}
        </g>
        ${r(320, 580, 360, 4, '#000', 'opacity="0.12"')}
        <g ${SH2}>
          ${r(884, 170, 92, 292, '#b08a58')}
          ${r(892, 178, 76, 276, 'url(#view-trees)', 'opacity="0.75"')}
          ${r(892, 178, 76, 276, '#e9f0ec', 'opacity="0.35"')}
          ${p('M900 440 L940 200 L952 200 L912 440 Z', '#ffffff', 'opacity="0.28"')}
        </g>
        ${plant(830, 470, 0.85, { pot: '#8b7f6b', potLip: '#9f9380', leaf: '#465d3e' })}
        ${ceilingStrip(180, 820, 64, '#fff1d6')}
      `
    },
    bath: {
      floor: '02', view: 'garden',
      wall: '#e9e4da', wallSide: '#ded8cc', wallSide2: '#e3ddd1', floorA: '#cfc5b3', floorB: '#b0a591',
      frame: '#3a3935', metal: '#8e8268',
      build: (cfg) => `
        ${win(cfg, { x: 190, y: 140, w: 190, h: 240, cols: 2 })}
        ${r(470, 120, 370, 350, '#ded6c7')}
        ${Array.from({ length: 5 }, (_, i) => l(470, 160 + i * 62, 840, 160 + i * 62, '#c8bfad', 1, 'opacity="0.7"')).join('')}
        ${bathtub(500, 540, { tub: '#f4f0e7', water: '#cbdbd6', metal: '#8e8268' })}
        ${vanity(720, 540, 180, { wood: '#a3835f', woodDark: '#7f6446', stone: '#ded6c7', basin: '#f0ebe0', metal: '#8e8268' })}
        ${art(742, 200, 58, 80, ['#8a9a86', '#c9c0ac', '#e8e2d6'], 'line')}
        <g>${r(560, 140, 90, 200, '#cfe0dc', 'opacity="0.25"')}
          ${r(560, 340, 90, 6, '#8e8268')}
          ${r(604, 140, 4, 200, '#8e8268', 'opacity="0.6"')}
        </g>
        ${plant(440, 470, 0.8, { pot: '#8b816d', potLip: '#9f9480', leaf: '#48613f' })}
        ${rug(560, 486, 230, 40, '#bcb09b')}
        ${r(470, 470, 370, 8, '#b9af9c')}
        ${ceilingStrip(240, 780, 58, '#fff2da')}
      `
    },
    bedroom2: {
      floor: '02', view: 'garden',
      wall: '#eae3d7', wallSide: '#ded6c8', wallSide2: '#e4dccf', floorA: '#b89773', floorB: '#947253',
      frame: '#3b3934', metal: '#9c8058',
      build: (cfg) => `
        ${win(cfg, { x: 600, y: 120, w: 220, h: 300, cols: 3 })}
        ${curtains(600, 120, 220, 300, '#e3dbcd')}
        ${bed(140, 520, 300, { headboard: '#a08a70', frame: '#7b6751', duvet: '#ded3c1', duvetDark: '#c2b5a2', throw: '#82907a' })}
        ${nightstand(84, 520, { wood: '#9d7d58', woodDark: '#7f6345', metal: '#a68a63' })}
        ${art(210, 176, 130, 96, ['#7d8a72', '#c2b49b', '#e8e1d4'], 'shape')}
        ${desk(690, 536, 230, { wood: '#a1835d', metal: '#6f6656' })}
        ${officeChair(800, 556, { chair: '#8f9a8a', chairDark: '#6f7d6d', metal: '#66614f' })}
        ${floorLamp(560, 470, 118, { metal: '#6a5b49', shade: '#e3d7c2' })}
        ${plant(510, 470, 0.75, { pot: '#8b7f6b', potLip: '#9f9380', leaf: '#455c3e' })}
        ${rug(130, 540, 360, 56, '#ab9a80')}
        ${ceilingStrip(240, 600, 58, '#fff0d4')}
      `
    },
    guest: {
      floor: '03', view: 'dusk',
      wall: '#e5ded1', wallSide: '#d9d1c2', wallSide2: '#e0d8ca', floorA: '#a3835f', floorB: '#816447',
      frame: '#393733', metal: '#9a7d55',
      build: (cfg) => `
        ${win(cfg, { x: 120, y: 130, w: 240, h: 290, cols: 3 })}
        ${bed(550, 512, 300, { headboard: '#6f7d68', frame: '#5c4c3a', duvet: '#e3d9c8', duvetDark: '#c5b8a3', throw: '#a97f57' })}
        ${nightstand(506, 512, { wood: '#92744f', woodDark: '#755a3c', metal: '#a08763' })}
        ${art(610, 180, 140, 96, ['#8a7350', '#bba98c', '#e7e0d3'], 'line')}
        ${armchair(300, 524, 94, 100, { body: '#8d9a86', light: '#a4b09b', dark: '#77836f', leg: '#55483a' })}
        ${floorLamp(240, 470, 124, { metal: '#665a49', shade: '#dccfba' })}
        ${rug(500, 536, 390, 56, '#96866e')}
        ${plant(940, 470, 1, { pot: '#837761', potLip: '#988b73', leaf: '#3f5639' })}
        ${r(430, 300, 40, 170, '#cfc4b1', 'opacity="0.6"')}
        ${ceilingStrip(300, 700, 62, '#fff0d6')}
      `
    },
    lounge: {
      floor: '03', view: 'city',
      wall: '#e2dacd', wallSide: '#d5ccbd', wallSide2: '#dcd3c4', floorA: '#997a5a', floorB: '#775c42',
      frame: '#363430', metal: '#9c7f56',
      build: (cfg) => `
        ${win(cfg, { x: 560, y: 110, w: 290, h: 320, cols: 4 })}
        ${bookshelf(120, 150, 230, 320, { wood: '#a58560', woodDark: '#7c6042', accent: '#8d6f52' })}
        ${sofa(450, 520, 320, 120, { body: '#7d8b78', light: '#92a08b', dark: '#66735f', leg: '#4e4639', accent: '#c3a97f', accent2: '#d6c7ad' })}
        ${rug(410, 540, 430, 58, '#8d7c64')}
        ${table(520, 574, 160, 26, { top: '#6f5539', leg: '#57432e' })}
        ${c(560, 500, 8, '#bfa783')}
        ${c(590, 500, 5, '#8c9a86')}
        ${floorLamp(850, 470, 136, { metal: '#5f5546', shade: '#ddcfb8' })}
        ${plant(390, 470, 0.95, { pot: '#857963', potLip: '#998c75', leaf: '#40573a' })}
        ${armchair(772, 524, 90, 96, { body: '#a68f72', light: '#bda98c', dark: '#8d775c', leg: '#4e4234' })}
        ${pendant(600, 54, 90, { cord: '#363430', shade: '#6f5a3f', light: '#ffe0ae' })}
      `
    },
    entertainment: {
      floor: '03', view: 'night',
      wall: '#33383a', wallSide: '#2a2f31', wallSide2: '#2f3436', floorA: '#5f4d3d', floorB: '#46362a',
      frame: '#191d1e', metal: '#a98550',
      build: (cfg) => `
        ${r(120, 110, 760, 360, '#2c3133')}
        <g>${Array.from({ length: 26 }, (_, i) => r(130 + i * 29, 110, 8, 360, '#3a3f41', 'opacity="0.85"')).join('')}</g>
        ${television(330, 168, 340, 168, {})}
        ${r(300, 360, 400, 10, '#1d2223')}
        ${r(300, 370, 400, 6, '#a98550', 'opacity="0.5"')}
        ${sofa(290, 574, 430, 124, { body: '#6a5a4a', light: '#7d6c5a', dark: '#55473a', leg: '#3b3228', accent: '#a98550', accent2: '#4f5f52' })}
        ${rug(270, 592, 470, 44, '#4a3c30')}
        <g>${[0, 1, 2].map(i => c(300 + i * 150, 110, 5, '#ffd9a0', 'opacity="0.55"')).join('')}</g>
        ${r(870, 400, 70, 70, '#3e4345')}
        ${r(870, 400, 70, 4, '#a98550', 'opacity="0.6"')}
        ${c(905, 388, 9, '#ffd9a0', 'opacity="0.4"', 'filter="url(#art-blur-sm)"')}
        ${plant(180, 470, 0.85, { pot: '#4c4a42', potLip: '#5c594f', leaf: '#32502f' })}
        ${r(120, 470, 760, 4, '#a98550', 'opacity="0.25"')}
      `
    },
    study: {
      floor: '03', view: 'garden',
      wall: '#e6dfd3', wallSide: '#dad2c4', wallSide2: '#e1d9cb', floorA: '#a48461', floorB: '#836547',
      frame: '#383632', metal: '#8f7a55',
      build: (cfg) => `
        ${win(cfg, { x: 620, y: 110, w: 220, h: 320, cols: 3 })}
        ${bookshelf(120, 120, 260, 350, { wood: '#a2825c', woodDark: '#7b6042', accent: '#6f7f6a' })}
        ${desk(450, 546, 330, { wood: '#8f6f4c', metal: '#615a4b' })}
        ${officeChair(610, 574, { chair: '#7d6a53', chairDark: '#64523e', metal: '#575043' })}
        ${art(480, 170, 90, 120, ['#7c8b70', '#bba98c', '#e9e2d5'], 'shape')}
        ${floorLamp(880, 470, 130, { metal: '#5f5445', shade: '#ddcfb8' })}
        ${plant(420, 470, 0.85, { pot: '#857963', potLip: '#998c75', leaf: '#41583b' })}
        ${r(470, 470, 300, 5, '#c2ab8d', 'opacity="0.5"')}
        ${rug(450, 500, 360, 50, '#a2937a')}
        ${ceilingStrip(300, 760, 60, '#fff0d4')}
      `
    }
  };

  /* ---------- scene shell ---------------------------------------------- */
  function render(roomId) {
    const room = ROOMS[roomId];
    if (!room) return '';
    const k = roomId;
    const c = { id: k, view: room.view, frame: room.frame, metal: room.metal };
    return `<svg class="room-art" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="w-${k}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${room.wall}"/><stop offset="1" stop-color="${room.wallSide2}"/>
        </linearGradient>
        <linearGradient id="f-${k}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${room.floorA}"/><stop offset="1" stop-color="${room.floorB}"/>
        </linearGradient>
        <radialGradient id="glow-${k}" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#ffe3b4" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#ffe3b4" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="art-sky-sheen" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <radialGradient id="vig-${k}" cx="0.5" cy="0.42" r="0.78">
          <stop offset="0.45" stop-color="#000000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.34"/>
        </radialGradient>
        <linearGradient id="edge-${k}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#000000" stop-opacity="0.26"/>
          <stop offset="0.22" stop-color="#000000" stop-opacity="0"/>
          <stop offset="0.86" stop-color="#000000" stop-opacity="0"/>
          <stop offset="1" stop-color="#000000" stop-opacity="0.22"/>
        </linearGradient>
        <linearGradient id="sun-${k}" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stop-color="#fff3d6" stop-opacity="0.30"/>
          <stop offset="1" stop-color="#fff3d6" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="1000" height="640" fill="url(#w-${k})"/>
      <!-- ceiling -->
      <path d="M0 0 H1000 L850 110 H150 Z" fill="${room.wallSide}" opacity="0.95"/>
      <path d="M0 0 H1000 L850 110 H150 Z" fill="url(#edge-${k})"/>
      <path d="M150 110 H850 V128 H150 Z" fill="#000000" opacity="0.10"/>
      <!-- side walls -->
      <path d="M0 0 L150 110 V470 L0 640 Z" fill="${room.wallSide}"/>
      <path d="M1000 0 L850 110 V470 L1000 640 Z" fill="${room.wallSide2}"/>
      <path d="M0 0 L150 110 V470 L0 640 Z" fill="#000000" opacity="0.10"/>
      <path d="M1000 0 L850 110 V470 L1000 640 Z" fill="#000000" opacity="0.03"/>
      <path d="M150 110 V470" stroke="#000000" stroke-opacity="0.10" stroke-width="2"/>
      <path d="M850 110 V470" stroke="#000000" stroke-opacity="0.10" stroke-width="2"/>
      <!-- back wall -->
      <rect x="150" y="110" width="700" height="360" fill="url(#w-${k})"/>
      <rect x="150" y="110" width="700" height="18" fill="#000000" opacity="0.08"/>
      <g opacity="0.26">${[300, 500, 700].map(x => l(x, 110, x, 470, room.wallSide, 1)).join('')}</g>
      <rect x="150" y="110" width="700" height="360" fill="url(#art-sky-sheen)" opacity="0.12"/>
      <!-- floor -->
      <path d="M0 640 L1000 640 L850 470 H150 Z" fill="url(#f-${k})"/>
      <g opacity="0.20" stroke="${room.floorB}" stroke-width="1.4">
        ${Array.from({ length: 17 }, (_, i) => {
          const bx = -300 + i * 100;
          return `M500 470 L${bx} 640`;
        }).join(' ')}
      </g>
      <g opacity="0.14">${[0, 1, 2, 3].map(i => `M0 ${520 + i * 30} H1000`).join(' ')}</g>
      <path d="M0 640 L1000 640 L850 470 H150 Z" fill="#000000" opacity="0.10"/>
      <path d="M150 470 H850 V492 H150 Z" fill="#000000" opacity="0.16" filter="url(#art-blur-sm)"/>
      <!-- skirting -->
      <rect x="150" y="460" width="700" height="10" fill="${room.wallSide}" opacity="0.95"/>
      <rect x="150" y="460" width="700" height="2" fill="#ffffff" opacity="0.18"/>
      ${room.build(c)}
      <!-- warm light pool -->
      <ellipse cx="500" cy="540" rx="380" ry="110" fill="url(#glow-${k})" opacity="0.18"/>
      <rect width="1000" height="640" fill="url(#vig-${k})"/>
      <rect width="1000" height="640" fill="url(#edge-${k})" opacity="0.5"/>
      <path d="M0 0 H1000 V640 H0 Z" fill="none" stroke="#000" stroke-opacity="0.22" stroke-width="2"/>
    </svg>`;
  }

  function mountAll() {
    document.querySelectorAll('[data-room]').forEach(el => {
      const id = el.getAttribute('data-room');
      if (!ROOMS[id]) return;
      el.innerHTML = render(id);
    });
  }

  return { ROOMS, render, mountAll, defs: defs() };
})();
