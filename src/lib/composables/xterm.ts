import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { ImageAddon } from '@xterm/addon-image';
import '@xterm/xterm/css/xterm.css';

export interface TerminalConfig {
	fontSize?: number;
	fontFamily?: string;
	scrollback?: number;
	cursorBlink?: boolean;
}

export interface TerminalInstance {
	term: Terminal;
	fitAddon: FitAddon;
}

const DEFAULT_CONFIG: Required<TerminalConfig> = {
	fontSize: 14,
	fontFamily: "'JetBrainsMono Nerd Font', monospace",
	scrollback: 10000,
	cursorBlink: true
};

export function createTerminal(container: HTMLElement, config?: TerminalConfig): TerminalInstance {
	const options = { ...DEFAULT_CONFIG, ...config };

	const term = new Terminal({
		cursorBlink: options.cursorBlink,
		fontSize: options.fontSize,
		fontFamily: options.fontFamily,
		scrollback: options.scrollback,
		allowProposedApi: true
	});

	const fitAddon = new FitAddon();
	term.loadAddon(fitAddon);
	term.open(container);
	fitAddon.fit();

	loadImageAddon(term);
	loadWebglAddon(term);

	return { term, fitAddon };
}

function loadImageAddon(term: Terminal): void {
	try {
		const imageAddon = new ImageAddon({
			sixelSupport: true,
			iipSupport: true,
			kittySupport: true,
			enableSizeReports: true,
			pixelLimit: 16777216,
			storageLimit: 128,
			showPlaceholder: true
		});
		term.loadAddon(imageAddon);
	} catch (e) {
		console.warn('Image addon failed to load:', e);
	}
}

function loadWebglAddon(term: Terminal): void {
	try {
		term.loadAddon(new WebglAddon());
	} catch {
		// Fallback to canvas renderer
	}
}
