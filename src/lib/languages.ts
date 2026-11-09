export const MAX_LANGUAGES = 4;

const languagesTakingE = new Set(["inglés", "italiano", "indonesio"]);

export const toggleLanguageSelection = (
  selected: readonly string[],
  id: string,
): string[] => {
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  return [...selected.slice(-(MAX_LANGUAGES - 1)), id];
};

export const joinSpanish = (items: readonly string[]): string => {
  if (items.length === 0) return "…";
  if (items.length === 1) return items[0];
  const lastItem = items[items.length - 1];
  const conjunction = languagesTakingE.has(lastItem) ? "e" : "y";
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${lastItem}`;
};
