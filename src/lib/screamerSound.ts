export type ScreamerKind = 'beast' | 'chase' | 'mimic';

const SOUND_PROFILES: Record<ScreamerKind, { growl: number; shriek: number; pulse: number }> = {
  beast: { growl: 47, shriek: 870, pulse: 58 },
  chase: { growl: 63, shriek: 1160, pulse: 76 },
  mimic: { growl: 38, shriek: 690, pulse: 49 },
};

export function playScreamerSound(kind: ScreamerKind) {
  const context = new AudioContext();
  const now = context.currentTime;
  const profile = SOUND_PROFILES[kind];
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.58, now + 0.018);
  master.gain.exponentialRampToValueAtTime(0.36, now + 0.16);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.42);
  compressor.threshold.value = -18;
  compressor.knee.value = 16;
  compressor.ratio.value = 8;
  master.connect(compressor).connect(context.destination);

  const distortion = context.createWaveShaper();
  distortion.curve = createDistortionCurve();
  distortion.oversample = '4x';
  distortion.connect(master);

  addNoiseBlast(context, distortion, now, 1.4);
  addTone(context, distortion, 'sawtooth', profile.growl, 25, now, 1.38, 0.42);
  addTone(context, distortion, 'square', profile.shriek, 105, now, .72, 0.12);
  addTone(context, master, 'sine', profile.pulse, profile.pulse * .7, now, .48, 0.52);
  addTone(context, distortion, 'sawtooth', profile.shriek * .72, 160, now + .19, .82, 0.13);

  void context.resume();
  const closeTimer = window.setTimeout(() => void context.close(), 1580);
  return () => {
    window.clearTimeout(closeTimer);
    if (context.state !== 'closed') void context.close();
  };
}

function addTone(context: AudioContext, destination: AudioNode, type: OscillatorType,
  startFrequency: number, endFrequency: number, start: number, duration: number, volume: number) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.detune.setValueAtTime((Math.random() - .5) * 24, start);
  oscillator.frequency.setValueAtTime(startFrequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function addNoiseBlast(context: AudioContext, destination: AudioNode, start: number, duration: number) {
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  noise.buffer = createNoiseBuffer(context, duration);
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2300, start);
  filter.frequency.exponentialRampToValueAtTime(170, start + duration);
  filter.Q.value = 1.4;
  gain.gain.setValueAtTime(.46, start);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  noise.connect(filter).connect(gain).connect(destination);
  noise.start(start);
  noise.stop(start + duration);
}

function createNoiseBuffer(context: AudioContext, duration: number) {
  const length = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    const crackle = Math.random() > .985 ? 1.8 : 1;
    channel[index] = (Math.random() * 2 - 1) * crackle;
  }
  return buffer;
}

function createDistortionCurve() {
  const curve = new Float32Array(4096);
  for (let index = 0; index < curve.length; index += 1) {
    const value = index * 2 / curve.length - 1;
    curve[index] = Math.tanh(value * 13);
  }
  return curve;
}
