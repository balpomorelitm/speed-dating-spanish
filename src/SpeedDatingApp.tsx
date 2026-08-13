"use client";

/* eslint-disable @next/next/no-img-element -- shared static GitHub Pages app uses optimized local photos */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  categories,
  conversationCards,
  countries,
  finalCardAsset,
  languages,
  photoCredits,
  residences,
  type CategoryId,
  type ConversationCard,
} from "./data/content";

const PROGRAMME_URL = "https://spanish.hku.hk/";
const INSTAGRAM_URL = "https://www.instagram.com/spanishprogramme_hku/";

const stepLabels = [
  "Inicio",
  "Nombre",
  "Origen",
  "Lenguas",
  "Vives",
  "Gestos",
  "Tarjetas",
];

const reactions = [
  { id: "like", icon: "👍", label: "Me gusta", color: "green" },
  { id: "love", icon: "👍👍", label: "Me gusta mucho", color: "yellow" },
  { id: "dislike", icon: "👎", label: "No me gusta", color: "coral" },
  { id: "hate", icon: "👎👎", label: "No me gusta nada", color: "burgundy" },
] as const;

type CategoryFilter = "all" | CategoryId;
type ReactionId = (typeof reactions)[number]["id"];
type DeckState = { currentId: string; queue: string[]; round: number };
type TeacherProfile = {
  id: string;
  name: string;
  languageIds: string[];
  residenceId: string | null;
};

const PROFILE_STORAGE_KEY = "speed-dating-teacher-profiles-v1";
const ACTIVE_PROFILE_STORAGE_KEY = "speed-dating-active-teacher-profile-v1";

const loadTeacherProfileState = (): {
  profiles: TeacherProfile[];
  activeProfile: TeacherProfile | null;
} => {
  if (typeof window === "undefined") return { profiles: [], activeProfile: null };
  try {
    const storedProfiles = JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) ?? "[]") as unknown;
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
          ? candidate.languageIds.filter((id): id is string => typeof id === "string" && validLanguageIds.has(id)).slice(0, 4)
          : [],
        residenceId: typeof candidate.residenceId === "string" && validResidenceIds.has(candidate.residenceId)
          ? candidate.residenceId
          : null,
      }];
    });
    const activeId = window.localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
    return {
      profiles,
      activeProfile: profiles.find((profile) => profile.id === activeId) ?? null,
    };
  } catch {
    return { profiles: [], activeProfile: null };
  }
};

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const makeDeck = (cards: ConversationCard[], round = 1): DeckState => {
  const shuffled = shuffle(cards);
  return {
    currentId: shuffled[0]?.id ?? conversationCards[0].id,
    queue: shuffled.slice(1).map((card) => card.id),
    round,
  };
};

const joinSpanish = (items: string[]) => {
  if (items.length === 0) return "…";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
};

export default function SpeedDatingApp() {
  const [step, setStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedResidence, setSelectedResidence] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [deck, setDeck] = useState<DeckState>(() => makeDeck(conversationCards));
  const [reaction, setReaction] = useState<ReactionId | null>(null);
  const [cardMotion, setCardMotion] = useState(0);
  const [deckNotice, setDeckNotice] = useState("");
  const [finaleAnswered, setFinaleAnswered] = useState(false);
  const [profiles, setProfiles] = useState<TeacherProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileLanguages, setProfileLanguages] = useState<string[]>([]);
  const [profileResidence, setProfileResidence] = useState("");
  const [profileError, setProfileError] = useState("");
  const touchStart = useRef<{ x: number; y: number; blocked: boolean } | null>(null);

  const currentCard =
    conversationCards.find((card) => card.id === deck.currentId) ?? conversationCards[0];

  const country = countries.find((item) => item.id === selectedCountry);
  const residence = residences.find((item) => item.id === selectedResidence);
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) ?? null;
  const languageNames = selectedLanguages
    .map((id) => languages.find((language) => language.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const pool = useMemo(
    () =>
      category === "all"
        ? conversationCards
        : conversationCards.filter((card) => card.category === category),
    [category],
  );

  const goToStep = useCallback((target: number) => {
    const boundedTarget = Math.max(0, Math.min(7, target));
    if (boundedTarget !== 7) setFinaleAnswered(false);
    setStep(boundedTarget);
    setMenuOpen(false);
    setProfilePanelOpen(false);
    setProfileFormOpen(false);
    setDeckNotice("");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const drawNextCard = useCallback(() => {
    setReaction(null);
    setCardMotion((value) => value + 1);
    setDeck((previous) => {
      if (previous.queue.length > 0) {
        return {
          ...previous,
          currentId: previous.queue[0],
          queue: previous.queue.slice(1),
        };
      }

      const fresh = shuffle(pool.filter((card) => card.id !== previous.currentId));
      setDeckNotice("¡Baraja completa! Empezamos otra ronda.");
      window.setTimeout(() => setDeckNotice(""), 2600);
      return {
        currentId: fresh[0]?.id ?? previous.currentId,
        queue: fresh.slice(1).map((card) => card.id),
        round: previous.round + 1,
      };
    });
  }, [pool]);

  const next = useCallback(() => {
    if (step === 6) drawNextCard();
    else if (step < 7) goToStep(step + 1);
  }, [drawNextCard, goToStep, step]);

  const previous = useCallback(() => {
    if (step > 0) goToStep(step - 1);
  }, [goToStep, step]);

  const selectCategory = (nextCategory: CategoryFilter) => {
    const nextPool =
      nextCategory === "all"
        ? conversationCards
        : conversationCards.filter((card) => card.category === nextCategory);
    setCategory(nextCategory);
    setDeck(makeDeck(nextPool));
    setReaction(null);
    setCardMotion((value) => value + 1);
    setDeckNotice("");
  };

  const toggleLanguage = (id: string) => {
    setSelectedLanguages((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length < 3) return [...current, id];
      return [...current.slice(1), id];
    });
  };

  const persistProfiles = (nextProfiles: TeacherProfile[], nextActiveId: string | null) => {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfiles));
      if (nextActiveId) window.localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, nextActiveId);
      else window.localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
    } catch {
      // The app still works for the current session if private browsing blocks storage.
    }
  };

  const applyProfile = (profile: TeacherProfile) => {
    setActiveProfileId(profile.id);
    setSelectedLanguages(profile.languageIds);
    setSelectedResidence(profile.residenceId);
    persistProfiles(profiles, profile.id);
    setMenuOpen(false);
    setProfilePanelOpen(false);
    setProfileFormOpen(false);
  };

  const openProfileForm = (profile?: TeacherProfile) => {
    setEditingProfileId(profile?.id ?? null);
    setProfileName(profile?.name ?? "");
    setProfileLanguages(profile?.languageIds ?? []);
    setProfileResidence(profile?.residenceId ?? "");
    setProfileError("");
    setProfileFormOpen(true);
  };

  const toggleProfileLanguage = (id: string) => {
    setProfileLanguages((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length < 4) return [...current, id];
      return [...current.slice(1), id];
    });
  };

  const saveProfile = () => {
    const cleanName = profileName.trim();
    if (!cleanName) {
      setProfileError("Escribe el nombre del profesor.");
      return;
    }
    if (profileLanguages.length === 0) {
      setProfileError("Elige al menos una lengua.");
      return;
    }
    if (!profileResidence) {
      setProfileError("Elige dónde vive el profesor.");
      return;
    }

    const id = editingProfileId ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `profile-${Date.now()}`);
    const savedProfile: TeacherProfile = {
      id,
      name: cleanName,
      languageIds: profileLanguages,
      residenceId: profileResidence || null,
    };
    const nextProfiles = editingProfileId
      ? profiles.map((profile) => profile.id === editingProfileId ? savedProfile : profile)
      : [...profiles, savedProfile];

    setProfiles(nextProfiles);
    setActiveProfileId(id);
    setSelectedLanguages(savedProfile.languageIds);
    setSelectedResidence(savedProfile.residenceId);
    persistProfiles(nextProfiles, id);
    setProfileFormOpen(false);
    setEditingProfileId(null);
  };

  const deleteProfile = (profile: TeacherProfile) => {
    if (!window.confirm(`¿Quitar el perfil de ${profile.name}?`)) return;
    const nextProfiles = profiles.filter((item) => item.id !== profile.id);
    const nextActiveId = activeProfileId === profile.id ? null : activeProfileId;
    setProfiles(nextProfiles);
    setActiveProfileId(nextActiveId);
    if (activeProfileId === profile.id) {
      setSelectedLanguages([]);
      setSelectedResidence(null);
    }
    persistProfiles(nextProfiles, nextActiveId);
  };

  const toggleFullscreen = async () => {
    const fullscreenDocument = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const root = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };

    try {
      if (document.fullscreenElement || fullscreenDocument.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else await fullscreenDocument.webkitExitFullscreen?.();
      } else if (root.requestFullscreen) {
        await root.requestFullscreen();
      } else {
        await root.webkitRequestFullscreen?.();
      }
    } catch {
      setFullscreenSupported(false);
    }
  };

  const reset = () => {
    setSelectedCountry(null);
    setSelectedLanguages(activeProfile?.languageIds ?? []);
    setSelectedResidence(activeProfile?.residenceId ?? null);
    setCategory("all");
    setDeck(makeDeck(conversationCards));
    setReaction(null);
    setFinaleAnswered(false);
    goToStep(0);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedState = loadTeacherProfileState();
      setProfiles(storedState.profiles);
      if (storedState.activeProfile) {
        setActiveProfileId(storedState.activeProfile.id);
        setSelectedLanguages(storedState.activeProfile.languageIds);
        setSelectedResidence(storedState.activeProfile.residenceId);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (menuOpen) return;
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [menuOpen, next, previous]);

  useEffect(() => {
    const fullscreenDocument = document as Document & {
      webkitFullscreenElement?: Element;
    };
    const syncFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || fullscreenDocument.webkitFullscreenElement));
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    touchStart.current = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
      blocked: Boolean(target.closest("button, a, [data-no-swipe]")),
    };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current || touchStart.current.blocked) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.3) return;
    if (deltaX < 0) next();
    else previous();
  };

  const verb = currentCard.number === "plural" ? "gustan" : "gusta";
  const categoryMeta = categories.find((item) => item.id === currentCard.category)!;
  const chosenReaction = reactions.find((item) => item.id === reaction);
  const selectedResponse = chosenReaction
    ? chosenReaction.id === "love"
      ? `Me ${verb} mucho ${currentCard.label}.`
      : chosenReaction.id === "hate"
        ? `No me ${verb} nada ${currentCard.label}.`
        : chosenReaction.id === "dislike"
          ? `No me ${verb} ${currentCard.label}.`
          : `Me ${verb} ${currentCard.label}.`
    : null;

  return (
    <div
      className={`app-shell step-${step}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="topbar">
        <button className="mini-brand" onClick={() => goToStep(0)} aria-label="Volver al inicio">
          <span className="brand-dot">¡H!</span>
          <span>
            <strong>Speed Dating</strong>
            <small>en español</small>
          </span>
        </button>

        <nav className="progress" aria-label="Progreso de la actividad">
          {stepLabels.map((label, index) => (
            <button
              key={label}
              className={index === Math.min(step, 6) ? "active" : index < step ? "done" : ""}
              onClick={() => goToStep(index)}
              aria-label={`Ir a ${label}`}
              aria-current={index === Math.min(step, 6) ? "step" : undefined}
            >
              <span>{index < step ? "✓" : index + 1}</span>
              <small>{label}</small>
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          {fullscreenSupported && (
            <button
              className="fullscreen-button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Salir de pantalla completa" : "Abrir en pantalla completa"}
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              <span aria-hidden="true">{isFullscreen ? "×" : "⛶"}</span>
            </button>
          )}
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main className="stage" aria-live="polite">
        {step === 0 && (
          <section className="welcome-screen screen-card">
            <div className="welcome-copy">
              <div className="eyebrow"><span>HKU</span> · PUERTAS ABIERTAS</div>
              <h1>
                Speed Dating
                <em>en español</em>
              </h1>
              <p>Habla, elige y diviértete.</p>
              <p className="english-help">Speak, choose and have fun.</p>
              <button className="primary-button start-button" onClick={() => goToStep(1)}>
                Empezar <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="welcome-collage" aria-hidden="true">
              <div className="burst burst-one">¡Hola!</div>
              <div className="floating-card card-name"><span>👋</span> Me llamo…</div>
              <div className="floating-card card-origin"><span>🌏</span> Soy de…</div>
              <div className="floating-card card-like"><span>👍</span> Me gusta</div>
              <div className="sticker sticker-one">¡VAMOS!</div>
              <div className="sticker sticker-two">HOLA</div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="lesson-screen name-screen">
            <LessonHeading number="01" english="Introduce yourself">
              ¿Cómo te <mark>llamas</mark>?
            </LessonHeading>
            <div className="dialogue-layout">
              <div className="teacher-card">
                <div className="teacher-avatar waving-hand" aria-hidden="true">👋</div>
                <span className="role-label">PROFESOR · TEACHER</span>
                <p>Me llamo <b>{activeProfile?.name ?? "…"}</b>.</p>
                <strong>¿Cómo te llamas?</strong>
              </div>
              <div className="student-answer coral-card">
                <span className="role-label">TU TURNO · YOUR TURN</span>
                <p>Me llamo…</p>
                <span className="speech-sticker" aria-hidden="true">👋</span>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="lesson-screen country-screen">
            <LessonHeading number="02" english="Where are you from?">
              ¿De dónde <mark>eres</mark>?
            </LessonHeading>
            <div className={`live-sentence ${country ? "has-selection" : ""}`}>
              <span className="sentence-flag" aria-hidden="true">
                {country ? <img src={country.flagImage} alt="" /> : "🌏"}
              </span>
              <div>
                <small>MODELO · MODEL</small>
                <p>Soy de <strong>{country?.name ?? "…"}</strong></p>
              </div>
            </div>
            <p className="tap-hint">Toca una bandera · <span>Tap a flag</span></p>
            <div className="choice-grid flag-grid" data-no-swipe>
              {countries.map((item) => (
                <button
                  key={item.id}
                  className={selectedCountry === item.id ? "selected" : ""}
                  onClick={() => setSelectedCountry(item.id)}
                  aria-pressed={selectedCountry === item.id}
                >
                  <img className="flag" src={item.flagImage} alt={`Bandera de ${item.name}`} />
                  <strong>{item.name}</strong>
                  <small>{item.english}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="lesson-screen language-screen">
            <LessonHeading number="03" english="Which languages do you speak?">
              ¿Qué lenguas <mark>hablas</mark>?
            </LessonHeading>
            <div className="teacher-example">
              <span>PROFESOR · TEACHER</span>
              <p>
                {activeProfile
                  ? `«Hablo ${joinSpanish(activeProfile.languageIds.map((id) => languages.find((language) => language.id === id)?.name).filter((name): name is string => Boolean(name)))}.»`
                  : "«Hablo español, inglés y un poco de chino.»"}
              </p>
            </div>
            <div className="live-sentence language-sentence">
              <span className="sentence-flag sentence-language-flags" aria-hidden="true">
                {selectedLanguages.length === 0
                  ? "💬"
                  : selectedLanguages.map((id) => {
                      const selected = languages.find((language) => language.id === id);
                      return selected ? <img key={id} src={selected.flagImage} alt="" /> : null;
                    })}
              </span>
              <div>
                <small>ELIGE HASTA 3 · CHOOSE UP TO 3</small>
                <p>Hablo <strong>{joinSpanish(languageNames)}</strong></p>
              </div>
            </div>
            <div className="choice-grid language-grid" data-no-swipe>
              {languages.map((language) => (
                <button
                  key={language.id}
                  className={selectedLanguages.includes(language.id) ? "selected" : ""}
                  onClick={() => toggleLanguage(language.id)}
                  aria-pressed={selectedLanguages.includes(language.id)}
                >
                  <img
                    className="language-flag"
                    src={language.flagImage}
                    alt={`Bandera representativa: ${language.flagCountry}`}
                  />
                  <strong>{language.name}</strong>
                  <small>{language.english}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="lesson-screen residence-screen">
            <LessonHeading number="04" english="Where do you live?">
              ¿Dónde <mark>vives</mark>?
            </LessonHeading>
            <div className="live-sentence residence-sentence">
              <span className="sentence-flag" aria-hidden="true">{residence?.emoji ?? "📍"}</span>
              <div>
                <small>MODELO · MODEL</small>
                <p>Vivo en <strong>{residence?.name ?? "…"}</strong></p>
              </div>
            </div>
            <p className="tap-hint">Elige una zona · <span>Choose an area</span></p>
            <div className="place-grid" data-no-swipe>
              {residences.map((place) => (
                <button
                  key={place.id}
                  className={selectedResidence === place.id ? "selected" : ""}
                  onClick={() => setSelectedResidence(place.id)}
                  aria-pressed={selectedResidence === place.id}
                >
                  <span aria-hidden="true">{place.emoji}</span>
                  {place.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="reaction-screen">
            <div className="eyebrow centered"><span>SEGUNDA PARTE</span> · ROUND TWO</div>
            <h2>¿Te gusta?</h2>
            <p className="reaction-intro">Responde con las manos · <span>Answer with your hands</span></p>
            <div className="reaction-grid">
              {reactions.map((item, index) => (
                <div className={`reaction-card ${item.color}`} key={item.id}>
                  <span className="reaction-number">0{index + 1}</span>
                  <div className="reaction-icon" aria-hidden="true">{item.icon}</div>
                  <strong>{item.label}</strong>
                  <small>
                    {index === 0 && "I like it"}
                    {index === 1 && "I like it a lot"}
                    {index === 2 && "I don’t like it"}
                    {index === 3 && "I don’t like it at all"}
                  </small>
                </div>
              ))}
            </div>
            <button className="primary-button ready-button" onClick={() => goToStep(6)}>
              ¡Listos! <span aria-hidden="true">→</span>
            </button>
          </section>
        )}

        {step === 6 && (
          <section className="deck-screen">
            <div className="deck-heading">
              <div>
                <span className="eyebrow"><span>RONDA {deck.round}</span> · ROUND {deck.round}</span>
                <h2>¿Te {verb}…?</h2>
              </div>
              <button className="lollipop-button" onClick={() => goToStep(7)}>
                <span aria-hidden="true">🍭</span>
                Tarjeta final
                <small>Final card</small>
              </button>
            </div>

            <div className="category-filters" data-no-swipe aria-label="Filtrar tarjetas por categoría">
              <button
                className={category === "all" ? "active" : ""}
                onClick={() => selectCategory("all")}
                aria-pressed={category === "all"}
              >
                <span aria-hidden="true">✨</span> Todo
              </button>
              {categories.map((item) => (
                <button
                  key={item.id}
                  className={category === item.id ? "active" : ""}
                  onClick={() => selectCategory(item.id)}
                  aria-pressed={category === item.id}
                >
                  <span aria-hidden="true">{item.emoji}</span> {item.label}
                </button>
              ))}
            </div>

            <div className="deck-layout">
              <article className="prompt-card" key={`${currentCard.id}-${cardMotion}`}>
                <div className="photo-wrap">
                  <img src={currentCard.image} alt={currentCard.alt} />
                  <span
                    className="category-badge"
                    style={{ backgroundColor: categoryMeta.color }}
                  >
                    {categoryMeta.emoji} {categoryMeta.label}
                  </span>
                  {currentCard.stickerImages?.length ? (
                    <span
                      className={`item-sticker item-sticker-flags ${currentCard.stickerImages.length === 1 ? "single-flag" : ""}`}
                      aria-hidden="true"
                    >
                      {currentCard.stickerImages.map((image) => (
                        <img key={image} src={image} alt="" />
                      ))}
                    </span>
                  ) : currentCard.sticker ? (
                    <span className="item-sticker" aria-hidden="true">{currentCard.sticker}</span>
                  ) : null}
                </div>
                <div className="prompt-copy">
                  <small>PREGUNTA · QUESTION</small>
                  <h3>¿Te {verb} <strong>{currentCard.label}</strong>?</h3>
                  <p>{currentCard.english}</p>
                </div>
              </article>

              <div className="answer-panel">
                <span className="panel-label">ELIGE TU RESPUESTA · CHOOSE</span>
                <div className="answer-buttons" data-no-swipe>
                  {reactions.map((item) => (
                    <button
                      key={item.id}
                      className={`${item.color} ${reaction === item.id ? "selected" : ""}`}
                      onClick={() => setReaction(item.id)}
                      aria-pressed={reaction === item.id}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      <strong>{item.label.replace("gusta", verb)}</strong>
                    </button>
                  ))}
                </div>
                <div className={`spoken-answer ${selectedResponse ? "visible" : ""}`}>
                  {selectedResponse ?? "Toca una respuesta"}
                </div>
                <button className="next-card-button" onClick={drawNextCard}>
                  Otra tarjeta <span aria-hidden="true">→</span>
                  <small>Swipe or tap</small>
                </button>
                <p className="deck-count">Quedan {deck.queue.length} sin repetir</p>
                {deckNotice && <p className="deck-notice" role="status">{deckNotice}</p>}
              </div>
            </div>
          </section>
        )}

        {step === 7 && (
          <section className={`finale-screen ${finaleAnswered ? "is-celebrating" : ""}`}>
            {finaleAnswered && (
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 20 }, (_, index) => <i key={index} />)}
              </div>
            )}
            <div className="finale-visual">
              <div className="finale-photo finale-brand">
                <img src={finalCardAsset.image} alt={finalCardAsset.alt} width="640" height="640" />
              </div>
              <span className="final-sticker">¡SORPRESA!</span>
            </div>
            <div className="finale-copy">
              <span className="eyebrow"><span>ÚLTIMA TARJETA</span> · LAST CARD</span>
              <h2>¿Te gustan los <em>Chupa Chups</em>?</h2>
              {!finaleAnswered ? (
                <button className="final-answer final-answer-button" onClick={() => setFinaleAnswered(true)}>
                  <span aria-hidden="true">👍👍</span> Sí, me gustan mucho.
                </button>
              ) : (
                <div className="final-reveal" aria-live="polite">
                  <div className="final-answer"><span aria-hidden="true">👍👍</span> Sí, me gustan mucho.</div>
                  <div className="qr-grid">
                    <div className="qr-panel">
                      <a href={PROGRAMME_URL} target="_blank" rel="noreferrer" aria-label="Abrir Spanish Programme de HKU">
                        <QRCodeSVG
                          value={PROGRAMME_URL}
                          size={148}
                          level="H"
                          bgColor="#fffaf1"
                          fgColor="#5f0034"
                          title="QR del Spanish Programme de HKU"
                        />
                      </a>
                      <div>
                        <span>DISCOVER MORE</span>
                        <strong>Spanish at HKU</strong>
                        <small>Visit the programme website</small>
                      </div>
                    </div>
                    <div className="qr-panel instagram-panel">
                      <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Abrir Instagram de Spanish Programme HKU">
                        <QRCodeSVG
                          value={INSTAGRAM_URL}
                          size={148}
                          level="H"
                          bgColor="#ffffff"
                          fgColor="#74105e"
                          title="QR del Instagram de Spanish Programme HKU"
                        />
                      </a>
                      <div>
                        <div className="instagram-title">
                          <span className="instagram-mark" aria-hidden="true"><i /></span>
                          <strong>Instagram</strong>
                        </div>
                        <span>SÍGUENOS · FOLLOW US</span>
                        <small>@spanishprogramme_hku</small>
                      </div>
                    </div>
                  </div>
                  <div className="final-actions">
                    <button className="secondary-button" onClick={() => goToStep(6)}>← Volver a las tarjetas</button>
                    <button className="primary-button" onClick={reset}>Empezar de nuevo ↻</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {step > 0 && step < 6 && (
        <footer className="bottom-nav">
          <button className="back-button" onClick={previous}>
            <span aria-hidden="true">←</span> Anterior
          </button>
          <span className="swipe-tip">Desliza para avanzar <span aria-hidden="true">↔</span></span>
          <div className="next-nav-actions">
            {(step === 3 || step === 4) && (
              <button
                className="language-reset-button"
                type="button"
                onClick={() => step === 3 ? setSelectedLanguages([]) : setSelectedResidence(null)}
                aria-label={step === 3 ? "Limpiar las lenguas seleccionadas" : "Limpiar el lugar seleccionado"}
                title={step === 3 ? "Limpiar las lenguas seleccionadas" : "Limpiar el lugar seleccionado"}
              >
                <span aria-hidden="true">↻</span>
              </button>
            )}
            <button className="primary-button" onClick={next}>
              Siguiente <span aria-hidden="true">→</span>
            </button>
          </div>
        </footer>
      )}

      {menuOpen && (
        <div className="menu-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-title">
          <div className={`menu-panel ${profilePanelOpen ? "profiles-panel" : ""}`}>
            <div className="menu-heading">
              <div>
                <span>{profilePanelOpen ? "CONFIGURACIÓN LOCAL · ON THIS DEVICE" : "IR A · JUMP TO"}</span>
                <h2 id="menu-title">{profilePanelOpen ? "Perfiles de profesor" : "Elige una sección"}</h2>
              </div>
              <button
                onClick={() => profilePanelOpen ? (setProfilePanelOpen(false), setProfileFormOpen(false)) : setMenuOpen(false)}
                aria-label={profilePanelOpen ? "Volver al menú" : "Cerrar menú"}
              >{profilePanelOpen ? "←" : "×"}</button>
            </div>
            {profilePanelOpen ? (
              <div className="profile-manager" data-no-swipe>
                <p className="profile-help">Guarda nombre, lenguas y residencia en esta tablet. Puedes cambiar de profesor con un toque.</p>
                {profileFormOpen ? (
                  <div className="profile-form">
                    <label className="profile-name-field">
                      <span>Nombre · Name</span>
                      <input
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        placeholder="Ej. Ana"
                        autoComplete="off"
                        maxLength={40}
                        autoFocus
                      />
                    </label>
                    <fieldset>
                      <legend>Lenguas (hasta 4) · Languages (up to 4)</legend>
                      <div className="profile-language-grid">
                        {languages.map((language) => (
                          <button
                            type="button"
                            key={language.id}
                            className={profileLanguages.includes(language.id) ? "selected" : ""}
                            onClick={() => toggleProfileLanguage(language.id)}
                            aria-pressed={profileLanguages.includes(language.id)}
                          >
                            <img src={language.flagImage} alt="" />
                            <span>{language.name}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <label className="profile-name-field">
                      <span>Vive en · Lives in</span>
                      <select value={profileResidence} onChange={(event) => setProfileResidence(event.target.value)}>
                        <option value="">Sin seleccionar</option>
                        {residences.map((place) => <option key={place.id} value={place.id}>{place.name}</option>)}
                      </select>
                    </label>
                    {profileError && <p className="profile-error" role="alert">{profileError}</p>}
                    <div className="profile-form-actions">
                      <button className="secondary-button" type="button" onClick={() => setProfileFormOpen(false)}>Cancelar</button>
                      <button className="primary-button" type="button" onClick={saveProfile}>Guardar y usar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="add-profile-button" type="button" onClick={() => openProfileForm()}>
                      <span aria-hidden="true">＋</span> Crear un perfil
                    </button>
                    <div className="profile-list">
                      {profiles.length === 0 && <p className="empty-profiles">Todavía no hay perfiles guardados.</p>}
                      {profiles.map((profile) => {
                        const profileResidenceName = residences.find((place) => place.id === profile.residenceId)?.name;
                        const profileLanguageNames = profile.languageIds
                          .map((id) => languages.find((language) => language.id === id)?.name)
                          .filter((name): name is string => Boolean(name));
                        return (
                          <article className={profile.id === activeProfileId ? "active" : ""} key={profile.id}>
                            <div className="profile-summary">
                              <span className="profile-avatar" aria-hidden="true">👋</span>
                              <div>
                                <strong>{profile.name}</strong>
                                <small>Hablo {joinSpanish(profileLanguageNames)} · Vivo en {profileResidenceName ?? "…"}</small>
                              </div>
                            </div>
                            <div className="profile-actions">
                              <button className="use-profile-button" type="button" onClick={() => applyProfile(profile)}>
                                {profile.id === activeProfileId ? "En uso ✓" : "Usar perfil"}
                              </button>
                              <button type="button" onClick={() => openProfileForm(profile)}>Editar</button>
                              <button className="delete-profile-button" type="button" onClick={() => deleteProfile(profile)}>Quitar</button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="menu-grid">
                  {stepLabels.map((label, index) => (
                    <button key={label} onClick={() => goToStep(index)} className={index === step ? "active" : ""}>
                      <span>0{index + 1}</span>
                      <strong>{label}</strong>
                    </button>
                  ))}
                  <button className="profile-menu-item" onClick={() => setProfilePanelOpen(true)}>
                    <span>👤</span>
                    <strong>{activeProfile ? `Perfil: ${activeProfile.name}` : "Crear perfil"}</strong>
                  </button>
                  <button className="final-menu-item" onClick={() => goToStep(7)}>
                    <span>🍭</span>
                    <strong>Final</strong>
                  </button>
                </div>
                <details className="credits">
                  <summary>Créditos de fotografías</summary>
                  <p>
                    Fotografías de {photoCredits.map((credit, index) => (
                      <span key={credit.file}>
                        <a href={credit.url} target="_blank" rel="noreferrer">{credit.author}</a>
                        {index < photoCredits.length - 1 ? ", " : "."}
                      </span>
                    ))}
                  </p>
                </details>
                <a className="catalog-link" href="catalogo.html">
                  Catálogo del profesor <span aria-hidden="true">↗</span>
                </a>
                <button className="reset-link" onClick={reset}>↻ Reiniciar toda la actividad</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LessonHeading({
  number,
  english,
  children,
}: {
  number: string;
  english: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lesson-heading">
      <span className="lesson-number">{number}</span>
      <div>
        <span className="english-kicker">{english}</span>
        <h2>{children}</h2>
      </div>
    </div>
  );
}
