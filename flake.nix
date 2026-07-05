{
  description = "Gibterm — Tauri v2 terminal emulator";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};

        version = "1.0.0";

        debUrl = "https://github.com/ikhwan-satrio/gibterm/releases/download/v${version}/gibterm_${version}_amd64.deb";

        deb = pkgs.fetchurl {
          url = debUrl;
          hash = "sha256-+zAVEp8k8Hm/i7E4ikltjsBESlMGorFvFHZFvd7oOuQ=";
        };

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
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = runtimeDeps;
          nativeBuildInputs = with pkgs; [
            pkg-config
            bun
            nodejs
            wrapGAppsHook4
            glib
            gsettings-desktop-schemas
            hicolor-icon-theme
          ];
        };

        packages.default = pkgs.stdenv.mkDerivation {
          pname = "gibterm";
          inherit version;

          src = deb;

          nativeBuildInputs = with pkgs; [
            dpkg
            autoPatchelfHook
          ];

          buildInputs = runtimeDeps;

          dontConfigure = true;
          dontBuild = true;

          installPhase = ''
            runHook preInstall

            dpkg -x $src unpacked

            mkdir -p $out
            cp -r unpacked/usr/* $out/

            # rewrite desktop file Exec path
            if [ -f $out/share/applications/gibterm.desktop ]; then
              sed -i "s|Exec=.*|Exec=$out/bin/gibterm|" $out/share/applications/gibterm.desktop
            fi

            runHook postInstall
          '';

          preFixup = ''
            gappsWrapperArgs+=(
              --prefix GDK_BACKEND : "wayland:x11"
              --prefix XDG_CURRENT_DESKTOP : "GNOME"
              --prefix LD_LIBRARY_PATH : "${pkgs.lib.makeLibraryPath runtimeDeps}"
            )
          '';

          meta = with pkgs.lib; {
            description = "Terminal emulator";
            homepage = "https://github.com/ikhwan-satrio/gibterm";
            license = licenses.mit;
            platforms = ["x86_64-linux"];
            mainProgram = "gibterm";
          };
        };
      }
    );
}
