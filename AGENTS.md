# AGENTS.md — Gibterm

## What this is

Gibterm is a **Tauri v2 desktop terminal emulator** with a SvelteKit frontend (Svelte 5 runes, Tailwind CSS v4, shadcn-svelte) and a Rust backend providing PTY, shell sessions, git, LSP, file system, and agent/hook features.

Product name: **Gibterm**. Identifier: `app.ikhwan-satrio.gibterm`.

## Commands

```sh
bun dev                          # start Vite dev server (frontend only)
bun tauri dev                    # full app (frontend + Rust backend, hot-reload)
bun run check                    # svelte-check + tsc typecheck
bun run lint                     # prettier --check .
bun run format                   # prettier --write .
bun build                        # vite build (production frontend)
bun tauri build                  # full production bundle (frontend + Rust)
```

Rust tests live in `src-tauri/tests/`. Run with:

```sh
cargo test --manifest-path src-tauri/Cargo.toml
```

## Project structure

```
src/                        # SvelteKit frontend
  routes/                   # Pages (+layout.ts disables SSR, enables CSR)
  lib/
    components/             # Svelte components (shell-terminal.svelte, ui/)
    composables/            # Svelte 5 reactive logic
    hooks/                  # Svelte hooks
    utils.ts                # cn() helper (clsx + tailwind-merge)
src-tauri/                  # Rust backend
  src/
    lib.rs                  # Tauri plugin setup, command handlers
    main.rs                 # Entry point (macOS key-repeat fix)
    modules/
      pty/                  # PTY session management (portable-pty)
      shell/                # Shell sessions, background processes
      git/                  # Git operations (status, diff, commit, etc.)
      fs/                   # File tree, read/write, watch, search, grep
      lsp/                  # Language server protocol
      agent/                # Agent/hook system
      secrets.rs            # OS keyring integration
      workspace.rs          # Workspace authorization (project trust)
      net.rs                # HTTP/AI request proxying
      history/              # Command history
  tests/                    # Rust integration tests
  capabilities/             # Tauri v2 permission manifests
```

## Key conventions

- **Svelte 5 runes mode** enforced globally in `vite.config.ts` (all non-node_modules files).
- **No `svelte.config.js`** — SvelteKit is configured entirely through `vite.config.ts`.
- **No SSR** — `+layout.ts` sets `prerender: true, csr: true, ssr: false`. This is a pure client-side Tauri app.
- **Static adapter** — built output goes to `dist/` for Tauri to bundle.
- **Prettier config**: tabs, single quotes, no trailing commas, 100-char width, `prettier-plugin-svelte` + `prettier-plugin-tailwindcss`.
- **shadcn-svelte** uses `sera` style, `neutral` base color, `lucide` icons. Components in `$lib/components/ui/`.
- **Platform overrides**: Linux/Windows get `decorations: false, transparent: true` (custom titlebar); macOS keeps native chrome with overlay titlebar. See `tauri.linux.conf.json`, `tauri.windows.conf.json`.
- **Tauri commands** are registered in `lib.rs` — add new commands to the `generate_handler![]` macro there.

## Package manager

**bun** — lockfile is `bun.lock`. Tauri config uses `bun dev` / `bun build` as beforeDev/beforeBuild commands.

## Rust backend notes

- Tauri v2 with `protocol-asset` feature for serving local files.
- `portable-pty` for pseudo-terminal, `shared_child` for process management.
- Linux uses `tauri-plugin-clipboard-manager` (WebKitGTK can't read external clipboard). macOS/Windows use native APIs.
- Release profile: `lto = "fat"`, `codegen-units = 1`, `opt-level = "s"`, `strip = true`.
- Key crate deps: `serde`, `tokio`, `reqwest` (rustls), `notify` (fs watch), `grep-*`, `nucleo-matcher` (fuzzy matching).
