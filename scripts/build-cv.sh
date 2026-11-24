#!/usr/bin/env bash
# Builds the résumé: compiles cv/pierre-vieira-cv.tex into public/cv/cv_pierre_vieira.pdf with Tectonic.
# The .tex is the only source; the PDF is not in git and is made on every deploy (wrangler.jsonc's build.command).
# Uses a `tectonic` on PATH when there is one, or else downloads a pinned release into .cache/ and checks its SHA-256.
# Skips the work when the PDF is already newer than the .tex; pass --force to build anyway.
set -euo pipefail

cd "$(dirname "$0")/.."

SRC="cv/pierre-vieira-cv.tex"
OUT_DIR="public/cv"
# The PDF is always named cv_pierre_vieira.pdf, whatever the .tex is called: the page links to that name.
OUT="$OUT_DIR/cv_pierre_vieira.pdf"
VERSION="0.17.0"
CACHE=".cache/tectonic-$VERSION"

if [[ "${1:-}" != "--force" && -f "$OUT" && "$OUT" -nt "$SRC" ]]; then
  echo "build-cv: $OUT is up to date"
  exit 0
fi

tectonic_bin() {
  if command -v tectonic >/dev/null 2>&1; then
    command -v tectonic
    return
  fi
  if [[ -x "$CACHE/tectonic" ]]; then
    echo "$CACHE/tectonic"
    return
  fi

  local target sha
  case "$(uname -s)-$(uname -m)" in
    Linux-x86_64)   target="x86_64-unknown-linux-musl";   sha="8533d07f9ccbd7a65824b9e0459041bca34af1eb33daba48f59215593753a3b7" ;;
    Linux-aarch64)  target="aarch64-unknown-linux-musl";  sha="b10954a95404f3ab2328d2fa59a5ebab8e657f893fab096f98be8db7c0c979b8" ;;
    Darwin-arm64)   target="aarch64-apple-darwin";        sha="a3f1cac7c5678f01661a92212f58480ae3b0634115d880dbc59e2953ded45667" ;;
    Darwin-x86_64)  target="x86_64-apple-darwin";         sha="7c90ef5b6ddb1eb1937e4337add5237b79338e4b9676459fa91187d24d6cdf80" ;;
    *) echo "build-cv: no Tectonic build for $(uname -s)-$(uname -m); install tectonic and retry" >&2; exit 1 ;;
  esac

  local url="https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40$VERSION/tectonic-$VERSION-$target.tar.gz"
  local tgz
  tgz="$(mktemp)"
  echo "build-cv: downloading Tectonic $VERSION ($target)" >&2
  curl -fsSL -o "$tgz" "$url"
  local got
  if command -v sha256sum >/dev/null 2>&1; then got="$(sha256sum "$tgz" | cut -d' ' -f1)"; else got="$(shasum -a 256 "$tgz" | cut -d' ' -f1)"; fi
  if [[ "$got" != "$sha" ]]; then
    echo "build-cv: checksum mismatch for $url" >&2
    rm -f "$tgz"
    exit 1
  fi
  mkdir -p "$CACHE"
  tar -xzf "$tgz" -C "$CACHE"
  rm -f "$tgz"
  echo "$CACHE/tectonic"
}

TECTONIC="$(tectonic_bin)"
mkdir -p "$OUT_DIR"
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT
"$TECTONIC" -X compile --outdir "$BUILD_DIR" "$SRC"
mv "$BUILD_DIR/$(basename "$SRC" .tex).pdf" "$OUT"
echo "build-cv: wrote $OUT"
