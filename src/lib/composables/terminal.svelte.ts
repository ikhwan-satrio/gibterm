import { onMount } from 'svelte';
import { createTerminal, type TerminalConfig } from './xterm';
import { createKeyHandler } from './keyboard';
import { parseOsc7Cwd } from './osc7';
import { openPty, writeToPty, resizePty, closePty } from './pty';

export interface TerminalProps {
	config?: TerminalConfig;
	onCwdChange?: (cwd: string) => void;
}

export function useTerminal(
	container: () => HTMLDivElement | undefined,
	{ config, onCwdChange }: TerminalProps = {}
) {
	onMount(() => {
		const el = container();
		if (!el) return;

		let disposed = false;
		let ptyId: number | null = null;

		const { term, fitAddon } = createTerminal(el, config);
		term.attachCustomKeyEventHandler(createKeyHandler(term));

		const encoder = new TextEncoder();

		openPty({
			cols: term.cols,
			rows: term.rows,
			onData: (buf) => {
				if (disposed) return;
				const text = new TextDecoder().decode(new Uint8Array(buf));
				const cwd = parseOsc7Cwd(text);
				if (cwd) onCwdChange?.(cwd);
				term.write(new Uint8Array(buf));
			},
			onExit: () => {
				if (!disposed) term.write('\r\n[Process exited]\r\n');
			}
		})
			.then((session) => {
				if (!disposed) ptyId = session.id;
			})
			.catch(console.error);

		const inputDisposable = term.onData((data) => {
			if (!disposed && ptyId !== null) {
				writeToPty(ptyId, encoder.encode(data)).catch(console.error);
			}
		});

		const resizeObserver = new ResizeObserver(() => {
			if (disposed || ptyId === null) return;
			const { width, height } = el.getBoundingClientRect();
			if (width === 0 || height === 0) return;
			fitAddon.fit();
			resizePty(ptyId, term.cols, term.rows).catch(console.error);
		});
		resizeObserver.observe(el);

		return () => {
			disposed = true;
			inputDisposable.dispose();
			resizeObserver.disconnect();
			if (ptyId !== null) closePty(ptyId);
			term.dispose();
		};
	});
}
