// The Journal — sit with a creative block, draw a card, write a reflection,
// log it. Past entries persist in localStorage so the journal grows over time.
// The strategy is positioned as a response, not a one-shot.

function JournalPrototype() {
  const deckRef = React.useRef(window.Oblique.makeDeck());
  const storeRef = React.useRef(window.Oblique.store("journal"));

  const [problem, setProblem] = React.useState("");
  const [strategy, setStrategy] = React.useState(null); // {text, idx}
  const [reflection, setReflection] = React.useState("");
  const [entries, setEntries] = React.useState(() => storeRef.current.get([]));
  const [focused, setFocused] = React.useState(null); // entry id

  function drawStrategy() {
    const t = deckRef.current.draw();
    setStrategy({ text: t, idx: window.Oblique.indexOf(t) });
  }

  function commit() {
    if (!strategy) return;
    const entry = {
      id: Date.now(),
      at: new Date().toISOString(),
      problem: problem.trim(),
      strategy: strategy.text,
      strategyIdx: strategy.idx,
      reflection: reflection.trim(),
    };
    const nextEntries = [entry, ...entries].slice(0, 50);
    setEntries(nextEntries);
    storeRef.current.set(nextEntries);
    // reset working area
    setProblem("");
    setStrategy(null);
    setReflection("");
  }

  function clearAll() {
    if (!confirm("Clear all journal entries?")) return;
    setEntries([]);
    storeRef.current.set([]);
  }

  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
         + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  const canCommit = strategy && (problem.trim() || reflection.trim());

  return (
    <div className="journal-root">
      <style>{journalCSS}</style>

      <header className="journal-head">
        <div>
          <div className="journal-title">The Journal</div>
          <div className="journal-sub">A practice. Sit with what's stuck, then draw.</div>
        </div>
        <div className="journal-meta">
          <span>{window.Oblique.pad(entries.length)} entries</span>
          {entries.length > 0 && (
            <button className="journal-clear" onClick={clearAll}>clear</button>
          )}
        </div>
      </header>

      <div className="journal-body">
        {/* Working area */}
        <section className="journal-work">
          <div className="journal-step">
            <div className="journal-step-label">
              <span className="journal-step-no">01</span>
              <span>What's stuck?</span>
            </div>
            <textarea
              className="journal-input"
              placeholder="Describe what you're working on — a sentence is enough."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
            />
          </div>

          <div className="journal-step">
            <div className="journal-step-label">
              <span className="journal-step-no">02</span>
              <span>The strategy</span>
            </div>
            {strategy ? (
              <div className="journal-strategy">
                <p className="journal-strategy-text">{strategy.text}</p>
                <div className="journal-strategy-row">
                  <span className="journal-strategy-no">№ {window.Oblique.pad(strategy.idx || 0)}</span>
                  <button className="journal-redraw" onClick={drawStrategy}>↻ draw again</button>
                </div>
              </div>
            ) : (
              <button className="journal-draw" onClick={drawStrategy}>
                <span className="journal-draw-icon">▢</span>
                <span>Draw a strategy</span>
              </button>
            )}
          </div>

          <div className="journal-step">
            <div className="journal-step-label">
              <span className="journal-step-no">03</span>
              <span>Reflect</span>
            </div>
            <textarea
              className="journal-input"
              placeholder="How does this strategy land? What does it unlock?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              disabled={!strategy}
            />
          </div>

          <div className="journal-actions">
            <button
              className="journal-save"
              onClick={commit}
              disabled={!canCommit}
            >
              Log entry →
            </button>
          </div>
        </section>

        {/* Ledger */}
        <aside className="journal-ledger">
          <div className="journal-ledger-head">Ledger</div>
          {entries.length === 0 ? (
            <div className="journal-empty">
              <span className="journal-empty-rule"></span>
              <p>Your past sessions will land here.</p>
            </div>
          ) : (
            <ul className="journal-entries">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className={"journal-entry " + (focused === e.id ? "journal-entry--open" : "")}
                  onClick={() => setFocused(focused === e.id ? null : e.id)}
                >
                  <div className="journal-entry-top">
                    <span className="journal-entry-date">{fmtDate(e.at)}</span>
                    <span className="journal-entry-no">№ {window.Oblique.pad(e.strategyIdx || 0)}</span>
                  </div>
                  <div className="journal-entry-strategy">{e.strategy}</div>
                  {focused === e.id && (
                    <div className="journal-entry-detail">
                      {e.problem && (
                        <div>
                          <div className="journal-entry-tag">stuck on</div>
                          <div className="journal-entry-body">{e.problem}</div>
                        </div>
                      )}
                      {e.reflection && (
                        <div>
                          <div className="journal-entry-tag">reflection</div>
                          <div className="journal-entry-body">{e.reflection}</div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

const journalCSS = `
.journal-root {
  position: absolute; inset: 0;
  background: #f4f1ea;
  color: #1a1612;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  padding: 24px 32px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.journal-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding-bottom: 16px;
  border-bottom: 0.5px solid rgba(26,22,18,0.15);
}
.journal-title {
  font-size: 22px;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
}
.journal-sub {
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(26,22,18,0.4);
  margin-top: 4px;
}
.journal-meta {
  display: flex; gap: 12px; align-items: center;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(26,22,18,0.45);
}
.journal-clear {
  border: none; background: transparent;
  font: inherit; color: rgba(26,22,18,0.45);
  cursor: pointer; padding: 4px 8px; border-radius: 3px;
  text-decoration: underline; text-underline-offset: 3px;
}
.journal-clear:hover { color: #1a1612; }

.journal-body {
  flex: 1;
  display: grid; grid-template-columns: 1fr 280px;
  gap: 32px;
  padding-top: 20px;
  min-height: 0;
}

.journal-work {
  display: flex; flex-direction: column;
  gap: 16px;
  min-height: 0;
}
.journal-step {
  display: flex; flex-direction: column; gap: 8px;
}
.journal-step-label {
  display: flex; align-items: center; gap: 10px;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(26,22,18,0.55);
}
.journal-step-no {
  width: 22px; height: 22px;
  border: 0.5px solid rgba(26,22,18,0.25);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
}

.journal-input {
  border: none;
  background: rgba(255,255,255,0.5);
  border-bottom: 0.5px solid rgba(26,22,18,0.2);
  padding: 10px 12px;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  font-size: 15px; line-height: 1.4;
  color: #1a1612;
  resize: none;
  outline: none;
  transition: all 0.15s;
}
.journal-input::placeholder {
  color: rgba(26,22,18,0.3);
  font-style: italic;
}
.journal-input:focus {
  background: #fff;
  border-bottom-color: #1a1612;
}
.journal-input:disabled { opacity: 0.4; }

.journal-draw {
  align-self: flex-start;
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px;
  border: 0.5px dashed rgba(26,22,18,0.35);
  background: transparent;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(26,22,18,0.7);
  cursor: pointer; border-radius: 4px;
  transition: all 0.15s;
}
.journal-draw:hover {
  background: #1a1612; color: #f4f1ea; border-color: #1a1612; border-style: solid;
}
.journal-draw-icon { font-size: 14px; }

.journal-strategy {
  background: #fdfcf8;
  border-radius: 4px;
  padding: 16px 18px;
  box-shadow:
    0 1px 0 rgba(0,0,0,0.05) inset,
    0 4px 14px rgba(0,0,0,0.05);
}
.journal-strategy-text {
  margin: 0;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  font-size: 17px; line-height: 1.35;
  font-style: italic;
  text-wrap: balance;
}
.journal-strategy-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 10px; padding-top: 10px;
  border-top: 0.5px solid rgba(26,22,18,0.1);
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.08em;
  color: rgba(26,22,18,0.45);
}
.journal-redraw {
  border: none; background: transparent;
  font: inherit; color: inherit;
  cursor: pointer; padding: 2px 6px; border-radius: 3px;
}
.journal-redraw:hover { color: #1a1612; }

.journal-actions {
  margin-top: auto;
  display: flex; justify-content: flex-end;
}
.journal-save {
  border: 0.5px solid #1a1612;
  background: #1a1612; color: #f4f1ea;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  padding: 10px 18px; border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}
.journal-save:hover:not(:disabled) {
  background: transparent; color: #1a1612;
}
.journal-save:disabled {
  opacity: 0.3; cursor: not-allowed;
}

.journal-ledger {
  display: flex; flex-direction: column;
  gap: 12px;
  border-left: 0.5px solid rgba(26,22,18,0.15);
  padding-left: 24px;
  min-height: 0;
}
.journal-ledger-head {
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(26,22,18,0.55);
}
.journal-empty {
  display: flex; flex-direction: column; gap: 14px;
  margin-top: 12px;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 10px; letter-spacing: 0.08em;
  color: rgba(26,22,18,0.4);
}
.journal-empty-rule {
  display: block; width: 32px; height: 1px;
  background: rgba(26,22,18,0.2);
}
.journal-entries {
  list-style: none; padding: 0; margin: 0;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 2px;
  min-height: 0;
}
.journal-entry {
  padding: 10px 0;
  border-bottom: 0.5px dotted rgba(26,22,18,0.12);
  cursor: pointer;
  transition: opacity 0.15s;
}
.journal-entry:hover { opacity: 0.7; }
.journal-entry--open:hover { opacity: 1; }
.journal-entry-top {
  display: flex; justify-content: space-between;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 9px; letter-spacing: 0.08em;
  color: rgba(26,22,18,0.4);
  margin-bottom: 4px;
}
.journal-entry-strategy {
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  font-size: 13px; line-height: 1.3;
  font-style: italic;
  color: #1a1612;
}
.journal-entry-detail {
  margin-top: 10px;
  display: flex; flex-direction: column; gap: 8px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.6);
  border-radius: 3px;
}
.journal-entry-tag {
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(26,22,18,0.4);
  margin-bottom: 2px;
}
.journal-entry-body {
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  font-size: 12px; line-height: 1.4;
  color: #1a1612;
}
`;

window.JournalPrototype = JournalPrototype;
