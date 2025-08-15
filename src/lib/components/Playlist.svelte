<script lang="ts">
	import type { Track } from '$lib/types';

	let { tracks = [], currentId = null, selectTrack = (id: string) => {}, onReorder = (from: number, to: number) => {} } = $props();

	let dragIndex: number | null = null;

	function onDragStart(e: DragEvent, index: number) {
		dragIndex = index;
		e.dataTransfer?.setData('text/plain', String(index));
	}
	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}
	function onDrop(e: DragEvent, index: number) {
		e.preventDefault();
		const from = dragIndex ?? Number(e.dataTransfer?.getData('text/plain') ?? -1);
		if (from >= 0 && from !== index) onReorder(from, index);
		dragIndex = null;
	}

	function format(t: number) {
		if (!isFinite(t)) return '';
		const m = Math.floor(t / 60);
		const s = Math.floor(t % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}
</script>

<div class="playlist border border-[#223] rounded-lg p-2 bg-[#0a0a12]">
	{#if tracks.length === 0}
		<p>No tracks yet. Add some files.</p>
	{:else}
		<ul class="list-none p-0 m-0 grid gap-1">
			{#each tracks as t, i (t.id)}
				<li class="p-0" draggable="true" ondragstart={(e) => onDragStart(e, i)} ondragover={onDragOver} ondrop={(e) => onDrop(e, i)}>
					<button
						type="button"
						class="row grid [grid-template-columns:2rem_1fr_auto] gap-2 items-center py-1 px-2 rounded-md w-full text-left bg-transparent border-0 cursor-pointer hover:bg-[#121428] aria-[current=true]:bg-[#1a1f3e]"
						aria-current={t.id === currentId ? 'true' : undefined}
						onclick={() => selectTrack(t.id)}
						title={`Select ${t.name}`}
					>
						<span class="index opacity-70">{i + 1}.</span>
						<span class="name overflow-hidden text-ellipsis whitespace-nowrap">{t.name}</span>
						{#if t.duration}
							<span class="dur opacity-80 tabular-nums">{format(t.duration)}</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
