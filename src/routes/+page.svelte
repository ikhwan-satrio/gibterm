<script lang="ts">
	import Titlebar from '$lib/components/titlebar.svelte';
	import ShellTerminal from '$lib/components/shell-terminal.svelte';
	import FileTree from '$lib/components/file-tree.svelte';
	import { tabStore } from '$lib/stores/tabs.svelte';
	import { cwdStore } from '$lib/stores/cwd.svelte';

	function handleCwdChange(cwd: string) {
		cwdStore.setCwd(cwd);
	}

	$effect(() => {
		const active = tabStore.activeTab;
		if (active) {
			cwdStore.setCwd(active.cwd);
		}
	});
</script>

<div class="flex flex-col w-screen h-screen overflow-hidden bg-[#1a1a1a]">
	<Titlebar />
	<div class="flex flex-1 overflow-hidden">
		<div class="w-56 shrink-0">
			<FileTree />
		</div>
		<div class="flex-1 relative overflow-hidden">
			{#each tabStore.tabs as tab (tab.id)}
				<div class="absolute inset-0" class:inactive={!tab.active}>
					<ShellTerminal tabId={tab.id} onCwdChange={handleCwdChange} />
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.inactive {
		visibility: hidden;
		pointer-events: none;
	}
</style>
