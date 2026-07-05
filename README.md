# Gibterm

A desktop terminal emulator built with [Tauri v2](https://v2.tauri.app/) and [SvelteKit](https://svelte.dev/).

## Features

- Multi-tab terminal with PTY support
- Built-in file explorer
- Shell integration (bash, zsh, fish, powershell)
- Git operations
- LSP support
- Auto-updater
- Cross-platform (Linux, macOS, Windows)

## Tech Stack

- **Frontend:** Svelte 5 (runes), SvelteKit, Tailwind CSS v4, shadcn-svelte, xterm.js
- **Backend:** Rust (Tauri v2), portable-pty, tokio, reqwest

## Prerequisites

- [Bun](https://bun.sh/) — package manager
- [Rust](https://www.rust-lang.org/tools/install) — for Tauri backend
- System dependencies for Tauri — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

## Development

```sh
# install dependencies
bun install

# run full app (frontend + Rust backend, hot-reload)
bun tauri dev

# run frontend only
bun dev
```

## Build

```sh
# production build
bun tauri build
```

Output will be in `src-tauri/target/release/bundle/`.

## NixOS Installation

Gibterm provides a Nix flake for building and installing on NixOS.

### Quick Run

```sh
nix run github:crynta/gibterm
```

### Install to User Profile

```sh
nix profile install github:crynta/gibterm
```

### Install from Source

```sh
git clone https://github.com/crynta/gibterm.git
cd gibterm
nix profile install .
```

### System-Wide Install (NixOS Module)

Add gibterm as a flake input in your system configuration:

```nix
# /etc/nixos/flake.nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    gibterm.url = "github:crynta/gibterm";
  };

  outputs = { self, nixpkgs, gibterm, ... }: {
    nixosConfigurations.myhost = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        ./configuration.nix
        {
          environment.systemPackages = [
            gibterm.packages.x86_64-linux.default
          ];
        }
      ];
    };
  };
}
```

### Development with Nix

```sh
# enter dev shell (all tools pre-installed)
nix develop

# then run as usual
bun tauri dev
```

If you use [direnv](https://direnv.net/), the dev shell is loaded automatically via `.envrc`.

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Start Vite dev server |
| `bun tauri dev` | Full app with hot-reload |
| `bun run check` | Typecheck (svelte-check + tsc) |
| `bun run lint` | Check formatting |
| `bun run format` | Auto-format code |
| `bun build` | Production frontend build |
| `bun tauri build` | Full production bundle |

## Project Structure

```
src/                        # SvelteKit frontend
  routes/                   # Pages
  lib/
    components/             # Svelte components
    composables/            # Svelte 5 reactive logic
    stores/                 # State stores
src-tauri/                  # Rust backend
  src/
    lib.rs                  # Tauri plugin setup & command handlers
    modules/
      pty/                  # PTY session management
      shell/                # Shell sessions & background processes
      git/                  # Git operations
      fs/                   # File tree, read/write, watch, search
      lsp/                  # Language server protocol
      agent/                # Agent/hook system
  tests/                    # Rust integration tests
```

## License

Apache-2.0 / MIT
