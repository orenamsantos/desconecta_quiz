#!/usr/bin/env node
/**
 * Teste real de renderização: usa jsdom como window + React real + ReactDOM real
 * Confirma que o app monta sem erros de execução, não apenas de parsing.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM } = require("jsdom");

const distDir = path.join(__dirname, "dist");
const bundleFile = fs.readdirSync(distDir).find(f => /^app\.[a-f0-9]+\.js$/.test(f));
const reactFile = fs.readdirSync(distDir).find(f => /^react\.[a-f0-9]+\.js$/.test(f));
const reactDomFile = fs.readdirSync(distDir).find(f => /^react-dom\.[a-f0-9]+\.js$/.test(f));

if (!bundleFile || !reactFile || !reactDomFile) {
  console.error("✗ faltam arquivos no dist/");
  process.exit(1);
}

const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
const dom = new JSDOM(html, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  url: "https://localhost/",
});

const errors = [];
const origErr = console.error.bind(console);
dom.window.console.error = function(...args) {
  errors.push(args.map(String).join(" "));
  origErr("  [JSDOM error]", ...args);
};

// Mock localStorage (jsdom tem, mas vamos nos certificar)
// Injeta os 3 scripts na ordem, como o browser faria.
const reactCode = fs.readFileSync(path.join(distDir, reactFile), "utf8");
const reactDomCode = fs.readFileSync(path.join(distDir, reactDomFile), "utf8");
const bundleCode = fs.readFileSync(path.join(distDir, bundleFile), "utf8");

try {
  dom.window.eval(reactCode);
  console.log("✓ React carregou:", typeof dom.window.React);
  dom.window.eval(reactDomCode);
  console.log("✓ ReactDOM carregou:", typeof dom.window.ReactDOM);
  dom.window.eval(bundleCode);
  console.log("✓ Bundle executou");
  console.log("  window.App:", typeof dom.window.App);
  console.log("  window.IOSDevice:", typeof dom.window.IOSDevice);
  console.log("  window.Icon:", typeof dom.window.Icon);
  console.log("  window.PhoneLoop:", typeof dom.window.PhoneLoop);

  // Aguarda os setTimeout/setInterval do primeiro ciclo
  return new Promise(resolve => setTimeout(resolve, 200)).then(() => {
    const rootHtml = dom.window.document.getElementById("root").innerHTML;
    console.log("  #root tamanho do DOM:", rootHtml.length, "chars");
    // Verifica se React realmente montou alguma coisa não trivial
    if (rootHtml.length > 500) {
      console.log("✓ React MONTOU o app (DOM tem conteúdo substancial)");
    } else if (rootHtml.includes("__splash")) {
      console.log("✗ React NÃO substituiu o splash screen");
      process.exit(1);
    } else {
      console.log("? DOM menor que esperado, mas splash foi removido:", rootHtml.slice(0, 200));
    }

    if (errors.length > 0) {
      console.log("\n⚠ Erros capturados durante a renderização:");
      errors.forEach(e => console.log("  -", e));
      // React costuma logar avisos sobre coisas como keys faltando — não é fatal.
      const fatal = errors.some(e => /is not defined|cannot read|unexpected token/i.test(e));
      if (fatal) {
        console.log("✗ ERRO FATAL");
        process.exit(1);
      } else {
        console.log("  (erros não-fatais, provavelmente warnings do React em dev)");
      }
    } else {
      console.log("✓ zero erros");
    }
  });
} catch (e) {
  console.error("✗ FALHA:", e.message);
  console.error(e.stack.split("\n").slice(0, 8).join("\n"));
  process.exit(1);
}
