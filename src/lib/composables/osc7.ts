const OSC7_MARKER = '\x1b]7;';
const ST = '\x1b\\';
const BEL = '\x07';

export function parseOsc7Cwd(data: string): string | null {
	const start = data.indexOf(OSC7_MARKER);
	if (start === -1) return null;

	const uriStart = start + OSC7_MARKER.length;
	const uriEnd = findTerminator(data, uriStart);
	if (uriEnd === -1) return null;

	const uri = data.substring(uriStart, uriEnd);
	return extractPath(uri);
}

function findTerminator(data: string, start: number): number {
	for (let i = start; i < data.length; i++) {
		if (data.charCodeAt(i) === 0x07) return i;
		if (data[i] === '\x1b' && data[i + 1] === '\\') return i;
	}
	return -1;
}

function extractPath(uri: string): string | null {
	const pathStart = uri.indexOf('/', 8);
	if (pathStart === -1) return null;

	try {
		return decodeURIComponent(uri.substring(pathStart));
	} catch {
		return uri.substring(pathStart);
	}
}
