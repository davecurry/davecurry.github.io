// Main canvas for the Oblique Strategies design exploration.
// Lays out four interactive prototypes side by side. Each artboard can be
// opened in fullscreen via the expand control.

function App() {
  return (
    <DesignCanvas>
      <DCSection
        id="prototypes"
        title="Oblique Strategies · interactive directions"
        subtitle="Four ways to bring Eno & Schmidt's deck into the browser. Open any artboard fullscreen to use it for real."
      >
        <DCArtboard id="deck" label="A · The Deck" width={780} height={560}>
          <DeckPrototype />
        </DCArtboard>

        <DCArtboard id="oracle" label="B · The Oracle" width={780} height={560}>
          <OraclePrototype />
        </DCArtboard>

        <DCArtboard id="spread" label="C · The Spread" width={920} height={560}>
          <SpreadPrototype />
        </DCArtboard>

        <DCArtboard id="journal" label="D · The Journal" width={920} height={640}>
          <JournalPrototype />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
