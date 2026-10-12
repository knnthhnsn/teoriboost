/** Mark the visible row for a prerecorded clip without moving focus or scrolling. */
export function createVoiceCue(rows) {
  let active = [];
  return index => {
    for (const { row, previousCurrent } of active) {
      row.classList.remove('voice-speaking');
      if (previousCurrent === null) row.removeAttribute('aria-current');
      else row.setAttribute('aria-current', previousCurrent);
    }
    active = [];
    const next = index === null ? [] : [rows[index]].flat().filter(Boolean);
    for (const row of new Set(next)) {
      if (!row.isConnected || row.closest('[hidden],details:not([open])')) continue;
      active.push({ row, previousCurrent: row.getAttribute('aria-current') });
      row.classList.add('voice-speaking');
      row.setAttribute('aria-current', 'true');
    }
  };
}
