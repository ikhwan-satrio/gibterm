import { invoke } from '@tauri-apps/api/core';

export interface FileEntry {
	name: string;
	kind: 'file' | 'dir' | 'symlink';
	size: number;
	mtime: number;
	gitignored: boolean;
}

export interface TreeNode {
	entry: FileEntry;
	expanded: boolean;
	children: TreeNode[];
	loaded: boolean;
	path: string;
}

type ClipboardAction = 'copy' | 'cut';

interface ClipboardEntry {
	path: string;
	action: ClipboardAction;
}

class CwdStore {
	cwd = $state('~');
	nodes = $state<TreeNode[]>([]);
	clipboard: ClipboardEntry[] = $state([]);

	async refresh(): Promise<void> {
		this.nodes = await buildTree(this.cwd);
	}

	setCwd(path: string): void {
		if (path === this.cwd) return;
		this.cwd = path;
		this.refresh();
	}

	copy(paths: string[]): void {
		this.clipboard = paths.map((path) => ({ path, action: 'copy' }));
	}

	cut(paths: string[]): void {
		this.clipboard = paths.map((path) => ({ path, action: 'cut' }));
	}

	clearClipboard(): void {
		this.clipboard = [];
	}

	get hasClipboard(): boolean {
		return this.clipboard.length > 0;
	}
}

export const cwdStore = new CwdStore();

// --- Read ---

async function readDir(path: string): Promise<FileEntry[]> {
	return invoke<FileEntry[]>('fs_read_dir', {
		path,
		showHidden: true,
		gitDecorations: true,
		workspace: { kind: 'local' }
	});
}

async function buildTree(path: string): Promise<TreeNode[]> {
	const entries = await readDir(path);
	return entries.map((entry) => ({
		entry,
		expanded: false,
		children: [],
		loaded: false,
		path: `${path}/${entry.name}`
	}));
}

// --- Mutations ---

export async function createFile(path: string): Promise<void> {
	await invoke('fs_create_file', {
		path,
		workspace: { kind: 'local' }
	});
	await cwdStore.refresh();
}

export async function createDir(path: string): Promise<void> {
	await invoke('fs_create_dir', {
		path,
		workspace: { kind: 'local' }
	});
	await cwdStore.refresh();
}

export async function renameEntry(from: string, to: string): Promise<void> {
	await invoke('fs_rename', {
		from,
		to,
		workspace: { kind: 'local' }
	});
	await cwdStore.refresh();
}

export async function deleteEntry(path: string): Promise<void> {
	await invoke('fs_delete', {
		path,
		workspace: { kind: 'local' }
	});
	await cwdStore.refresh();
}

export async function copyEntries(sources: string[], destDir: string): Promise<void> {
	await invoke('fs_copy', {
		sources,
		destDir,
		workspace: { kind: 'local' }
	});
	await cwdStore.refresh();
}

export async function moveEntry(from: string, to: string): Promise<void> {
	await invoke('fs_rename', {
		from,
		to,
		workspace: { kind: 'local' }
	});
	await cwdStore.refresh();
}

export async function pasteClipboard(): Promise<void> {
	const entries = cwdStore.clipboard;
	if (entries.length === 0) return;

	for (const entry of entries) {
		const fileName = entry.path.split('/').pop() || '';
		if (entry.action === 'copy') {
			const destPath = `${cwdStore.cwd}/${fileName}`;
			await invoke('fs_copy', {
				sources: [entry.path],
				destDir: cwdStore.cwd,
				workspace: { kind: 'local' }
			});
			// Handle name conflict: if dest already exists, append "copy"
			// (handled by fs_copy backend)
		} else {
			const destPath = `${cwdStore.cwd}/${fileName}`;
			await moveEntry(entry.path, destPath);
		}
	}

	cwdStore.clearClipboard();
	await cwdStore.refresh();
}

// --- Tree helpers ---

export async function toggleDir(node: TreeNode): Promise<void> {
	if (node.entry.kind !== 'dir') return;

	if (!node.loaded) {
		node.children = await buildTree(node.path);
		node.loaded = true;
	}
	node.expanded = !node.expanded;
}
