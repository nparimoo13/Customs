let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** A synthesized rubber-stamp thunk: a short noise burst plus a low body thump. */
export function playStamp(correct: boolean): void {
  const ac = audio();
  if (!ac) return;
  try {
    const t = ac.currentTime;

    const len = Math.floor(ac.sampleRate * 0.12);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    const noise = ac.createBufferSource();
    noise.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = correct ? 1800 : 1100;
    const ng = ac.createGain();
    ng.gain.value = 0.6;
    noise.connect(filter).connect(ng).connect(ac.destination);
    noise.start(t);

    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(correct ? 160 : 110, t);
    osc.frequency.exponentialRampToValueAtTime(correct ? 70 : 45, t + 0.15);
    const og = ac.createGain();
    og.gain.setValueAtTime(0.7, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(og).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  } catch {
    /* audio is decorative; never let it break the game */
  }
}
