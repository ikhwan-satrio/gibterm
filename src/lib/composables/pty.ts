import { invoke, Channel } from '@tauri-apps/api/core';

export interface PtyOptions {
	cols: number;
	rows: number;
	cwd?: string | null;
	shell?: string | null;
	onData?: (data: ArrayBuffer) => void;
	onExit?: (code: number) => void;
}

export interface PtySession {
	id: number;
	cols: number;
	rows: number;
}

export async function openPty(options: PtyOptions): Promise<PtySession> {
	const onData = new Channel<ArrayBuffer>();
	const onExit = new Channel<number>();

	if (options.onData) onData.onmessage = options.onData;
	if (options.onExit) onExit.onmessage = options.onExit;

	const id = await invoke<number>('pty_open', {
		cols: options.cols,
		rows: options.rows,
		cwd: options.cwd ?? null,
		workspace: { kind: 'local' },
		blocks: false,
		shell: options.shell ?? null,
		onData,
		onExit
	});

	return { id, cols: options.cols, rows: options.rows };
}

export async function writeToPty(id: number, data: Uint8Array): Promise<void> {
	const headers = { 'x-pty-id': String(id) };
	await invoke('pty_write', data, { headers });
}

export async function resizePty(id: number, cols: number, rows: number): Promise<void> {
	await invoke('pty_resize', { id, cols, rows });
}

export async function closePty(id: number): Promise<void> {
	await invoke('pty_close', { id }).catch(() => {});
}
