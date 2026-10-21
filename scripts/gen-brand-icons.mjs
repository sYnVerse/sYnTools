
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Resvg, initWasm } from '@resvg/resvg-wasm';

const root = process.cwd();
const wasmPath = path.join(root, 'node_modules/@resvg/resvg-wasm/index_bg.wasm');
await initWasm(readFileSync(wasmPath));

const svg = readFileSync(path.join(root, 'public/syntools-mark.svg'));

function render(size, out) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'transparent',
  });
  const png = resvg.render().asPng();
  writeFileSync(path.join(root, out), png);
  console.log('wrote', out, size);
}

render(16, 'public/favicon-16x16.png');
render(32, 'public/favicon-32x32.png');
render(180, 'public/apple-touch-icon.png');
render(192, 'public/android-chrome-192x192.png');
render(512, 'public/android-chrome-512x512.png');
render(512, 'public/logo.png');
render(70, 'public/mstile-70x70.png');
render(144, 'public/mstile-144x144.png');
render(150, 'public/mstile-150x150.png');
render(310, 'public/mstile-310x310.png');

// wide mstile: render square then we keep square for simplicity in a 310x150 wrapper via SVG
const wideSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="310" height="150" viewBox="0 0 310 150">
  <rect width="310" height="150" fill="#0B1021"/>
  <rect x="95" y="15" width="120" height="120" rx="28" fill="#7B9EFF"/>
  <text x="155" y="95" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="56" font-weight="700" fill="#0B1021">sY</text>
</svg>`;
const wide = new Resvg(wideSvg, { fitTo: { mode: 'width', value: 310 } });
writeFileSync(path.join(root, 'public/mstile-310x150.png'), wide.render().asPng());
console.log('wrote public/mstile-310x150.png');

// favicon.ico: write 32x32 PNG bytes as .ico fallback (browsers accept PNG favicons via link tags;
// also copy 32px as favicon.ico for legacy <link rel="icon" href="favicon.ico">)
writeFileSync(path.join(root, 'public/favicon.ico'), readFileSync(path.join(root, 'public/favicon-32x32.png')));
console.log('wrote public/favicon.ico (png bytes)');
