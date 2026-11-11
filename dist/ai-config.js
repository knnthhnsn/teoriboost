// Shared by the browser and the chat function. Day boundaries follow Danish local
// time rather than a fixed UTC offset, so the clock change is handled correctly.
export const AI_CONFIG = Object.freeze({
  timeZone: 'Europe/Copenhagen',
  dailyLimits: Object.freeze({ guest: 1, free: 3, premium: 50 }),
  guestIpDailyLimit: 30,
  webSearch: Object.freeze({
    dailyLimits: Object.freeze({ guest: 1, free: 1, premium: 10 }),
    perQuestion: Object.freeze({ guest: 1, free: 1, premium: 2 }),
  }),
});

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: AI_CONFIG.timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
});

export function aiDayKey(now = Date.now()) {
  const date = new Date(now);
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date');
  const parts = Object.fromEntries(dayFormatter.formatToParts(date).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function aiResetAt(now = Date.now()) {
  let low = new Date(now).getTime();
  const day = aiDayKey(low);
  let high = low + 36 * 60 * 60 * 1000;
  // Find the first millisecond of the next local day. This avoids assuming a
  // 24-hour day or a fixed UTC offset during daylight-saving transitions.
  while (low + 1 < high) {
    const mid = Math.floor((low + high) / 2);
    if (aiDayKey(mid) === day) low = mid; else high = mid;
  }
  return new Date(high).toISOString();
}
