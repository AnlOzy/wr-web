import { DraftBoard } from './components/DraftBoard';
import { CharacterSelector } from './components/CharacterSelector';
import { useDraft } from './store/useDraft';
import type { Character } from './data/characters';

function App() {
  const { state, selectSlot, lockCharacter, clearSelection, getBannedNames } = useDraft();

  const handleCharacterSelect = (char: Character) => {
    lockCharacter(char);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-primary/30 pb-32">

      {/* Navbar / Header */}
      <header className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
            MOBA Team Builder
          </h1>
          <div className="text-xs text-slate-500 font-mono">
            v0.1.0-alpha
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <DraftBoard
          state={state}
          onSlotClick={selectSlot}
        />
      </main>

      {/* Character Selector (Bottom Sheet) */}
      <CharacterSelector
        isOpen={!!state.selection}
        onSelect={handleCharacterSelect}
        bannedNames={getBannedNames()}
        onClose={clearSelection}
      />
    </div>
  );
}

export default App;
