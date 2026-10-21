// ui.js — start / pause / settings overlay for HUMAN play only.
// HARNESS TRANSPARENCY: this module is only ever loaded via a dynamic import
// in main.js that is gated on (!session && !moment && !harness). Harness boots
// never fetch this file: no DOM injected, no listeners, no localStorage reads.
//
// Visual grammar is lifted from the game's own cockpit MFDs (see moment-2):
// warm near-black glass, a LEFT-ALIGNED amber LED cluster in the panel head,
// bold warm-white type over quiet grey secondaries, amber for the live value,
// cyan reserved for data headers, and a cut corner so the panel is cockpit
// hardware rather than a web rectangle.

import { partsForStation, shipsForStation, canCommission, commissionShip, installPart, rankName, rankIndex, RANKS, careerPoints, nextRank } from './career.js';

const TITLE = 'IRIDIUM REACH';
const FRANCHISE = 'STAR TREK';
const LS_KEY = 'iridium-reach.settings';
const LS_HS = 'iridium-reach.highscore';
const S_MIN = 0.3, S_MAX = 3.0;
const pct = (v) => ((v - S_MIN) / (S_MAX - S_MIN)) * 100;
const fmt = (n) => String(Math.max(0, Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const readHighScore = () => {
  try {
    const v = parseInt(localStorage.getItem(LS_HS) || '0', 10);
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch (e) { return 0; }
};
const writeHighScore = (v) => {
  try { localStorage.setItem(LS_HS, String(Math.round(v))); } catch (e) {}
};

export function initUI(G) {
  const canvas = G.renderer.domElement;

  // ---------------- settings: load + persist ----------------
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    if (typeof s.sensitivity === 'number' && isFinite(s.sensitivity)) {
      G.settings.sensitivity = Math.min(S_MAX, Math.max(S_MIN, s.sensitivity));
    }
    if (typeof s.invertY === 'boolean') G.settings.invertY = s.invertY;
  } catch (e) { /* corrupted storage: keep defaults */ }
  const saveSettings = () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(G.settings)); } catch (e) {}
  };

  // ---------------- styles ----------------
  const style = document.createElement('style');
  style.textContent = `
#ir-ui, #ir-ui * { margin: 0; padding: 0; box-sizing: border-box; }
#ir-ui {
  position: fixed; inset: 0; z-index: 40;
  font-family: "Avenir Next", "Segoe UI", Helvetica, Arial, "DejaVu Sans Condensed", sans-serif;
  color: #f6ece0; -webkit-font-smoothing: antialiased; user-select: none;
}
/* scrim: warm, and light enough that the cockpit stays legible hardware */
/* panels are TOP-anchored, not centred: opening settings or the controls list
   grows the panel downward instead of sliding the button under the cursor */
#ir-ui .ir-layer {
  position: absolute; inset: 0; overflow: auto;
  display: flex; align-items: flex-start; justify-content: center;
  background: radial-gradient(ellipse at 50% 46%,
    rgba(10,6,3,0.30) 0%, rgba(8,5,3,0.50) 58%, rgba(4,2,1,0.66) 100%);
}
#ir-ui #ir-start { padding-top: 118px; }
#ir-ui #ir-pause { padding-top: 250px; }
/* ---- panel: cut corner, warm glass, blurred backdrop ---- */
#ir-ui .ir-panel {
  position: relative;
  background: rgba(13,11,9,0.90);
  -webkit-backdrop-filter: blur(7px) saturate(0.75);
  backdrop-filter: blur(7px) saturate(0.75);
  border: 1px solid rgba(255,206,150,0.30);
  /* hardware bezel, not a web drop shadow: hard dark edge + inner warm bevel */
  box-shadow: inset 0 1px 0 rgba(255,214,170,0.16), inset 0 0 90px rgba(0,0,0,0.5),
              0 0 0 3px rgba(6,4,3,0.55), 0 0 34px rgba(0,0,0,0.5);
  clip-path: polygon(26px 0, 100% 0, 100% calc(100% - 26px),
                     calc(100% - 26px) 100%, 0 100%, 0 26px);
  padding: 0 0 26px;
  display: flex; flex-direction: column;
}
/* panel head: amber LED cluster + label, LEFT aligned (HUD MFD grammar) */
#ir-ui .ir-head {
  display: flex; align-items: center; gap: 14px;
  padding: 11px 26px 10px 30px;
  border-bottom: 1px solid rgba(255,206,150,0.20);
  background: linear-gradient(180deg, rgba(255,168,84,0.10), rgba(255,168,84,0.0));
}
#ir-ui .ir-leds { display: flex; gap: 4px; }
#ir-ui .ir-leds i { width: 5px; height: 5px; background: #ffa23c; }
#ir-ui .ir-leds i:nth-child(4) { opacity: 0.45; }
#ir-ui .ir-leds i:nth-child(5) { opacity: 0.28; }
#ir-ui .ir-headtxt {
  font-size: 10px; font-weight: 600; letter-spacing: 0.30em;
  color: rgba(246,236,224,0.66); text-transform: uppercase;
}
#ir-ui .ir-headtxt b { color: #ffa23c; font-weight: 700; }
#ir-ui .ir-headr { margin-left: auto; font-size: 9px; letter-spacing: 0.26em; color: rgba(120,214,232,0.7); }
#ir-ui .ir-body { padding: 22px 34px 0; }
/* ---- type ---- */
/* HUD titling is heavy, warm and tightly set (see "Photon Cannon" /
   "Crimson Songbird") — match the weight and colour, not a landing-page hero */
#ir-ui .ir-title {
  text-align: center; white-space: nowrap;
  font-size: 42px; font-weight: 800; letter-spacing: 0.055em; text-indent: 0.055em;
  color: #ffd7a3; text-transform: uppercase;
  text-shadow: 0 0 24px rgba(255,150,60,0.30);
}
#ir-ui .ir-sub {
  margin-top: 9px; text-align: center;
  font-size: 10px; font-weight: 600; letter-spacing: 0.24em; text-indent: 0.24em;
  color: rgba(246,236,224,0.52); text-transform: uppercase;
}
#ir-ui .ir-pad-hint {
  margin-top: 11px; text-align: center;
  font-size: 9px; font-weight: 600; letter-spacing: 0.13em; text-indent: 0.13em;
  color: rgba(153,204,255,0.62); text-transform: uppercase;
}
#ir-ui .ir-rule {
  margin: 20px 0 18px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,206,150,0.26) 14%,
    rgba(255,206,150,0.26) 86%, transparent);
}
/* ---- control listing: fixed key column, clean left edge ---- */
#ir-ui .ir-controls {
  display: grid; grid-template-columns: 210px 1fr; gap: 9px 26px;
  align-items: center; margin: 0 auto; width: max-content;
}
#ir-ui .ir-keys { display: flex; gap: 6px; align-items: center; }
/* key chips wear the HUD's dark-tag-with-amber-dash grammar, not <kbd> */
#ir-ui .ir-key {
  position: relative; display: inline-block; min-width: 52px; text-align: center;
  border: 1px solid rgba(255,206,150,0.22); border-left: 3px solid rgba(255,162,60,0.85);
  background: rgba(0,0,0,0.45);
  padding: 4px 10px 4px 11px; font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.12em; text-indent: 0.12em;
  color: #ffe6c8; text-transform: uppercase; white-space: nowrap;
}
#ir-ui .ir-act {
  font-size: 10.5px; font-weight: 600; letter-spacing: 0.20em;
  color: rgba(246,236,224,0.80); text-transform: uppercase;
}
/* ---- one button language everywhere ---- */
#ir-ui .ir-btn {
  position: relative; display: block; width: 320px; margin: 0 auto 9px;
  padding: 12px 0 12px 18px;
  border: 1px solid rgba(255,206,150,0.30);
  background: rgba(255,206,150,0.05);
  color: #f6ece0; font-family: inherit; font-size: 11.5px; font-weight: 600;
  letter-spacing: 0.28em; text-indent: 0.28em; text-transform: uppercase;
  text-align: center; cursor: pointer;
}
#ir-ui .ir-btn i {           /* chevron sits outside the centring box */
  position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
  font-style: normal; color: #ffa23c; letter-spacing: 0;
}
#ir-ui .ir-btn:hover { border-color: rgba(255,162,60,0.85); background: rgba(255,162,60,0.13); color: #fff3e2; }
/* the 90%-case action is filled and taller — not a border tint apart */
#ir-ui .ir-btn.primary {
  border-color: rgba(255,178,86,0.95);
  background: linear-gradient(180deg, rgba(255,162,60,0.34), rgba(255,132,36,0.20));
  color: #fff3e0; font-size: 13.5px; font-weight: 700; padding: 16px 0 16px 18px;
  box-shadow: inset 0 0 24px rgba(255,150,60,0.18);
}
#ir-ui .ir-btn.primary i { color: #fff3e0; }
#ir-ui .ir-btn.primary.pulse { animation: ir-pulse 1.9s ease-in-out infinite; }
#ir-ui .ir-btn.active { border-color: rgba(255,162,60,0.85); background: rgba(255,162,60,0.18); color: #fff3e2; }
@keyframes ir-pulse { 0%,100% { border-color: rgba(255,162,60,0.75); } 50% { border-color: rgba(255,162,60,0.28); } }
#ir-ui .ir-foot {
  margin-top: 14px; text-align: center;
  font-size: 9.5px; font-weight: 600; letter-spacing: 0.24em; text-indent: 0.24em;
  color: rgba(246,236,224,0.38); text-transform: uppercase;
}
#ir-ui .ir-foot b { color: rgba(255,162,60,0.9); font-weight: 700; }
/* ---- settings ---- */
#ir-settings { width: 320px; margin: 14px auto 0; }
#ir-settings .ir-row { margin-bottom: 20px; }
#ir-settings .ir-lab {
  display: flex; justify-content: space-between; align-items: baseline;
  font-size: 10px; font-weight: 600; letter-spacing: 0.22em;
  color: rgba(246,236,224,0.72); text-transform: uppercase; margin-bottom: 9px;
}
#ir-settings .ir-lab .val { color: #ffa23c; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; }
#ir-settings .ir-rail { position: relative; }
#ir-ui input.ir-range {
  -webkit-appearance: none; appearance: none; width: 100%; height: 18px;
  background: transparent; cursor: pointer; display: block;
}
#ir-ui input.ir-range::-webkit-slider-runnable-track {
  height: 3px; background: linear-gradient(90deg, rgba(255,162,60,0.75), rgba(255,162,60,0.20));
}
#ir-ui input.ir-range::-webkit-slider-thumb {
  -webkit-appearance: none; width: 12px; height: 16px; margin-top: -7px;
  background: #ffa23c; clip-path: polygon(0 0, 100% 0, 100% 58%, 50% 100%, 0 58%);
}
#ir-ui input.ir-range::-moz-range-track { height: 3px; background: linear-gradient(90deg, rgba(255,162,60,0.75), rgba(255,162,60,0.20)); }
#ir-ui input.ir-range::-moz-range-thumb {
  width: 12px; height: 16px; border: none; border-radius: 0;
  background: #ffa23c; clip-path: polygon(0 0, 100% 0, 100% 58%, 50% 100%, 0 58%);
}
/* ticks + captions sit at their REAL values (thumb travel is inset 6px each
   side by the 12px thumb, so the scale is inset to match) */
#ir-settings .ir-scale { position: relative; height: 16px; margin: 1px 6px 0; }
#ir-settings .ir-scale span {
  position: absolute; top: 0; transform: translateX(-50%);
  font-size: 8.5px; font-weight: 600; letter-spacing: 0.1em;
  color: rgba(246,236,224,0.42); white-space: nowrap;
}
#ir-settings .ir-scale span::before {
  content: ''; position: absolute; left: 50%; top: -5px; width: 1px; height: 4px;
  background: rgba(246,236,224,0.35);
}
#ir-settings .ir-scale span.def { color: rgba(255,162,60,0.85); }
#ir-settings .ir-scale span.def::before { background: rgba(255,162,60,0.85); height: 6px; top: -7px; }
/* segmented two-state switch — the active cell is unmistakable */
#ir-ui .ir-seg { display: flex; border: 1px solid rgba(255,206,150,0.30); width: max-content; }
#ir-ui .ir-seg button {
  font-family: inherit; font-size: 10px; font-weight: 700;
  letter-spacing: 0.22em; text-indent: 0.22em; text-transform: uppercase;
  padding: 7px 20px; border: none; cursor: pointer;
  background: transparent; color: rgba(246,236,224,0.48);
}
#ir-ui .ir-seg button + button { border-left: 1px solid rgba(255,206,150,0.22); }
#ir-ui .ir-seg button.on {
  background: linear-gradient(180deg, rgba(255,162,60,0.42), rgba(255,132,36,0.26));
  color: #fff3e0; box-shadow: inset 0 0 0 1px rgba(255,178,86,0.9);
}
#ir-ui .ir-seg button:hover { color: #ffe6c8; }
#ir-ui .hidden { display: none !important; }
/* ---- game over ---- */
#ir-ui #ir-gameover { padding-top: 150px; }
/* stat listing: WHITE-first values (the in-world HUD's data grammar — white
   numbers, dim white labels, amber reserved for the record callout) */
#ir-ui .ir-stats {
  width: 330px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr auto; gap: 9px 22px;
  align-items: baseline;
}
#ir-ui .ir-stats .k {
  font-size: 10px; font-weight: 600; letter-spacing: 0.24em;
  color: rgba(246,236,224,0.55); text-transform: uppercase;
}
#ir-ui .ir-stats .v {
  font-size: 16px; font-weight: 700; letter-spacing: 0.08em;
  color: rgba(255,255,255,0.93); text-align: right;
  font-family: Futura, "Avenir Next", "Century Gothic", "Trebuchet MS", sans-serif;
}
#ir-ui .ir-stats .v.big { font-size: 27px; }
#ir-ui .ir-newrec {
  display: inline-block; margin-left: 10px; padding: 2px 7px;
  border: 1px solid rgba(255,162,60,0.85); color: #ffa23c;
  font-size: 8.5px; font-weight: 700; letter-spacing: 0.22em; text-indent: 0.22em;
  vertical-align: 3px;
}
/* ---- in-flight score readout (outside #ir-ui: lives during play) ----
   Register matches the cockpit HUD's data grammar: Futura family, WHITE-first
   values over dim white labels, a thin white rule — no web-page chrome. */
#ir-hudscore {
  position: fixed; top: 24px; right: 30px; z-index: 30;
  pointer-events: none; text-align: right; user-select: none;
  /* r9: same condensed geometric face as the repainted cockpit MFDs, so the
     score readout keeps one register with the in-world HUD */
  font-family: "Avenir Next Condensed", "Arial Narrow", "Avenir Next", "DejaVu Sans Condensed", sans-serif;
  text-shadow: 0 0 10px rgba(0,0,0,0.55);
}
#ir-hudscore .lab {
  font-size: 10px; font-weight: 700; letter-spacing: 0.34em;
  color: rgba(255,255,255,0.55);
}
#ir-hudscore .val {
  margin-top: 2px; padding-top: 3px;
  border-top: 1px solid rgba(255,255,255,0.35);
  font-size: 24px; font-weight: 700; letter-spacing: 0.10em;
  color: rgba(255,255,255,0.93);
}
#ir-hudscore .best {
  margin-top: 3px; font-size: 9px; font-weight: 600; letter-spacing: 0.22em;
  color: rgba(255,255,255,0.42);
}
#ir-hudscore .cred {
  margin-top: 7px; padding-top: 4px;
  border-top: 1px solid rgba(153,204,255,0.28);
  font-size: 10px; font-weight: 700; letter-spacing: 0.18em;
  color: rgba(153,204,255,0.92);
}
#ir-dockprompt {
  position: fixed; left: 50%; bottom: 42px; transform: translateX(-50%);
  z-index: 31; pointer-events: none; text-align: center; user-select: none;
  font-family: "Arial Narrow", "Avenir Next Condensed", "Avenir Next", "DejaVu Sans Condensed", sans-serif;
  color: #ffcc99; text-shadow: 0 0 14px rgba(0,0,0,0.9);
}
#ir-dockprompt b {
  display: block; color: #ff9c00; font-size: 11px; font-weight: 700;
  letter-spacing: 0.32em; text-indent: 0.32em; text-transform: uppercase;
}
#ir-dockprompt span {
  display: block; margin-top: 5px; padding: 6px 15px;
  border: 1px solid rgba(255,156,0,0.55); background: rgba(0,0,0,0.62);
  font-size: 10px; font-weight: 700; letter-spacing: 0.20em; text-indent: 0.20em;
  text-transform: uppercase;
}
#ir-dockprompt span i { font-style: normal; color: #99ccff; }
#ir-mission {
  position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
  z-index: 30; width: clamp(310px, 34vw, 470px); pointer-events: none; user-select: none;
  display: none; padding: 8px 15px 9px 18px;
  background: linear-gradient(180deg, rgba(0,0,0,0.78), rgba(0,0,0,0.46));
  border-top: 2px solid var(--mc, #ff9c00);
  border-left: 6px solid var(--mc, #ff9c00);
  border-radius: 0 22px 0 0;
  font-family: "Arial Narrow", "Avenir Next Condensed", "Avenir Next", "DejaVu Sans Condensed", sans-serif;
  color: #ffcc99; text-shadow: 0 0 12px rgba(0,0,0,0.85);
}
#ir-mission[data-type="combat"] { --mc: #ff9c00; }
#ir-mission[data-type="diplomacy"] { --mc: #cc99cc; }
#ir-mission[data-type="relief"] { --mc: #ffb15c; }
#ir-mission[data-type="science"] { --mc: #66e6ff; }
#ir-mission .m-head { display: flex; align-items: center; gap: 8px; }
#ir-mission .m-kind {
  padding: 2px 7px 2px 8px; background: var(--mc, #ff9c00); color: #000;
  font-size: 9px; font-weight: 700; letter-spacing: 0.20em; text-indent: 0.20em;
  text-transform: uppercase;
}
#ir-mission .m-num { margin-left: auto; font-size: 8.5px; font-weight: 700; letter-spacing: 0.24em; color: #99ccff; }
#ir-mission .m-title { margin-top: 5px; font-size: 17px; font-weight: 700; letter-spacing: 0.10em; color: #ffd7a3; text-transform: uppercase; }
#ir-mission .m-obj { margin-top: 2px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.09em; color: #99ccff; text-transform: uppercase; }
#ir-mission .m-bar { height: 3px; margin-top: 8px; background: rgba(255,255,255,0.12); overflow: hidden; }
#ir-mission .m-bar i { display: block; width: 0; height: 100%; background: var(--mc, #ff9c00); box-shadow: 0 0 8px var(--mc, #ff9c00); transition: width 120ms linear; }
#ir-mission .m-hint { margin-top: 5px; min-height: 12px; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; color: rgba(255,204,153,0.72); text-transform: uppercase; }
#ir-mission.mission-warning .m-hint { color: #ff6a4a; }
#ir-mission.mission-complete { border-top-color: #9dffd6; border-left-color: #9dffd6; }
#ir-mission.mission-complete .m-title { color: #d6ffed; }
#ir-mission .m-foot {
  display: flex; justify-content: space-between; gap: 12px;
  margin-top: 6px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.14);
  font-size: 8.5px; font-weight: 700; letter-spacing: 0.16em; color: rgba(153,204,255,0.75);
  text-transform: uppercase;
}
#ir-mission .m-reward { color: rgba(255,204,153,0.65); text-align: right; }
#ir-missionprompt {
  position: fixed; left: 50%; bottom: 58px; transform: translateX(-50%);
  z-index: 31; pointer-events: none; text-align: center; user-select: none;
  display: none;
  font-family: "Arial Narrow", "Avenir Next Condensed", "Avenir Next", "DejaVu Sans Condensed", sans-serif;
  color: #ffcc99; text-shadow: 0 0 14px rgba(0,0,0,0.9);
}
#ir-missionprompt b {
  display: block; color: #99ccff; font-size: 10px; font-weight: 700;
  letter-spacing: 0.24em; text-indent: 0.24em; text-transform: uppercase;
}
#ir-missionprompt span {
  display: block; margin-top: 5px; padding: 6px 15px;
  border: 1px solid rgba(153,204,255,0.55); background: rgba(0,0,0,0.62);
  font-size: 10px; font-weight: 700; letter-spacing: 0.20em; text-indent: 0.20em;
  text-transform: uppercase;
}
#ir-missionprompt span i { font-style: normal; color: #ff9c00; }
#ir-ui #ir-dock { padding-top: 92px; }
#ir-ui .ir-wallet {
  display: flex; align-items: baseline; justify-content: space-between;
  width: 100%; padding: 10px 16px; margin-bottom: 12px;
  border-left: 6px solid #99ccff; background: rgba(153,204,255,0.08);
  font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
  color: #99ccff;
}
#ir-ui .ir-wallet b { font-size: 22px; letter-spacing: 0.08em; color: #ffcc99; }
#ir-ui .ir-shop { display: flex; flex-direction: column; gap: 8px; }
#ir-ui #ir-dock .ir-body { max-height: calc(100vh - 220px); overflow-y: auto; padding-right: 8px; }
#ir-ui .ir-dock-sec { margin-top: 12px; }
#ir-ui .ir-dock-sec h4 {
  margin: 0 0 6px; padding-bottom: 4px; border-bottom: 1px solid rgba(153,204,255,0.35);
  font-size: 9px; font-weight: 700; letter-spacing: 0.28em; color: #99ccff; text-transform: uppercase;
}
#ir-ui .ir-brief {
  margin-top: 10px; padding: 9px 12px; border-left: 5px solid #99ccff;
  background: rgba(153,204,255,0.08); font-size: 9px; font-weight: 700;
  letter-spacing: 0.14em; line-height: 1.45; color: rgba(255,204,153,0.82); text-transform: uppercase;
}
#ir-ui .ir-item {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 12px 10px 16px; border-left: 5px solid #ff9c00;
  background: rgba(255,156,0,0.07);
}
#ir-ui .ir-item.off { opacity: 0.46; border-left-color: #555; }
#ir-ui .ir-item.focus { outline: 2px solid #99ccff; outline-offset: 1px; background: rgba(153,204,255,0.12); }
#ir-ui .ir-item.focus .ir-buy { background: #99ccff; color: #000; }
#ir-ui .ir-item .ir-copy { flex: 1; min-width: 0; }
#ir-ui .ir-item .ir-name {
  font-size: 13px; font-weight: 700; letter-spacing: 0.10em;
  color: #ffcc99; text-transform: uppercase;
}
#ir-ui .ir-item .ir-desc {
  margin-top: 3px; font-size: 9px; font-weight: 600; letter-spacing: 0.16em;
  color: rgba(153,204,255,0.78); text-transform: uppercase;
}
#ir-ui .ir-item .ir-buy {
  min-width: 108px; padding: 9px 12px; border: 0; border-radius: 0 18px 18px 0;
  background: #ff9c00; color: #000; cursor: pointer;
  font-family: inherit; font-size: 11px; font-weight: 700;
  letter-spacing: 0.10em; text-transform: uppercase;
}
#ir-ui .ir-item .ir-buy:disabled { background: #333; color: #777; cursor: default; }
#ir-ui .ir-item .ir-buy:not(:disabled):hover { background: #ffcc99; }
#ir-ui .ir-wallet.poor b { color: #ff6a4a; }
`;
  document.head.appendChild(style);

  // ---------------- LCARS skin ----------------
  // The base sheet above keeps all layout behaviour; this layer re-skins it
  // with the Starfleet LCARS grammar: black glass, signal-orange caps and
  // rails, peach type, lavender/blue data accents.
  const lcars = document.createElement('style');
  lcars.textContent = `
#ir-ui { font-family: "Arial Narrow", "Avenir Next Condensed", "Avenir Next", "DejaVu Sans Condensed", sans-serif; color: #ffcc99; }
#ir-ui .ir-layer { background: radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.62) 58%, rgba(0,0,0,0.82) 100%); }
#ir-ui .ir-panel { background: #000; border: 0; border-radius: 0 48px 0 0; box-shadow: 0 0 0 2px #ff9c00, 0 0 42px rgba(0,0,0,0.85); clip-path: none; padding-bottom: 26px; overflow: hidden; }
#ir-ui .ir-panel::before { content: ''; position: absolute; left: 0; top: 52px; bottom: 26px; width: 10px; background: #ff9c00; pointer-events: none; }
#ir-ui .ir-head { background: #ff9c00; border-bottom: 0; border-radius: 0 42px 0 0; padding: 10px 26px 10px 34px; }
#ir-ui .ir-headtxt, #ir-ui .ir-headtxt b { color: #000; }
#ir-ui .ir-headr { color: #000; opacity: 0.72; }
#ir-ui .ir-leds i { background: #000; }
#ir-ui .ir-leds i:nth-child(n+4) { opacity: 0.35; }
#ir-ui .ir-body { padding: 26px 34px 0; }
#ir-ui .ir-eyebrow { margin-bottom: 7px; font-size: 9px; font-weight: 700; letter-spacing: 0.42em; text-indent: 0.42em; color: #99ccff; text-transform: uppercase; }
#ir-ui .ir-title { text-align: left; color: #ffcc99; font-size: 48px; letter-spacing: 0.05em; text-indent: 0; text-shadow: none; }
#ir-ui .ir-sub { margin-top: 8px; text-align: left; color: #99ccff; letter-spacing: 0.20em; text-indent: 0.20em; }
#ir-ui .ir-rule { height: 2px; margin: 20px 0 18px; background: linear-gradient(90deg, #ff9c00 0 28%, #cc99cc 28% 55%, #99ccff 55% 72%, transparent 72%); opacity: 0.9; }
#ir-ui .ir-btn { width: 100%; border: 0; border-radius: 0 28px 28px 0; background: #ff9c00; color: #000; text-align: left; padding: 11px 18px 11px 44px; font-weight: 700; }
#ir-ui .ir-btn i { color: #000; left: 18px; }
#ir-ui .ir-btn:hover { background: #ffcc99; color: #000; }
#ir-ui .ir-btn.primary { background: #cc99cc; color: #000; border: 0; box-shadow: none; font-size: 13px; padding: 16px 18px 16px 44px; }
#ir-ui .ir-btn.primary i, #ir-ui .ir-btn.primary.pulse i { color: #000; }
#ir-ui .ir-btn.primary.pulse { animation: none; }
#ir-ui .ir-btn.active { background: #99ccff; color: #000; border: 0; }
#ir-ui .ir-key { border: 0; border-left: 5px solid #ff9c00; background: #111; color: #99ccff; border-radius: 0 12px 12px 0; }
#ir-ui .ir-act { color: #ffcc99; }
#ir-ui .ir-foot { color: rgba(255,204,153,0.45); }
#ir-ui .ir-foot b { color: #ff9c00; }
#ir-ui .ir-lab { color: #99ccff; }
#ir-ui .ir-lab .val { color: #ff9c00; }
#ir-ui input.ir-range::-webkit-slider-runnable-track { height: 4px; background: linear-gradient(90deg, #ff9c00, #cc99cc); }
#ir-ui input.ir-range::-webkit-slider-thumb { background: #ff9c00; }
#ir-ui input.ir-range::-moz-range-track { height: 4px; background: linear-gradient(90deg, #ff9c00, #cc99cc); }
#ir-ui input.ir-range::-moz-range-thumb { background: #ff9c00; }
#ir-ui .ir-seg { border: 0; background: #111; border-radius: 0 18px 18px 0; overflow: hidden; }
#ir-ui .ir-seg button { color: #99ccff; }
#ir-ui .ir-seg button + button { border-left: 1px solid #333; }
#ir-ui .ir-seg button.on { background: #99ccff; color: #000; box-shadow: none; }
#ir-ui .ir-stats .k { color: #99ccff; }
#ir-ui .ir-stats .v { color: #ffcc99; font-family: "Arial Narrow", "Avenir Next Condensed", "DejaVu Sans Condensed", sans-serif; }
#ir-ui .ir-newrec { border: 0; background: #ff9c00; color: #000; border-radius: 0 10px 10px 0; }
#ir-hudscore { font-family: "Arial Narrow", "Avenir Next Condensed", "DejaVu Sans Condensed", sans-serif; }
#ir-hudscore .lab { color: #ff9c00; }
#ir-hudscore .val { color: #ffcc99; border-top-color: #ff9c00; }
#ir-hudscore .best { color: #99ccff; }
#ir-hudscore .cred { color: #99ccff; border-top-color: rgba(153,204,255,0.35); }
#ir-ui .ir-wallet { background: #111; border-left-color: #99ccff; }
#ir-ui .ir-wallet b { color: #ff9c00; }
#ir-ui .ir-wallet.poor b { color: #ff5a3c; }
#ir-ui .ir-item { background: #111; border-left-color: #ff9c00; }
#ir-ui .ir-item .ir-name { color: #ffcc99; }
#ir-ui .ir-item .ir-desc { color: #99ccff; }
#ir-ui .ir-item .ir-buy { background: #ff9c00; color: #000; flex-shrink: 0; }
#ir-ui .ir-item .ir-buy:disabled { background: #222; color: #666; }
#ir-ui #ir-dock .ir-eyebrow { letter-spacing: 0.28em; text-indent: 0.28em; }
#ir-ui #ir-dock .ir-sub { letter-spacing: 0.14em; text-indent: 0.14em; }
#ir-ui #ir-dock .ir-item .ir-name { letter-spacing: 0.07em; }
#ir-ui #ir-dock .ir-item .ir-desc { letter-spacing: 0.08em; line-height: 1.3; }
`;
  document.head.appendChild(lcars);

  // ---------------- DOM ----------------
  const root = document.createElement('div');
  root.id = 'ir-ui';
  const head = (label, right) => `<div class="ir-head">
      <span class="ir-leds"><i></i><i></i><i></i><i></i><i></i></span>
      <span class="ir-headtxt">${label}</span>
      <span class="ir-headr">${right}</span>
    </div>`;
  const key = (k) => `<span class="ir-key">${k}</span>`;
  const controlRows = [
    [key('MOUSE') + key('HOLD LMB'), 'STEER &nbsp;&middot;&nbsp; PHASERS'],
    [key('RMB') + key('Q'), 'PHOTON TORPEDO'],
    [key('W') + key('S'), 'IMPULSE &nbsp;&middot;&nbsp; BRAKE'],
    [key('A') + key('D'), 'ROLL'],
    [key('ARROW KEYS'), 'PITCH &nbsp;&middot;&nbsp; YAW'],
    [key('SHIFT'), 'IMPULSE BOOST'],
    [key('SPACE') + key('CTRL'), 'BRAKE-TURN'],
    [key('F'), 'PHASERS'],
    [key('E'), 'MISSION ACTION &middot; DOCK AT SAFE HAVEN'],
    [key('J'), 'JUMP FROM SAFE HAVEN'],
    [key('ESC'), 'PAUSE'],
  ].map(([k, a]) => `<div class="ir-keys">${k}</div><div class="ir-act">${a}</div>`).join('');

  root.innerHTML = `
  <div class="ir-layer hidden" id="ir-start">
    <div class="ir-panel" style="width:690px">
      ${head('<b>&#9632;</b> STARFLEET COMMAND &middot; MAIN BRIDGE', 'LCARS 47')}
      <div class="ir-body">
        <div class="ir-eyebrow">${FRANCHISE} &middot; FAN TECH DEMO</div>
        <div class="ir-title">${TITLE}</div>
        <div class="ir-sub" id="ir-shipline"></div>
        <div class="ir-sub" id="ir-bestline" style="margin-top:5px"></div>
        <div class="ir-rule"></div>
        <div class="ir-controls">${controlRows}</div>
        <div class="ir-pad-hint">XBOX PAD &middot; STICKS FLY &middot; RT/LT FIRE &middot; A INTERACT / DOCK &middot; Y JUMP &middot; START PAUSE</div>
        <div class="ir-rule"></div>
        <button class="ir-btn primary pulse" id="ir-fly"><i>&#8250;&#8250;</i>TAKE THE CONN</button>
        <button class="ir-btn" id="ir-start-set"><i>&#8250;&#8250;</i>SHIP SETTINGS</button>
        <div id="ir-start-settings-host"></div>
        <div class="ir-foot">CLICK THE CANOPY TO ENGAGE &middot; <b>ESC</b> HOLDS THE BRIDGE</div>
      </div>
    </div>
  </div>
  <div class="ir-layer hidden" id="ir-pause">
    <div class="ir-panel" style="width:470px">
      ${head('<b>&#9632;</b> STARFLEET COMMAND &middot; BRIDGE HOLD', 'HOLD')}
      <div class="ir-body">
        <div class="ir-title" style="font-size:32px">MAIN BRIDGE HOLD</div>
        <div class="ir-sub">SIMULATION SUSPENDED</div>
        <div class="ir-rule"></div>
        <button class="ir-btn primary" id="ir-resume"><i>&#8250;&#8250;</i>RESUME CONN</button>
        <button class="ir-btn" id="ir-settings-btn"><i>&#8250;&#8250;</i>SHIP SETTINGS</button>
        <button class="ir-btn" id="ir-ctl-btn"><i>&#8250;&#8250;</i>CONTROLS</button>
        <div id="ir-pause-settings-host"></div>
        <div class="ir-controls hidden" id="ir-pause-controls" style="margin-top:16px">${controlRows}</div>
        <div class="ir-foot"><b>START</b> OR <b>ESC</b> RESUMES AND RE-ENGAGES THE CONN</div>
      </div>
    </div>
  </div>
  <div class="ir-layer hidden" id="ir-dock">
    <div class="ir-panel" style="width:620px">
      ${head('<b>&#9632;</b> STARFLEET COMMAND &middot; PORT AUTHORITY', 'SAFE')}
      <div class="ir-body">
        <div class="ir-eyebrow" id="ir-dock-kind">DEEP SPACE PORT</div>
        <div class="ir-title" style="font-size:34px" id="ir-dock-name">SAFE HAVEN</div>
        <div class="ir-sub" id="ir-dock-sub">NO HOSTILES &middot; REPAIR AND REQUISITION</div>
        <div class="ir-rule"></div>
        <div class="ir-wallet" id="ir-dock-wallet"><span>REQUISITION CREDITS</span><b id="ir-dock-credits">0</b></div>
        <div class="ir-brief" id="ir-dock-brief"></div>
        <div class="ir-dock-sec hidden" id="ir-dock-assign-sec"><h4>ASSIGNMENT BOARD</h4><div class="ir-shop" id="ir-dock-offers"></div></div>
        <div class="ir-dock-sec hidden" id="ir-dock-parts-sec"><h4>STARBASE REQUISITIONS</h4><div class="ir-shop" id="ir-dock-parts"></div></div>
        <div class="ir-dock-sec hidden" id="ir-dock-ships-sec"><h4>SHIPYARD</h4><div class="ir-shop" id="ir-dock-ships"></div></div>
        <div class="ir-dock-sec hidden" id="ir-dock-nav-sec"><h4>NAVIGATION · SELECT COURSE</h4><div class="ir-shop" id="ir-dock-nav"></div></div>
        <div class="ir-dock-sec"><h4>PORT SERVICES</h4><div class="ir-shop" id="ir-dock-shop"></div></div>
        <div class="ir-rule"></div>
        <button class="ir-btn primary" id="ir-dock-depart"><i>&#8250;&#8250;</i>DEPART &middot; JUMP TO COURSE</button>
        <button class="ir-btn" id="ir-dock-undock"><i>&#8250;&#8250;</i>RETURN TO CONN</button>
        <div class="ir-foot"><b>A / ENTER</b> BUY &middot; <b>B / ESC</b> RETURN &middot; <b>Y</b> DEPART</div>
      </div>
    </div>
  </div>
  <div class="ir-layer hidden" id="ir-gameover">
    <div class="ir-panel" style="width:520px">
      ${head('<b>&#9632;</b> STARFLEET COMMAND &middot; FINAL', 'LOST')}
      <div class="ir-body">
        <div class="ir-title" style="font-size:32px">VESSEL LOST</div>
        <div class="ir-sub" id="ir-go-shipline">HULL INTEGRITY ZERO</div>
        <div class="ir-rule"></div>
        <div class="ir-stats">
          <span class="k">FINAL SCORE</span><span class="v big" id="ir-go-score">0</span>
          <span class="k">BEST SCORE<span class="ir-newrec hidden" id="ir-go-newrec">NEW RECORD</span></span><span class="v" id="ir-go-best">0</span>
          <span class="k">ENGAGEMENTS WON</span><span class="v" id="ir-go-waves">0</span>
          <span class="k">SECTORS VISITED</span><span class="v" id="ir-go-systems">1</span>
          <span class="k">HOSTILES DESTROYED</span><span class="v" id="ir-go-kills">0</span>
        </div>
        <div class="ir-rule"></div>
        <button class="ir-btn primary" id="ir-restart"><i>&#8250;&#8250;</i>RELAUNCH</button>
        <div class="ir-foot"><b>R</b> OR <b>A / START</b> RELAUNCHES THE VESSEL</div>
      </div>
    </div>
  </div>`;
  document.body.appendChild(root);

  // in-flight score readout — separate node so it lives OUTSIDE the overlay
  // root (visible during play, pointer-transparent, killed with the layer)
  const scoreHud = document.createElement('div');
  scoreHud.id = 'ir-hudscore';
  scoreHud.innerHTML = '<div class="lab">STARFLEET SCORE</div><div class="val">0</div><div class="best"></div><div class="cred">REQ 0</div>';
  scoreHud.style.display = 'none';
  document.body.appendChild(scoreHud);

  const dockPrompt = document.createElement('div');
  dockPrompt.id = 'ir-dockprompt';
  dockPrompt.style.display = 'none';
  document.body.appendChild(dockPrompt);

  const missionCard = document.createElement('div');
  missionCard.id = 'ir-mission';
  missionCard.innerHTML = `
    <div class="m-head"><span class="m-kind"></span><span class="m-num"></span></div>
    <div class="m-title"></div>
    <div class="m-obj"></div>
    <div class="m-bar"><i></i></div>
    <div class="m-hint"></div>
    <div class="m-foot"><span class="m-range"></span><span class="m-reward"></span></div>`;
  document.body.appendChild(missionCard);

  const missionPrompt = document.createElement('div');
  missionPrompt.id = 'ir-missionprompt';
  missionPrompt.style.display = 'none';
  document.body.appendChild(missionPrompt);

  const mKind = missionCard.querySelector('.m-kind');
  const mNum = missionCard.querySelector('.m-num');
  const mTitle = missionCard.querySelector('.m-title');
  const mObj = missionCard.querySelector('.m-obj');
  const mBar = missionCard.querySelector('.m-bar i');
  const mHint = missionCard.querySelector('.m-hint');
  const mRange = missionCard.querySelector('.m-range');
  const mReward = missionCard.querySelector('.m-reward');
  const MISSION_KINDS = { combat: 'PATROL', diplomacy: 'DIPLOMACY', relief: 'RELIEF', science: 'SCIENCE' };

  // settings block — one node, hosted by whichever overlay is open
  const settingsEl = document.createElement('div');
  settingsEl.id = 'ir-settings';
  settingsEl.className = 'hidden';
  settingsEl.innerHTML = `
    <div class="ir-row">
      <div class="ir-lab"><span>STICK SENSITIVITY</span><span class="val" id="ir-sens-val"></span></div>
      <div class="ir-rail">
        <input class="ir-range" id="ir-sens" type="range" min="${S_MIN}" max="${S_MAX}" step="0.05">
        <div class="ir-scale">
          <span style="left:${pct(0.3)}%">0.3&times;</span>
          <span class="def" style="left:${pct(1.0)}%">1.0&times;</span>
          <span style="left:${pct(2.0)}%">2.0&times;</span>
          <span style="left:${pct(3.0)}%">3.0&times;</span>
        </div>
      </div>
    </div>
    <div class="ir-row">
      <div class="ir-lab"><span>INVERT Y AXIS</span></div>
      <div class="ir-seg" id="ir-invert">
        <button type="button" data-v="0">OFF</button><button type="button" data-v="1">ON</button>
      </div>
    </div>`;

  const el = (id) => root.querySelector('#' + id);
  const startLayer = el('ir-start');
  const pauseLayer = el('ir-pause');
  const dockLayer = el('ir-dock');
  const pauseControls = el('ir-pause-controls');
  const dockShop = el('ir-dock-shop');
  const dockCredits = el('ir-dock-credits');
  const dockWallet = el('ir-dock-wallet');
  const dockKind = el('ir-dock-kind');
  const dockName = el('ir-dock-name');
  const dockSub = el('ir-dock-sub');
  const sens = settingsEl.querySelector('#ir-sens');
  const sensVal = settingsEl.querySelector('#ir-sens-val');
  const segBtns = settingsEl.querySelectorAll('#ir-invert button');

  const SHOP_ITEMS = [
    {
      id: 'hull',
      name: 'HULL PATCH',
      desc: () => 'RESTORE 40 HULL INTEGRITY',
      cost: 120,
      can: () => G.player.hull < 99.9,
      buy: () => { G.player.hull = Math.min(100, G.player.hull + 40); },
    },
    {
      id: 'shield',
      name: 'SHIELD RECHARGE',
      desc: () => 'RESTORE SHIELDS TO FULL',
      cost: 80,
      can: () => G.player.shield < 99.9,
      buy: () => { G.player.shield = 100; },
    },
    {
      id: 'torpedo',
      name: 'TORPEDO SYSTEM',
      desc: () => {
        const next = Math.max(1.6, 3.2 - G.player.torpedoLevel * 0.4);
        const dmg = Math.round((1 + G.player.torpedoLevel * 0.25) * 100);
        return `RELOAD ${next.toFixed(1)}s \u00b7 WARHEAD ${dmg}%`;
      },
      cost: 320,
      can: () => G.player.torpedoLevel < 4,
      buy: () => G.flight.upgradeTorpedo(),
    },
    {
      id: 'phaser',
      name: 'PHASER CALIBRATION',
      desc: () => {
        const now = Math.round(G.player.phaserDamageMul * 100);
        const next = Math.round((G.player.phaserDamageMul + 0.15) * 100);
        return `ARRAY OUTPUT ${now}% \u2192 ${next}% \u00b7 +15% DAMAGE`;
      },
      cost: 320,
      can: () => G.player.phaserCalibration < 4,
      buy: () => G.flight.calibratePhasers(),
    },
  ];

  // in-fiction context line from the game's own procedural names
  el('ir-shipline').textContent =
    `${G.names.ship} · ${G.names.shipClass} CLASS · ${rankName(G)} · ${G.names.system}`.toUpperCase();
  // persistent flight record (localStorage high score)
  const bootHS = readHighScore();
  el('ir-bestline').textContent = bootHS > 0 ? `BEST STARFLEET RECORD ${fmt(bootHS)}` : 'NO FLIGHT RECORD ON FILE';
  const hudBest = scoreHud.querySelector('.best');
  const hudVal = scoreHud.querySelector('.val');
  if (bootHS > 0) hudBest.textContent = `BEST ${fmt(bootHS)}`;
  startLayer.classList.remove('hidden');

  // score readout refresh — cheap poll; DOM only touched on change.
  // r10: the visibility flip is a FUNCTION the state transitions call
  // directly. r9 left it to the 150ms poll alone, so the in-flight score
  // readout was still painted over the game-over panel when a check looked
  // (hudGone: false) — a poll race dressed as a layout bug.
  let shownScore = -1;
  let shownCredits = -1;
  const hudCred = scoreHud.querySelector('.cred');
  const paintScoreHud = () => {
    const flying = G.uiState === 'running';
    if (scoreHud.style.display !== (flying ? 'block' : 'none')) {
      scoreHud.style.display = flying ? 'block' : 'none';
    }
    if (!flying) return;
    const sc = G.telemetryData.score;
    if (sc !== shownScore) { shownScore = sc; hudVal.textContent = fmt(sc); }
    const cr = Math.max(0, Math.round(G.player.credits || 0));
    if (cr !== shownCredits) { shownCredits = cr; hudCred.textContent = `REQ ${fmt(cr)}`; }
  };

  const paintDockPrompt = () => {
    const safe = G.safeSystem && G.mode === 'space' && G.uiState === 'running';
    if (!safe) { dockPrompt.style.display = 'none'; return; }
    if (G.missions && G.missions.active && G.missions.canInteract) {
      dockPrompt.style.display = 'none';
      return;
    }
    const station = G.station;
    const near = station && station.canDock();
    const dist = station ? station.nearest() : Infinity;
    dockPrompt.style.display = 'block';
    const label = station ? station.label : 'SAFE HAVEN';
    const planet = station ? station.planetName : '';
    dockPrompt.innerHTML = near
      ? `<b>SAFE HAVEN</b><span><i>E</i> / <i>A</i> DOCK AT ${label} &middot; <i>J</i> / <i>Y</i> JUMP</span>`
      : `<b>FRIENDLY SPACE</b><span>${planet ? planet + ' &middot; ' : ''}NO HOSTILES &middot; <i>J</i> / <i>Y</i> JUMP${dist < 3200 ? ' &middot; APPROACH TO DOCK' : ''}</span>`;
  };
  function paintMission() {
    const m = G.missions;
    const flying = G.uiState === 'running' && G.mode === 'space' && m && m.active;
    if (!flying) {
      missionCard.style.display = 'none';
      missionPrompt.style.display = 'none';
      return;
    }
    missionCard.style.display = 'block';
    missionCard.dataset.type = m.type || 'combat';
    missionCard.classList.toggle('mission-complete', !!m.completed);
    missionCard.classList.toggle('mission-warning', /WEAPONS HOT|TOO CLOSE|OUT OF/i.test(m.hint || ''));
    mKind.textContent = MISSION_KINDS[m.type] || 'MISSION';
    mNum.textContent = `MISSION ${String(m.sequence || 1).padStart(2, '0')}`;
    mTitle.textContent = m.title || '';
    mObj.textContent = m.objective || '';
    mBar.style.width = `${Math.round((m.progress || 0) * 100)}%`;
    mHint.textContent = m.hint || '';
    mRange.textContent = m.progressLabel || (m.distance ? `RANGE ${m.distance}u` : '');
    mReward.textContent = m.rewardText || '';
    if (m.canInteract && !m.completed) {
      missionPrompt.style.display = 'block';
      missionPrompt.innerHTML = `<b>${m.targetName || 'CONTACT'}</b><span><i>E</i> / <i>A</i> ${m.prompt || 'INTERACT'}</span>`;
    } else {
      missionPrompt.style.display = 'none';
    }
  }

  setInterval(() => { paintScoreHud(); paintDockPrompt(); paintMission(); }, 150);

  // ---------------- settings widgets ----------------
  function paintSettings() {
    sens.value = String(G.settings.sensitivity);
    sensVal.textContent = G.settings.sensitivity.toFixed(2) + '×';
    segBtns.forEach((b) => b.classList.toggle('on', (b.dataset.v === '1') === G.settings.invertY));
  }
  sens.addEventListener('input', () => {
    G.settings.sensitivity = Math.min(S_MAX, Math.max(S_MIN, parseFloat(sens.value) || 1));
    paintSettings();
    saveSettings();
  });
  segBtns.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    G.settings.invertY = b.dataset.v === '1';
    paintSettings();
    saveSettings();
  }));
  paintSettings();

  const settingsBtnFor = { 'ir-start-settings-host': 'ir-start-set', 'ir-pause-settings-host': 'ir-settings-btn' };
  let settingsOpenBtn = null;
  function openSettings(hostId) {
    el(hostId).appendChild(settingsEl);
    settingsEl.classList.remove('hidden');
    settingsOpenBtn = el(settingsBtnFor[hostId]);
    settingsOpenBtn.classList.add('active');
  }
  function closeSettings() {
    settingsEl.classList.add('hidden');
    if (settingsOpenBtn) settingsOpenBtn.classList.remove('active');
    settingsOpenBtn = null;
  }
  function toggleSettings(hostId) {
    if (settingsEl.classList.contains('hidden')) openSettings(hostId);
    else closeSettings();
  }
  settingsEl.addEventListener('click', (e) => e.stopPropagation());

  // ---------------- pointer lock helpers ----------------
  // Chrome imposes a short lockout after an Esc-initiated exit and requires a
  // fresh gesture; a rejected request is normal, and the canvas mousedown
  // handler in main.js re-requests on the player's next click. Headless has no
  // real lock at all — the game must run either way, so failures are silent.
  function tryLock() {
    try {
      const p = canvas.requestPointerLock && canvas.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }

  // ---------------- state machine ----------------
  let pausedAt = 0;

  function start() {
    if (G.uiState !== 'start') return;
    G.uiState = 'running';
    G.uiHold = false;
    startLayer.classList.add('hidden');
    closeSettings();
    paintScoreHud();  // readout up on the same frame as the launch
    paintMission();
    G.post.whiteout = 1; // arrival-style fade into flight (game's own grammar)
    tryLock();           // audio unlocks itself off this same click (audio.js)
    // r15 game-start. THIS IS THE GESTURE THAT UNLOCKS AUDIO — the pointerdown
    // listener in audio.js fires on the same click and creates the
    // AudioContext, then kicks voice.load(). So this play() lands before a
    // single clip is decoded, which is exactly the race voice.js's
    // startNow() handles: it awaits that one clip and replays the request if
    // it is still fresh. Any browser autoplay block is therefore moot — we
    // are inside a user gesture by construction.
    if (G.audio && G.audio.say) G.audio.say('game-start');
  }

  function pause() {
    if (G.uiState !== 'running') return;
    G.uiState = 'paused';
    G.uiHold = true;
    pausedAt = performance.now();
    closeSettings();
    pauseControls.classList.add('hidden');
    el('ir-ctl-btn').classList.remove('active');
    paintScoreHud();  // readout down with the sim, not 150ms later
    paintMission();
    pauseLayer.classList.remove('hidden');
    // klaxon runs on a wall-clock interval — silence it while the sim holds
    if (G.audio && G.audio.klaxonOff) G.audio.klaxonOff();
    if (document.pointerLockElement === canvas && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  function resume() {
    if (G.uiState !== 'paused') return;
    G.uiState = 'running';
    G.uiHold = false;
    closeSettings();
    pauseLayer.classList.add('hidden');
    paintScoreHud();
    paintMission();
    if (G.state === 'red-alert' && G.audio && G.audio.klaxonOn) G.audio.klaxonOn();
    tryLock();
  }

  // ---------------- safe haven / port ----------------
  let dockFocus = 0;
  let dockActions = [];
  const dockBrief = el('ir-dock-brief');
  const dockOffers = el('ir-dock-offers');
  const dockParts = el('ir-dock-parts');
  const dockShips = el('ir-dock-ships');
  const dockNav = el('ir-dock-nav');
  const dockAssignSec = el('ir-dock-assign-sec');
  const dockPartsSec = el('ir-dock-parts-sec');
  const dockShipsSec = el('ir-dock-ships-sec');
  const dockNavSec = el('ir-dock-nav-sec');

  function spendCredits(cost) {
    const credits = Math.max(0, Math.round(G.player.credits || 0));
    if (credits < cost) return false;
    G.player.credits = credits - cost;
    G.telemetryData.credits = G.player.credits;
    G.telemetryData.creditsSpent += cost;
    return true;
  }

  function buildDockActions() {
    const credits = Math.max(0, Math.round(G.player.credits || 0));
    const m = G.missions;
    const rank = rankIndex(G);
    const groups = { debrief: [], offers: [], parts: [], ships: [], nav: [], services: [] };

    if (m && m.contract && m.contract.status === 'debrief' && m.contract.issuerSystem === G.systemIndex) {
      groups.debrief.push({
        kind: 'debrief', name: 'CLOSE ASSIGNMENT', cost: 0, ready: true,
        desc: `${m.contract.title} · ${m.contract.stages.length} STAGES COMPLETE`,
        label: `+${fmt(m.contract.score)} SCORE · +${fmt(m.contract.credits)} CR`,
      });
    }

    if (m && !m.contract) {
      for (let i = 0; i < m.offers.length; i++) {
        const off = m.offers[i];
        groups.offers.push({
          kind: 'offer', index: i, name: off.title, cost: 0, ready: true,
          desc: `${off.blurb} · ${off.targetNames.join(' > ')} · +${fmt(off.score)} SCORE · +${fmt(off.credits)} CR`,
          label: 'ACCEPT',
        });
      }
    }

    for (const part of partsForStation(G)) {
      groups.parts.push({
        kind: 'part', id: part.id, name: part.name, desc: part.desc,
        cost: part.cost, ready: credits >= part.cost, label: `${fmt(part.cost)} CR`,
      });
    }

    for (const def of shipsForStation(G)) {
      const owned = G.career && G.career.ownedShips.has(def.id);
      const rankOk = def.minRank <= rank;
      const cost = owned ? 0 : def.cost;
      groups.ships.push({
        kind: 'ship', id: def.id,
        name: `${def.name} · ${def.className}`,
        desc: owned ? 'OWNED · READY TO RECOMMISSION' : def.blurb,
        cost, ready: canCommission(G, def.id) && (owned || credits >= cost),
        label: !rankOk ? `RANK ${RANKS[def.minRank].name}` : `${fmt(cost)} CR`,
      });
    }

    if (!m || !m.contract) {
      const seen = new Set();
      for (const delta of [-2, -1, 1, 2, 3]) {
        const sys = G.systemIndex + delta;
        if (sys < 0 || sys === G.systemIndex || seen.has(sys)) continue;
        seen.add(sys);
        const rec = G.ensureSystem(sys);
        const current = G.travelTarget === sys;
        groups.nav.push({
          kind: 'course', system: sys,
          name: `SECTOR ${sys + 1} · ${rec.area.toUpperCase()}`,
          desc: `${rec.safe ? 'SAFE HAVEN · STARBASE' : 'HOSTILE SPACE · PATROL RISK'}${current ? ' · COURSE SET' : ''}`,
          cost: 0, ready: !current, label: current ? 'SET' : 'COURSE',
        });
      }
    }

    for (const item of SHOP_ITEMS) {
      groups.services.push({
        kind: 'service', id: item.id, name: item.name, desc: item.desc(),
        cost: item.cost, ready: item.can() && credits >= item.cost,
        label: !item.can() ? (item.id === 'hull' || item.id === 'shield' ? 'FULL' : 'MAX') : `${fmt(item.cost)} CR`,
      });
    }

    const all = [...groups.debrief, ...groups.offers, ...groups.parts, ...groups.ships, ...groups.nav, ...groups.services];
    all.forEach((a, i) => { a.idx = i; });
    return { all, groups };
  }

  function renderActions(host, actions) {
    host.innerHTML = actions.map((a) => `<div class="ir-item${a.ready ? '' : ' off'}${a.idx === dockFocus ? ' focus' : ''}" data-row="${a.idx}">
      <div class="ir-copy"><div class="ir-name">${a.name}</div><div class="ir-desc">${a.desc}</div></div>
      <button class="ir-buy" data-do="${a.idx}"${a.ready ? '' : ' disabled'}>${a.label}</button>
    </div>`).join('');
    host.querySelectorAll('[data-do]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        runDockAction(Number(btn.dataset.do));
      });
    });
  }

  function paintDock() {
    if (!G.station) return;
    const credits = Math.max(0, Math.round(G.player.credits || 0));
    const sb = G.station.starbase;
    const m = G.missions;
    const next = nextRank(G);
    dockKind.textContent = sb ? `${sb.id} · ${sb.name.toUpperCase()}` : (G.station.label || 'SAFE HAVEN');
    dockName.textContent = (G.station.planetName || 'FRIENDLY WORLD').toUpperCase();
    dockSub.textContent = `RANK ${rankName(G)} · ${careerPoints(G)} CAREER PTS${next ? ` · NEXT ${next.name} AT ${next.points}` : ' · FLAG RANK'}`;
    dockCredits.textContent = fmt(credits);
    dockWallet.classList.toggle('poor', credits < 80);

    const c = m && m.contract;
    if (c && c.status === 'debrief') {
      dockBrief.textContent = `DEBRIEF READY · ${c.title} · +${fmt(c.score)} SCORE · +${fmt(c.credits)} CR`;
    } else if (c && c.status === 'return') {
      dockBrief.textContent = `RETURN TO ${c.issuerName} TO CLOSE ${c.title}`;
    } else if (c && c.status === 'travel') {
      const stage = c.stages[c.stageIndex];
      dockBrief.textContent = `ACTIVE ASSIGNMENT · ${c.title} · STAGE ${c.stageIndex + 1}/${c.stages.length} · NEXT ${G.ensureSystem(stage.system).area.toUpperCase()}`;
    } else if (G.travelTarget != null) {
      dockBrief.textContent = `COURSE SET · SECTOR ${G.travelTarget + 1} · ${G.ensureSystem(G.travelTarget).area.toUpperCase()}`;
    } else {
      dockBrief.textContent = (m && m.lastDebrief) || 'ASSIGNMENT BOARD OPEN · SELECT A CONTRACT OR REQUISITION';
    }

    const built = buildDockActions();
    dockActions = built.all;
    if (dockFocus >= dockActions.length) dockFocus = Math.max(0, dockActions.length - 1);

    const assignCount = built.groups.debrief.length + built.groups.offers.length;
    dockAssignSec.classList.toggle('hidden', assignCount === 0);
    dockPartsSec.classList.toggle('hidden', built.groups.parts.length === 0);
    dockShipsSec.classList.toggle('hidden', built.groups.ships.length === 0);
    dockNavSec.classList.toggle('hidden', built.groups.nav.length === 0);
    renderActions(dockOffers, [...built.groups.debrief, ...built.groups.offers]);
    renderActions(dockParts, built.groups.parts);
    renderActions(dockShips, built.groups.ships);
    renderActions(dockNav, built.groups.nav);
    renderActions(dockShop, built.groups.services);
  }

  function runDockAction(index) {
    const a = dockActions[index];
    if (!a || !a.ready) return false;
    const credits = Math.max(0, Math.round(G.player.credits || 0));
    if (a.kind === 'debrief') {
      if (!G.missions.completeContract()) return false;
    } else if (a.kind === 'offer') {
      if (!G.missions.acceptOffer(a.index)) return false;
    } else if (a.kind === 'part') {
      if (credits < a.cost || !installPart(G, a.id)) return false;
      spendCredits(a.cost);
    } else if (a.kind === 'ship') {
      const owned = G.career && G.career.ownedShips.has(a.id);
      if (!canCommission(G, a.id) || (!owned && credits < a.cost)) return false;
      if (!commissionShip(G, a.id)) return false;
      if (a.cost) spendCredits(a.cost);
    } else if (a.kind === 'course') {
      if (!G.setCourse(a.system)) return false;
    } else if (a.kind === 'service') {
      const item = SHOP_ITEMS.find((it) => it.id === a.id);
      if (!item || !item.can() || credits < item.cost) return false;
      if (item.buy() === false) return false;
      spendCredits(item.cost);
    }
    if (G.audio && G.audio.chime) G.audio.chime();
    paintDock();
    paintScoreHud();
    paintMission();
    return true;
  }

  function buyDockItem(id) {
    const a = dockActions.find((it) => it.kind === 'service' && it.id === id);
    return a ? runDockAction(a.idx) : false;
  }

  function moveDockFocus(delta) {
    if (G.uiState !== 'docked') return false;
    if (!dockActions.length) return false;
    dockFocus = (dockFocus + delta + dockActions.length) % dockActions.length;
    paintDock();
    return true;
  }

  function buyFocused() {
    if (G.uiState !== 'docked') return false;
    return runDockAction(dockFocus);
  }

  function openDock() {
    if (G.uiState !== 'running' || !G.station || !G.station.canDock()) return false;
    G.uiState = 'docked';
    G.uiHold = true;
    closeSettings();
    pauseLayer.classList.add('hidden');
    gameoverLayer.classList.add('hidden');
    dockFocus = 0;
    paintDock();
    paintScoreHud();
    paintMission();
    dockPrompt.style.display = 'none';
    dockLayer.classList.remove('hidden');
    if (G.audio && G.audio.klaxonOff) G.audio.klaxonOff();
    if (document.pointerLockElement === canvas && document.exitPointerLock) {
      document.exitPointerLock();
    }
    return true;
  }

  function undock() {
    if (G.uiState !== 'docked') return;
    G.uiState = 'running';
    G.uiHold = false;
    dockLayer.classList.add('hidden');
    paintScoreHud();
    paintDockPrompt();
    paintMission();
    tryLock();
  }

  function depart() {
    if (G.uiState !== 'docked') return;
    undock();
    G.requestJump();
  }

  G.openDock = openDock;
  G.undock = undock;
  G.buyDockItem = buyDockItem;

  // ---------------- game over ----------------
  // main.js runs the destruction sequence (explosion + tumble) and calls
  // this when it freezes the frame. uiState is already 'gameover' by then.
  const gameoverLayer = el('ir-gameover');

  G.onGameOver = (stats) => {
    paintScoreHud(); // final earned value on the readout before it goes
    scoreHud.style.display = 'none'; // no poll race: the HUD leaves with the ship
    dockPrompt.style.display = 'none';
    missionCard.style.display = 'none';
    missionPrompt.style.display = 'none';
    const prev = readHighScore();
    const isRecord = stats.score > prev;
    if (isRecord) writeHighScore(stats.score);
    // r15 high-score — hung off the RECORD WRITE, not off the panel opening,
    // so the line and the persisted number cannot disagree.
    if (isRecord && G.audio && G.audio.say) G.audio.say('high-score');
    el('ir-go-score').textContent = fmt(stats.score);
    el('ir-go-best').textContent = fmt(Math.max(prev, stats.score));
    el('ir-go-newrec').classList.toggle('hidden', !isRecord);
    el('ir-go-waves').textContent = String(stats.wavesCleared);
    el('ir-go-systems').textContent = String(stats.systemsReached);
    el('ir-go-kills').textContent = String(stats.enemiesKilled);
    el('ir-go-shipline').textContent =
      `HULL INTEGRITY ZERO · VESSEL ${G.names.ship} LOST`.toUpperCase();
    closeSettings();
    pauseLayer.classList.add('hidden');
    gameoverLayer.classList.remove('hidden');
    if (G.audio && G.audio.klaxonOff) G.audio.klaxonOff();
    if (document.pointerLockElement === canvas && document.exitPointerLock) {
      document.exitPointerLock();
    }
  };

  // relaunch = full reload: guarantees a clean state reset (fresh seed run,
  // fresh prewarm) and re-reads the persisted high score on the start screen
  //
  // r15: the reload is now held for the restart line. A page reload destroys
  // the AudioContext mid-word, so "play then reload immediately" would ship a
  // line nobody ever hears — the asset would be dead weight. The hold is
  // bounded three ways: it only waits while the voice layer is actually busy,
  // it hard-caps at RELAUNCH_HOLD_MS, and a SECOND press reloads at once, so
  // a player who does not want the quip is never more than one click from the
  // start screen. Muted (harness, ?novoice=1) reloads immediately, unchanged.
  // Long enough for the longest restart clip (restart.mp3 is 8.034 s, measured
  // by tools/r15-voice-decode.mjs). The first value was 4500, picked before
  // anything had measured a clip, and it cut the longest line off at 56%.
  const RELAUNCH_HOLD_MS = 8300;
  let relaunchArmed = false;
  function relaunch() {
    if (relaunchArmed) { location.reload(); return; }
    relaunchArmed = true;
    const V = G.audio && G.audio.voice;
    const r = G.audio && G.audio.say ? G.audio.say('restart') : 'muted';
    if (!V || V.muted || (r !== 'playing' && r !== 'loading' && r !== 'queued')) {
      location.reload();
      return;
    }
    const t0 = performance.now();
    const tick = () => {
      if (!V.isBusy() || performance.now() - t0 > RELAUNCH_HOLD_MS) { location.reload(); return; }
      setTimeout(tick, 100);
    };
    setTimeout(tick, 120);
  }
  el('ir-restart').addEventListener('click', (e) => { e.stopPropagation(); relaunch(); });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyR' && G.uiState === 'gameover') relaunch();
  });

  // start overlay: any click launches, except clicks on its own controls
  startLayer.addEventListener('click', () => {
    if (!settingsEl.classList.contains('hidden')) return; // settings open: explicit launch only
    start();
  });
  el('ir-fly').addEventListener('click', (e) => { e.stopPropagation(); closeSettings(); start(); });
  el('ir-start-set').addEventListener('click', (e) => { e.stopPropagation(); toggleSettings('ir-start-settings-host'); });

  el('ir-resume').addEventListener('click', (e) => { e.stopPropagation(); resume(); });
  el('ir-settings-btn').addEventListener('click', (e) => { e.stopPropagation(); toggleSettings('ir-pause-settings-host'); });
  el('ir-dock-depart').addEventListener('click', (e) => { e.stopPropagation(); depart(); });
  el('ir-dock-undock').addEventListener('click', (e) => { e.stopPropagation(); undock(); });
  el('ir-ctl-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const showing = pauseControls.classList.toggle('hidden');
    el('ir-ctl-btn').classList.toggle('active', !showing);
  });

  // Esc: pauses when running (this is the path when no lock is held — with a
  // lock the browser eats Esc for the lock exit and pointerlockchange below
  // catches it). In the menu Esc resumes, guarded so the browser's lock-exit
  // Esc cannot pause and resume within one press.
  window.addEventListener('keydown', (e) => {
    if (G.uiState === 'docked') {
      if (e.code === 'ArrowUp') { e.preventDefault(); moveDockFocus(-1); return; }
      if (e.code === 'ArrowDown') { e.preventDefault(); moveDockFocus(1); return; }
      if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); buyFocused(); return; }
    }
    if (e.code !== 'Escape') return;
    if (G.uiState === 'running') {
      pause();
    } else if (G.uiState === 'paused' && performance.now() - pausedAt > 350) {
      resume();
    } else if (G.uiState === 'docked') {
      undock();
    }
  });

  // browser-reserved Esc during pointer lock: lock drops -> pause
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== canvas && G.uiState === 'running') pause();
  });

  return { start, pause, resume, restart: relaunch, undock, depart, moveDockFocus, buyFocused };
}
