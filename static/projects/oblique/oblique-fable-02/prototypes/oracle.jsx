// The Oracle — single full-bleed strategy in monumental type.
// Press SPACE (or click anywhere) to draw the next one. Text crossfades.
// Designed to feel like a meditation app.
//
// Animation strategy: CSS transitions, NOT @keyframes. Base styles are the
// visible/final state; a "--start" modifier class is added on mount and
// removed on the next frame so the transition runs. A setTimeout fallback
// inside useEntered() guarantees the modifier clears even if rAF misbehaves
// — so a failed transition still leaves the element visible.

function OracleText({ text }) {
  const entered = window.Oblique.useEntered();
  return (
    <p className={"oracle-text " + (entered ? "" : "oracle-text--start")}>
      {text}
    </p>
  );
}

function OracleExitGhost({ text, onDone }) {
  const entered = window.Oblique.useEntered();
  React.useEffect(() => {
    const t = setTimeout(onDone, 420);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <p className={"oracle-text oracle-text--ghost " + (entered ? "oracle-text--exit" : "")}>
      {text}
    </p>
  );
}

function OraclePrototype() {
  const deckRef = React.useRef(window.Oblique.makeDeck());
  const [current, setCurrent] = React.useState(() => {
    const t = deckRef.current.draw();
    return { text: t, idx: window.Oblique.indexOf(t), key: 0 };
  });
  const [count, setCount] = React.useState(1);
  const [exiting, setExiting] = React.useState(null);
  const tick = React.useRef(0);

  function next() {
    setExiting({ text: current.text, key: "x" + tick.current });
    tick.current += 1;
    const t = deckRef.current.draw();
    setCurrent({ text: t, idx: window.Oblique.indexOf(t), key: tick.current });
    setCount((c) => c + 1);
  }

  const rootRef = React.useRef(null);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (!el.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.code === "Space" || e.code === "Enter" || e.code === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    el.tabIndex = 0;
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  });

  return (
    <div ref={rootRef} className="oracle-root" onClick={next}>
      <style>{oracleCSS}</style>

      <div className="oracle-top">
        <span className="oracle-mark">The Oracle</span>
      </div>

      <div className="oracle-stage">
        {exiting && (
          <OracleExitGhost
            key={exiting.key}
            text={exiting.text}
            onDone={() => setExiting(null)}
          />
        )}
        <OracleText key={current.key} text={current.text} />
      </div>

      <div className="oracle-bottom">
        <span className="oracle-no">№ {window.Oblique.pad(current.idx || 0)}</span>
        <span className="oracle-hint">
          <kbd>space</kbd> &nbsp;or click &nbsp;to draw
        </span>
        <span className="oracle-count">
          {window.Oblique.pad(count)} <span className="oracle-count-sep">/</span> ∞
        </span>
      </div>
    </div>
  );
}

const oracleCSS = `
.oracle-root {
  position: absolute; inset: 0;
  background: #0e0d0c;
  color: #ece9e2;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  display: flex; flex-direction: column;
  padding: 28px 40px;
  cursor: pointer;
  user-select: none;
  outline: none;
  overflow: hidden;
}
.oracle-root::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.03), transparent 70%);
  pointer-events: none;
}
.oracle-top {
  display: flex; justify-content: space-between; align-items: baseline;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(236,233,226,0.4);
}
.oracle-stage {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 24px 8%;
  position: relative;
}
.oracle-text {
  margin: 0;
  font-family: 'Newsreader', ui-serif, Georgia, serif;
  font-weight: 300;
  font-size: clamp(28px, 4.4vw, 56px);
  line-height: 1.2;
  letter-spacing: -0.01em;
  text-align: center;
  text-wrap: balance;
  font-style: italic;
  /* Base = final visible state. Transitions handle the in/out movement. */
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
  transition: opacity 0.5s cubic-bezier(.2,.7,.3,1),
              transform 0.5s cubic-bezier(.2,.7,.3,1),
              filter 0.5s cubic-bezier(.2,.7,.3,1);
}
/* Mount state: applied for one frame, then removed so transition runs */
.oracle-text--start {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(6px);
  transition: none;
}
/* Outgoing ghost overlay */
.oracle-text--ghost {
  position: absolute;
  top: 50%; left: 8%; right: 8%;
  transform: translateY(-50%);
  pointer-events: none;
}
.oracle-text--exit {
  opacity: 0;
  transform: translateY(calc(-50% - 10px));
  filter: blur(6px);
}

.oracle-bottom {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  align-items: end;
  font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace;
  font-size: 11px; letter-spacing: 0.12em;
  color: rgba(236,233,226,0.35);
}
.oracle-no { justify-self: start; font-variant-numeric: tabular-nums; }
.oracle-hint {
  justify-self: center;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 10px;
}
.oracle-hint kbd {
  font-family: inherit; font-size: 10px;
  padding: 2px 6px;
  border: 0.5px solid rgba(236,233,226,0.3);
  border-radius: 3px;
  background: rgba(255,255,255,0.03);
}
.oracle-count {
  justify-self: end;
  font-variant-numeric: tabular-nums;
}
.oracle-count-sep { opacity: 0.5; padding: 0 2px; }
`;

window.OraclePrototype = OraclePrototype;
