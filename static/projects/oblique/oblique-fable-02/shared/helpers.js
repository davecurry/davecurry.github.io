// Shared helpers for all four Oblique prototypes.
// Exposes a tiny "deck" abstraction (Fisher–Yates shuffle, draw-without-replacement
// with auto-reshuffle), plus formatting + persistence utilities.

(function () {
  const S = window.STRATEGIES || [];

  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // makeDeck() returns a stateful draw function with auto-reshuffle.
  function makeDeck(seedAvoid) {
    let queue = shuffled(S);
    if (seedAvoid && queue[0] === seedAvoid) {
      queue.push(queue.shift());
    }
    return {
      draw() {
        if (queue.length === 0) queue = shuffled(S);
        return queue.shift();
      },
      peek() { return queue[0]; },
      size: S.length,
    };
  }

  function pad(n, width = 3) {
    const s = String(n);
    return s.length >= width ? s : "0".repeat(width - s.length) + s;
  }

  // Find a strategy's 1-indexed position in the canonical STRATEGIES list.
  function indexOf(s) {
    const i = S.indexOf(s);
    return i < 0 ? null : i + 1;
  }

  // localStorage namespaced helper
  function store(key) {
    const k = "oblique:" + key;
    return {
      get(fallback) {
        try {
          const v = localStorage.getItem(k);
          return v == null ? fallback : JSON.parse(v);
        } catch (e) { return fallback; }
      },
      set(v) {
        try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
      },
    };
  }

  // useEntered() — returns false on first paint, then true on the next frame.
  // Used to flip a "start" modifier class off so a CSS transition runs.
  // A hard 80ms setTimeout fallback guarantees the modifier always clears,
  // so a failed rAF can never leave the element stuck at its starting state.
  function useEntered() {
    const React = window.React;
    const [e, setE] = React.useState(false);
    React.useEffect(() => {
      let cleared = false;
      const clear = () => { if (!cleared) { cleared = true; setE(true); } };
      const t = setTimeout(clear, 80);
      const r1 = requestAnimationFrame(() => requestAnimationFrame(clear));
      return () => { clearTimeout(t); cancelAnimationFrame(r1); };
    }, []);
    return e;
  }

  window.Oblique = {
    shuffled, makeDeck, pad, indexOf, store, useEntered,
    total: S.length,
    attribution: window.STRATEGIES_ATTRIBUTION,
  };
})();
