import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_LANGUAGES,
  joinSpanish,
  toggleLanguageSelection,
} from "../src/lib/languages.ts";

test("language lists keep empty and single-language sentences readable", () => {
  assert.equal(joinSpanish([]), "…");
  assert.equal(joinSpanish(["español"]), "español");
  assert.equal(joinSpanish(["inglés"]), "inglés");
});

test("language lists use e before inglés, italiano and indonesio", () => {
  for (const lastLanguage of ["inglés", "italiano", "indonesio"]) {
    assert.equal(joinSpanish(["español", lastLanguage]), `español e ${lastLanguage}`);
    assert.equal(joinSpanish(["español", "francés", lastLanguage]), `español, francés e ${lastLanguage}`);
  }
});

test("only the final language determines the conjunction", () => {
  assert.equal(joinSpanish(["español", "chino"]), "español y chino");
  assert.equal(joinSpanish(["inglés", "italiano", "indonesio", "francés"]), "inglés, italiano, indonesio y francés");
  const selected = Object.freeze(["español", "francés", "chino", "inglés"]);
  assert.equal(joinSpanish(selected), "español, francés, chino e inglés");
  assert.deepEqual(selected, ["español", "francés", "chino", "inglés"]);
});

test("both language selectors can retain four selections in order", () => {
  assert.equal(MAX_LANGUAGES, 4);
  const selected = ["es", "en", "fr", "it"].reduce(toggleLanguageSelection, []);
  assert.deepEqual(selected, ["es", "en", "fr", "it"]);
});

test("a fifth language replaces the first without mutating the selection", () => {
  const selected = Object.freeze(["es", "en", "fr", "it"]);
  assert.deepEqual(toggleLanguageSelection(selected, "id"), ["en", "fr", "it", "id"]);
  assert.deepEqual(selected, ["es", "en", "fr", "it"]);
});

test("choosing a selected language deselects it and frees one slot", () => {
  const selected = ["es", "en", "fr", "it"];
  const withoutEnglish = toggleLanguageSelection(selected, "en");
  assert.deepEqual(withoutEnglish, ["es", "fr", "it"]);
  assert.deepEqual(toggleLanguageSelection(withoutEnglish, "id"), ["es", "fr", "it", "id"]);
  assert.deepEqual(toggleLanguageSelection(["es"], "es"), []);
});
