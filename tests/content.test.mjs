import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../src/SpeedDatingApp.tsx", import.meta.url), "utf8");
const content = await readFile(new URL("../src/data/content.ts", import.meta.url), "utf8");
const html = await readFile(new URL("../dist-pages/index.html", import.meta.url), "utf8");

test("the static GitHub Pages build has its entry point and metadata", () => {
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /Speed Dating en español/);
  assert.match(html, /\.\/assets\//);
});

test("the complete guided sequence and finale are present", () => {
  for (const phrase of ["¿Cómo te", "¿De dónde", "¿Qué lenguas", "¿Dónde", "¿Te gusta?", "¿Te gustan los"]) {
    assert.ok(app.includes(phrase), `missing phrase: ${phrase}`);
  }
  assert.match(app, /https:\/\/spanish\.hku\.hk\//);
});

test("the catalogue includes all categories and both grammar numbers", () => {
  for (const category of ["hobbies", "sports", "food", "drinks", "places", "campus"]) {
    assert.match(content, new RegExp(`id: "${category}"`));
  }
  assert.match(content, /"singular" \| "plural"/);
  assert.match(content, /"plural"\)/);
});
