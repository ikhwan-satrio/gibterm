<script lang="ts">
	import { Minus, Plus, X, Square, Copy } from '@lucide/svelte';
	import { getCurrentWindow } from '@tauri-apps/api/window';
	import { tabStore } from '$lib/stores/tabs.svelte';

	let maximized = $state(false);

	async function handleMinimize() {
		await getCurrentWindow().minimize();
	}

	async function handleMaximize() {
		const win = getCurrentWindow();
		if (maximized) {
			await win.unmaximize();
		} else {
			await win.maximize();
		}
		maximized = !maximized;
	}

	async function handleClose() {
		await getCurrentWindow().close();
	}
</script>

<div
	class="flex items-center justify-between h-9 bg-[#1a1a1a] border-b border-[#333] select-none shrink-0"
	data-tauri-drag-region
>
	<div
		class="flex items-center gap-px pl-2 flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden"
	>
		{#each tabStore.tabs as tab (tab.id)}
			<button
				class="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs cursor-pointer whitespace-nowrap transition-all duration-150 {tab.active
					? 'bg-[#333] text-white'
					: 'bg-transparent text-[#888] hover:bg-[#2a2a2a] hover:text-[#ccc]'}"
				onclick={() => tabStore.setActive(tab.id)}
			>
				<span class="max-w-[120px] overflow-hidden text-ellipsis">{tab.title}</span>
				<span
					role="button"
					tabindex="0"
					class="flex items-center justify-center w-4 h-4 rounded text-[#666] opacity-0 transition-all duration-150 hover:bg-[#444] hover:text-white group-hover:opacity-100"
					onclick={(e) => {
						e.stopPropagation();
						tabStore.closeTab(tab.id);
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') tabStore.closeTab(tab.id);
					}}
				>
					<X size={12} />
				</span>
			</button>
		{/each}
		<button
			class="flex items-center justify-center w-6 h-6 ml-1 rounded-md bg-transparent border-none text-[#666] cursor-pointer transition-all duration-150 hover:bg-[#2a2a2a] hover:text-white"
			onclick={() => tabStore.addTab()}
		>
			<Plus size={14} />
		</button>
	</div>

	<div class="flex items-center h-full pr-2 gap-0.5">
		<button
			class="flex items-center justify-center w-8 h-7 rounded-md bg-transparent border-none text-[#888] cursor-pointer transition-all duration-150 hover:bg-[#333] hover:text-white"
			onclick={handleMinimize}
		>
			<Minus size={14} />
		</button>
		<button
			class="flex items-center justify-center w-8 h-7 rounded-md bg-transparent border-none text-[#888] cursor-pointer transition-all duration-150 hover:bg-[#333] hover:text-white"
			onclick={handleMaximize}
		>
			{#if maximized}
				<Copy size={12} />
			{:else}
				<Square size={12} />
			{/if}
		</button>
		<button
			class="flex items-center justify-center w-8 h-7 rounded-md bg-transparent border-none text-[#888] cursor-pointer transition-all duration-150 hover:bg-[#e81123] hover:text-white"
			onclick={handleClose}
		>
			<X size={14} />
		</button>
	</div>
</div>
