<script lang="ts">
  // Props expected from parent
  export let playing: boolean;
  export let current: number; // seconds
  export let duration: number; // seconds
  // volume reserved for future use (uncomment when implemented)
  export let canPrev: boolean;
  export let canNext: boolean;
  export let format: (t: number) => string;
  export let onTogglePlay: () => void;
  export let onPrev: () => void;
  export let onNext: () => void;
  export let onSeek: (t: number) => void;
  export let onVolume: (v: number) => void;
  export let show: boolean; // visibility controlled by parent idle logic
  export let onInteract: () => void; // notify parent to keep visible
  export let showPlaylist: boolean;
  export let togglePlaylist: () => void;
  // Scene picker removed (only bars visualizer remains)

  function handleSeek(e: Event) {
    const target = e.target as HTMLInputElement;
    const v = Number(target.value);
    onSeek(v);
  }
  function handleVolume(e: Event) {
    const target = e.target as HTMLInputElement;
    const v = Number(target.value);
    onVolume(v);
  }
</script>

<div class="transport-wrapper" role="region" aria-label="Player transport" data-visible={show ? 'true' : 'false'} on:mousemove={onInteract} on:focusin={onInteract} on:touchstart={onInteract}>
  <div class="gradient-layer" aria-hidden="true"></div>
  <div class="controls-row" role="group" aria-label="Playback controls">
    <button class="icon-btn" aria-label="Previous track" disabled={!canPrev} on:click={() => { onPrev(); onInteract(); }}>
      <!-- Prev icon -->
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14"/><path d="M18 6l-8.5 6L18 18z"/></svg>
    </button>
    <button class="icon-btn play" aria-label={playing ? 'Pause' : 'Play'} on:click={() => { onTogglePlay(); onInteract(); }}>
      {#if playing}
        <!-- Pause -->
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
      {:else}
        <!-- Play -->
        <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      {/if}
    </button>
    <button class="icon-btn" aria-label="Next track" disabled={!canNext} on:click={() => { onNext(); onInteract(); }}>
      <!-- Next icon -->
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5v14"/><path d="M6 6l8.5 6L6 18z"/></svg>
    </button>

    <div class="time" aria-live="off">{format(current)} / {format(duration)}</div>

    <div class="spacer"></div>

  <button class="icon-btn small" aria-pressed={showPlaylist} aria-label="Toggle playlist" on:click={() => { togglePlaylist(); onInteract(); }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h13"/><path d="M3 12h13"/><path d="M3 18h13"/></svg>
    </button>
  </div>
  <div class="seek-row">
    <input class="seek" type="range" min="0" max={duration} step="0.01" value={current} on:input={handleSeek} aria-label="Seek" />
  </div>
  <!-- Scene picker removed -->
</div>

<style>
  .transport-wrapper {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    padding: clamp(0.75rem,2vh,1.25rem) clamp(1rem,2vw,2rem) clamp(1.1rem,2.5vh,1.75rem);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    pointer-events: none;
    --fade-duration: 300ms;
    transition: opacity var(--fade-duration) ease, transform var(--fade-duration) ease;
    opacity: 0;
    transform: translateY(12px);
    z-index: 30;
  }
  .transport-wrapper[data-visible='true'] {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .gradient-layer {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(8,10,20,0.9) 0%, rgba(8,10,25,0.55) 55%, rgba(8,10,25,0) 100%);
    backdrop-filter: blur(4px) brightness(1.05);
    -webkit-backdrop-filter: blur(4px) brightness(1.05);
    border-top: 1px solid rgba(120,140,200,0.15);
    pointer-events: none;
    z-index: 0;
  }
  .controls-row {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #e6f0ff;
    font-size: 0.9rem;
    text-shadow: 0 0 8px rgba(120,200,255,0.35);
  }
  .icon-btn {
    background: none;
    border: 0;
    padding: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #e6f0ff;
    transition: filter 160ms, transform 160ms; 
    border-radius: 8px; /* improve focus outline shape */
  }
  .icon-btn:focus-visible {
    outline: 2px solid #7c4dff;
    outline-offset: 2px;
  }
  .icon-btn:hover:not(:disabled), .icon-btn:focus-visible {
    filter: drop-shadow(0 0 6px rgba(124,77,255,0.7));
  }
  .icon-btn:active:not(:disabled) { transform: scale(0.92); }
  .icon-btn:disabled { opacity: 0.3; cursor: default; }
  .icon-btn.play svg { filter: drop-shadow(0 0 10px rgba(124,77,255,0.9)); }
  .icon-btn.play:hover svg { filter: drop-shadow(0 0 14px rgba(124,77,255,1)); }
  .time { min-width: 120px; opacity: 0.85; }
  .spacer { flex: 1; }
  .seek-row { position: relative; z-index: 2; }
  .seek { width: 100%; cursor: pointer; background: transparent; }
  .seek::-webkit-slider-runnable-track { height: 6px; border-radius: 3px; background: linear-gradient(90deg,#7c4dff,#4dd2ff); }
  .seek::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff 0%, #b8e9ff 40%, #7c4dff 100%); box-shadow: 0 0 10px 2px rgba(124,77,255,0.8); margin-top: -6px; }
  .seek::-moz-range-track { height: 6px; border-radius: 3px; background: linear-gradient(90deg,#7c4dff,#4dd2ff); }
  .seek::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #fff 0%, #b8e9ff 40%, #7c4dff 100%); box-shadow: 0 0 10px 2px rgba(124,77,255,0.8); border: 0; }
  /* Scene picker styles removed */
  @media (max-width: 720px) {
    .controls-row { flex-wrap: wrap; }
    .time { order: 10; width: 100%; }
  }
</style>
