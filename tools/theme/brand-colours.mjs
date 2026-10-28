// One-off: the UI keeps to the brand. Yellow, asphalt ink, white and greys; green and red only say right and
// wrong, orange only warns (and the streak flame). Blue, cyan, purple and pink UI colours move to the brand:
// chosen answers and options are yellow with ink, progress is yellow, links and small headings are ink (yellow in
// dark), focus rings are ink (yellow in dark). Illustrations, car paints and the Google logo keep their colours.
// Run: node tools/theme/brand-colours.mjs, then node tools/theme/build-dark.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '../../dist');
const SELECTED = 'background:#FFD60A;color:#1F2328;border-color:#C9A200;box-shadow:0 3px 0 #C9A200';
const EDITS = {
  'redesign.css': [
    ['--blue:#1CB0F6;--blue-ink:#0A7BBF;--orange:#FF9600;--purple:#A560E8;', '--blue:#1F2328;--blue-ink:#1F2328;--orange:#FF9600;--purple:#1F2328;'],
    ['--acid-text:#2F6F00;', '--acid-text:#7A6000;'],
    ['.acid,span.acid{color:var(--good-ink)}', '.acid,span.acid{color:var(--acid-text)}'],
    ['#humor-toggle b,.mode-toggle b,.acid{color:#2F6F00!important}', '#humor-toggle b,.mode-toggle b,.acid{color:var(--acid-text)!important}'],
    ['.choice-btn.selected{background:#EAF7FF;color:var(--blue-ink);border-color:var(--blue);box-shadow:0 3px 0 var(--blue)}', `.choice-btn.selected{${SELECTED}}`],
    ['.turn-shell{--turn-lime:#4C7A00;--turn-cyan:#0A7BBF}', '.turn-shell{--turn-lime:#7A6000;--turn-cyan:#7A6000}'],
  ],
  'dark.css': [
    ['--blue:#38BDF8;--blue-ink:#7DD3FC;--orange:#FFA53D;--purple:#C08CF5;', '--blue:#FFD60A;--blue-ink:#FFD60A;--orange:#FFA53D;--purple:#FFD60A;'],
    ['--acid-text:#FFE066;', '--acid-text:#FFD60A;'],
    ['--good-ink:#3B8A00;--bad-ink:#D42F2F;--blue-ink:#0A7BBF;--acid-text:#2F6F00}', '--good-ink:#3B8A00;--bad-ink:#D42F2F;--blue-ink:#1F2328;--acid-text:#7A6000}'],
  ],
  'light.css': [['--blue-ink:#07527F;', '--blue-ink:#1F2328;']],
  'play.css': [
    ['.journey-tactile-choice.selected,.statement .choice-btn.selected{border-color:#1CB0F6!important;background:#DDF4FF!important;box-shadow:0 3px 0 #1899D6!important;color:#0B5E87!important}',
      '.journey-tactile-choice.selected,.statement .choice-btn.selected{border-color:#C9A200!important;background:#FFD60A!important;box-shadow:0 3px 0 #C9A200!important;color:#1F2328!important}'],
    ['.exam-bar i{position:absolute;inset:0;border-radius:999px;background:#1CB0F6;', '.exam-bar i{position:absolute;inset:0;border-radius:999px;background:#FFD60A;'],
    ['background:#F4F0FF;border:2px solid #B9A6F5;box-shadow:0 4px 0 #B9A6F5;', 'background:#FFF5CC;border:2px solid #F0C800;box-shadow:0 4px 0 #D9B400;'],
    ['.jp-order .ui-ico{width:26px;height:26px;color:#5B3CC4;', '.jp-order .ui-ico{width:26px;height:26px;color:#1F2328;'],
  ],
  'screens.css': [
    ['.topic-bar i{display:block;height:100%;border-radius:8px;background:var(--good,#58CC02);', '.topic-bar i{display:block;height:100%;border-radius:8px;background:#FFD60A;'],
    ['.sw-bar.good i{background:var(--good,#58CC02)}', '.sw-bar.good i{background:#FFD60A}'],
    ['.ready-bar i{display:block;height:100%;border-radius:999px;background:var(--good,#58CC02);', '.ready-bar i{display:block;height:100%;border-radius:999px;background:#FFD60A;'],
    ['.pn--review .pn-btn{background:#1CB0F6;border-color:#1899D6;box-shadow:0 6px 0 #1899D6;color:#fff}', '.pn--review .pn-btn{background:#1F2328;border-color:#000;box-shadow:0 6px 0 #000;color:#FFD60A}'],
    ['background:#EEF4FF;min-width:0!important}', 'background:#F4F5F7;min-width:0!important}'],
    ['.topic-cards{color:#0A4F8F!important}', '.topic-cards{color:var(--blue-ink)!important}'],
    ['.set-row input:focus-visible + i{outline:3px solid #1CB0F6;', '.set-row input:focus-visible + i{outline:3px solid var(--blue);'],
    ['.seg input:focus-visible + span{outline:3px solid #1CB0F6;', '.seg input:focus-visible + span{outline:3px solid var(--blue);'],
    ['.acc-row input:focus-visible{outline:3px solid #1CB0F6;', '.acc-row input:focus-visible{outline:3px solid var(--blue);'],
    ['.chip--date .ui-ico{color:#0B6BA8}.chip--goal .ui-ico{color:#C2255C}', '.chip--date .ui-ico{color:#1F2328}.chip--goal .ui-ico{color:#7A6000}'],
    ['.chip--date{--chip-tile:#DDF2FD;--chip-edge:#9ED3F2;--chip-ink:#1078B5}', '.chip--date{--chip-tile:#F4F5F7;--chip-edge:#D3D6DB;--chip-ink:#1F2328}'],
    ['.chip--goal{--chip-tile:#FFE3EC;--chip-edge:#F4AFC5;--chip-ink:#C2255C}', '.chip--goal{--chip-tile:#FFF5CC;--chip-edge:#F0C800;--chip-ink:#7A6000}'],
    ['.jp-done-goal .ui-ico{color:#C2255C}', '.jp-done-goal .ui-ico{color:#7A6000}'],
  ],
  'chat.css': [
    ['.chat-bubble a{color:#0A4F8F;', '.chat-bubble a{color:var(--blue-ink);'],
    ['.chat-src{font:700 13px var(--font-display);color:#0A4F8F;', '.chat-src{font:700 13px var(--font-display);color:var(--blue-ink);'],
    ['.chat-yn button.on{border-color:#1CB0F6;background:#DDF4FF;box-shadow:0 2px 0 #1899D6;color:#0B5E87}', '.chat-yn button.on{border-color:#C9A200;background:#FFD60A;box-shadow:0 2px 0 #C9A200;color:#1F2328}'],
    ['.chat-sources a{padding:5px 10px;border-radius:999px;background:#EEF4FF;color:#0A4F8F;', '.chat-sources a{padding:5px 10px;border-radius:999px;background:#F4F5F7;color:var(--blue-ink);'],
  ],
  'order.css': [
    ['border-color:#1CB0F6;background:#F4FBFF;box-shadow:0 14px 30px -10px rgba(31,35,40,.35),0 4px 0 #1899D6;', 'border-color:#C9A200;background:#FFF5CC;box-shadow:0 14px 30px -10px rgba(31,35,40,.35),0 4px 0 #C9A200;'],
    ['.ord-item.is-drag .ord-n{background:#1CB0F6;color:#fff}', '.ord-item.is-drag .ord-n{background:#FFD60A;color:#1F2328}'],
    ['.ord-src{align-self:flex-start;font:700 13px var(--font-display);color:#0A4F8F;', '.ord-src{align-self:flex-start;font:700 13px var(--font-display);color:var(--blue-ink);'],
  ],
  'start.css': [
    ['.step-option.is-on{border-color:#1CB0F6;background:#E8F7FF;box-shadow:0 4px 0 #1899D6}', '.step-option.is-on{border-color:#C9A200;background:#FFF5CC;box-shadow:0 4px 0 #C9A200}'],
    ['.step-option.is-on small{color:#0B5E87}', '.step-option.is-on small{color:#1F2328}'],
    ['border-radius:18px;border:2px solid #1CB0F6;animation:ring-out', 'border-radius:18px;border:2px solid #C9A200;animation:ring-out'],
    ['.start-ticker span:nth-child(4n){background:#E3FAFD}', '.start-ticker span:nth-child(4n){background:#FFFFFF}'],
  ],
  'games.css': [['.judge.judge .judge__hotspot--place{background:#7DD3FC;box-shadow:0 0 0 5px rgba(125,211,252,.25),', '.judge.judge .judge__hotspot--place{background:#FFD60A;box-shadow:0 0 0 5px rgba(255,214,10,.3),']],
  'team.css': [['.team-kind input:focus-visible + span{outline:3px solid #0B6BA8;', '.team-kind input:focus-visible + span{outline:3px solid var(--blue);']],
  'styles.css': [['.step-track .current{background:var(--cyan)}', '.step-track .current{background:#FFD60A}']],
  'journey-player.css': [['background:linear-gradient(90deg,var(--cyan),var(--acid));transition:width 420ms', 'background:#FFD60A;transition:width 420ms']],
  'journey.css': [['.journey-progress-meter i{display:block;height:100%;background:linear-gradient(90deg,var(--cyan),var(--acid));', '.journey-progress-meter i{display:block;height:100%;background:#FFD60A;']],
  'mirror-hero.css': [
    ['letter-spacing:.12em;color:#0F6CA3}', 'letter-spacing:.12em;color:#7A6000}'],
    ['background:linear-gradient(180deg,#E3F1FC 0,#F3F9FE 38%,#fff 78%);', 'background:linear-gradient(180deg,#EEF0F3 0,#F6F7F9 38%,#fff 78%);'],
  ],
  'exam-visual.css': [
    ['.scene-photo-top span:first-child{color:#587326}', '.scene-photo-top span:first-child{color:#5F656D}'],
    ['margin:0;color:#4f6831;flex:1}', 'margin:0;color:#1F2328;flex:1}'],
    ['background:#f4f4f4;white-space:nowrap;color:#376831}', 'background:#f4f4f4;white-space:nowrap;color:#1F2328}'],
    ['.exam-active .choice-btn.selected{background:#f3f4f4;color:#1c2020;border-color:#bfd3d7;box-shadow:inset 0 0 0 1px rgba(191,211,215,0.25)}', `.exam-active .choice-btn.selected{${SELECTED}}`],
    ['.exam-active .choice-btn.selected:focus-visible{outline-color:#bfd3d7}', '.exam-active .choice-btn.selected:focus-visible{outline-color:var(--blue)}'],
  ],
  'voice.css': [
    ['color:#516930;cursor:pointer', 'color:#1F2328;cursor:pointer'],
    ['outline:2px solid var(--cyan,#74eee2);outline-offset:2px;background-color:rgba(116,238,226,0.102)', 'outline:2px solid #FFD60A;outline-offset:2px;background-color:rgba(255,214,10,0.14)'],
  ],
  'turn-lesson.css': [
    ['.turn-shell{--turn-lime:#7a6000;--turn-cyan:#19807f;', '.turn-shell{--turn-lime:#7a6000;--turn-cyan:#7a6000;'],
    ['rgba(125,230,229,', 'rgba(255,214,10,', 'all'],
    ['#7de6e5', '#ffd60a', 'all'],
  ],
  'app.js': [["['#FFD60A','#FFD400','#14E0F0','#FF5FA2']", "['#FFD60A','#FFD400','#FFFFFF','#1F2328']"]],
  'start.js': [
    ["['#FFD60A', '#FFD400', '#14E0F0', '#FF5FA2', '#B44CFF']", "['#FFD60A', '#FFD400', '#FFFFFF', '#1F2328', '#FFE066']"],
    ["['#FFD60A', '#58CC02', '#FFD400', '#14E0F0', '#FF5FA2', '#7B4DFF', '#FF8A00']", "['#FFD60A', '#FFFFFF', '#FFD400', '#1F2328', '#FFE066', '#C9A200', '#FF9600']"],
  ],
};

let n = 0;
for (const [file, edits] of Object.entries(EDITS)) {
  const p = join(DIST, file); let s = readFileSync(p, 'utf8');
  for (const [a, b, all] of edits) {
    if (!s.includes(a)) { if (s.includes(b)) continue; throw new Error(`${file}: not found: ${a.slice(0, 80)}`); } // already done
    s = all ? s.split(a).join(b) : s.replace(a, b); n++;
  }
  writeFileSync(p, s);
}
console.log(n, 'edits in', Object.keys(EDITS).length, 'files');
