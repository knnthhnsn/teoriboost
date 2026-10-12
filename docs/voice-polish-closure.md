# Voice UI polish closure

Status: implemented in the scoped voice assets.

- The player is static at every viewport width, so it cannot cover the lesson diagram while scrolling.
- The full transcript remains available to assistive technology through the existing paragraph, while its repeated visual block is hidden.
- On desktop the static panel is one slim flex row: identity/status stays left and the four content-sized controls stay nowrap on the right. On mobile the panel switches to block with the existing four-column control row and 8px separation; controls retain a 44px minimum target.
- Local narration triggers still own pause/resume state, and panel controls still provide pause, restart, stop, and speed control.
- After natural completion, “Start forfra” reuses the same validated queue, cue callback, and original local trigger. Stop, error, or a new narration clears that restart state.
- `read(parts, { onPart })` and the playback engine expose a Promise<boolean> result. The callback receives the zero-based clip index on load/clip change and `null` on stop, completion, error, or narration replacement. Session and generation guards prevent stale media events from notifying a newer callback.

Validation completed for this change: full Node test suite, JavaScript syntax checks, and scoped diff review. Browser/device behavior was not claimed here.
