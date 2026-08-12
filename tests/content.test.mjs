import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../src/SpeedDatingApp.tsx", import.meta.url), "utf8");
const content = await readFile(new URL("../src/data/content.ts", import.meta.url), "utf8");
const html = await readFile(new URL("../dist-pages/index.html", import.meta.url), "utf8");
const catalogHtml = await readFile(new URL("../dist-pages/catalogo.html", import.meta.url), "utf8");
const catalogApp = await readFile(new URL("../src/CatalogApp.tsx", import.meta.url), "utf8");

test("the static GitHub Pages build has its entry point and metadata", () => {
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /Speed Dating en español/);
  assert.match(html, /\.\/assets\//);
  assert.match(catalogHtml, /Catálogo del profesor/);
  assert.match(catalogHtml, /\.\/assets\//);
});

test("the complete guided sequence and finale are present", () => {
  for (const phrase of ["¿Cómo te", "¿De dónde", "¿Qué lenguas", "¿Dónde", "¿Te gusta?", "¿Te gustan los"]) {
    assert.ok(app.includes(phrase), `missing phrase: ${phrase}`);
  }
  assert.match(app, /https:\/\/spanish\.hku\.hk\//);
  assert.doesNotMatch(app, /Me llamo Pablo/);
  assert.match(app, /finaleAnswered &&/);
  assert.match(app, /catalogo\.html/);
});

test("the catalogue includes all categories and both grammar numbers", () => {
  for (const category of ["hobbies", "sports", "food", "drinks", "places", "campus"]) {
    assert.match(content, new RegExp(`id: "${category}"`));
  }
  assert.match(content, /"singular" \| "plural"/);
  assert.match(content, /"plural"\)/);
});

test("the revised catalogue has the agreed counts and wording", () => {
  const cardsBlock = content.match(/export const conversationCards[\s\S]*?export const countries/)?.[0] ?? "";
  const countriesBlock = content.match(/export const countries[\s\S]*?export const languages/)?.[0] ?? "";
  const languagesBlock = content.match(/export const languages[\s\S]*?export const residences/)?.[0] ?? "";

  assert.equal(cardsBlock.match(/\bcard\("/g)?.length, 51);
  assert.equal(countriesBlock.match(/flagImage: flagPath/g)?.length, 18);
  assert.equal(languagesBlock.match(/flagImage: flagPath/g)?.length, 22);

  for (const removed of ["hacer senderismo", "las empanadas", "trabajar en grupo", "hacer un intercambio", "ir a la biblioteca", "el agua con gas"]) {
    assert.ok(!cardsBlock.includes(removed), `active cards still include: ${removed}`);
  }
  for (const replacement of ["el agua caliente", "estudiar"]) {
    assert.ok(cardsBlock.includes(replacement), `missing replacement: ${replacement}`);
  }
});

test("flags, specific photos and review controls are wired locally", async () => {
  assert.doesNotMatch(content, /flag:\s*"/);
  assert.match(content, /imageKind: specificPhotos\[id\] \? "specific" : "category"/);
  assert.match(catalogApp, /speedDatingReviewV1/);
  assert.match(catalogApp, /Copiar resumen/);

  for (const relativePath of [
    "../public/flags/hk.svg",
    "../public/flags/es.svg",
    "../public/photos/cards/cake.webp",
    "../public/photos/cards/paella.webp",
    "../public/photos/cards/hot-water.webp",
    "../public/brand/chupa-chups.svg",
  ]) {
    await access(new URL(relativePath, import.meta.url));
  }
});
