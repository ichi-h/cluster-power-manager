{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        packages = nixpkgs.legacyPackages.${system};
      in
      {
        devShells = {
          default = packages.mkShell {
            buildInputs = with packages; [
              lefthook
              gh
            ];
            shellHook = ''
              lefthook check-install || lefthook install
            '';
          };
        };
      }
    );
}
