#!/usr/bin/env node
/**
 * Build principal: compila JSX → bundle único minificado usando Preact
 * (via preact/compat) em vez de React. Reduz o payload em ~47% e o
 * parse/execute time em ~75%.
 *
 * Preact/compat é drop-in com React 18 para os hooks e APIs que o quiz usa:
 * useState, useEffect, useRef, createElement, createPortal, createRoot,
 * flushSync, etc. O código JSX não muda.
 *
 * Output: dist/app.<hash>.js  (único script, ~130KB)
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const babel = require("@babel/core");
const esbuild = require("esbuild");

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, "dist");

const SOURCES = [
  "ios-frame.jsx",
  "icons.jsx",
  "phone-loop.jsx",
  "desconecta-quiz-v3.jsx",
];

async function build() {
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const compiled = [];
  for (const file of SOURCES) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    const result = await babel.transformAsync(src, {
      presets: [["@babel/preset-react", { runtime: "classic" }]],
      babelrc: false,
      configFile: false,
      filename: file,
      sourceType: "script",
      compact: false,
    });
    compiled.push(`/* === ${file} === */\n${result.code}\n`);
  }
  const combinedQuiz = compiled.join("\n");

  const entryCode = [
    'import * as PreactCompat from "preact/compat";',
    'import { createRoot } from "preact/compat/client";',
    'const R = Object.assign({}, PreactCompat, { createRoot });',
    'globalThis.React = R;',
    'globalThis.ReactDOM = R;',
    combinedQuiz,
    'createRoot(document.getElementById("root")).render(React.createElement(App));',
  ].join("\n");

  const tmpEntry = path.join(OUT_DIR, "__entry.tmp.js");
  fs.writeFileSync(tmpEntry, entryCode);

  const result = await esbuild.build({
    entryPoints: [tmpEntry],
    bundle: true,
    minify: true,
    format: "iife",
    target: "es2020",
    write: false,
    logLevel: "error",
    legalComments: "none",
  });

  fs.unlinkSync(tmpEntry);

  const code = result.outputFiles[0].text;
  const hash = crypto.createHash("sha256").update(code).digest("hex").slice(0, 10);
  const outName = `app.${hash}.js`;
  fs.writeFileSync(path.join(OUT_DIR, outName), code);

  console.log(`✓ bundle:  ${outName}  (${(code.length/1024).toFixed(1)} KB minified, Preact-based)`);

  generateHtml(outName);
  console.log(`✓ out: ${OUT_DIR}`);
}

function generateHtml(bundleName) {
  const template = fs.readFileSync(path.join(ROOT, "index.template.html"), "utf8");
  let html = template
    .replace(/<script src="__REACT__"><\/script>\s*/g, "")
    .replace(/<script src="__REACT_DOM__"><\/script>\s*/g, "")
    .replace(/<script src="__BUNDLE__"><\/script>/, '<script src="' + bundleName + '"></script>')
    .replace(/<link rel="preload" href="__REACT__" as="script"\/>\s*/g, "")
    .replace(/<link rel="preload" href="__REACT_DOM__" as="script"\/>\s*/g, "")
    .replace(/<link rel="preload" href="__BUNDLE__" as="script"\/>/, '<link rel="preload" href="' + bundleName + '" as="script"/>');

  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html);
  console.log(`✓ html:    index.html`);
}

build().catch(err => {
  console.error("✗ build falhou:", err.message);
  process.exit(1);
});
