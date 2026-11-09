import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { conversationCards } from "../src/data/content.ts";

const app = await readFile(new URL("../src/SpeedDatingApp.tsx", import.meta.url), "utf8");
const content = await readFile(new URL("../src/data/content.ts", import.meta.url), "utf8");
const html = await readFile(new URL("../dist-pages/index.html", import.meta.url), "utf8");
const catalogHtml = await readFile(new URL("../dist-pages/catalogo.html", import.meta.url), "utf8");
const catalogApp = await readFile(new URL("../src/CatalogApp.tsx", import.meta.url), "utf8");

test("the static GitHub Pages build has its entry point and metadata", () => {
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /Speak Dating en español/);
  assert.match(html, /\.\/assets\//);
  assert.match(catalogHtml, /Catálogo del profesor/);
  assert.match(catalogHtml, /\.\/assets\//);
});

test("the complete guided sequence and finale are present", () => {
  for (const phrase of ["¿Cómo te", "¿De dónde", "¿Qué lenguas", "¿Dónde", "¿Te gusta?", "¿Te gustan los"]) {
    assert.ok(app.includes(phrase), `missing phrase: ${phrase}`);
  }
  assert.match(app, /https:\/\/spanish\.hku\.hk\//);
  assert.match(app, /https:\/\/www\.instagram\.com\/spanishprogramme_hku\//);
  assert.doesNotMatch(app, /Me llamo Pablo/);
  assert.match(app, /finaleAnswered &&/);
  assert.match(app, /catalogo\.html/);
  assert.match(app, /className="finale-visual"/);
  assert.match(app, /instagram-panel/);
  assert.match(app, /toggleFullscreen/);
  assert.match(app, /requestFullscreen/);
  assert.match(catalogApp, /preview-qr instagram/);
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

  assert.equal(conversationCards.length, 55);
  assert.equal(new Set(conversationCards.map(({ id }) => id)).size, 55);
  assert.equal(countriesBlock.match(/flagImage: flagPath/g)?.length, 22);
  assert.equal(languagesBlock.match(/flagImage: flagPath/g)?.length, 22);

  for (const removed of ["hacer senderismo", "las empanadas", "las arepas", "el gazpacho", "trabajar en grupo", "hacer un intercambio", "ir a la biblioteca", "el agua con gas", "ver el fútbol", "participar en clubes", "la música latina"]) {
    assert.ok(!cardsBlock.includes(removed), `active cards still include: ${removed}`);
  }
  for (const replacement of ["el agua caliente", "estudiar", "la música"]) {
    assert.ok(cardsBlock.includes(replacement), `missing replacement: ${replacement}`);
  }

  for (const origin of ["España", "Inglaterra", "Francia", "Rusia"]) {
    assert.ok(countriesBlock.includes(origin), `missing origin: ${origin}`);
  }

  assert.match(content, /name: "Sheung Wan"/);
  assert.match(content, /card\("cake", "food", "la tarta de chocolate", "chocolate cake", ""\)/);
  assert.match(content, /card\("tortilla", "food", "la tortilla española", "Spanish omelette", ""\)/);
  assert.match(content, /card\("churros", "food", "los churros", "churros", "", "plural"\)/);
});

test("all existing card identifiers remain available", () => {
  const originalIds = [
    "music", "dance", "sing", "draw", "read", "cook", "photos", "travel", "shopping", "films", "series", "games",
    "play-football", "tennis", "basketball", "swim", "run", "cycle",
    "cake", "noodles", "rice", "fried-rice", "paella", "dim-sum", "sushi", "pizza", "tacos", "tortilla", "churros", "ice-cream",
    "bubble-tea", "tea", "coffee", "orange-juice", "hot-chocolate", "hot-water",
    "beach", "mountains", "cinema", "museums", "theme-parks", "victoria-peak", "cantopop", "kpop", "latin-music",
    "study-spanish", "learn-languages", "friends", "study",
  ];
  const activeIds = new Set(conversationCards.map(({ id }) => id));
  for (const id of originalIds) assert.ok(activeIds.has(id), `missing existing card: ${id}`);
});

test("the six approved cards have their agreed questions, translations and local photos", async () => {
  const approvedCards = [
    ["la Roja", "sports", "Spain’s national football team", "singular", "¿Te gusta la Roja?"],
    ["Barcelona", "places", "Barcelona", "singular", "¿Te gusta Barcelona?"],
    ["Machu Picchu", "places", "Machu Picchu", "singular", "¿Te gusta Machu Picchu?"],
    ["las croquetas", "food", "croquettes", "plural", "¿Te gustan las croquetas?"],
    ["el jamón ibérico", "food", "Iberian cured ham", "singular", "¿Te gusta el jamón ibérico?"],
    ["la Universidad de Hong Kong", "campus", "The University of Hong Kong", "singular", "¿Te gusta la Universidad de Hong Kong?"],
  ];
  for (const [label, category, english, number, question] of approvedCards) {
    const card = conversationCards.find((candidate) => candidate.label === label);
    assert.ok(card, `missing approved card: ${label}`);
    assert.equal(card.category, category);
    assert.equal(card.english, english);
    assert.equal(card.number, number);
    assert.equal(`¿Te ${card.number === "plural" ? "gustan" : "gusta"} ${card.label}?`, question);
    assert.equal(card.imageKind, "specific");
    assert.match(card.image, /^photos\/cards\/[\w-]+\.webp$/);
    assert.ok(card.alt.trim(), `missing alt text: ${label}`);
    assert.ok(card.photoCredit.trim(), `missing credit: ${label}`);
    assert.match(card.photoSource, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    await access(new URL(`../public/${card.image}`, import.meta.url));
  }
});

test("drinks retain exactly the existing six cards", () => {
  assert.deepEqual(
    conversationCards.filter(({ category }) => category === "drinks").map(({ id, label, english }) => [id, label, english]),
    [
      ["bubble-tea", "el bubble tea", "bubble tea"],
      ["tea", "el té", "tea"],
      ["coffee", "el café", "coffee"],
      ["orange-juice", "el zumo de naranja", "orange juice"],
      ["hot-chocolate", "el chocolate caliente", "hot chocolate"],
      ["hot-water", "el agua caliente", "hot water"],
    ],
  );
});

test("HKU attribution and programme headings are included in both QR views", async () => {
  assert.match(app, /SPANISH LANGUAGE &(?:amp;)? CULTURE/);
  assert.match(app, /Developed by the HKU SPANISH DEPARTMENT 💟/);
  assert.match(app, /Learn more about the Spanish Programme at HKU/);
  assert.match(catalogApp, /Learn more about the Spanish Programme at HKU/);
  assert.doesNotMatch(app, /HKU · PUERTAS ABIERTAS/);
  const logoPath = app.match(/src="(brand\/smlc[^"]+)"/)?.[1];
  assert.ok(logoPath, "missing local SMLC logo on home screen");
  await access(new URL(`../public/${logoPath}`, import.meta.url));
});

test("activity and teacher settings share the language rules without changing storage keys", () => {
  assert.match(app, /from "\.\/lib\/languages"/);
  for (const setter of ["setSelectedLanguages", "setProfileLanguages"]) {
    assert.match(app, new RegExp(`${setter}\\(\\s*\\([^)]*\\)\\s*=>\\s*toggleLanguageSelection\\(`));
  }
  assert.match(app, /loadTeacherProfileState\(languages,\s*residences,\s*MAX_LANGUAGES\)/);
  assert.match(app, /from "\.\/lib\/teacherProfiles"/);
  assert.ok((app.match(/joinSpanish\(/g)?.length ?? 0) >= 3, "activity, teacher example and profile summary use the shared sentence formatter");
});

test("flags, specific photos and review controls are wired locally", async () => {
  assert.doesNotMatch(content, /flag:\s*"/);
  assert.match(content, /imageKind: specificPhotos\[id\] \? "specific" : "category"/);
  assert.match(catalogApp, /speedDatingReviewV1/);
  assert.match(catalogApp, /Copiar resumen/);

  for (const relativePath of [
    "../public/flags/hk.svg",
    "../public/flags/es.svg",
    "../public/flags/gb-eng.svg",
    "../public/photos/cards/cake.webp",
    "../public/photos/cards/paella.webp",
    "../public/photos/cards/hot-water.webp",
    "../public/photos/cards/orange-juice.webp",
    "../public/photos/cards/hot-chocolate.webp",
    "../public/photos/cards/theme-parks.webp",
    "../public/brand/chupa-chups.png",
  ]) {
    await access(new URL(relativePath, import.meta.url));
  }
});
