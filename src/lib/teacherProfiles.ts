export type TeacherProfile = {
  id: string;
  name: string;
  languageIds: string[];
  residenceId: string | null;
};

type ProfileStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type TeacherProfileState = {
  profiles: TeacherProfile[];
  activeProfile: TeacherProfile | null;
};

export const PROFILE_STORAGE_KEY = "speed-dating-teacher-profiles-v1";
export const ACTIVE_PROFILE_STORAGE_KEY = "speed-dating-active-teacher-profile-v1";

const getProfileStorage = (storage?: ProfileStorage): ProfileStorage | null =>
  storage ?? (typeof window === "undefined" ? null : window.localStorage);

export const loadTeacherProfileState = (
  languages: readonly { id: string }[],
  residences: readonly { id: string }[],
  maxLanguages: number,
  storage?: ProfileStorage,
): TeacherProfileState => {
  try {
    const profileStorage = getProfileStorage(storage);
    if (!profileStorage) return { profiles: [], activeProfile: null };
    const storedProfiles = JSON.parse(profileStorage.getItem(PROFILE_STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(storedProfiles)) return { profiles: [], activeProfile: null };
    const validLanguageIds = new Set(languages.map((language) => language.id));
    const validResidenceIds = new Set(residences.map((place) => place.id));
    const profiles = storedProfiles.flatMap((item): TeacherProfile[] => {
      if (!item || typeof item !== "object") return [];
      const candidate = item as Partial<TeacherProfile>;
      if (typeof candidate.id !== "string" || typeof candidate.name !== "string") return [];
      return [{
        id: candidate.id,
        name: candidate.name,
        languageIds: Array.isArray(candidate.languageIds)
          ? candidate.languageIds.filter((id): id is string => typeof id === "string" && validLanguageIds.has(id)).slice(0, maxLanguages)
          : [],
        residenceId: typeof candidate.residenceId === "string" && validResidenceIds.has(candidate.residenceId)
          ? candidate.residenceId
          : null,
      }];
    });
    const activeId = profileStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
    return {
      profiles,
      activeProfile: profiles.find((profile) => profile.id === activeId) ?? null,
    };
  } catch {
    return { profiles: [], activeProfile: null };
  }
};

export const persistProfiles = (
  nextProfiles: TeacherProfile[],
  nextActiveId: string | null,
  storage?: ProfileStorage,
): void => {
  try {
    const profileStorage = getProfileStorage(storage);
    if (!profileStorage) return;
    profileStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfiles));
    if (nextActiveId) profileStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, nextActiveId);
    else profileStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
  } catch {
    // The app still works for the current session if private browsing blocks storage.
  }
};
