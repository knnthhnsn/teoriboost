/**
 * Small, inert view helpers for the optional NATKØRSEL imagegen cutouts.
 * The files are deliberately referenced by path only; generation and asset
 * acceptance happen outside this module.
 */
const ART_ROOT = 'assets/illustrations/';

export const ART_ASSETS = Object.freeze({
  'mads-nut': Object.freeze({ src: `${ART_ROOT}mads-nut.webp`, width: 720, height: 720, role: 'garage' }),
  natmobil: Object.freeze({ src: `${ART_ROOT}natmobil.webp`, width: 720, height: 720, role: 'hero' }),
  'koerelys-brain': Object.freeze({ src: `${ART_ROOT}koerelys-brain.webp`, width: 720, height: 720, role: 'result' }),
  'stop-receipt': Object.freeze({ src: `${ART_ROOT}stop-receipt.webp`, width: 720, height: 720, role: 'reaction' }),
  'omkamp-cone': Object.freeze({ src: `${ART_ROOT}omkamp-cone.webp`, width: 720, height: 720, role: 'mission' }),
});

const VARIANTS = new Set(['hero', 'garage', 'mission', 'result', 'reaction']);

function escapeAttribute(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * Return a decorative image element for a known asset, or an empty string for
 * an unknown name. `humorOnly` lets callers keep a joke asset out of calm mode.
 */
export function renderArt(name, { variant = 'reaction', priority = false, humorOnly = false } = {}) {
  const asset = Object.hasOwn(ART_ASSETS, name) ? ART_ASSETS[name] : undefined;
  if (!asset) return '';
  const safeVariant = VARIANTS.has(variant) ? variant : 'reaction';
  const classes = ['art-asset', `art-asset--${safeVariant}`];
  if (humorOnly) classes.push('art-asset--humor-only');
  const loading = priority ? '' : ' loading="lazy"';
  const priorityAttrs = priority ? ' fetchpriority="high"' : '';
  const humorAttrs = humorOnly ? ' data-humor-only="true"' : '';
  return `<img class="${classes.join(' ')}" src="${escapeAttribute(asset.src)}" width="${asset.width}" height="${asset.height}" alt="" aria-hidden="true" decoding="async"${loading}${priorityAttrs}${humorAttrs}>`;
}

