// Minimal energy analyser helper.
// Can analyse from an existing HTMLMediaElement (preferred) or a MediaStream (e.g., microphone).
export function createEnergyAnalyser(src: HTMLMediaElement | MediaStream) {
  if (typeof window === 'undefined') {
    throw new Error('createEnergyAnalyser must be called in the browser');
  }
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.8;
  const data = new Uint8Array(analyser.frequencyBinCount);
  const srcNode = src instanceof MediaStream
    ? ctx.createMediaStreamSource(src)
    : ctx.createMediaElementSource(src);
  srcNode.connect(analyser);
  // Route to destination so audio is audible; if silent analysis is desired, connect to a 0-gain node instead.
  analyser.connect(ctx.destination);
  function getEnergy(): number {
    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const avg = sum / (data.length * 255);
    return Math.min(1, Math.max(0, avg)); // 0..1
  }
  return { ctx, analyser, getEnergy, dispose: () => ctx.close() };
}
