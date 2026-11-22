#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
if ! command -v npm >/dev/null 2>&1; then echo 'Necesitas Node.js/npm en tu Mac para preparar el OCR local.'; exit 1; fi
if ! command -v curl >/dev/null 2>&1; then echo 'No se encontró curl.';exit 1;fi
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
printf 'Instalando Tesseract.js v7 y el motor compatible...\n'
npm install --prefix "$TMP" --no-audit --no-fund --ignore-scripts tesseract.js@7.0.0
mkdir -p ocr/core ocr/lang
cp "$TMP/node_modules/tesseract.js/dist/tesseract.min.js" ocr/tesseract.min.js
cp "$TMP/node_modules/tesseract.js/dist/worker.min.js" ocr/worker.min.js
cp "$TMP/node_modules/tesseract.js-core/"*.wasm.js ocr/core/
cp "$TMP/node_modules/tesseract.js-core/"*.wasm ocr/core/
curl --fail --location --retry 3 'https://tessdata.projectnaptha.com/4.0.0_fast/spa.traineddata.gz' -o ocr/lang/spa.traineddata.gz
python3 - <<'PYTHON'
import json
from pathlib import Path
assets=['ocr/tesseract.min.js','ocr/worker.min.js']
assets += [str(x) for x in sorted(Path('ocr/core').glob('*.wasm*'))]
assets += ['ocr/lang/spa.traineddata.gz']
for path in assets:
 if not Path(path).is_file() or Path(path).stat().st_size<1024:
  raise RuntimeError('Archivo OCR incompleto: '+path)
Path('ocr/ready.json').write_text(json.dumps({'version':'7.0.0','assets':assets},indent=2)+'\n')
print('Motor preparado: ',len(assets),'archivos; tamaño total',round(sum(Path(x).stat().st_size for x in assets)/1048576,2),'MiB')
PYTHON
printf '\nLISTO: sube la carpeta ocr completa junto a index.html, sw.js y manifest.webmanifest.\n'
