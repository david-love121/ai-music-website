// Audio metrics as a Svelte store, initialized from a component
import { audioEngine } from "./AudioEngine";
import { writable } from "svelte/store";

export type Energy = {
  rms: number;
  bass: number;
  mid: number;
  high: number;
  peak: number;
  /** Smoothed overall energy scalar 0..1 */
  energy: number;
};

export const energy = writable<Energy>({
  rms: 0,
  bass: 0,
  mid: 0,
  high: 0,
  peak: 0,
  energy: 0,
});

function bucketEnergy(freq: Uint8Array, start: number, end: number) {
  let sum = 0;
  for (let i = start; i < end && i < freq.length; i++) sum += freq[i] * freq[i];
  return Math.sqrt(sum / Math.max(1, end - start)) / 255; // 0..1
}

let raf = 0;
let ticks = 0;

// Exponential smoothing helper to avoid jitter
function smoothTowards(current: number, target: number, dt: number, tau = 0.15) {
  const a = 1 - Math.exp(-dt / tau);
  return current + a * (target - current);
}

export function startEnergyLoop() {
  if (typeof window === "undefined") return () => {};

  let eSmooth = 0;
  let last = performance.now();

  const loop = () => {
    const now = performance.now();
    const dt = Math.max(0.001, (now - last) / 1000);
    last = now;

    const freq = audioEngine.getFrequencyData();
    const time = audioEngine.getTimeDomainData();
    if (freq && time) {
      const bass = bucketEnergy(freq, 0, 16); // ~0-344Hz
      const mid = bucketEnergy(freq, 16, 64); // ~344-1378Hz
      const high = bucketEnergy(freq, 64, 256); // >

      let sum = 0;
      for (let i = 0; i < time.length; i++) {
        const v = (time[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / time.length);
      const peak = Math.max(bass, mid, high);

      // Use RMS as raw overall energy in 0..1, then smooth it
      const eRaw = Math.min(1, Math.max(0, rms));
      eSmooth = smoothTowards(eSmooth, eRaw, dt);

      energy.set({ rms, bass, mid, high, peak, energy: eSmooth });
      // Throttled debug log once per ~30 frames
      if (++ticks % 30 === 0) {
        energy.update((e) => {
          console.log('[energy] update', {
            rms: Number(e.rms.toFixed(3)),
            bass: Number(e.bass.toFixed(3)),
            mid: Number(e.mid.toFixed(3)),
            high: Number(e.high.toFixed(3)),
            peak: Number(e.peak.toFixed(3)),
            energy: Number(e.energy.toFixed(3)),
            hasAnalyser: !!audioEngine.analyser
          });
          return e;
        });
      }
    } else if (++ticks % 60 === 0) {
      console.log('[energy] no data yet', { hasAnalyser: !!audioEngine.analyser });
    }
    raf = requestAnimationFrame(loop);
  };

  function onVis() {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', onVis);

  raf = requestAnimationFrame(loop);
  return () => {
    document.removeEventListener('visibilitychange', onVis);
    cancelAnimationFrame(raf);
  };
}
