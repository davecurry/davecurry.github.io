// The Deck — a face-down pile you click to draw from.
// Top card lifts off the stack, flips into the slot. Click the drawn card
// to send it back to the pile.
//
// Animation strategy: CSS transitions, NOT @keyframes. Base styles render
// the card in its final visible position; a "--from-pile" modifier holds
// the off-canvas starting state for one frame, then useEntered() removes it
// so the transition runs. setTimeout fallback inside useEntered guarantees
// the modifier always clears, so a missed rAF still leaves cards visible.

function DrawnCard({ text, idx, onClick }) {
  const entered = window.Oblique.useEntered();
  return (
    <div
      className={"deck-card " + (entered ? "" : "deck-card--from-pile")}
      onClick={onClick}
      role="button"
      aria-label="Return card to deck"
    >
      <div className="deck-card-face">
        <p className="deck-card-text">{text}</p>
        <span className="deck-card-no">№ {window.Oblique.pad(idx || 0)}</span>
      </div>
    </div>
  );
}

function ExitingCard({ text, idx, returning, onDone }) {
  const entered = window.Oblique.useEntered();
  React.useEffect(() => {
    const t = setTimeout(onDone, 520);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className={
        "deck-card deck-card--exit-host " +
        (entered ? (returning ? "deck-card--return-to-pile" : "deck-card--slide-away") : "")
      }
    >
      <div className="deck-card-face">
        <p className="deck-card-text">{text}</p>
        <span className="deck-card-no">№ {window.Oblique.pad(idx || 0)}</span>
      </div>
    </div>
  );
}

function DeckPrototype() {
  const deckRef = React.useRef(window.Oblique.makeDeck());
  const [drawn, setDrawn] = React.useState(null); // {text, idx, key}
  const [drawCount, setDrawCount] = React.useState(0);
  const [exiting, setExiting] = React.useState(null);
  const tick = React.useRef(0);

  const PILE_DEPTH = 9;
  const pileVisible = Math.max(2, PILE_DEPTH - (drawCount % PILE_DEPTH));

  function handleDraw() {
    const t = deckRef.current.draw();
    const idx = window.Oblique.indexOf(t);
    if (drawn) {
      tick.current += 1;
      setExiting({ ...drawn, exitKey: "x" + tick.current });
    }
    tick.current += 1;
    setDrawn({ text: t, idx, key: tick.current });
    setDrawCount((c) => c + 1);
  }

  function handleReturn() {
    if (!drawn) return;
    tick.current += 1;
    setExiting({ ...drawn, exitKey: "r" + tick.current, returning: true });
    setDrawn(null);
  }

  return (
    <div className="deck-root">
      <style>{deckCSS}</style>

      <div className="deck-eyebrow">
        <span>The Deck</span>
        <span className="deck-counter">{window.Oblique.pad(drawCount)} drawn</span>
      </div>

      <div className="deck-stage">
        <div
          className="deck-pile"
          onClick={handleDraw}
          role="button"
          aria-label="Draw a strategy"
        >
          {Array.from({ length: pileVisible }).map((_, i) => {
            const isTop = i === pileVisible - 1;
            return (
              <div
                key={i}
                className={"deck-back " + (isTop ? "deck-back--top" : "")}
                style={{
                  transform: `translate(${i * 0.6}px, ${-i * 0.9}px) rotate(${(i % 2 ? 1 : -1) * 0.25}deg)`,
                  zIndex: i,
                }}
              >
                <div className="deck-back-inner">
                  <span className="deck-back-mark">·</span>
                </div>
              </div>
            );
          })}
          <div className="deck-pile-hint">Click to draw</div>
        </div>

        <div className="deck-slot">
          {exiting && (
            <ExitingCard
              key={exiting.exitKey}
              text={exiting.text}
              idx={exiting.idx}
              returning={exiting.returning}
              onDone={() => setExiting((e) => (e && e.exitKey === exiting.exitKey ? null : e))}
            />
          )}
          {drawn && (
            <DrawnCard
              key={drawn.key}
              text={drawn.text}
              idx={drawn.idx}
              onClick={handleReturn}
            />
          )}
          {!drawn && !exiting && (
            <div className="deck-slot-hint">
              <span className="deck-slot-line"></span>
              <span>your card lands here</span>
            </div>
          )}
        </div>
      </div>

      <div className="deck-foot">
        <span>{window.Oblique.attribution}</span>
        {drawn && (
          <button className="deck-redraw" onClick={handleDraw}>
            ↻ Draw another
          </button>
        )}
      </div>
    </div>
  );
}

const deckCSS = `
.deck-root {
  position: absolute; inset: 0;
  background: #f4f1ea;
  background-image: radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1px);
  background-size: 4px 4px;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  color: #1a1612;
  padding: 28px 40px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.deck-eyebrow {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(26,22,18,0.55);
}
.deck-counter { font-variant-numeric: tabular-nums; }

.deck-stage {
  flex: 1; display: flex; align-items: center; justify-content: space-around;
  gap: 40px; padding: 24px 0;
}
.deck-pile {
  position: relative; width: 260px; height: 180px;
  cursor: pointer;
  perspective: 1200px;
}
.deck-back {
  position: absolute; inset: 0;
  border-radius: 8px;
  background: #fafaf6;
  box-shadow:
    0 1px 0 rgba(0,0,0,0.06) inset,
    0 0.5px 0 rgba(255,255,255,0.9) inset,
    0 1px 2px rgba(0,0,0,0.04);
  transition: transform 0.18s cubic-bezier(.2,.7,.3,1);
}
.deck-pile:hover .deck-back--top {
  transform: translate(0, -6px) rotate(-0.4deg) !important;
  box-shadow:
    0 8px 22px rgba(0,0,0,0.10),
    0 1px 0 rgba(0,0,0,0.06) inset;
}
.deck-back-inner {
  position: absolute; inset: 14px;
  border: 0.5px solid rgba(0,0,0,0.08);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
}
.deck-back-mark {
  color: rgba(0,0,0,0.2);
  font-size: 32px; line-height: 1;
}
.deck-pile-hint {
  position: absolute; bottom: -28px; left: 0; right: 0;
  text-align: center;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(26,22,18,0.4);
  pointer-events: none;
}

.deck-slot {
  position: relative;
  width: 320px; height: 220px;
  display: flex; align-items: center; justify-content: center;
  perspective: 1400px;
}
.deck-slot-hint {
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(26,22,18,0.3);
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.deck-slot-line {
  width: 60px; height: 1px; background: rgba(26,22,18,0.2);
}

/* Base = visible/final state. Modifier classes set transient states; the
   "--from-pile" modifier disables transition so the start is snapped, not
   tweened. */
.deck-card {
  position: absolute; inset: 0;
  border-radius: 8px;
  background: #fdfcf8;
  box-shadow:
    0 1px 0 rgba(0,0,0,0.05) inset,
    0 12px 28px rgba(0,0,0,0.10),
    0 4px 10px rgba(0,0,0,0.04);
  cursor: pointer;
  transform-style: preserve-3d;
  opacity: 1;
  transform: translate(0, 0) rotateY(0deg) rotate(0deg);
  transition: opacity 0.55s cubic-bezier(.2,.7,.3,1),
              transform 0.55s cubic-bezier(.2,.7,.3,1);
}
.deck-card--from-pile {
  opacity: 0;
  transform: translate(-180px, -90px) rotateY(180deg) rotate(-8deg);
  transition: none;
}
.deck-card--exit-host {
  cursor: default;
  pointer-events: none;
}
.deck-card--slide-away {
  opacity: 0;
  transform: translate(60px, 8px) rotate(2deg);
}
.deck-card--return-to-pile {
  opacity: 0;
  transform: translate(-200px, -30px) rotateY(90deg) rotate(-6deg);
}

.deck-card-face {
  position: absolute; inset: 0;
  padding: 28px 32px;
  display: flex; flex-direction: column; justify-content: center;
}
.deck-card-text {
  margin: 0;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  font-weight: 400;
  font-size: 22px; line-height: 1.3;
  color: #1a1612;
  text-wrap: balance;
}
.deck-card-no {
  position: absolute; bottom: 14px; right: 18px;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.1em;
  color: rgba(26,22,18,0.35);
}

.deck-foot {
  display: flex; justify-content: space-between; align-items: center;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.08em;
  color: rgba(26,22,18,0.45);
}
.deck-redraw {
  border: 0.5px solid rgba(26,22,18,0.25);
  background: transparent;
  font: inherit; color: inherit;
  padding: 6px 12px; border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}
.deck-redraw:hover {
  background: #1a1612; color: #f4f1ea; border-color: #1a1612;
}
`;

window.DeckPrototype = DeckPrototype;
