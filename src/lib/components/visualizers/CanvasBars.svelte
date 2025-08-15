<script lang="ts">
	import { audioEngine } from '$lib/audio/AudioEngine';
	import { browser } from '$app/environment';
	import { makeSizer } from '$lib/sizing';
	let canvas: HTMLCanvasElement | undefined;
	// Props (runes mode) – accept fullscreen flag
	const { fullscreen = false } = $props<{ fullscreen?: boolean }>();

	let raf = 0;
	let disposeSize: (() => void) | undefined;
	let cw = 0, ch = 0, dpr = 1;
	// Precompute x positions (up to 64 bars) to avoid per-frame allocation
	const maxBars = 64;
	const xs = new Float32Array(maxBars);
	let cachedBars = 0; // last bar count used to populate xs

	// Frame throttling & change detection
	let lastFrameTime = 0; // rAF timestamp of last full draw
	const PAUSED_INTERVAL = 66; // ~15fps when paused
	const prevVals = new Float32Array(maxBars); // previous normalized magnitudes (0..1)
	// Phased pause animation: hold 1s then ease-out collapse over ~1.1s.
	let decayPhase = 0; // 0 idle paused / none, 1 hold, 2 decay
	let lastPlaying = false; // for edge detection
	const HOLD_MS = 1000;
	const DECAY_MS = 1100;
	let decayHoldEnd = 0; // timestamp when phase should switch to decay
	let decayStartTime = 0; // timestamp when decay started
	const decaySnapshot = new Float32Array(maxBars); // frozen bar heights at pause moment
	let firstFrame = true;
	const CHANGE_EPS = 0.002; // average delta threshold to skip redraw when virtually static

	$effect(() => {
		if (!browser) return;
		if (!canvas) return;
		const ctx = canvas.getContext('2d')!;

		// Use ResizeObserver-driven sizing
		disposeSize = makeSizer(canvas, (w, h, d) => {
			if (!canvas) return;
			cw = w;
			const baseH = fullscreen ? h : 220;
			ch = baseH;
			dpr = d;
			canvas.width = Math.max(1, Math.floor(cw * dpr));
			canvas.height = Math.max(1, Math.floor(ch * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			cachedBars = 0; // force recompute xs next frame
		});

		function renderFrame(t: number) {
			// Phase-aware pause handling
			const playing = audioEngine.playing;
			if (lastPlaying && !playing) {
				// Enter hold phase
				decayPhase = 1;
				decayHoldEnd = t + HOLD_MS;
				for (let i = 0; i < maxBars; i++) decaySnapshot[i] = prevVals[i];
			}
			if (!lastPlaying && playing) {
				decayPhase = 0; // cancel any pause animation on resume
			}
			lastPlaying = playing;
			if (!playing && decayPhase === 1 && t >= decayHoldEnd) {
				decayPhase = 2;
				decayStartTime = t;
			}
			// Throttle only when fully paused & idle (phase 0)
			if (!playing && decayPhase === 0 && t - lastFrameTime < PAUSED_INTERVAL) {
				raf = requestAnimationFrame(renderFrame);
				return;
			}
			lastFrameTime = t;

			if (cw === 0 || ch === 0) { raf = requestAnimationFrame(renderFrame); return; }

			const data = audioEngine.getFrequencyData();
			if (!data) { raf = requestAnimationFrame(renderFrame); return; }
			let bars = Math.min(maxBars, data.length);

			// Precompute xs only if bar count or width changed since last time
			if (bars !== cachedBars) {
				const barW = cw / bars;
				for (let i = 0; i < bars; i++) xs[i] = i * barW;
				cachedBars = bars;
			}

			// Change detection (playing only)
			if (playing) {
				let diffAccum = 0;
				for (let i = 0; i < bars; i++) {
					const v = data[i] / 255;
					diffAccum += Math.abs(v - prevVals[i]);
				}
				const avgDiff = diffAccum / bars;
				if (!firstFrame && avgDiff < CHANGE_EPS) { raf = requestAnimationFrame(renderFrame); return; }
			}

			firstFrame = false;
			ctx.clearRect(0, 0, cw, ch);
			const barW = cw / bars;
			const usableHBase = ch - 20;

			// Fill & build stroke path in one pass
			ctx.save();
			ctx.globalCompositeOperation = 'source-over';
			if (playing) {
				for (let i = 0; i < bars; i++) {
					const v = data[i] / 255;
					prevVals[i] = v;
					const x = xs[i];
					const y = usableHBase * (1 - v);
					ctx.fillStyle = `hsl(${280 - i * 2}, 100%, ${40 + v * 40}%)`;
					ctx.fillRect(x, y, barW + 0.5, usableHBase - y);
				}
			} else {
				if (decayPhase === 1) {
					// Hold: draw frozen snapshot
					for (let i = 0; i < bars; i++) {
						const v = decaySnapshot[i];
						prevVals[i] = v; // keep for stroke
						const x = xs[i];
						const y = usableHBase * (1 - v);
						ctx.fillStyle = `hsl(${280 - i * 2}, 100%, ${40 + v * 40}%)`;
						ctx.fillRect(x, y, barW + 0.5, usableHBase - y);
					}
				} else if (decayPhase === 2) {
					const pRaw = (t - decayStartTime) / DECAY_MS;
					const p = Math.min(1, Math.max(0, pRaw));
					const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
					for (let i = 0; i < bars; i++) {
						const v = decaySnapshot[i] * (1 - eased);
						prevVals[i] = v;
						const x = xs[i];
						const y = usableHBase * (1 - v);
						ctx.fillStyle = `hsl(${280 - i * 2}, 100%, ${40 + v * 40}%)`;
						ctx.fillRect(x, y, barW + 0.5, usableHBase - y);
					}
					if (p >= 1) {
						decayPhase = 0; // finished -> idle
						for (let i = 0; i < bars; i++) prevVals[i] = 0;
					}
				} else {
					// Idle paused baseline
					for (let i = 0; i < bars; i++) prevVals[i] = 0;
				}
			}
			ctx.restore();

			// Single glow stroke path
			ctx.save();
			ctx.globalCompositeOperation = 'lighter';
			const outlineW = Math.max(1, barW * 0.08);
			ctx.lineWidth = outlineW;
			ctx.strokeStyle = 'rgba(255,255,255,0.55)';
			ctx.shadowColor = 'rgba(255,255,255,0.9)';
			ctx.shadowBlur = 12;
			ctx.beginPath();
			for (let i = 0; i < bars; i++) {
				const v = prevVals[i];
				const x = xs[i];
				const y = usableHBase * (1 - v);
				ctx.rect(x + outlineW * 0.5, y, Math.max(0, barW - outlineW), usableHBase - y);
			}
			ctx.stroke();
			ctx.restore();

			raf = requestAnimationFrame(renderFrame);
		}

		function onVis() {
			if (document.hidden) cancelAnimationFrame(raf);
			else raf = requestAnimationFrame(renderFrame);
		}
		document.addEventListener('visibilitychange', onVis);

		raf = requestAnimationFrame(renderFrame);
		return () => {
			document.removeEventListener('visibilitychange', onVis);
			disposeSize?.();
			cancelAnimationFrame(raf);
		};
	});
</script>

<canvas bind:this={canvas} class="w-full {fullscreen ? 'h-full' : 'h-[180px]'} rounded-lg bg-[linear-gradient(180deg,#0b0b13,#0e0e1a)]"></canvas>
