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
  languages,
  photoCredits,
  residences,
  type CategoryId,
  type ConversationCard,
} from "./data/content";

const PROGRAMME_URL = "https://spanish.hku.hk/";

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
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedResidence, setSelectedResidence] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [deck, setDeck] = useState<DeckState>(() => makeDeck(conversationCards));
  const [reaction, setReaction] = useState<ReactionId | null>(null);
  const [cardMotion, setCardMotion] = useState(0);
  const [deckNotice, setDeckNotice] = useState("");
  const touchStart = useRef<{ x: number; y: number; blocked: boolean } | null>(null);

  const currentCard =
    conversationCards.find((card) => card.id === deck.currentId) ?? conversationCards[0];

  const country = countries.find((item) => item.id === selectedCountry);
  const residence = residences.find((item) => item.id === selectedResidence);
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
    setStep(Math.max(0, Math.min(7, target)));
    setMenuOpen(false);
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

  const reset = () => {
    setSelectedCountry(null);
    setSelectedLanguages([]);
    setSelectedResidence(null);
    setCategory("all");
    setDeck(makeDeck(conversationCards));
    setReaction(null);
    goToStep(0);
  };

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

        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
          <span />
          <span />
          <span />
        </button>
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
                <div className="teacher-avatar" aria-hidden="true">P</div>
                <span className="role-label">PROFESOR · TEACHER</span>
                <p>Me llamo Pablo.</p>
                <strong>Y tú, ¿cómo te llamas?</strong>
              </div>
              <div className="student-answer coral-card">
                <span className="role-label">TU TURNO · YOUR TURN</span>
                <p>Me llamo</p>
                <div className="answer-line">……………………</div>
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
              <span className="sentence-flag" aria-hidden="true">{country?.flag ?? "🌏"}</span>
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
                  <span className="flag" aria-hidden="true">{item.flag}</span>
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
              <p>«Hablo español, inglés y un poco de chino.»</p>
            </div>
            <div className="live-sentence language-sentence">
              <span className="sentence-flag" aria-hidden="true">💬</span>
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
                  <span aria-hidden="true">{language.hello}</span>
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
                  <span className="item-sticker" aria-hidden="true">{currentCard.sticker}</span>
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
          <section className="finale-screen">
            <div className="confetti" aria-hidden="true">
              {Array.from({ length: 20 }, (_, index) => <i key={index} />)}
            </div>
            <div className="finale-photo">
              <img src="photos/lollipops.jpg" alt="Chupachups de muchos colores" />
              <span className="final-sticker">¡SORPRESA!</span>
            </div>
            <div className="finale-copy">
              <span className="eyebrow"><span>ÚLTIMA TARJETA</span> · LAST CARD</span>
              <h2>¿Te gustan los <em>chupachups</em>?</h2>
              <div className="final-answer"><span aria-hidden="true">👍👍</span> Sí, me gustan mucho.</div>
              <div className="qr-panel">
                <a href={PROGRAMME_URL} target="_blank" rel="noreferrer" aria-label="Abrir Spanish Programme de HKU">
                  <QRCodeSVG
                    value={PROGRAMME_URL}
                    size={164}
                    level="H"
                    bgColor="#fffaf1"
                    fgColor="#5f0034"
                    title="QR del Spanish Programme de HKU"
                  />
                </a>
                <div>
                  <span>DESCUBRE MÁS</span>
                  <strong>Español en HKU</strong>
                  <small>Scan to visit our programme</small>
                </div>
              </div>
              <div className="final-actions">
                <button className="secondary-button" onClick={() => goToStep(6)}>← Volver a las tarjetas</button>
                <button className="primary-button" onClick={reset}>Empezar de nuevo ↻</button>
              </div>
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
          <button className="primary-button" onClick={next}>
            Siguiente <span aria-hidden="true">→</span>
          </button>
        </footer>
      )}

      {menuOpen && (
        <div className="menu-overlay" role="dialog" aria-modal="true" aria-labelledby="menu-title">
          <div className="menu-panel">
            <div className="menu-heading">
              <div>
                <span>IR A · JUMP TO</span>
                <h2 id="menu-title">Elige una sección</h2>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">×</button>
            </div>
            <div className="menu-grid">
              {stepLabels.map((label, index) => (
                <button key={label} onClick={() => goToStep(index)} className={index === step ? "active" : ""}>
                  <span>0{index + 1}</span>
                  <strong>{label}</strong>
                </button>
              ))}
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
                ))} Unsplash License.
              </p>
            </details>
            <button className="reset-link" onClick={reset}>↻ Reiniciar toda la actividad</button>
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
