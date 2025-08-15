<script lang="ts">
	let { onPlayPause = () => {}, onPrev = () => {}, onNext = () => {}, onSeekRel = (sec: number) => {}, onVolumeRel = (delta: number) => {} } = $props();

	$effect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return; // don't steal focus
			switch (e.key) {
				case ' ': // space
					e.preventDefault();
					onPlayPause();
					break;
				case 'ArrowRight':
					onSeekRel(5);
					break;
				case 'ArrowLeft':
					onSeekRel(-5);
					break;
				case '+':
				case '=':
					onVolumeRel(0.05);
					break;
				case '-':
					onVolumeRel(-0.05);
					break;
				case 'n':
				case 'N':
					onNext();
					break;
				case 'p':
				case 'P':
					onPrev();
					break;
			}
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<!-- no markup needed -->
