<script lang="ts">
	import { X, Trash2 } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title,
		description,
		confirmLabel = 'Delete',
		destructive = false,
		onconfirm,
		children
	}: {
		open: boolean;
		title: string;
		description: string;
		confirmLabel?: string;
		destructive?: boolean;
		onconfirm: () => void;
		children?: Snippet;
	} = $props();

	function handleConfirm() {
		onconfirm();
		open = false;
	}

	function handleCancel() {
		open = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') handleCancel();
	}
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
		onkeydown={handleKeydown}
		onclick={handleCancel}
	>
		<div
			class="bg-[#2a2a2a] border border-[#444] rounded-lg shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<div class="flex items-start gap-3 p-5 pb-3">
				{#if destructive}
					<div
						class="flex items-center justify-center w-10 h-10 rounded-full bg-[#e81123]/15 shrink-0"
					>
						<Trash2 size={18} class="text-[#e81123]" />
					</div>
				{/if}
				<div class="flex-1 min-w-0">
					<h3 class="text-sm font-medium text-white">{title}</h3>
					<p class="text-xs text-[#888] mt-1">{description}</p>
				</div>
				<button
					class="flex items-center justify-center w-6 h-6 rounded text-[#666] hover:text-white hover:bg-[#444] cursor-pointer transition-colors shrink-0"
					onclick={handleCancel}
				>
					<X size={14} />
				</button>
			</div>

			{#if children}
				<div class="px-5 pb-3">
					{@render children()}
				</div>
			{/if}

			<div class="flex items-center justify-end gap-2 px-5 py-3 bg-[#222] border-t border-[#333]">
				<button
					class="h-8 px-3 text-xs font-medium text-[#ccc] bg-[#333] hover:bg-[#444] rounded cursor-pointer transition-colors"
					onclick={handleCancel}
				>
					Cancel
				</button>
				<button
					class="h-8 px-3 text-xs font-medium rounded cursor-pointer transition-colors {destructive
						? 'bg-[#e81123] text-white hover:bg-[#ff2d3f]'
						: 'bg-[#555] text-white hover:bg-[#666]'}"
					onclick={handleConfirm}
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
