#!/usr/bin/env node
/**
 * Smoke test do bundle final (self-contained com Preact).
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const distDir = path.join(__dirname, "dist");
const bundleFile = fs.readdirSync(distDir).find(f => /^app\.[a-f0-9]+\.js$/.test(f));
if (!bundleFile) { console.error("✗ bundle não encontrado"); process.exit(1); }

const html = fs.readFileSync(path.join(distDir, "index.html"), "utf8");
const dom = new JSDOM(html, {
  runScripts: "outside-only",
  pretendToBeVisual: true,
  url: "https://localhost/",
});

const errors = [];
dom.window.console.error = (...args) => errors.push(args.map(String).join(" "));
dom.window.HTMLElement.prototype.scrollTo = function() {};

const bundleCode = fs.readFileSync(path.join(distDir, bundleFile), "utf8");

try {
  dom.window.eval(bundleCode);
  console.log("✓ Bundle executou");
  console.log("  React?", typeof dom.window.React);
  console.log("  ReactDOM?", typeof dom.window.ReactDOM);
  console.log("  App?", typeof dom.window.App);
  console.log("  IOSDevice?", typeof dom.window.IOSDevice);
  console.log("  Icon?", typeof dom.window.Icon);
  console.log("  PhoneLoop?", typeof dom.window.PhoneLoop);

  setTimeout(() => {
    const rootHtml = dom.window.document.getElementById("root").innerHTML;
    console.log("  #root DOM:", rootHtml.length, "chars");
    if (rootHtml.length > 1000) {
      console.log("✓ App MONTOU");
    } else {
      console.log("✗ DOM muito pequeno:", rootHtml.slice(0, 300));
      process.exit(1);
    }
    if (errors.length) {
      console.log("\n⚠ Erros:");
      errors.slice(0, 5).forEach(e => console.log("  -", e.slice(0, 200)));
      const fatal = errors.some(e => /is not defined|cannot read prop|invalid hook/i.test(e));
      if (fatal) process.exit(1);
    } else {
      console.log("✓ zero erros");
    }
  }, 200);
} catch (e) {
  console.error("✗ FALHA:", e.message);
  console.error(e.stack.split("\n").slice(0, 5).join("\n"));
  process.exit(1);
}
