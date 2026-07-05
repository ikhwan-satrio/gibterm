<script lang="ts">
	import { onMount } from 'svelte';
	import { FolderOpen, FilePlus, FolderPlus, RefreshCw, Clipboard } from '@lucide/svelte';
	import { cwdStore, createFile, createDir, pasteClipboard } from '$lib/stores/cwd.svelte';
	import FileTreeNode from '$lib/components/file-tree-node.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';

	let showNewFileDialog = $state(false);
	let showNewFolderDialog = $state(false);
	let newNameValue = $state('');

	onMount(() => {
		cwdStore.refresh();
	});

	function handleNewFile() {
		newNameValue = '';
		showNewFileDialog = true;
	}

	function handleNewFolder() {
		newNameValue = '';
		showNewFolderDialog = true;
	}

	async function confirmNewFile() {
		if (!newNameValue.trim()) return;
		const path = `${cwdStore.cwd}/${newNameValue.trim()}`;
		await createFile(path);
	}

	async function confirmNewFolder() {
		if (!newNameValue.trim()) return;
		const path = `${cwdStore.cwd}/${newNameValue.trim()}`;
		await createDir(path);
	}

	async function handlePaste() {
		await pasteClipboard();
	}
</script>

<div class="flex flex-col h-full bg-[#1a1a1a] border-r border-[#333]">
	<div
		class="flex items-center justify-between px-3 py-2 text-xs text-[#888] border-b border-[#333] shrink-0"
	>
		<div class="flex items-center gap-2">
			<FolderOpen size={14} />
			<span class="font-medium">Files</span>
		</div>
		<div class="flex items-center gap-0.5">
			{#if cwdStore.hasClipboard}
				<button
					class="flex items-center justify-center w-5 h-5 rounded text-[#666] hover:bg-[#333] hover:text-white cursor-pointer transition-colors"
					title="Paste"
					onclick={handlePaste}
				>
					<Clipboard size={13} />
				</button>
			{/if}
			<button
				class="flex items-center justify-center w-5 h-5 rounded text-[#666] hover:bg-[#333] hover:text-white cursor-pointer transition-colors"
				title="New File"
				onclick={handleNewFile}
			>
				<FilePlus size={13} />
			</button>
			<button
				class="flex items-center justify-center w-5 h-5 rounded text-[#666] hover:bg-[#333] hover:text-white cursor-pointer transition-colors"
				title="New Folder"
				onclick={handleNewFolder}
			>
				<FolderPlus size={13} />
			</button>
			<button
				class="flex items-center justify-center w-5 h-5 rounded text-[#666] hover:bg-[#333] hover:text-white cursor-pointer transition-colors"
				title="Refresh"
				onclick={() => cwdStore.refresh()}
			>
				<RefreshCw size={13} />
			</button>
		</div>
	</div>
	<div class="flex-1 overflow-auto py-1">
		{#each cwdStore.nodes as node (node.path)}
			<FileTreeNode {node} />
		{/each}
	</div>
</div>

<!-- New File Dialog -->
<Dialog
	bind:open={showNewFileDialog}
	title="New File"
	description="Enter a name for the new file."
	confirmLabel="Create"
	onconfirm={confirmNewFile}
>
	<input
		type="text"
		bind:value={newNameValue}
		placeholder="filename.txt"
		class="w-full h-8 px-3 text-xs text-white bg-[#1a1a1a] border border-[#444] rounded focus:outline-none focus:border-[#666]"
		onkeydown={(e) => {
			if (e.key === 'Enter') confirmNewFile();
		}}
	/>
</Dialog>

<!-- New Folder Dialog -->
<Dialog
	bind:open={showNewFolderDialog}
	title="New Folder"
	description="Enter a name for the new folder."
	confirmLabel="Create"
	onconfirm={confirmNewFolder}
>
	<input
		type="text"
		bind:value={newNameValue}
		placeholder="folder-name"
		class="w-full h-8 px-3 text-xs text-white bg-[#1a1a1a] border border-[#444] rounded focus:outline-none focus:border-[#666]"
		onkeydown={(e) => {
			if (e.key === 'Enter') confirmNewFolder();
		}}
	/>
</Dialog>
