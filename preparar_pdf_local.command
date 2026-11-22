#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then
  echo "Falta Node.js y npm. Descárgalo desde https://nodejs.org/ y vuelve a intentarlo."
  exit 1
fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
printf '\nDescargando PDF.js 4.10.38 para lectura PDF offline...\n'
npm install --prefix "$TMP" pdfjs-dist@4.10.38 --no-save --ignore-scripts --no-audit --no-fund
mkdir -p pdfjs
cp "$TMP/node_modules/pdfjs-dist/build/pdf.min.mjs" pdfjs/pdf.min.mjs
cp "$TMP/node_modules/pdfjs-dist/build/pdf.worker.min.mjs" pdfjs/pdf.worker.min.mjs
if [ -f "$TMP/node_modules/pdfjs-dist/LICENSE" ]; then cp "$TMP/node_modules/pdfjs-dist/LICENSE" pdfjs/LICENSE; fi
cat > pdfjs/ready.json <<'JSON'
{"version":"4.10.38","assets":["pdfjs/pdf.min.mjs","pdfjs/pdf.worker.min.mjs"]}
JSON
printf '\nListo. Sube la carpeta pdfjs completa junto al index.html, sw.js y manifest.webmanifest a GitHub.\n'
ls -lh pdfjs
