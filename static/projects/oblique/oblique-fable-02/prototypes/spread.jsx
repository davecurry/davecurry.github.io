// The Spread — three cards drawn at once, each in a positional role.
// Click any individual card to re-draw just that one. "New spread" reshuffles all.
// Each card has a subtle reveal animation when (re)drawn.

const SPREAD_ROLES = [
  { key: "begin",   label: "Begin",   sub: "where to enter" },
  { key: "disrupt", label: "Disrupt", sub: "what to break" },
  { key: "resolve", label: "Resolve", sub: "how to leave it" },
];

function SpreadCard({ cardKey, text, idx, role, onClick }) {
  const entered = window.Oblique.useEntered();
  return (
    <div
      className={"spread-card " + (entered ? "" : "spread-card--start")}
      onClick={onClick}
      role="button"
      aria-label={"Re-draw " + role}
    >
      <div className="spread-card-corner spread-card-corner--tl"></div>
      <div className="spread-card-corner spread-card-corner--br"></div>
      <p className="spread-card-text">{text}</p>
      <span className="spread-card-no">№ {window.Oblique.pad(idx || 0)}</span>
    </div>
  );
}

function SpreadPrototype() {
  const deckRef = React.useRef(window.Oblique.makeDeck());
  const [cards, setCards] = React.useState(() =>
    SPREAD_ROLES.map(() => {
      const t = deckRef.current.draw();
      return { text: t, idx: window.Oblique.indexOf(t), key: Math.random() };
    })
  );
  const [spreadCount, setSpreadCount] = React.useState(1);

  function redrawAt(i) {
    setCards((cs) => {
      const next = cs.slice();
      const t = deckRef.current.draw();
      next[i] = { text: t, idx: window.Oblique.indexOf(t), key: Math.random() };
      return next;
    });
  }

  function newSpread() {
    setCards(SPREAD_ROLES.map(() => {
      const t = deckRef.current.draw();
      return { text: t, idx: window.Oblique.indexOf(t), key: Math.random() };
    }));
    setSpreadCount((s) => s + 1);
  }

  return (
    <div className="spread-root">
      <style>{spreadCSS}</style>

      <div className="spread-eyebrow">
        <span>The Spread</span>
        <span className="spread-count">Spread № {window.Oblique.pad(spreadCount)}</span>
      </div>

      <div className="spread-cards">
        {SPREAD_ROLES.map((role, i) => (
          <div className="spread-col" key={role.key}>
            <div className="spread-role">
              <span className="spread-role-no">{i + 1}</span>
              <div>
                <div className="spread-role-label">{role.label}</div>
                <div className="spread-role-sub">{role.sub}</div>
              </div>
            </div>

            <SpreadCard
              key={cards[i].key}
              cardKey={cards[i].key}
              text={cards[i].text}
              idx={cards[i].idx}
              role={role.label}
              onClick={() => redrawAt(i)}
            />

            <div className="spread-card-hint">click to re-draw</div>
          </div>
        ))}
      </div>

      <div className="spread-foot">
        <span className="spread-attr">{window.Oblique.attribution}</span>
        <button className="spread-new" onClick={newSpread}>
          ↻ &nbsp;New spread
        </button>
      </div>
    </div>
  );
}

const spreadCSS = `
.spread-root {
  position: absolute; inset: 0;
  background: #f6f3ec;
  color: #1a1612;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  padding: 28px 40px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.spread-eyebrow {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(26,22,18,0.55);
}
.spread-count { font-variant-numeric: tabular-nums; }

.spread-cards {
  flex: 1;
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  padding: 32px 0 24px;
  align-items: stretch;
}
.spread-col {
  display: flex; flex-direction: column;
  gap: 14px;
}
.spread-role {
  display: flex; gap: 14px; align-items: center;
}
.spread-role-no {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 0.5px solid rgba(26,22,18,0.35);
  display: flex; align-items: center; justify-content: center;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px;
  color: rgba(26,22,18,0.6);
}
.spread-role-label {
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  font-size: 18px;
  font-style: italic;
  color: #1a1612;
}
.spread-role-sub {
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(26,22,18,0.4);
  margin-top: 2px;
}

.spread-card {
  flex: 1;
  position: relative;
  background: #fdfcf8;
  border-radius: 6px;
  padding: 22px 22px 32px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  box-shadow:
    0 1px 0 rgba(0,0,0,0.05) inset,
    0 8px 22px rgba(0,0,0,0.06),
    0 2px 6px rgba(0,0,0,0.03);
  /* Base = visible/final state. Transitions handle the reveal. */
  opacity: 1;
  transform: translateY(0) rotateX(0);
  transition: opacity 0.5s cubic-bezier(.2,.7,.3,1),
              transform 0.5s cubic-bezier(.2,.7,.3,1),
              box-shadow 0.2s;
}
.spread-card--start {
  opacity: 0;
  transform: translateY(14px) rotateX(-12deg);
  transition: none;
}
.spread-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 1px 0 rgba(0,0,0,0.05) inset,
    0 14px 32px rgba(0,0,0,0.10),
    0 4px 10px rgba(0,0,0,0.04);
}
.spread-card-text {
  margin: 0;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  font-size: 18px; line-height: 1.32;
  text-align: center;
  text-wrap: balance;
  color: #1a1612;
}
.spread-card-no {
  position: absolute; bottom: 12px; right: 14px;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 9px; letter-spacing: 0.1em;
  color: rgba(26,22,18,0.35);
}
.spread-card-corner {
  position: absolute; width: 12px; height: 12px;
  border-color: rgba(26,22,18,0.18);
  border-style: solid; border-width: 0;
}
.spread-card-corner--tl { top: 10px; left: 10px;     border-top-width: 0.5px; border-left-width: 0.5px; }
.spread-card-corner--br { bottom: 10px; right: 10px; border-bottom-width: 0.5px; border-right-width: 0.5px; }
.spread-card-hint {
  text-align: center;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(26,22,18,0.3);
}

.spread-foot {
  display: flex; justify-content: space-between; align-items: center;
}
.spread-attr {
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.08em;
  color: rgba(26,22,18,0.45);
}
.spread-new {
  border: 0.5px solid #1a1612;
  background: transparent;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
  color: #1a1612;
  padding: 8px 14px; border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}
.spread-new:hover {
  background: #1a1612; color: #f6f3ec;
}
`;

window.SpreadPrototype = SpreadPrototype;
