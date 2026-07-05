<script lang="ts">
	import {
		Folder,
		FolderOpen,
		File,
		ChevronRight,
		ChevronDown,
		Ellipsis,
		Pencil,
		Trash2,
		Copy,
		Scissors,
		Clipboard
	} from '@lucide/svelte';
	import {
		type TreeNode,
		toggleDir,
		deleteEntry,
		renameEntry,
		pasteClipboard
	} from '$lib/stores/cwd.svelte';
	import { cwdStore } from '$lib/stores/cwd.svelte';
	import FileTreeNode from '$lib/components/file-tree-node.svelte';
	import Dialog from '$lib/components/ui/dialog.svelte';

	let { node, depth = 0 }: { node: TreeNode; depth?: number } = $props();

	let showMenu = $state(false);
	let showDeleteDialog = $state(false);
	let showRenameDialog = $state(false);
	let renameValue = $state(node.entry.name);
	let menuPos = $state({ x: 0, y: 0 });

	async function handleClick() {
		if (node.entry.kind === 'dir') {
			await toggleDir(node);
		}
	}

	function handleNameClick(e: MouseEvent | KeyboardEvent) {
		e.stopPropagation();
	}

	function handleContextMenu(e: MouseEvent | KeyboardEvent) {
		e.preventDefault();
		e.stopPropagation();
		if ('clientX' in e) {
			menuPos = { x: e.clientX, y: e.clientY };
		}
		showMenu = true;
	}

	function closeMenu() {
		showMenu = false;
	}

	function handleDelete() {
		closeMenu();
		showDeleteDialog = true;
	}

	async function confirmDelete() {
		await deleteEntry(node.path);
	}

	function handleCopy() {
		closeMenu();
		cwdStore.copy([node.path]);
	}

	function handleCut() {
		closeMenu();
		cwdStore.cut([node.path]);
	}

	async function handlePaste() {
		closeMenu();
		await pasteClipboard();
	}

	function handleRename() {
		closeMenu();
		renameValue = node.entry.name;
		showRenameDialog = true;
	}

	async function confirmRename() {
		const parent = node.path.substring(0, node.path.lastIndexOf('/'));
		const newPath = `${parent}/${renameValue}`;
		if (newPath !== node.path) {
			await renameEntry(node.path, newPath);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div>
	<div
		class="flex items-center gap-1 w-full py-0.5 pr-2 text-left text-xs hover:bg-[#2a2a2a] rounded cursor-pointer transition-colors duration-100 group"
		style="padding-left: {depth * 12 + 8}px"
		role="treeitem"
		tabindex="-1"
		oncontextmenu={handleContextMenu}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') handleClick();
		}}
	>
		{#if node.entry.kind === 'dir'}
			<span
				class="text-[#666] shrink-0 cursor-pointer"
				onclick={handleClick}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') handleClick();
				}}
			>
				{#if node.expanded}
					<ChevronDown size={12} />
				{:else}
					<ChevronRight size={12} />
				{/if}
			</span>
			<span class="text-[#dcb67a] shrink-0">
				{#if node.expanded}
					<FolderOpen size={14} />
				{:else}
					<Folder size={14} />
				{/if}
			</span>
		{:else}
			<span class="w-3 shrink-0"></span>
			<span class="text-[#6c7a89] shrink-0">
				<File size={14} />
			</span>
		{/if}
		<span
			class="truncate text-[#ccc] flex-1 cursor-text"
			onclick={handleNameClick}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') handleNameClick(e);
			}}
		>
			{node.entry.name}
		</span>
		<span
			role="button"
			tabindex="-1"
			class="flex items-center justify-center w-5 h-5 rounded text-[#666] opacity-0 group-hover:opacity-100 hover:bg-[#444] hover:text-white cursor-pointer transition-all shrink-0"
			onclick={handleContextMenu}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') handleContextMenu(e);
			}}
		>
			<Ellipsis size={12} />
		</span>
	</div>

	{#if node.expanded && node.children.length > 0}
		<div>
			{#each node.children as child (child.path)}
				<FileTreeNode node={child} depth={depth + 1} />
			{/each}
		</div>
	{/if}
</div>

<!-- Context Menu -->
{#if showMenu}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50" onclick={closeMenu} onkeydown={() => {}}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl py-1 min-w-[140px]"
			style="left: {menuPos.x}px; top: {menuPos.y}px"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<button
				class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#ccc] hover:bg-[#333] cursor-pointer transition-colors"
				onclick={handleRename}
			>
				<Pencil size={12} />
				Rename
			</button>
			<button
				class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#ccc] hover:bg-[#333] cursor-pointer transition-colors"
				onclick={handleCopy}
			>
				<Copy size={12} />
				Copy
			</button>
			<button
				class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#ccc] hover:bg-[#333] cursor-pointer transition-colors"
				onclick={handleCut}
			>
				<Scissors size={12} />
				Cut
			</button>
			{#if cwdStore.hasClipboard}
				<button
					class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#ccc] hover:bg-[#333] cursor-pointer transition-colors"
					onclick={handlePaste}
				>
					<Clipboard size={12} />
					Paste
				</button>
			{/if}
			<div class="my-1 border-t border-[#333]"></div>
			<button
				class="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-[#e81123] hover:bg-[#e81123]/10 cursor-pointer transition-colors"
				onclick={handleDelete}
			>
				<Trash2 size={12} />
				Delete
			</button>
		</div>
	</div>
{/if}

<!-- Delete Dialog -->
<Dialog
	bind:open={showDeleteDialog}
	title="Delete {node.entry.name}"
	description="Are you sure you want to delete this {node.entry
		.kind}? This action cannot be undone."
	confirmLabel="Delete"
	destructive
	onconfirm={confirmDelete}
/>

<!-- Rename Dialog -->
<Dialog
	bind:open={showRenameDialog}
	title="Rename {node.entry.name}"
	description="Enter a new name for this {node.entry.kind}."
	confirmLabel="Rename"
	onconfirm={confirmRename}
>
	<input
		type="text"
		bind:value={renameValue}
		class="w-full h-8 px-3 text-xs text-white bg-[#1a1a1a] border border-[#444] rounded focus:outline-none focus:border-[#666]"
		onkeydown={(e) => {
			if (e.key === 'Enter') confirmRename();
		}}
	/>
</Dialog>
