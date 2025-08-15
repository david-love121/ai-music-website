<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<style>
	:global(html, body) {
		height: 100%;
		margin: 0;
	}
	/* If your app root has an id, ensure it fills height too (kept harmless if missing) */
	:global(#app) {
		height: 100%;
	}
	/* Removed unused .wrapper and .canvas-host selectors */
	/* Ensure no parent flex/calc collapses height */
</style>

{@render children?.()}
