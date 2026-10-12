# Natkørsel image placement

Current implementation uses five original native 1254×1254 transparent PNGs. All are decorative, empty-alt and pointer-inert.

- Brain: the start header outside the canvas, mission introduction, progress and clean mission results. Hidden during active game steps and in calm mode.
- Møtrik-Mads: garage introduction and post-answer memory hook. No art/lead cue is shown in the initial garage decision.
- Mint car: the driving-demo entry strip; no generated car is used as a factual scenario diagram.
- Receipt: after a correct STOP answer. The crowded featured-card placement was removed.
- Cone: after an incorrect answer and in mixed mission results.

Motion-off and reduced-motion keep pictures static; calm hides optional joke characters. The true source pixels/hashes and complete prompts are in authoring/art-manifest.json and authoring/art-prompts.json. Final acceptance and limits are described in art-status.md and art-browser-qa.json.
