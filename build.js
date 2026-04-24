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

const GTM_LINK_CLICK_HELPER = [
  "<script>",
  "(function(){",
  "  var LINK_CLASS = 'gtm-link-click';",
  "  var LINK_ID_PREFIX = 'gtm-link-';",
  "  var counter = 0;",
  "",
  "  function slugify(value){",
  "    return String(value || 'cta')",
  "      .toLowerCase()",
  "      .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')",
  "      .replace(/[^a-z0-9]+/g, '-')",
  "      .replace(/^-+|-+$/g, '')",
  "      .slice(0, 48) || 'cta';",
  "  }",
  "",
  "  function ensureLinkAttributes(link){",
  "    if(!link || !link.getAttribute || !link.getAttribute('href')) return;",
  "    if(!link.id){",
  "      counter += 1;",
  "      link.id = LINK_ID_PREFIX + slugify(link.textContent) + '-' + counter;",
  "    }",
  "    if(!link.classList.contains(LINK_CLASS)) link.classList.add(LINK_CLASS);",
  "    link.setAttribute('data-gtm-link-click', 'true');",
  "  }",
  "",
  "  function getButtonUrl(button){",
  "    if(!button || !button.getAttribute) return '';",
  "    var attrs = ['href','data-href','data-url','data-checkout-url','data-redirect-url','data-link'];",
  "    for(var i=0;i<attrs.length;i++){",
  "      var value = button.getAttribute(attrs[i]);",
  "      if(value && /^(https?:\\/\\/|\\/)/.test(value)) return value;",
  "    }",
  "    var inlineClick = button.getAttribute('onclick') || '';",
  "    var match = inlineClick.match(/https?:\\/\\/[^'\"\\s<>]+/);",
  "    return match ? match[0] : '';",
  "  }",
  "",
  "  function buttonToLink(button){",
  "    if(!button || button.dataset.gtmConverted === 'true') return;",
  "    var url = getButtonUrl(button);",
  "    if(!url) return;",
  "",
  "    var link = document.createElement('a');",
  "    link.href = url;",
  "    link.id = button.id || LINK_ID_PREFIX + slugify(button.textContent) + '-' + (++counter);",
  "    link.className = (button.className ? button.className + ' ' : '') + LINK_CLASS;",
  "    link.style.cssText = button.style.cssText;",
  "    link.setAttribute('role', 'button');",
  "    link.setAttribute('data-gtm-link-click', 'true');",
  "    link.innerHTML = button.innerHTML;",
  "",
  "    button.dataset.gtmConverted = 'true';",
  "    button.replaceWith(link);",
  "  }",
  "",
  "  function enhanceGtmLinks(){",
  "    document.querySelectorAll('a[href]').forEach(ensureLinkAttributes);",
  "    document.querySelectorAll('button[href],button[data-href],button[data-url],button[data-checkout-url],button[data-redirect-url],button[data-link]').forEach(buttonToLink);",
  "  }",
  "",
  "  if(document.readyState === 'loading'){",
  "    document.addEventListener('DOMContentLoaded', enhanceGtmLinks);",
  "  } else {",
  "    enhanceGtmLinks();",
  "  }",
  "",
  "  new MutationObserver(enhanceGtmLinks).observe(document.documentElement, { childList:true, subtree:true });",
  "  document.addEventListener('click', function(event){",
  "    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;",
  "    if(link) ensureLinkAttributes(link);",
  "  }, true);",
  "})();",
  "</script>"
].join("\n");

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
    .replace(/<link rel="preload" href="__BUNDLE__" as="script"\/>/, '<link rel="preload" href="' + bundleName + '" as="script"/>')
    .replace(/<\/body>/, GTM_LINK_CLICK_HELPER + "\n</body>");

  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html);
  console.log(`✓ html:    index.html`);
}

build().catch(err => {
  console.error("✗ build falhou:", err.message);
  process.exit(1);
});
