/**
 * Browser Web Audio API sound generator for Admin Notifications.
 * Generates pleasant, rich, self-contained chimes without relying on external mp3 files.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a single chime tone with a smooth decay envelope.
 */
function playTone(freq, startTime, duration = 0.35, type = "sine", gainLevel = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * New Order Alarm:
 * Repeating multi-bell chime (e.g. cash register / kitchen bell ding-dong).
 * Rings 3 times with pleasant ascending chords.
 */
export function playOrderAlarm() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // 3 repetitions of a double-ding chime
  for (let rep = 0; rep < 3; rep++) {
    const offset = now + rep * 0.75;
    playTone(587.33, offset, 0.28, "triangle", 0.4); // D5
    playTone(880.0, offset + 0.12, 0.45, "sine", 0.45); // A5
    playTone(1174.66, offset + 0.14, 0.45, "sine", 0.25); // D6 harmonic
  }
}

/**
 * Refund Request Alert:
 * Distinct two-tone descending attention chime.
 */
export function playRefundAlert() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(784.0, now, 0.25, "sine", 0.4); // G5
  playTone(523.25, now + 0.2, 0.5, "triangle", 0.45); // C5
}

/**
 * Inquiry / Message Notification:
 * Soft single ping.
 */
export function playInquiryNotification() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playTone(659.25, now, 0.18, "sine", 0.3); // E5
  playTone(1046.5, now + 0.08, 0.35, "sine", 0.35); // C6
}
