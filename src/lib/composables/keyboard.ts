import type { Terminal } from '@xterm/xterm';

export function createKeyHandler(term: Terminal) {
	return (event: KeyboardEvent): boolean => {
		if (event.type !== 'keydown') return true;

		if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
			pasteFromClipboard(term);
			return false;
		}

		if (event.ctrlKey && !event.shiftKey && event.key === 'c') {
			copySelection(term);
			return false;
		}

		if (event.ctrlKey && event.shiftKey && (event.key === 'c' || event.key === 'C')) {
			copySelection(term);
			return false;
		}

		return true;
	};
}

function pasteFromClipboard(term: Terminal): void {
	navigator.clipboard
		.readText()
		.then((text) => {
			if (text) term.paste(text);
		})
		.catch(() => {});
}

function copySelection(term: Terminal): void {
	const selection = term.getSelection();
	if (selection) {
		navigator.clipboard.writeText(selection).catch(() => {});
		term.clearSelection();
	}
}
