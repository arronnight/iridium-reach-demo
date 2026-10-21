# Iridium Reach

[![Play](https://img.shields.io/badge/▶_play_it-jason--c--dev.github.io-2ea44f)](https://jason-c-dev.github.io/iridium-reach-demo/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Made with Claude](https://img.shields.io/badge/made_with-Claude_Code-d97757)](https://claude.com/claude-code)
[![Built by a Gauntlet Loop](https://img.shields.io/badge/built_by-gauntlet_loop_·_15_rounds-8a2be2)](#how-it-was-built)
[![three.js](https://img.shields.io/badge/three.js-0.185-049EF4)](https://threejs.org)
[![Voice](https://img.shields.io/badge/ship's_computer-ElevenLabs-1f6feb)](#credits)

A cockpit-view Star Trek fan space-combat and first-contact demo, built almost
entirely by AI agents. Take the conn of a Starfleet vessel, hold the line against
Klingon, Romulan and Cardassian warships, take on the sector's Starfleet
assignment, then dock at a friendly port to repair and refit before the next
jump.

Everything you see is procedural — every mesh, texture, planet, nebula and
sound effect is generated in code at runtime. No models, no image assets,
no audio files*, no build step. One HTML file, some ES modules, and three.js.

*except the ship's computer, who insisted on a real voice.

This is an unaffiliated fan tech demo. Star Trek and all related marks belong
to their respective owners; this project contains no assets from the franchise.

**[▶ Play it in your browser](https://jason-c-dev.github.io/iridium-reach-demo/)** — Chrome recommended, sound on.

![Red alert](screenshots/red-alert.png)

## The game

Cruise a procedural sector, get ambushed by the sector's own hostile fleet,
manage heat-limited phaser banks and a slow-loading photon torpedo, survive
the red alert, then jump to the next sector — each one harder than the last.
Every other sector is a safe haven where you can repair, resupply and upgrade.

Each sector opens with a Starfleet field encounter. Clear a hostile patrol, hail
a local envoy, run medical supplies to a colony, or conduct a passive
first-contact scan. Diplomacy and science want you to hold station with weapons
cold; relief wants you close enough to run a cargo beam. Missions pay score and
requisition credits, scaled by how far you have travelled from home.

Safe sectors are starbases DS1 through DS9. Each port posts a board of
two- and three-stage assignments: patrol a hostile sector, divert to a colony,
then return to the issuing starbase for debrief. Contracts pay a completion
bonus, advance your Starfleet rank, and can send you back through sectors you
have already visited. Ports also sell ship parts and new commands; DS9's
shipyard eventually offers the Sovereign-class U.S.S. Enterprise.

- **Three hostile classes, three fleets** — Klingon K't'inga battlecruisers,
  B'rel Birds-of-Prey and Vor'cha attack cruisers; Romulan Scouts and
  D'deridex Warbirds; Cardassian Hideki patrol ships and Galor cruisers.
  Each has a canon silhouette, weapon colour, standoff range and attack
  pattern (pursuit, strafing run, or standoff siege)
- **Starfleet weapons** — sustained phaser banks plus a heavy photon torpedo
  with splash damage on a 3.2s reload
- **Ship systems** — shields that regenerate, a hull that doesn't, red
  alerts, and a ship you can genuinely lose
- **Canon fleet and map** — fly named 2370s Starfleet classes from Miranda
  to Sovereign across Alpha and Beta Quadrant sectors, from Bajor and
  Cardassia to Qo'noS, Romulus and the Neutral Zone. In 2372 the Klingon
  War puts Klingon hulls in Federation space; the Badlands and DMZ field
  Cardassian ships, and Romulan sectors field Romulan ones
- **Sector missions** — patrol, diplomacy, planetary relief and first contact.
  Safe sectors never ask you to fire first
- **Starbases DS1-DS9** — assignment boards, multi-stage contracts, debriefs,
  rank progression, ship parts and a shipyard, with the Enterprise-E waiting
  at DS9 for a captain
- **Revisitable space** — choose a previous or future sector from the port
  navigation board instead of always jumping forward
- **Career progression** — Ensign to Captain through missions and assignment
  completions; new ranks unlock better parts and commands
- **Safe havens** — friendly ports with no hostiles. Dock to patch the hull,
  recharge shields, upgrade torpedoes or recalibrate the phaser array
- **Requisition credits** — earned from kills, waves and assignments; spent at
  port on repairs, refits, parts and ships
- **Scoring** — per-kill and wave bonuses, persistent high score
- **Phaser upgrades** — every wave cleared doubles your heat endurance,
  MK I through MK IV; port calibration adds up to +60% damage
- **Asteroids** — now with collision. Flying into rocks is no longer free
- **A ship's computer with attitude** — 49 voice lines across 16 events,
  performed in the finest tradition of sarcastic British AI. It will
  comment on your aim.

![Warp tunnel](screenshots/warp-tunnel.png)

## Controls

Keyboard and mouse, or an Xbox/XInput controller.

| input | action |
|---|---|
| Mouse (hold LMB) | steer · phasers |
| RMB / Q | photon torpedo |
| W / S | impulse · brake |
| A / D | roll |
| Arrow keys | pitch · yaw |
| Shift | impulse boost |
| Space + Ctrl | brake-turn |
| F | phasers |
| E | mission action (hail, scan, transfer) · dock at a safe haven |
| J | jump from safe space |
| Esc | pause · settings (mouse sensitivity, invert Y); returns to conn while docked |
| Dock board (keyboard) | Up/Down select · Enter buy/accept/set course · Esc return |
| Xbox left stick | pitch · yaw |
| Xbox right stick | roll · throttle |
| RT / LT | phasers / photon torpedo |
| LB / RB | impulse boost / brake-turn |
| A / B / Y | mission action or dock / undock / jump |
| Start | pause · resume |
| D-pad + A (docked) | select assignments, parts, ships, courses and upgrades |

## How it was built

This game was built by a **gauntlet loop**: a fleet of AI agents (Claude
Code — a Fable 5 orchestrator managing Opus 5 workers) given a task, a build
method, and a deliberately unreachable bar — *"indistinguishable from real
No Man's Sky screenshots to a forensic judge."* The game was originally built
as a No Man's Sky homage; this branch re-skins the cockpit, naming, HUD and
combat as a Star Trek fan demo.

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
- Safe havens are one-screen repair and requisition ports, not walkable
  station interiors.
- Field encounters are one-objective vignettes; starbase assignments chain
  two or three of them into a contract with a return-to-port debrief, not a
  branching storyline.
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
- **Inspiration**: the LCARS presentation and Starfleet combat are a fan
  tribute to [Star Trek](https://www.startrek.com/). The original visual and
  structural bar was [No Man's Sky](https://www.nomanssky.com/) by
  [Hello Games](https://hellogames.org/) — an amazing game the author plays
  and loves. This is an unaffiliated fan tech demo; it contains no assets from
  either franchise.
