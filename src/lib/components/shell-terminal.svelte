<script lang="ts">
	import { useTerminal, type TerminalProps } from '$lib/composables/terminal.svelte';
	import { tabStore } from '$lib/stores/tabs.svelte';

	let {
		config,
		tabId,
		onCwdChange
	}: TerminalProps & { tabId: string; onCwdChange?: (cwd: string) => void } = $props();

	let containerRef = $state<HTMLDivElement>();

	useTerminal(() => containerRef, {
		config,
		onCwdChange: (cwd) => {
			tabStore.updateCwd(tabId, cwd);
			onCwdChange?.(cwd);
		}
	});
</script>

<div class="h-full w-full min-h-[200px] bg-[#1e1e1e]" bind:this={containerRef}></div>
