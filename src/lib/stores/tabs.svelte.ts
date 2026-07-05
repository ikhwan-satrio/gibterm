export interface Tab {
	id: string;
	title: string;
	cwd: string;
	active: boolean;
}

let counter = 0;

function createId(): string {
	return `tab-${++counter}-${Date.now()}`;
}

class TabStore {
	tabs = $state<Tab[]>([{ id: createId(), title: 'Terminal', cwd: '~', active: true }]);

	get activeTab(): Tab | undefined {
		return this.tabs.find((t) => t.active);
	}

	addTab(): Tab {
		const tab: Tab = {
			id: createId(),
			title: 'Terminal',
			cwd: '~',
			active: false
		};
		for (const t of this.tabs) t.active = false;
		tab.active = true;
		this.tabs.push(tab);
		return tab;
	}

	closeTab(id: string): void {
		const idx = this.tabs.findIndex((t) => t.id === id);
		if (idx === -1) return;
		this.tabs.splice(idx, 1);
		if (this.tabs.length === 0) {
			this.addTab();
			return;
		}
		if (this.tabs.every((t) => !t.active)) {
			this.tabs[Math.min(idx, this.tabs.length - 1)].active = true;
		}
	}

	setActive(id: string): void {
		for (const t of this.tabs) t.active = t.id === id;
	}

	updateCwd(id: string, cwd: string): void {
		const tab = this.tabs.find((t) => t.id === id);
		if (tab) {
			tab.cwd = cwd;
			tab.title = cwd.split('/').pop() || cwd;
		}
	}
}

export const tabStore = new TabStore();
