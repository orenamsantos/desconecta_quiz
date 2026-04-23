#!/usr/bin/env node
/**
 * Build script — compila JSX → JS, concatena os 4 arquivos na ordem original
 * e minifica num único bundle. Preserva 100% a semântica do código.
 *
 * Ordem (mesma do index.html antigo):
 *   ios-frame.jsx → icons.jsx → phone-loop.jsx → desconecta-quiz-v3.jsx
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const babel = require("@babel/core");
const { minify } = require("terser");

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, "dist");

// Ordem DEVE bater com a ordem dos <script> do index.html antigo.
const SOURCES = [
  "ios-frame.jsx",
  "icons.jsx",
  "phone-loop.jsx",
  "desconecta-quiz-v3.jsx",
];

// Bootstrap idêntico ao inline <script type="text/babel"> que existia no index.html
const BOOTSTRAP = `
function __Mount(){
  return React.createElement(IOSDevice, { width: 402, height: 874 },
    React.createElement(App, null)
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(__Mount));
`;

async function build() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1) compila cada JSX isoladamente (preserva ordem de declarações)
  const compiled = [];
  for (const file of SOURCES) {
    const src = fs.readFileSync(path.join(ROOT, file), "utf8");
    const result = await babel.transformAsync(src, {
      presets: [["@babel/preset-react", { runtime: "classic" }]],
      // NÃO usamos preset-env: queremos manter ES2017+ (mobile Chrome/Safari modernos).
      // Também NÃO usamos nenhum plugin que transforme `function` declarations,
      // porque os arquivos usam hoisting global (window.App, window.Icon, etc.)
      babelrc: false,
      configFile: false,
      filename: file,
      sourceType: "script", // IMPORTANTE: script, não module — tudo é global
      compact: false,
    });
    compiled.push(`/* === ${file} === */\n${result.code}\n`);
  }

  // 2) concatena tudo + bootstrap
  const combined = compiled.join("\n") + "\n" + BOOTSTRAP;

  // 3) minifica (mantendo nomes de função pra evitar quebra em refs dinâmicas)
  const minified = await minify(combined, {
    compress: {
      passes: 2,
      drop_console: false, // preserva console.* caso seja usado em debug
      ecma: 2017,
    },
    mangle: {
      // NÃO manglear nomes que podem ser referenciados por string
      reserved: [
        "App", "IOSDevice", "IOSStatusBar", "IOSNavBar", "IOSGlassPill",
        "IOSList", "IOSListRow", "IOSKeyboard", "Icon", "PhoneLoop",
        "useLiveTime", "formatIOSTime", "React", "ReactDOM",
      ],
    },
    format: { comments: false, ecma: 2017 },
  });

  if (minified.error) throw minified.error;

  // 4) hash no filename pra cache immutable
  const hash = crypto.createHash("sha256").update(minified.code).digest("hex").slice(0, 10);
  const outName = `app.${hash}.js`;
  const outPath = path.join(OUT_DIR, outName);
  fs.writeFileSync(outPath, minified.code);

  console.log(`✓ bundle:  ${outName}  (${(minified.code.length/1024).toFixed(1)} KB minified)`);
  console.log(`  raw:     ${(combined.length/1024).toFixed(1)} KB before minify`);

  // 5) copia React prod builds (hasheados)
  const { reactName, reactDomName } = copyReact();

  // 6) gera index.html a partir de template com os nomes hasheados
  generateHtml(outName, reactName, reactDomName);

  console.log(`✓ out: ${OUT_DIR}`);
}

function generateHtml(bundleName, reactName, reactDomName) {
  const template = fs.readFileSync(path.join(ROOT, "index.template.html"), "utf8");
  const html = template
    .replace(/__BUNDLE__/g, bundleName)
    .replace(/__REACT__/g, reactName)
    .replace(/__REACT_DOM__/g, reactDomName);
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), html);
  console.log(`✓ html:    index.html`);
}

function copyReact() {
  const nm = path.join(ROOT, "node_modules");
  const reactProd = path.join(nm, "react", "umd", "react.production.min.js");
  const reactDomProd = path.join(nm, "react-dom", "umd", "react-dom.production.min.js");

  if (!fs.existsSync(reactProd) || !fs.existsSync(reactDomProd)) {
    throw new Error(
      "React UMD prod não encontrado. Rode: npm i --save react@18.3.1 react-dom@18.3.1"
    );
  }

  const reactCode = fs.readFileSync(reactProd);
  const reactDomCode = fs.readFileSync(reactDomProd);
  const rHash = crypto.createHash("sha256").update(reactCode).digest("hex").slice(0, 10);
  const rdHash = crypto.createHash("sha256").update(reactDomCode).digest("hex").slice(0, 10);
  const reactName = `react.${rHash}.js`;
  const reactDomName = `react-dom.${rdHash}.js`;
  fs.writeFileSync(path.join(OUT_DIR, reactName), reactCode);
  fs.writeFileSync(path.join(OUT_DIR, reactDomName), reactDomCode);
  console.log(`✓ react:   ${reactName} (${(reactCode.length/1024).toFixed(1)} KB) + ${reactDomName} (${(reactDomCode.length/1024).toFixed(1)} KB)`);
  return { reactName, reactDomName };
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
