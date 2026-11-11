#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ALLOWED_UI_BASES = new Set([
  '#FFD60A', '#FFF6C7', '#FFEB85', '#FFE45C', '#E8BC00', '#C9A200', '#4A4127',
  '#FEFFED', '#0F1215', '#F4F5F7', '#E3E5E8', '#C2CCD6', '#5F656D', '#525C65',
  '#3A434C', '#2B3138', '#1F2328', '#58CC02', '#2F6F00', '#E8FBD5', '#FF4B4B',
  '#D42F2F', '#FFE5E5', '#1CB0F6', '#0A7BBF', '#FF9600'
]);
const STATE_COLORS = new Set(['#58CC02','#2F6F00','#E8FBD5','#FF4B4B','#D42F2F','#FFE5E5']);
const WARNING_COLOR = '#FF9600';


const ARROW_RE = /[\u2190-\u21ff\u27a0-\u27ff]/gu;
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const SKIP_TEXT_TAGS = new Set(['script', 'template', 'noscript']);
const STATE_SELECTOR_RE = /(?:^|[.#\[\s:_-])(?:right|correct|wrong|incorrect)(?:$|[.#\]\s:_-])/i;
const CARD_SELECTOR_RE = /(?:card|box|panel|callout|note|summary|answer|faq|item|tile|section|aside|tip|warning|source|related|step|feature|compare|result|practice|destination|branch|scope|table)/i;
const NARROW_DIAGRAM_PRIMITIVE_RE = /(?:^|[-_.#\s])(?:connector|axis|roadline|road-line|timeline-path|timeline-line|timeline-rail|timeline-connector|flow-line|flow-connector|gauge-tick|scale-tick)(?:$|[-_.#\s:[>])/i;
const CARD_CONTAINER_RE = /(?:card|note|panel|box|step)/i;
const SVG_PAINT_PROPERTY_RE = /^(?:fill|stroke|stop-color|flood-color|lighting-color)$/i;
const APPROVED_SCENE_DRAWING_PROPERTIES = new Map([
  ['.speed-road svg', new Set(['filter'])],
  ['.switch-energy>svg', new Set(['fill'])],
  ['.field-access-montage svg', new Set(['filter'])],
  ['.private-ground-parcel svg', new Set(['filter'])],
  ['.mspeed-scene svg', new Set(['filter'])],
  ['.urban-speed-scene svg', new Set(['filter'])],
  ['.clip-count-scene svg', new Set(['filter'])],
  ['.licence-status-scene svg', new Set(['filter'])]
]);

function makeLineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return starts;
}

function lineAt(starts, offset) {
  let low = 0;
  let high = starts.length;
  while (low + 1 < high) {
    const mid = (low + high) >> 1;
    if (starts[mid] <= offset) low = mid;
    else high = mid;
  }
  return low + 1;
}

function rel(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function decodeEntities(text) {
  const named = new Map([
    ['amp', '&'], ['lt', '<'], ['gt', '>'], ['quot', '"'], ['apos', "'"], ['nbsp', ' '],
    ['middot', '·'], ['rarr', '→'], ['larr', '←'], ['uarr', '↑'], ['darr', '↓'],
    ['nearr', '↗'], ['nwarr', '↖'], ['searr', '↘'], ['swarr', '↙']
  ]);
  return text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z][a-z0-9]+));/gi, (whole, dec, hex, name) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(Number.parseInt(hex, 16));
    return named.get(name.toLowerCase()) ?? whole;
  });
}

function parseAttributes(rawTag) {
  const attributes = new Map();
  const body = rawTag.replace(/^<\/?\s*[a-z][\w:-]*/i, '').replace(/\/?>\s*$/, '');
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of body.matchAll(re)) {
    const key = match[1].toLowerCase();
    attributes.set(key, match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

function findTagEnd(html, start) {
  let quote = '';
  for (let i = start + 1; i < html.length; i += 1) {
    const char = html[i];
    if (quote) {
      if (char === '\\') i += 1;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '>') return i;
  }
  return -1;
}

function indexFallsIn(text, index, expression) {
  for (const match of text.matchAll(expression)) {
    if (index >= match.index && index < match.index + match[0].length) return true;
  }
  return false;
}

function isDateOrdinal(text, index) {
  const expressions = [
    /\b\d{1,2}\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{2,4}\b/g,
    /\b\d{4}\s*[./-]\s*\d{1,2}\s*[./-]\s*\d{1,2}\b/g,
    /\b\d{1,2}\s+(?:januar|februar|marts|april|maj|juni|juli|august|september|oktober|november|december)\s+\d{4}\b/gi
  ];
  return expressions.some(expression => indexFallsIn(text, index, expression));
}

function isRoadCodeOrdinal(text, index) {
  const before = text.slice(Math.max(0, index - 24), index);
  return /\b(?:vej|rute|route|road|motorvej|hovedvej|landevej)\s*$/i.test(before);
}

function isClockOrdinal(text, index) {
  const before = text.slice(Math.max(0, index - 18), index);
  const local = text.slice(Math.max(0, index - 8), Math.min(text.length, index + 10));
  const clockRange = /\b(?:(?:fra|mellem)\s+)?(?:klokken|kl\.)\s*\d{1,2}(?::\d{2})?\s+(?:og|til)\s+\d{1,2}(?::\d{2})?\b/gi;
  return /\b(?:kl\.?|klokken)\s*$/i.test(before)
    || indexFallsIn(text, index, clockRange)
    || /\b\d{1,2}\s*[–-]\s*0\d\b/.test(local)
    || /\b0\d\s*[–-]\s*\d{1,2}\b/.test(local)
    || /\b0\d:\d{2}\b/.test(local);
}

function isPhoneOrdinal(text, index) {
  return indexFallsIn(text, index, /\b(?:\+45\s*)?\d{2}(?:[ -]\d{2}){3}\b/g);
}

function visibleSnippet(text, index, length = 1) {
  return text.slice(Math.max(0, index - 36), Math.min(text.length, index + length + 48)).replace(/\s+/g, ' ').trim();
}

function addHtmlTextViolations({ text, offset, file, siteRoot, lineStarts, context, out, segments }) {
  if (context.skip || context.hidden || context.metadata) return;
  const decoded = decodeEntities(text);
  if (!decoded.trim()) return;
  segments.push({ text: decoded.replace(/\s+/g, ' ').trim(), offset, toc: context.toc });
  if (!context.road) {
    const ordinalRe = /(?<![\d.,-])\b0\d\b(?![\d.,-])(?:\s*(?:\/|·))?/g;
    for (const match of decoded.matchAll(ordinalRe)) {
      if (isDateOrdinal(decoded, match.index) || isRoadCodeOrdinal(decoded, match.index) || isClockOrdinal(decoded, match.index) || isPhoneOrdinal(decoded, match.index)) continue;
      out.ordinals.push({
        file: rel(siteRoot, file),
        line: lineAt(lineStarts, offset),
        label: match[0].trim(),
        snippet: visibleSnippet(decoded, match.index, match[0].length)
      });
    }
  }
  if (!context.road && !context.svg) {
    for (const match of decoded.matchAll(ARROW_RE)) {
      out.arrows.push({
        file: rel(siteRoot, file),
        line: lineAt(lineStarts, offset),
        glyph: match[0],
        snippet: visibleSnippet(decoded, match.index)
      });
    }
  }
}

function scanHtml(html, file, siteRoot, out, stylesheetRefs) {
  const lineStarts = makeLineStarts(html);
  const stack = [];
  const segments = [];
  let index = 0;
  const inherited = () => stack.at(-1) ?? { skip: false, hidden: false, metadata: false, road: false, svg: false, toc: false };

  while (index < html.length) {
    if (html.startsWith('<!--', index)) {
      const end = html.indexOf('-->', index + 4);
      if (end < 0) {
        out.errors.push({ file: rel(siteRoot, file), line: lineAt(lineStarts, index), message: 'Unclosed HTML comment; scan stopped fail-closed.' });
        break;
      }
      index = end + 3;
      continue;
    }
    const active = inherited();
    if (active.skip) {
      const closeStart = html.toLowerCase().indexOf(`</${active.tag}`, index);
      if (closeStart < 0) {
        out.errors.push({ file: rel(siteRoot, file), line: lineAt(lineStarts, index), message: `Unclosed <${active.tag}> block; scan stopped fail-closed.` });
        break;
      }
      index = closeStart;
    }
    if (html[index] !== '<') {
      const end = html.indexOf('<', index);
      const limit = end < 0 ? html.length : end;
      addHtmlTextViolations({ text: html.slice(index, limit), offset: index, file, siteRoot, lineStarts, context: inherited(), out, segments });
      index = limit;
      continue;
    }
    const end = findTagEnd(html, index);
    if (end < 0) {
      out.errors.push({ file: rel(siteRoot, file), line: lineAt(lineStarts, index), message: 'Unclosed HTML tag; scan stopped fail-closed.' });
      break;
    }
    const rawTag = html.slice(index, end + 1);
    const tagMatch = rawTag.match(/^<\s*(\/?)\s*([a-z][\w:-]*)/i);
    if (!tagMatch) {
      index = end + 1;
      continue;
    }
    const closing = Boolean(tagMatch[1]);
    const tag = tagMatch[2].toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        const popped = stack.pop();
        if (popped.tag === tag) break;
      }
      index = end + 1;
      continue;
    }
    const attributes = parseAttributes(rawTag);
    const parent = inherited();
    const className = attributes.get('class') ?? '';
    const context = {
      tag,
      skip: parent.skip || SKIP_TEXT_TAGS.has(tag),
      hidden: parent.hidden || attributes.has('hidden'),
      metadata: parent.metadata || tag === 'head' || tag === 'style',
      road: parent.road || /^true$/i.test(attributes.get('data-road-sign-content') ?? ''),
      svg: parent.svg || tag === 'svg',
      toc: parent.toc || /(?:^|\s)toc(?:\s|$)/i.test(className) || (tag === 'nav' && /(?:indhold|contents|guide)/i.test(attributes.get('aria-label') ?? ''))
    };

    if (tag === 'link' && /(?:^|\s)stylesheet(?:\s|$)/i.test(attributes.get('rel') ?? '') && attributes.get('href')) {
      stylesheetRefs.push({ page: rel(siteRoot, file), href: attributes.get('href') });
    }
    if (tag === 'style') {
      const closeStart = html.toLowerCase().indexOf('</style', end + 1);
      if (closeStart < 0) {
        out.errors.push({ file: rel(siteRoot, file), line: lineAt(lineStarts, index), message: 'Unclosed <style> block; scan stopped fail-closed.' });
        break;
      }
      const closeEnd = findTagEnd(html, closeStart);
      if (closeEnd < 0) {
        out.errors.push({ file: rel(siteRoot, file), line: lineAt(lineStarts, closeStart), message: 'Malformed </style> tag; scan stopped fail-closed.' });
        break;
      }
      scanCss(html.slice(end + 1, closeStart), file, siteRoot, out, { lineStarts, offsetAdjustment: end + 1 });
      index = closeEnd + 1;
      continue;
    }
    if (!context.skip && attributes.has('style')) {
      analyzeInlineStyle(attributes.get('style'), context.svg ? `[svg-drawing] inline <${tag}>` : `inline <${tag}>`, file, siteRoot, lineStarts, index, out);
    }
    if (!VOID_TAGS.has(tag) && !/\/\s*>$/.test(rawTag)) stack.push(context);
    index = end + 1;
  }

  const tocSegments = segments.filter(segment => segment.toc);
  const pageText = tocSegments.map(segment => segment.text).join(' ');
  const duplicateRe = /\b(\d{1,2})\s+\1\.\s*\p{L}/gu;
  for (const match of pageText.matchAll(duplicateRe)) {
    let remaining = match.index;
    let source = tocSegments[0];
    for (const segment of tocSegments) {
      if (remaining <= segment.text.length) { source = segment; break; }
      remaining -= segment.text.length + 1;
    }
    out.duplicateToc.push({
      file: rel(siteRoot, file),
      line: lineAt(lineStarts, source?.offset ?? 0),
      label: match[0],
      snippet: visibleSnippet(pageText, match.index, match[0].length)
    });
  }
}

function maskCssComments(css) {
  let output = '';
  let index = 0;
  while (index < css.length) {
    if (css.startsWith('/*', index)) {
      const end = css.indexOf('*/', index + 2);
      const limit = end < 0 ? css.length : end + 2;
      output += css.slice(index, limit).replace(/[^\n\r]/g, ' ');
      index = limit;
    } else {
      output += css[index];
      index += 1;
    }
  }
  return output;
}

function findCssDelimiter(css, start, end, delimiters) {
  let quote = '';
  let parens = 0;
  let brackets = 0;
  for (let i = start; i < end; i += 1) {
    const char = css[i];
    if (quote) {
      if (char === '\\') i += 1;
      else if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(') parens += 1;
    else if (char === ')') parens = Math.max(0, parens - 1);
    else if (char === '[') brackets += 1;
    else if (char === ']') brackets = Math.max(0, brackets - 1);
    else if (!parens && !brackets && delimiters.has(char)) return i;
  }
  return -1;
}

function findMatchingBrace(css, open, end) {
  let quote = '';
  let depth = 1;
  for (let i = open + 1; i < end; i += 1) {
    const char = css[i];
    if (quote) {
      if (char === '\\') i += 1;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '{') depth += 1;
    else if (char === '}' && --depth === 0) return i;
  }
  return -1;
}

function splitDeclarations(css, start, end) {
  const declarations = [];
  let cursor = start;
  while (cursor < end) {
    const semicolon = findCssDelimiter(css, cursor, end, new Set([';']));
    const limit = semicolon < 0 ? end : semicolon;
    const colon = findCssDelimiter(css, cursor, limit, new Set([':']));
    if (colon >= 0) {
      const property = css.slice(cursor, colon).trim();
      const value = css.slice(colon + 1, limit).trim();
      if (property && value) {
        const valueStart = colon + 1 + css.slice(colon + 1, limit).search(/\S/);
        declarations.push({ property, value, offset: cursor, valueStart });
      }
    }
    cursor = semicolon < 0 ? end : semicolon + 1;
  }
  return declarations;
}

function parseCssRules(css, start = 0, end = css.length, context = [], rules = []) {
  let cursor = start;
  while (cursor < end) {
    while (cursor < end && /\s/.test(css[cursor])) cursor += 1;
    if (cursor >= end) break;
    const delimiter = findCssDelimiter(css, cursor, end, new Set(['{', ';']));
    if (delimiter < 0) break;
    if (css[delimiter] === ';') {
      cursor = delimiter + 1;
      continue;
    }
    const header = css.slice(cursor, delimiter).trim();
    const close = findMatchingBrace(css, delimiter, end);
    if (close < 0) {
      rules.push({ parseError: 'Unclosed CSS block', offset: delimiter, selector: header, context });
      break;
    }
    const bodyStart = delimiter + 1;
    if (header.startsWith('@')) {
      parseCssRules(css, bodyStart, close, [...context, header], rules);
    } else {
      const nested = findCssDelimiter(css, bodyStart, close, new Set(['{']));
      if (nested >= 0) parseCssRules(css, bodyStart, close, context, rules);
      else rules.push({ selector: header, offset: cursor, declarations: splitDeclarations(css, bodyStart, close), context });
    }
    cursor = close + 1;
  }
  return rules;
}

function maskCssStringsAndUrls(value) {
  const chars = [...value];
  let index = 0;
  while (index < chars.length) {
    if (chars[index] === '"' || chars[index] === "'") {
      const quote = chars[index];
      index += 1;
      while (index < chars.length) {
        const char = chars[index];
        chars[index] = char === '\n' || char === '\r' ? char : ' ';
        if (char === '\\') {
          index += 1;
          if (index < chars.length) chars[index] = chars[index] === '\n' ? '\n' : ' ';
        } else if (char === quote) break;
        index += 1;
      }
    } else if (value.slice(index, index + 4).toLowerCase() === 'url(') {
      let depth = 1;
      index += 4;
      while (index < chars.length && depth) {
        const char = chars[index];
        chars[index] = char === '\n' || char === '\r' ? char : ' ';
        if (char === '(') depth += 1;
        else if (char === ')') depth -= 1;
        index += 1;
      }
    }
    index += 1;
  }
  return chars.join('');
}

function normalizedHex(raw) {
  const hex = raw.toUpperCase();
  if (hex.length === 3 || hex.length === 4) {
    const expanded = hex.split('').map(char => char + char).join('');
    return { base: `#${expanded.slice(0, 6)}`, alpha: expanded.slice(6) || null };
  }
  if (hex.length === 6 || hex.length === 8) return { base: `#${hex.slice(0, 6)}`, alpha: hex.slice(6) || null };
  return null;
}

function isGreen(base) {
  const red = Number.parseInt(base.slice(1, 3), 16) / 255;
  const green = Number.parseInt(base.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(base.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  if (delta < 0.06 || max !== green) return false;
  let hue = 60 * (((blue - red) / delta) + 2);
  if (hue < 0) hue += 360;
  return hue >= 70 && hue <= 180;
}

function selectorBranches(selector) {
  const branches = [];
  let start = 0;
  let parens = 0;
  let brackets = 0;
  let quote = '';
  for (let index = 0; index < selector.length; index += 1) {
    const char = selector[index];
    if (quote) {
      if (char === '\\') index += 1;
      else if (char === quote) quote = '';
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '(') parens += 1;
    else if (char === ')') parens = Math.max(0, parens - 1);
    else if (char === '[') brackets += 1;
    else if (char === ']') brackets = Math.max(0, brackets - 1);
    else if (char === ',' && !parens && !brackets) {
      branches.push(selector.slice(start, index).trim());
      start = index + 1;
    }
  }
  branches.push(selector.slice(start).trim());
  return branches.filter(Boolean);
}

function isApprovedSceneDrawing(branch, property) {
  const normalizedSelector = branch.replace(/\s*>\s*/g, '>').replace(/\s+/g, ' ').trim();
  return APPROVED_SCENE_DRAWING_PROPERTIES.get(normalizedSelector)?.has(property) ?? false;
}

function isAllowedColor(rawHex, selector, property) {
  const parsed = normalizedHex(rawHex);
  if (!parsed || !ALLOWED_UI_BASES.has(parsed.base)) return false;
  const branches = selectorBranches(selector);
  if (parsed.base === '#FFD60A' && /^(?:color|text-decoration-color|caret-color)$/i.test(property)
      && !branches.every(branch => /(?:^|[.\s])brand-dot(?:$|[\s:])/i.test(branch))) return false;
  if (STATE_COLORS.has(parsed.base) && !(branches.length && branches.every(branch => STATE_SELECTOR_RE.test(branch)))) return false;
  if (parsed.base === WARNING_COLOR && !(branches.length && branches.every(branch => /(?:warn|advar|notice)/i.test(branch)))) return false;
  return true;
}

function analyzeDeclarations({ declarations, selector, file, siteRoot, lineStarts, out, offsetAdjustment = 0 }) {
  const ruleProperties = new Set(declarations.map(declaration => declaration.property.toLowerCase()));
  const boxLikeRule = [...ruleProperties].some(property => /^(?:background|background-color|padding|border-radius)$/.test(property));
  for (const declaration of declarations) {
    const property = declaration.property.toLowerCase();
    const masked = maskCssStringsAndUrls(declaration.value);
    for (const match of masked.matchAll(/\b(?:rgba?|hsla?)\([^)]*\)/gi)) {
      out.offPalette.push({
        file: rel(siteRoot, file),
        line: lineAt(lineStarts, offsetAdjustment + declaration.valueStart + match.index),
        color: match[0],
        base: null,
        selector,
        property
      });
    }
    for (const match of masked.matchAll(/#([0-9a-f]{3,8})(?![0-9a-f])/gi)) {
      if (isAllowedColor(match[1], selector, property)) continue;
      const parsed = normalizedHex(match[1]);
      out.offPalette.push({
        file: rel(siteRoot, file),
        line: lineAt(lineStarts, offsetAdjustment + declaration.valueStart + match.index),
        color: `#${match[1]}`,
        base: parsed?.base ?? null,
        selector,
        property
      });
    }
    const borderMatch = property.match(/^border-(left|right|top|bottom|inline-start|inline-end|block-start|block-end)(?:-width)?$/);
    if (borderMatch) {
      const widths = [...declaration.value.matchAll(/(?:^|\s|\()([0-9]*\.?[0-9]+)px\b/gi)].map(match => Number(match[1]));
      const width = widths.length ? Math.max(...widths) : 0;
      const vertical = /^(?:left|right|inline-start|inline-end)$/.test(borderMatch[1]);
      const cardLike = selector.startsWith('inline ') || CARD_SELECTOR_RE.test(selector) || (vertical && boxLikeRule);
      const narrowDiagramPrimitive = NARROW_DIAGRAM_PRIMITIVE_RE.test(selector) && !CARD_CONTAINER_RE.test(selector);
      if (width >= 3 && cardLike && !narrowDiagramPrimitive) {
        out.stripes.push({
          file: rel(siteRoot, file),
          line: lineAt(lineStarts, offsetAdjustment + declaration.offset),
          selector,
          property,
          width,
          value: declaration.value
        });
      }
    }
    if (property === 'content' && !/\[data-road-sign-content(?:=[^\]]+)?\]/i.test(selector)) {
      for (const match of declaration.value.matchAll(ARROW_RE)) {
        out.arrows.push({
          file: rel(siteRoot, file),
          line: lineAt(lineStarts, offsetAdjustment + declaration.valueStart + match.index),
          glyph: match[0],
          snippet: `${selector} { content: ${declaration.value} }`
        });
      }
    }
  }
}

function analyzeInlineStyle(style, selector, file, siteRoot, lineStarts, offset, out) {
  const declarations = splitDeclarations(style, 0, style.length).map(declaration => ({
    ...declaration,
    offset: offset + declaration.offset,
    valueStart: offset + declaration.valueStart
  }));
  analyzeDeclarations({ declarations, selector, file, siteRoot, lineStarts, out });
}

function scanCss(css, file, siteRoot, out, { lineStarts = makeLineStarts(css), offsetAdjustment = 0 } = {}) {
  const sanitized = maskCssComments(css);
  // Vendor CSS often embeds SVG paint values in percent-encoded data URLs.
  for (const match of sanitized.matchAll(/%23([0-9a-f]{3,8})(?![0-9a-f])/gi)) {
    const parsed = normalizedHex(match[1]);
    if (parsed && ALLOWED_UI_BASES.has(parsed.base)) continue;
    out.offPalette.push({ file: rel(siteRoot,file), line: lineAt(lineStarts,offsetAdjustment+match.index), color: '#'+match[1], base: parsed?.base ?? null, selector: '[encoded SVG data URL]', property: 'paint' });
  }
  for (const match of sanitized.matchAll(/(?:fill|stroke)=(?:'|%27)([a-z]+)(?:'|%27)/gi)) {
    if (['none','currentcolor','transparent'].includes(match[1].toLowerCase())) continue;
    out.offPalette.push({ file: rel(siteRoot,file), line: lineAt(lineStarts,offsetAdjustment+match.index), color: match[1], base: null, selector: '[SVG data URL]', property: 'paint' });
  }
  const rules = parseCssRules(sanitized);
  for (const rule of rules) {
    if (rule.parseError) {
      out.errors.push({ file: rel(siteRoot, file), line: lineAt(lineStarts, offsetAdjustment + rule.offset), message: rule.parseError });
      continue;
    }
    analyzeDeclarations({ declarations: rule.declarations, selector: rule.selector, file, siteRoot, lineStarts, out, offsetAdjustment });
  }
}

async function walkFiles(root) {
  const files = [];
  const visit = async directory => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(full);
      else if (entry.isFile()) files.push(full);
    }
  };
  await visit(root);
  return files;
}

function summarizeLocations(items, key = 'file') {
  return [...new Set(items.map(item => item[key]))].sort();
}

function summarizeReport(raw, inventory) {
  const glyphs = {};
  for (const item of raw.arrows) glyphs[item.glyph] = (glyphs[item.glyph] ?? 0) + 1;
  const labels = {};
  for (const item of raw.ordinals) labels[item.label] = (labels[item.label] ?? 0) + 1;
  const colors = {};
  for (const item of raw.offPalette) {
    const key = item.color.toUpperCase();
    colors[key] = (colors[key] ?? 0) + 1;
  }
  const violationCount = raw.ordinals.length + raw.arrows.length + raw.stripes.length + raw.offPalette.length + raw.duplicateToc.length;
  return {
    status: violationCount === 0 && raw.errors.length === 0 ? 'PASS' : 'FAIL',
    generatedAt: new Date().toISOString(),
    inventory,
    summary: {
      violationCount,
      errorCount: raw.errors.length,
      familiesFailed: [
        raw.ordinals.length && 'visibleZeroPaddedOrdinals',
        raw.arrows.length && 'decorativeArrowGlyphs',
        raw.stripes.length && 'oneSidedCardBorderBars',
        raw.offPalette.length && 'offManualUiHexColors',
        raw.duplicateToc.length && 'duplicateTocNumbers'
      ].filter(Boolean)
    },
    visibleZeroPaddedOrdinals: { count: raw.ordinals.length, distinctPages: summarizeLocations(raw.ordinals).length, labels, locations: raw.ordinals },
    decorativeArrowGlyphs: { count: raw.arrows.length, distinctPages: summarizeLocations(raw.arrows).length, glyphs, locations: raw.arrows },
    oneSidedCardBorderBars: { count: raw.stripes.length, distinctFiles: summarizeLocations(raw.stripes).length, locations: raw.stripes },
    offManualUiHexColors: { count: raw.offPalette.length, uniqueCount: Object.keys(colors).length, colors, distinctFiles: summarizeLocations(raw.offPalette).length, locations: raw.offPalette },
    duplicateTocNumbers: { count: raw.duplicateToc.length, distinctPages: summarizeLocations(raw.duplicateToc).length, locations: raw.duplicateToc },
    errors: raw.errors
  };
}

async function writeReport(reportPath, report) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

export async function checkGuideDesign({ siteRoot = path.resolve('site/koereskoler'), reportPath = null } = {}) {
  if (!path.isAbsolute(siteRoot)) throw new TypeError(`siteRoot must be absolute: ${siteRoot}`);
  if (reportPath !== null && !path.isAbsolute(reportPath)) throw new TypeError(`reportPath must be absolute: ${reportPath}`);

  const raw = { ordinals: [], arrows: [], stripes: [], offPalette: [], duplicateToc: [], errors: [] };
  const inventory = {
    siteRoot,
    allHtmlCount: 0,
    marketingHtmlCount: 0,
    guideCount: 0,
    hubCount: 0,
    checkedHtml: [],
    excludedHtml: [],
    stylesheetReferences: [],
    excludedStylesheetReferences: [],
    checkedStylesheets: []
  };
  let allFiles = [];
  try {
    const stat = await fs.stat(siteRoot);
    if (!stat.isDirectory()) throw new Error('siteRoot is not a directory');
    allFiles = await walkFiles(siteRoot);
  } catch (error) {
    raw.errors.push({ file: '.', line: 1, message: `Cannot inventory site root: ${error.message}` });
    const report = summarizeReport(raw, inventory);
    if (reportPath) await writeReport(reportPath, report);
    return report;
  }

  const allHtml = allFiles.filter(file => file.toLowerCase().endsWith('.html')).sort();
  const marketingHtml = allHtml;
  inventory.allHtmlCount = allHtml.length;
  inventory.marketingHtmlCount = marketingHtml.length;
  inventory.hubCount = marketingHtml.filter(file => file === path.join(siteRoot, 'index.html')).length;
  inventory.guideCount = marketingHtml.length - inventory.hubCount;
  inventory.checkedHtml = marketingHtml.map(file => rel(siteRoot, file));
  inventory.excludedHtml = [];
  if (inventory.hubCount !== 1) raw.errors.push({ file: 'viden/index.html', line: 1, message: 'Expected exactly one /koereskoler index.' });
  if (inventory.guideCount < 1) raw.errors.push({ file: 'viden', line: 1, message: 'No built town or school pages found.' });

  const stylesheetRefs = [];
  for (const file of marketingHtml) {
    try {
      const html = await fs.readFile(file, 'utf8');
      scanHtml(html, file, siteRoot, raw, stylesheetRefs);
    } catch (error) {
      raw.errors.push({ file: rel(siteRoot, file), line: 1, message: `Cannot read HTML: ${error.message}` });
    }
  }

  const refCounts = new Map();
  for (const ref of stylesheetRefs) {
    const key = ref.href;
    const current = refCounts.get(key) ?? { href: key, pageCount: 0, pages: [] };
    current.pageCount += 1;
    if (current.pages.length < 20) current.pages.push(ref.page);
    refCounts.set(key, current);
  }
  inventory.stylesheetReferences = [...refCounts.values()].sort((a, b) => a.href.localeCompare(b.href));

  const localCss = new Set(allFiles.filter(file => file.toLowerCase().endsWith('.css')));
  for (const ref of stylesheetRefs) {
    if (/^(?:https?:)?\/\//i.test(ref.href) || /^(?:data:|blob:)/i.test(ref.href)) continue;
    const clean = decodeURIComponent(ref.href.split(/[?#]/, 1)[0]);
    const resolved = clean.startsWith('/koereskoler/') ? path.resolve(siteRoot, clean.slice('/koereskoler/'.length)) : clean.startsWith('/') ? null : path.resolve(siteRoot, path.dirname(ref.page), clean);
    if (!resolved) {
      inventory.excludedStylesheetReferences.push({ page: ref.page, href: ref.href, reason: 'Shared release-site CSS outside authored section' });
      continue;
    }
    const relative = path.relative(siteRoot, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      raw.errors.push({ file: ref.page, line: 1, message: `Stylesheet escapes site root: ${ref.href}` });
      continue;
    }
    if (resolved.toLowerCase().endsWith('.css')) localCss.add(resolved);
  }

  for (const file of [...localCss].sort()) {
    try {
      const css = await fs.readFile(file, 'utf8');
      inventory.checkedStylesheets.push(rel(siteRoot, file));
      scanCss(css, file, siteRoot, raw);
    } catch (error) {
      raw.errors.push({ file: rel(siteRoot, file), line: 1, message: `Cannot read required stylesheet: ${error.message}` });
    }
  }

  const report = summarizeReport(raw, inventory);
  if (reportPath) await writeReport(reportPath, report);
  return report;
}

function parseCli(argv) {
  const options = { siteRoot: path.resolve('site/koereskoler'), reportPath: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--site-root' || arg === '--report') {
      const value = argv[++index];
      if (!value) throw new TypeError(`Missing value for ${arg}`);
      if (!path.isAbsolute(value)) throw new TypeError(`${arg} requires an absolute path: ${value}`);
      if (arg === '--site-root') options.siteRoot = value;
      else options.reportPath = value;
    } else if (arg === '--help' || arg === '-h') {
      return { help: true };
    } else throw new TypeError(`Unknown argument: ${arg}`);
  }
  return options;
}

async function main() {
  let options;
  try {
    options = parseCli(process.argv.slice(2));
  } catch (error) {
    console.error(`Guide design gate usage error: ${error.message}`);
    console.error('Usage: node scripts/check-guide-design.mjs [--site-root ABS] [--report ABS]');
    process.exitCode = 2;
    return;
  }
  if (options.help) {
    console.log('Usage: node scripts/check-guide-design.mjs [--site-root ABS] [--report ABS]');
    return;
  }
  try {
    const report = await checkGuideDesign(options);
    console.log(JSON.stringify({ status: report.status, summary: report.summary, inventory: {
      marketingHtmlCount: report.inventory.marketingHtmlCount,
      guideCount: report.inventory.guideCount,
      hubCount: report.inventory.hubCount,
      checkedStylesheets: report.inventory.checkedStylesheets
    } }, null, 2));
    process.exitCode = report.status === 'PASS' ? 0 : 1;
  } catch (error) {
    console.error(`Guide design gate failed closed: ${error.stack ?? error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) await main();

