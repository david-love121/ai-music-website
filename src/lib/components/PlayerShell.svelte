<script lang="ts">
	import { audioEngine } from '$lib/audio/AudioEngine';
import VisualizerHost from './visualizers/VisualizerHost.svelte';
import Playlist from './Playlist.svelte';
	import KeyboardShortcuts from './KeyboardShortcuts.svelte';
	import BottomTransport from './BottomTransport.svelte';

	let fileInput = $state<HTMLInputElement | undefined>(undefined);

// playlist state
import type { Track } from '$lib/types';
let tracks = $state<Track[]>([]);
let loadedDefaults = $state(false);
let currentId = $state<string | null>(null);

	// local reactive state
	let playing = $state(false);
	let current = $state(0);
	let duration = $state(0);
	let volume = $state(0.8);

	// fullscreen UI additions
	let showUI = $state(true);
	let uiTimer: number | null = null;
	let playlistOpen = $state(false);
	// Visualizer scenes removed; only bars remains

	function bumpUI() {
		showUI = true;
		if (uiTimer) clearTimeout(uiTimer);
		uiTimer = setTimeout(() => { showUI = false; }, 3000) as unknown as number;
	}
	$effect(() => {
		if (typeof window === 'undefined') return;
		function keyHandler(e: KeyboardEvent) {
			if ([' ', 'Space', 'ArrowLeft', 'ArrowRight'].includes(e.key)) bumpUI();
		}
		window.addEventListener('keydown', keyHandler);
		window.addEventListener('mousemove', bumpUI, { passive: true });
		window.addEventListener('touchstart', bumpUI, { passive: true });
		return () => {
			window.removeEventListener('keydown', keyHandler);
			window.removeEventListener('mousemove', bumpUI);
			window.removeEventListener('touchstart', bumpUI);
		};
	});
	function togglePlaylist() { playlistOpen = !playlistOpen; bumpUI(); }

function onSelectFiles(e: Event) {
		const files = (e.target as HTMLInputElement).files;
		if (!files || files.length === 0) return;
		const added: Track[] = [];
		for (const f of Array.from(files)) {
			added.push({ id: crypto.randomUUID(), name: f.name, src: f });
		}
		tracks.push(...added);
		// Auto-select first added if nothing selected
		if (!currentId && added.length) {
			selectTrack(added[0].id);
		}
	}

	async function togglePlay() {
		if (audioEngine.playing) {
			audioEngine.pause();
			playing = false;
		} else {
			await audioEngine.play();
			playing = true;
		}
	}

	function onSeek(input: Event) {
		const t = Number((input.target as HTMLInputElement).value);
		audioEngine.seek(t);
		current = t;
	}

	function onVolume(input: Event) {
		const v = Number((input.target as HTMLInputElement).value);
		volume = v;
		audioEngine.setVolume(v);
	}

async function selectTrack(id: string) {
	const next = tracks.find((t) => t.id === id);
	if (!next) return;
	currentId = id;
	await audioEngine.load(next.src);
	duration = audioEngine.duration;
	await audioEngine.play();
	playing = true;
}

function nextTrack() {
	if (!tracks.length || !currentId) return;
	const idx = tracks.findIndex((t) => t.id === currentId);
	const next = tracks[(idx + 1) % tracks.length];
	selectTrack(next.id);
}
function prevTrack() {
	if (!tracks.length || !currentId) return;
	const idx = tracks.findIndex((t) => t.id === currentId);
	const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
	selectTrack(prev.id);
}

function reorder(from: number, to: number) {
	if (from === to) return;
	const item = tracks.splice(from, 1)[0];
	tracks.splice(to, 0, item);
}

// util
	function format(t: number) {
		if (!isFinite(t)) return '0:00';
		const m = Math.floor(t / 60);
		const s = Math.floor(t % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}

	let raf = 0;
	$effect(() => {
		if (typeof window === 'undefined') return;
		cancelAnimationFrame(raf);
		function loop() {
			current = audioEngine.currentTime;
			duration = audioEngine.duration || duration;
			raf = requestAnimationFrame(loop);
		}
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});

	// Load default tracks from static manifest (for static hosting like GitHub Pages)
	$effect(() => {
		if (typeof window === 'undefined') return;
		if (loadedDefaults || tracks.length > 0) return;
		const base = (import.meta as any).env?.BASE_URL || '';
		fetch(`${base}music-dir/manifest.json`)
			.then((r) => (r.ok ? r.json() : []))
			.then((list: string[]) => {
				if (!Array.isArray(list) || !list.length) return;
				for (const fname of list) {
					tracks.push({ id: crypto.randomUUID(), name: fname, src: `${base}music-dir/${fname}` });
				}
				loadedDefaults = true;
				if (!currentId && tracks.length) selectTrack(tracks[0].id);
			})
			.catch(() => {});
	});

	// auto-next when track ends
	$effect(() => {
		audioEngine.onEnded(() => nextTrack());
	});

	// Removed unused energy metrics loop (no visualizers consume it now)
</script>

<div class="fullscreen-player" role="application" onmousemove={bumpUI}>
	<!-- Fullscreen visual layer -->
	<div class="visual-layer" aria-hidden="true">
		<VisualizerHost fullscreen={true} />
	</div>

	<!-- Optional playlist panel -->
	{#if playlistOpen}
		<div class="playlist-panel" role="region" aria-label="Playlist panel" onmousemove={(e)=> e.stopPropagation()}>
			<div class="panel-header flex items-center justify-between mb-2">
				<h2 class="text-sm tracking-wide uppercase text-[#9fb4ff]">Playlist</h2>
				<button class="close-btn" aria-label="Close playlist" onclick={togglePlaylist}>✕</button>
			</div>
			<Playlist {tracks} {currentId} selectTrack={selectTrack} onReorder={reorder} />
			<div class="mt-3">
				<input type="file" bind:this={fileInput} accept="audio/*" multiple onchange={onSelectFiles} class="text-xs" />
			</div>
		</div>
	{/if}

	<!-- Bottom transport overlay -->
		<BottomTransport
		playing={playing}
		current={current}
		duration={duration}
		canPrev={tracks.length > 1}
		canNext={tracks.length > 1}
		{format}
		onTogglePlay={togglePlay}
		onPrev={prevTrack}
		onNext={nextTrack}
		onSeek={(t)=> { audioEngine.seek(t); current = t; bumpUI(); }}
		onVolume={(v)=> { volume = v; audioEngine.setVolume(v); bumpUI(); }}
		show={showUI}
		onInteract={bumpUI}
		showPlaylist={playlistOpen}
			togglePlaylist={togglePlaylist}
		>
		</BottomTransport>

	<KeyboardShortcuts onPlayPause={togglePlay} onPrev={prevTrack} onNext={nextTrack} onSeekRel={(d: number)=> { audioEngine.seek(audioEngine.currentTime + d); bumpUI(); }} onVolumeRel={(dv: number)=> { volume = Math.max(0, Math.min(1, volume + dv)); audioEngine.setVolume(volume); bumpUI(); }} />
</div>

<style>
	.fullscreen-player {
		position: relative;
		width: 100%;
		height: 100dvh;
		overflow: hidden;
		font-family: system-ui, sans-serif;
		color: #e6f0ff;
		background: #000; /* fallback */
	}
	.visual-layer { position: absolute; inset:0; }
	.playlist-panel {
		position: absolute;
		top: 4%; left: 3%; bottom: 20%;
		width: min(320px, 90vw);
		overflow-y: auto;
		padding: 1rem 1rem 1.25rem;
		background: rgba(10,12,24,0.78);
		backdrop-filter: blur(14px) saturate(140%);
		-webkit-backdrop-filter: blur(14px) saturate(140%);
		border: 1px solid rgba(120,140,200,0.25);
		border-radius: 18px;
		z-index: 40;
		box-shadow: 0 10px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(140,170,255,0.1) inset;
	}
	.close-btn { background:none; border:0; color:#e6f0ff; cursor:pointer; font-size: 0.9rem; }
	.close-btn:hover { color:#fff; }

	@media (max-width: 820px) {
		.playlist-panel { top: 8%; left: 4%; right: 4%; width: auto; }
	}
</style>
