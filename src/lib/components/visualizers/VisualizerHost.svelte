<script lang="ts">
	import CanvasBars from './CanvasBars.svelte';
	// Simplified host: only Bars visualizer remains. Keep fullscreen prop for layout compatibility.
	const { fullscreen = false } = $props<{ fullscreen?: boolean }>();
</script>

<div class={fullscreen ? 'vis-host-full' : 'host'}>
	<CanvasBars {fullscreen} />
</div>

<style>
	.vis-host-full {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		pointer-events: none; /* canvas handles events */
	}
	.host { width: 100%; }
</style>
