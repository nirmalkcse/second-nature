/**
 * second-nature · feedback.js
 *
 * One vocabulary of feedback, three senses.
 *
 *   feedback.play('selection')   // a detent: picker tick, segment change
 *   feedback.play('light')       // impact: a small thing lands
 *   feedback.play('success')     // notification: a task finished well
 *
 * Haptics play where the platform exposes them (Vibration API: Android, some
 * desktops). iOS Safari exposes none to the web, so there the same call falls
 * back to sound if you have enabled it, and the visual response you built
 * carries the rest. Sound is OFF by default: a web page that makes noise
 * uninvited has broken trust before it has earned any.
 *
 * The names follow Apple's feedback generators so one design language maps
 * across platforms:
 *   selection                       → UISelectionFeedbackGenerator
 *   light · medium · heavy · soft · rigid → UIImpactFeedbackGenerator
 *   success · warning · error       → UINotificationFeedbackGenerator
 */

/** vibrate: ms or [on, off, on…]. tone: [frequency Hz, duration s, gain 0–1, delay s][] */
const VOCABULARY = {
  selection: { vibrate: 6, tones: [[1800, 0.012, 0.35, 0]] },
  light: { vibrate: 10, tones: [[1250, 0.018, 0.45, 0]] },
  medium: { vibrate: 16, tones: [[880, 0.026, 0.6, 0]] },
  heavy: { vibrate: 28, tones: [[520, 0.04, 0.8, 0]] },
  soft: { vibrate: 14, tones: [[620, 0.05, 0.4, 0]] },
  rigid: { vibrate: 8, tones: [[2200, 0.01, 0.55, 0]] },
  success: {
    vibrate: [10, 70, 18],
    tones: [
      [880, 0.07, 0.5, 0],
      [1320, 0.11, 0.5, 0.085],
    ],
  },
  warning: {
    vibrate: [16, 110, 16],
    tones: [
      [740, 0.08, 0.5, 0],
      [740, 0.08, 0.5, 0.13],
    ],
  },
  error: {
    vibrate: [24, 60, 24, 60, 32],
    tones: [
      [520, 0.07, 0.6, 0],
      [390, 0.14, 0.6, 0.09],
    ],
  },
};

export function createFeedback(options = {}) {
  const config = { haptics: true, sound: false, volume: 0.5, minIntervalMs: 28, ...options };
  let ctx = null;
  let lastAt = 0;

  const audio = () => {
    if (typeof window === 'undefined') return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC({ latencyHint: 'interactive' });
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };

  const tone = (ac, [frequency, duration, gain, delay]) => {
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, t);
    // A click, not a beep: instant attack, exponential fall, slight pitch drop.
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.86, t + duration);
    const peak = Math.max(0.0001, gain * config.volume * 0.12);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(peak, t + 0.002);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(amp).connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  };

  return {
    /** Names you can play. */
    types: Object.keys(VOCABULARY),

    configure(next) {
      Object.assign(config, next);
      return this;
    },

    get config() {
      return { ...config };
    },

    /**
     * Fire on the frame the visual change happens, from inside the user's
     * gesture handler: late feedback reads as a different event.
     */
    play(type = 'light') {
      const entry = VOCABULARY[type];
      if (!entry) return false;

      // Rapid ticks blur into a buzz; drop the ones nobody could tell apart.
      const t = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (t - lastAt < config.minIntervalMs) return false;
      lastAt = t;

      let played = false;
      // Browsers only allow vibration after the person has interacted with the page.
      const active = typeof navigator !== 'undefined' && (navigator.userActivation ? navigator.userActivation.hasBeenActive : true);
      if (config.haptics && active && typeof navigator.vibrate === 'function') {
        try {
          played = navigator.vibrate(entry.vibrate) || played;
        } catch {}
      }
      if (config.sound) {
        const ac = audio();
        if (ac) {
          for (const spec of entry.tones) tone(ac, spec);
          played = true;
        }
      }
      return played;
    },
  };
}

/** A shared instance for the common case. */
export const feedback = createFeedback();

/**
 * Controller rumble for games and TV interfaces (Gamepad API).
 * `weak` is the high-frequency motor (texture, UI ticks), `strong` the
 * low-frequency one (impacts). Keep UI rumble short and weak; save strong for
 * things that would be heavy in the world.
 */
export function rumble(gamepad, { durationMs = 30, weak = 0.4, strong = 0 } = {}) {
  const actuator = gamepad?.vibrationActuator;
  if (!actuator?.playEffect) return Promise.resolve(false);
  return actuator
    .playEffect('dual-rumble', { duration: durationMs, weakMagnitude: weak, strongMagnitude: strong })
    .then(() => true)
    .catch(() => false);
}
