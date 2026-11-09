import assert from "node:assert/strict";
import test from "node:test";
import { MAX_LANGUAGES, toggleLanguageSelection } from "../src/lib/languages.ts";
import {
  ACTIVE_PROFILE_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  loadTeacherProfileState,
  persistProfiles,
} from "../src/lib/teacherProfiles.ts";

const languages = ["es", "en", "fr", "it", "id"].map((id) => ({ id }));
const residences = [{ id: "sheung-wan" }];
const emptyState = { profiles: [], activeProfile: null };
const memoryStorage = () => {
  const entries = new Map();
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  };
};
const loadProfiles = (storage) => loadTeacherProfileState(languages, residences, MAX_LANGUAGES, storage);

test("four selected languages survive saving and reloading the active teacher profile", () => {
  const storage = memoryStorage();
  const profile = {
    id: "teacher-ana",
    name: "Ana",
    languageIds: ["es", "en", "fr", "it"].reduce(toggleLanguageSelection, []),
    residenceId: "sheung-wan",
  };
  persistProfiles([profile], profile.id, storage);

  assert.equal(PROFILE_STORAGE_KEY, "speed-dating-teacher-profiles-v1");
  assert.equal(ACTIVE_PROFILE_STORAGE_KEY, "speed-dating-active-teacher-profile-v1");
  assert.deepEqual(JSON.parse(storage.getItem(PROFILE_STORAGE_KEY)), [profile]);
  assert.equal(storage.getItem(ACTIVE_PROFILE_STORAGE_KEY), profile.id);
  assert.deepEqual(loadProfiles(storage), { profiles: [profile], activeProfile: profile });

  const replacedProfile = { ...profile, languageIds: toggleLanguageSelection(profile.languageIds, "id") };
  persistProfiles([replacedProfile], profile.id, storage);
  assert.deepEqual(loadProfiles(storage).activeProfile.languageIds, ["en", "fr", "it", "id"]);
});

test("deactivating a teacher preserves the saved profile and removes the active key", () => {
  const storage = memoryStorage();
  const profile = { id: "teacher-ana", name: "Ana", languageIds: ["es"], residenceId: "sheung-wan" };
  persistProfiles([profile], profile.id, storage);
  persistProfiles([profile], null, storage);
  assert.equal(storage.getItem(ACTIVE_PROFILE_STORAGE_KEY), null);
  assert.deepEqual(loadProfiles(storage), { profiles: [profile], activeProfile: null });
});

test("loading filters invalid identifiers and caps stored languages at four in order", () => {
  const storage = memoryStorage();
  storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify([
    null,
    123,
    {},
    { id: "teacher-ana", name: "Ana", languageIds: ["unknown", "es", 7, "en", "fr", "it", "id"], residenceId: "missing" },
    { id: "teacher-pablo", name: "Pablo", languageIds: "es" },
  ]));
  storage.setItem(ACTIVE_PROFILE_STORAGE_KEY, "teacher-ana");
  const state = loadProfiles(storage);
  assert.deepEqual(state.profiles, [
    { id: "teacher-ana", name: "Ana", languageIds: ["es", "en", "fr", "it"], residenceId: null },
    { id: "teacher-pablo", name: "Pablo", languageIds: [], residenceId: null },
  ]);
  assert.deepEqual(state.activeProfile, state.profiles[0]);
  storage.setItem(ACTIVE_PROFILE_STORAGE_KEY, "missing-teacher");
  assert.equal(loadProfiles(storage).activeProfile, null);
});

test("missing, malformed and unreadable storage loads an empty state", () => {
  const storage = memoryStorage();
  assert.deepEqual(loadProfiles(storage), emptyState);
  for (const invalidValue of ["{", "null", "{}", "123"]) {
    storage.setItem(PROFILE_STORAGE_KEY, invalidValue);
    assert.deepEqual(loadProfiles(storage), emptyState);
  }
  assert.deepEqual(loadProfiles({ ...storage, getItem() { throw new Error("Storage is blocked"); } }), emptyState);
  assert.doesNotThrow(() => persistProfiles([], null, { ...storage, setItem() { throw new Error("Storage is full"); } }));
});

test("server rendering and denied browser storage access remain safe", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  try {
    delete globalThis.window;
    assert.deepEqual(loadProfiles(), emptyState);
    assert.doesNotThrow(() => persistProfiles([], null));
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        get localStorage() { throw new Error("Storage access denied"); },
      },
    });
    assert.deepEqual(loadProfiles(), emptyState);
    assert.doesNotThrow(() => persistProfiles([], null));
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else delete globalThis.window;
  }
});
