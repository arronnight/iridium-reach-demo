# Iridium Reach

[![Play](https://img.shields.io/badge/▶_play_it-jason--c--dev.github.io-2ea44f)](https://jason-c-dev.github.io/iridium-reach-demo/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made with Claude](https://img.shields.io/badge/made_with-Claude_Code-d97757)](https://claude.com/claude-code)
[![Built by a Gauntlet Loop](https://img.shields.io/badge/built_by-gauntlet_loop_·_15_rounds-8a2be2)](#how-it-was-built)
[![three.js](https://img.shields.io/badge/three.js-0.185-049EF4)](https://threejs.org)
[![Voice](https://img.shields.io/badge/ship's_computer-ElevenLabs-1f6feb)](#credits)

A cockpit-view space shooter tech demo, built almost entirely by AI agents,
made in loving homage to [No Man's Sky](https://www.nomanssky.com/) — go play
the real thing, it's extraordinary.

Everything you see is procedural — every mesh, texture, planet, nebula and
sound effect is generated in code at runtime. No models, no image assets,
no audio files*, no build step. One HTML file, some ES modules, and three.js.

*except the ship's computer, who insisted on a real voice.

**[▶ Play it in your browser](https://jason-c-dev.github.io/iridium-reach-demo/)** — Chrome recommended, sound on.

![Red alert](screenshots/red-alert.png)

## The game

Cruise a procedural star system, get ambushed by pirate raiders, manage a
heat-limited photon cannon, survive the red alert, warp out, repeat — each
system harder than the last.

- **Three enemy classes** — raiders, fast fragile interceptors, and a heavy
  gunship that hits like a bailiff
- **Ship systems** — shields that regenerate, a hull that doesn't, red
  alerts, and a ship you can genuinely lose
- **Scoring** — per-kill and wave bonuses, persistent high score
- **Cannon upgrades** — every wave cleared doubles your heat endurance,
  MK I through MK IV
- **Asteroids** — now with collision. Flying into rocks is no longer free
- **A ship's computer with attitude** — 49 voice lines across 16 events,
  performed in the finest tradition of sarcastic British AI. It will
  comment on your aim.

![Warp tunnel](screenshots/warp-tunnel.png)

## Controls

| input | action |
|---|---|
| Mouse (hold LMB) | steer · fire |
| W / S | thrust · brake |
| A / D | roll |
| Arrow keys | pitch · yaw |
| Shift | boost |
| Space + Ctrl | brake-turn |
| F | fire |
| Esc | pause · settings (mouse sensitivity, invert Y) |

## How it was built

This game was built by a **gauntlet loop**: a fleet of AI agents (Claude
Code — a Fable 5 orchestrator managing Opus 5 workers) given a task, a build
method, and a deliberately unreachable bar — *"indistinguishable from real
No Man's Sky screenshots to a forensic judge."*

Each round, worker agents rebuilt subsystems in parallel git worktrees, each
paired with a harsh critic; blind judges then compared screenshots of the
build against real reference shots and filed forensic defect reports, which
seeded the next round. Fifteen rounds and four runs later the judges were
still winning — that bar is unreachable by design — but along the way the
loop produced a complete playable game, a 60fps render pipeline, a
deterministic capture harness, and one genuinely fooled judge.

The full write-up — including what the technique gets right, where its
returns diminish, and why the human playtester out-found the critic fleet at
the end — is coming as a blog post.

![Low altitude combat](screenshots/low-altitude-combat.png)
![Planet surface](screenshots/planet-surface.png)

## Demo honesty

This is a tech demo, and it knows it:

- The ship's computer is a little chatty. We measured it (64% speech duty in
  combat). It stays, because it adds to the charm.
- The asteroid belt only exists in the first system. After one warp, space
  is rock-free — the collision system arrived before the level design did.
- Targets 60fps at 1080p; measured grazing the bar on an Apple M4. Your
  mileage may vary with GPU and browser.
- Best experienced in Chrome. Audio starts after your first click (browser
  autoplay rules).

## Credits

- **Code**: built by [Claude Code](https://claude.com/claude-code) agents in
  a gauntlet loop, directed and playtested by
  [Jason Croucher](https://github.com/jason-c-dev). MIT licensed.
- **Rendering**: [three.js](https://threejs.org) (MIT, vendored).
- **Ship's computer**: voice lines generated with
  [ElevenLabs](https://elevenlabs.io) (voice: Callum). Distributed under
  ElevenLabs' terms, not MIT — see [LICENSE](LICENSE).
- **Inspiration**: the look and feel pay homage to
  [No Man's Sky](https://www.nomanssky.com/) by
  [Hello Games](https://hellogames.org/) — an amazing game the author plays
  and loves, and the bar fifteen rounds of AI critics never reached. Buy it,
  play it. This is an unaffiliated fan tech demo; it contains no assets from
  the game.
