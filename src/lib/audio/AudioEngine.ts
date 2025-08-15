/*
 Basic Web Audio engine for music playback and visualization.
 - Uses an <audio> element as the source for easy file/URL loading
 - Exposes an AnalyserNode and helper getters for frequency/time data
 - Designed for client-side only (guards for SSR)
*/

export type TrackSource = File | string;

export class AudioEngine {
  private audio?: HTMLAudioElement;
  private ctx?: AudioContext;
  private source?: MediaElementAudioSourceNode;
  private gain?: GainNode;
  analyser?: AnalyserNode;

  private frequencyData?: Uint8Array;
  private timeData?: Uint8Array;

  // State cache (mirrors element but avoids null checks in UI)
  playing = false;
  loop = false;
  rate = 1;
  volume = 0.8;

  ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "metadata";
      this.audio.crossOrigin = "anonymous";
      this.audio.loop = this.loop;
      this.audio.playbackRate = this.rate;
      this.audio.volume = this.volume;
      this.audio.addEventListener("play", () => (this.playing = true));
      this.audio.addEventListener("pause", () => (this.playing = false));
    }
    return this.audio;
  }

  ensureGraph() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const audio = this.ensureAudio();
    if (!this.source) {
      this.source = this.ctx!.createMediaElementSource(audio);
    }
    if (!this.gain) {
      this.gain = this.ctx!.createGain();
      this.gain.gain.value = this.volume;
    }
    if (!this.analyser) {
      this.analyser = this.ctx!.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8; // stabilize frame-to-frame variance
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.fftSize);
    }
    // Connect: source -> analyser -> gain -> destination
    this.source!.connect(this.analyser!);
    this.analyser!.connect(this.gain!);
    this.gain!.connect(this.ctx!.destination);
  }

  async load(source: TrackSource) {
    if (typeof window === "undefined") return;
    this.ensureGraph();
    const audio = this.ensureAudio();
    // Revoke previous object URL if any
    if (audio.src && audio.src.startsWith("blob:"))
      URL.revokeObjectURL(audio.src);

    if (source instanceof File) {
      audio.src = URL.createObjectURL(source);
    } else {
      audio.src = source;
    }
    await audio.load();
  }

  onEnded(cb: () => void) {
    const a = this.ensureAudio();
    a.addEventListener("ended", cb);
  }

  async play() {
    if (!this.audio) return;
    this.ensureGraph();
    // Resume context on user gesture
    if (this.ctx && this.ctx.state === "suspended") await this.ctx.resume();
    await this.audio.play();
    this.playing = true;
  }

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.playing = false;
  }

  seek(timeSec: number) {
    if (!this.audio) return;
    this.audio.currentTime = Math.max(0, Math.min(timeSec, this.duration));
  }

  setRate(rate: number) {
    this.rate = rate;
    if (this.audio) this.audio.playbackRate = rate;
  }

  setLoop(loop: boolean) {
    this.loop = loop;
    if (this.audio) this.audio.loop = loop;
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.gain) this.gain.gain.value = volume;
    if (this.audio) this.audio.volume = volume; // mirrors UI if graph not ready yet
  }

  get duration() {
    return this.audio?.duration ?? 0;
  }

  get currentTime() {
    return this.audio?.currentTime ?? 0;
  }

  getFrequencyData(): Uint8Array | undefined {
    if (!this.analyser || !this.frequencyData) return undefined;
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }

  getTimeDomainData(): Uint8Array | undefined {
    if (!this.analyser || !this.timeData) return undefined;
    this.analyser.getByteTimeDomainData(this.timeData);
    return this.timeData;
  }
}

export const audioEngine = new AudioEngine();
