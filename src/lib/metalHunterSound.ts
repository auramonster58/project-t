export function playMetalHunterSound(chasing: boolean) {
  const AudioContextClass = window.AudioContext;
  const context = new AudioContextClass();
  const scrape = () => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = chasing ? 'sawtooth' : 'square';
    oscillator.frequency.setValueAtTime(chasing ? 95 : 60, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(28, context.currentTime + .34);
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(chasing ? .075 : .12, context.currentTime + .025);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .36);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .38);
  };
  scrape();
  const timer = window.setInterval(scrape, chasing ? 720 : 930);
  return () => { window.clearInterval(timer); void context.close(); };
}
