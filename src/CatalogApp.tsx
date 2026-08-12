"use client";

/* eslint-disable @next/next/no-img-element -- static catalogue uses local optimized assets */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  categories,
  contentChanges,
  conversationCards,
  countries,
  finalCardAsset,
  flagCredit,
  languages,
  type CategoryId,
} from "./data/content";

const STORAGE_KEY = "speedDatingReviewV1";
const PROGRAMME_URL = "https://spanish.hku.hk/";

type SectionId = "cards" | "countries" | "languages" | "final";
type Decision = "approved" | "change" | "remove";
type ReviewEntry = { decision?: Decision; note: string };
type ReviewState = Record<string, ReviewEntry>;
type StatusFilter = "all" | "pending" | Decision;

const sectionLabels: Array<{ id: SectionId; label: string; count: number }> = [
  { id: "cards", label: "Tarjetas", count: conversationCards.length },
  { id: "countries", label: "Procedencia", count: countries.length },
  { id: "languages", label: "Lenguas", count: languages.length },
  { id: "final", label: "Final", count: 1 },
];

const decisionLabels: Record<Decision, string> = {
  approved: "Aprobar",
  change: "Cambiar",
  remove: "Quitar",
};

const decisionIcons: Record<Decision, string> = {
  approved: "✓",
  change: "✎",
  remove: "×",
};

const reviewKey = (kind: SectionId, id: string) => `${kind}:${id}`;

const statusOf = (entry?: ReviewEntry): Exclude<StatusFilter, "all"> =>
  entry?.decision ?? "pending";

export default function CatalogApp() {
  const [section, setSection] = useState<SectionId>("cards");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CategoryId>("all");
  const [reviews, setReviews] = useState<ReviewState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as ReviewState) : {};
    } catch {
      return {};
    }
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const filteredCards = useMemo(
    () =>
      conversationCards.filter((card) => {
        const categoryMatches = categoryFilter === "all" || card.category === categoryFilter;
        const statusMatches =
          statusFilter === "all" || statusOf(reviews[reviewKey("cards", card.id)]) === statusFilter;
        return categoryMatches && statusMatches;
      }),
    [categoryFilter, reviews, statusFilter],
  );

  const sectionItems = useMemo(() => {
    if (section === "countries") return countries.map((item) => item.id);
    if (section === "languages") return languages.map((item) => item.id);
    if (section === "final") return [finalCardAsset.id];
    return conversationCards.map((item) => item.id);
  }, [section]);

  const sectionCounts = useMemo(() => {
    const counts = { pending: 0, approved: 0, change: 0, remove: 0 };
    for (const id of sectionItems) {
      counts[statusOf(reviews[reviewKey(section, id)])] += 1;
    }
    return counts;
  }, [reviews, section, sectionItems]);

  const updateDecision = (key: string, decision: Decision) => {
    setReviews((current) => {
      const previous = current[key] ?? { note: "" };
      return {
        ...current,
        [key]: {
          ...previous,
          decision: previous.decision === decision ? undefined : decision,
        },
      };
    });
  };

  const updateNote = (key: string, note: string) => {
    setReviews((current) => ({
      ...current,
      [key]: { ...(current[key] ?? {}), note },
    }));
  };

  const matchesStatus = (kind: SectionId, id: string) =>
    statusFilter === "all" || statusOf(reviews[reviewKey(kind, id)]) === statusFilter;

  const copySummary = async () => {
    const lines = [
      "REVISIÓN · SPEED DATING EN ESPAÑOL",
      `Tarjetas: ${conversationCards.length} · Procedencias: ${countries.length} · Lenguas: ${languages.length}`,
      "",
    ];

    const namedItems: Array<{ key: string; label: string }> = [
      ...conversationCards.map((item) => ({ key: reviewKey("cards", item.id), label: `Tarjeta · ${item.label}` })),
      ...countries.map((item) => ({ key: reviewKey("countries", item.id), label: `Procedencia · ${item.name}` })),
      ...languages.map((item) => ({ key: reviewKey("languages", item.id), label: `Lengua · ${item.name}` })),
      { key: reviewKey("final", finalCardAsset.id), label: "Final · Chupa Chups" },
    ];

    const reviewed = namedItems.filter(({ key }) => reviews[key]?.decision || reviews[key]?.note?.trim());
    if (reviewed.length === 0) lines.push("Todavía no hay decisiones ni notas.");
    for (const item of reviewed) {
      const entry = reviews[item.key];
      const status = entry?.decision ? decisionLabels[entry.decision] : "Pendiente";
      lines.push(`${status.toUpperCase()} · ${item.label}${entry?.note?.trim() ? ` — ${entry.note.trim()}` : ""}`);
    }

    const summary = lines.join("\n");
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = summary;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setNotice("Resumen copiado.");
    window.setTimeout(() => setNotice(""), 2200);
  };

  const resetReviews = () => {
    if (!window.confirm("¿Borrar todas las decisiones y notas guardadas en este navegador?")) return;
    setReviews({});
    setNotice("Revisión reiniciada.");
  };

  return (
    <main className="catalog-shell">
      <header className="catalog-hero">
        <div>
          <span className="catalog-eyebrow">HERRAMIENTA DEL PROFESOR · TEACHER TOOL</span>
          <h1>Catálogo visual</h1>
          <p>Revisa cada frase, emoji, bandera y fotografía sin recorrer la actividad.</p>
        </div>
        <a className="catalog-home-link" href="index.html">← Volver a la actividad</a>
      </header>

      <section className="change-summary" aria-labelledby="changes-title">
        <div>
          <span>CAMBIOS YA APLICADOS</span>
          <h2 id="changes-title">Tu primera revisión</h2>
        </div>
        <ul>
          {contentChanges.map((change) => (
            <li key={change.id}>
              <strong>{change.action === "quitada" ? "Quitada" : "Cambiada"}</strong>
              <span>{change.before}{change.after ? ` → ${change.after}` : ""}</span>
            </li>
          ))}
        </ul>
      </section>

      <nav className="catalog-tabs" aria-label="Secciones del catálogo">
        {sectionLabels.map((item) => (
          <button
            key={item.id}
            className={section === item.id ? "active" : ""}
            onClick={() => {
              setSection(item.id);
              setStatusFilter("all");
            }}
            aria-current={section === item.id ? "page" : undefined}
          >
            {item.label} <span>{item.count}</span>
          </button>
        ))}
      </nav>

      <section className="catalog-toolbar" aria-label="Filtros y acciones de revisión">
        <div className="status-filters">
          {([
            ["all", "Todo", sectionItems.length],
            ["pending", "Pendiente", sectionCounts.pending],
            ["approved", "Aprobado", sectionCounts.approved],
            ["change", "Cambiar", sectionCounts.change],
            ["remove", "Quitar", sectionCounts.remove],
          ] as const).map(([id, label, count]) => (
            <button
              key={id}
              className={statusFilter === id ? "active" : ""}
              onClick={() => setStatusFilter(id)}
              aria-pressed={statusFilter === id}
            >
              {label} <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="catalog-actions">
          <button onClick={copySummary}>Copiar resumen</button>
          <button className="danger" onClick={resetReviews}>Reiniciar revisión</button>
        </div>
      </section>

      {section === "cards" && (
        <section aria-labelledby="cards-title">
          <div className="catalog-section-heading">
            <div>
              <span>TARJETARIO</span>
              <h2 id="cards-title">Tarjetas activas ({conversationCards.length})</h2>
            </div>
            <label>
              Categoría
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as "all" | CategoryId)}>
                <option value="all">Todas</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
              </select>
            </label>
          </div>
          <div className="catalog-table-wrap">
            <table className="catalog-table card-table">
              <thead>
                <tr>
                  <th>#</th><th>Imagen</th><th>Emoji</th><th>Contenido</th><th>Gramática</th><th>Fuente</th><th>Revisión</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => {
                  const category = categories.find((item) => item.id === card.category)!;
                  const key = reviewKey("cards", card.id);
                  return (
                    <tr key={card.id} data-status={statusOf(reviews[key])}>
                      <td data-label="#"><strong>{conversationCards.indexOf(card) + 1}</strong></td>
                      <td data-label="Imagen"><img className="catalog-photo" src={card.image} alt={card.alt} /></td>
                      <td data-label="Emoji"><span className="catalog-emoji" aria-label={`Emoji: ${card.sticker}`}>{card.sticker}</span></td>
                      <td data-label="Contenido">
                        <span className="category-chip" style={{ background: category.color }}>{category.emoji} {category.label}</span>
                        <strong className="catalog-primary">{card.label}</strong>
                        <small>{card.english}</small>
                      </td>
                      <td data-label="Gramática">
                        <strong>{card.number === "plural" ? "gustan" : "gusta"}</strong>
                        <small>{card.number}</small>
                      </td>
                      <td data-label="Fuente">
                        <span className={`image-kind ${card.imageKind}`}>{card.imageKind === "specific" ? "Foto propia" : "Foto de categoría"}</span>
                        <a href={card.photoSource} target="_blank" rel="noreferrer">{card.photoCredit} ↗</a>
                      </td>
                      <td data-label="Revisión"><ReviewControls itemKey={key} entry={reviews[key]} onDecision={updateDecision} onNote={updateNote} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredCards.length === 0 && <p className="empty-state">No hay tarjetas con estos filtros.</p>}
        </section>
      )}

      {section === "countries" && (
        <SimpleTable title={`Procedencia (${countries.length})`} columns={["Bandera", "Español", "English", "Revisión"]}>
          {countries.filter((item) => matchesStatus("countries", item.id)).map((country) => {
            const key = reviewKey("countries", country.id);
            return (
              <tr key={country.id} data-status={statusOf(reviews[key])}>
                <td data-label="Bandera"><img className="catalog-flag" src={country.flagImage} alt={`Bandera de ${country.name}`} /></td>
                <td data-label="Español"><strong className="catalog-primary">{country.name}</strong></td>
                <td data-label="English">{country.english}</td>
                <td data-label="Revisión"><ReviewControls itemKey={key} entry={reviews[key]} onDecision={updateDecision} onNote={updateNote} /></td>
              </tr>
            );
          })}
        </SimpleTable>
      )}

      {section === "languages" && (
        <SimpleTable title={`Lenguas (${languages.length})`} columns={["Bandera", "Español", "English", "Representación", "Revisión"]}>
          {languages.filter((item) => matchesStatus("languages", item.id)).map((language) => {
            const key = reviewKey("languages", language.id);
            return (
              <tr key={language.id} data-status={statusOf(reviews[key])}>
                <td data-label="Bandera"><img className="catalog-flag" src={language.flagImage} alt={`Bandera representativa: ${language.flagCountry}`} /></td>
                <td data-label="Español"><strong className="catalog-primary">{language.name}</strong></td>
                <td data-label="English">{language.english}</td>
                <td data-label="Representación">{language.flagCountry}</td>
                <td data-label="Revisión"><ReviewControls itemKey={key} entry={reviews[key]} onDecision={updateDecision} onNote={updateNote} /></td>
              </tr>
            );
          })}
        </SimpleTable>
      )}

      {section === "final" && matchesStatus("final", finalCardAsset.id) && (
        <section className="catalog-final" aria-labelledby="final-title">
          <div className="catalog-section-heading">
            <div><span>TARJETA FINAL</span><h2 id="final-title">Antes y después de responder</h2></div>
          </div>
          <div className="final-preview-grid">
            <article className="final-preview before">
              <span className="preview-label">ANTES DE PULSAR</span>
              <img src={finalCardAsset.image} alt={finalCardAsset.alt} />
              <h3>¿Te gustan los Chupa Chups?</h3>
              <button type="button">👍👍 Sí, me gustan mucho.</button>
            </article>
            <article className="final-preview after">
              <span className="preview-label">DESPUÉS DE PULSAR</span>
              <div className="preview-confetti" aria-hidden="true">◆ ● ■ ◆ ●</div>
              <div className="preview-qr">
                <QRCodeSVG value={PROGRAMME_URL} size={132} level="H" title="QR de Español en HKU" />
                <div><strong>Descubre Español en HKU</strong><small>Confeti, QR y botones finales</small></div>
              </div>
              <div className="preview-buttons"><span>Volver a las tarjetas</span><span>Empezar de nuevo</span></div>
            </article>
          </div>
          <div className="final-review-panel">
            <div>
              <strong>Recurso de marca</strong>
              <a href={finalCardAsset.photoSource} target="_blank" rel="noreferrer">{finalCardAsset.photoCredit} ↗</a>
            </div>
            <ReviewControls
              itemKey={reviewKey("final", finalCardAsset.id)}
              entry={reviews[reviewKey("final", finalCardAsset.id)]}
              onDecision={updateDecision}
              onNote={updateNote}
            />
          </div>
        </section>
      )}

      <footer className="catalog-footer">
        <span>Banderas: <a href={flagCredit.url} target="_blank" rel="noreferrer">{flagCredit.author}</a> · licencia {flagCredit.license}</span>
        <span>Las decisiones se guardan solo en este navegador.</span>
      </footer>
      {notice && <div className="catalog-toast" role="status">{notice}</div>}
    </main>
  );
}

function ReviewControls({
  itemKey,
  entry,
  onDecision,
  onNote,
}: {
  itemKey: string;
  entry?: ReviewEntry;
  onDecision: (key: string, decision: Decision) => void;
  onNote: (key: string, note: string) => void;
}) {
  return (
    <div className="review-controls">
      <div className="decision-buttons" aria-label="Decisión de revisión">
        {(Object.keys(decisionLabels) as Decision[]).map((decision) => (
          <button
            key={decision}
            className={`${decision} ${entry?.decision === decision ? "active" : ""}`}
            onClick={() => onDecision(itemKey, decision)}
            aria-pressed={entry?.decision === decision}
            title={decisionLabels[decision]}
          >
            <span aria-hidden="true">{decisionIcons[decision]}</span>{decisionLabels[decision]}
          </button>
        ))}
      </div>
      <label className="note-field">
        <span>Nota</span>
        <textarea
          value={entry?.note ?? ""}
          onChange={(event) => onNote(itemKey, event.target.value)}
          placeholder="Qué cambiar…"
          rows={2}
        />
      </label>
    </div>
  );
}

function SimpleTable({ title, columns, children }: { title: string; columns: string[]; children: ReactNode }) {
  return (
    <section aria-labelledby="simple-table-title">
      <div className="catalog-section-heading"><div><span>LISTA VISUAL</span><h2 id="simple-table-title">{title}</h2></div></div>
      <div className="catalog-table-wrap">
        <table className="catalog-table simple-table">
          <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  );
}
