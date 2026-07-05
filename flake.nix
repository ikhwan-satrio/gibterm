{
  description = "Gibterm — Tauri v2 terminal emulator";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    crane = {
      url = "github:ipetkov/crane";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    fenix,
    crane,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
        craneLib = crane.lib.${system};
        rustNightly = fenix.packages.${system}.latest;

        runtimeDeps = with pkgs; [
          webkitgtk_4_1
          gtk3
          glib
          libayatana-appindicator
          librsvg
          libsoup_3
          openssl
          sqlite
        ];

        buildTools = with pkgs; [
          pkg-config
          bun
          nodejs
          glib
          gsettings-desktop-schemas
          hicolor-icon-theme
        ];

        rustToolchain = rustNightly.withComponents [
          "cargo"
          "clippy"
          "rust-src"
          "rustfmt"
        ];
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = runtimeDeps ++ [rustToolchain];
          nativeBuildInputs = buildTools ++ [
            pkgs.wrapGAppsHook4
            pkgs.cargo-tauri
          ];

          shellHook = ''
            export RUST_SRC_PATH="${rustToolchain.rustPlatform.rustLibSrc}"
            export GSETTINGS_SCHEMA_DIR="${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}/glib-2.0/schemas"
          '';
        };

        packages.default = let
          src = ./.;
          cargoDeps = craneLib.importCargoLock {
            lockFile = ./src-tauri/Cargo.lock;
          };
          cargoConfig = pkgs.writeText "cargo-config.toml" ''
            [net]
            offline = true

            [source.vendored-sources]
            directory = "${cargoDeps}"

            [source.crates-io]
            replace-with = "vendored-sources"
          '';
          icons = ./src-tauri/icons;
        in
          pkgs.stdenv.mkDerivation {
            pname = "gibterm";
            version = "1.0.0";

            nativeBuildInputs = buildTools ++ [rustToolchain];
            buildInputs = runtimeDeps;

            buildCommand = ''
              export HOME=$(mktemp -d)
              export CARGO_HOME="$HOME/.cargo"
              export SSL_CERT_FILE="${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"

              mkdir -p "$CARGO_HOME"
              cp ${cargoConfig} "$CARGO_HOME/config.toml"

              cp -r ${src}/* .
              chmod -R u+w .

              bun install --frozen-lockfile
              bun run build

              cd src-tauri

              cargo build --release --target-dir "$HOME/target"

              mkdir -p $out/bin
              cp "$HOME/target/release/gibterm" $out/bin/gibterm

              mkdir -p $out/share/applications
              cat > $out/share/applications/gibterm.desktop << 'DESKTOP_EOF'
              [Desktop Entry]
              Name=Gibterm
              Exec=gibterm
              Type=Application
              Terminal=false
              Categories=Development;Utility;TerminalEmulator;
              Comment=Terminal emulator
              DESKTOP_EOF

              mkdir -p $out/share/icons/hicolor/128x128/apps
              mkdir -p $out/share/icons/hicolor/256x256/apps
              cp ${icons}/128x128.png $out/share/icons/hicolor/128x128/apps/gibterm.png
              cp ${icons}/128x128@2x.png $out/share/icons/hicolor/256x256/apps/gibterm.png

              chmod +x $out/bin/gibterm
              patchelf --set-interpreter "$(cat $NIX_CC/nix-support/dynamic-linker)" \
                --set-rpath "${pkgs.lib.makeLibraryPath runtimeDeps}" \
                $out/bin/gibterm

              wrapProgram $out/bin/gibterm \
                --prefix GDK_BACKEND : "wayland:x11" \
                --prefix XDG_CURRENT_DESKTOP : "GNOME" \
                --prefix GSETTINGS_SCHEMA_DIR : "${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}/glib-2.0/schemas" \
                --set LD_LIBRARY_PATH "${pkgs.lib.makeLibraryPath runtimeDeps}"
            '';

            meta = with pkgs.lib; {
              description = "Terminal emulator";
              homepage = "https://github.com/ikhwan-satrio/gibterm";
              license = licenses.mit;
              platforms = platforms.linux;
              mainProgram = "gibterm";
            };
          };
      }
    );
}
