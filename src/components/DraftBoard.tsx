import React, { useMemo } from 'react';
import type { Character } from '../data/characters';
import type { DraftState, TeamSide, SlotType } from '../store/useDraft';
import { calculateRecommendations, calculateScore } from '../logic/recommendation';

interface DraftBoardProps {
    state: DraftState;
    onSlotClick: (side: TeamSide, index: number, type: SlotType) => void;
}

export const DraftBoard: React.FC<DraftBoardProps> = ({ state, onSlotClick }) => {

    // Calculate Recommendations if a slot is selected
    const recommendations = useMemo(() => {
        if (!state.selection || state.selection.type === 'ban') return [];

        // Determine enemies and allies based on selection side
        const enemies = state.selection.side === 'blue' ? state.redTeam : state.blueTeam;
        const allies = state.selection.side === 'blue' ? state.blueTeam : state.redTeam;

        // Get all 'picked' names to exclude
        const pickedOrBanned = new Set<string>();
        state.blueBans.concat(state.redBans).concat(state.blueTeam).concat(state.redTeam).forEach(c => {
            if (c) pickedOrBanned.add(c.name);
        });

        return calculateRecommendations(enemies, allies, pickedOrBanned).slice(0, 2);
    }, [state]);

    const renderBanSlot = (char: Character | null, index: number, side: TeamSide) => {
        const isSelected = state.selection?.side === side && state.selection?.index === index && state.selection?.type === 'ban';
        return (
            <button
                key={`${side}-ban-${index}`}
                onClick={() => onSlotClick(side, index, 'ban')}
                className={`w-10 h-10 sm:w-12 sm:h-12 border rounded relative flex items-center justify-center bg-slate-800 transition-all ${isSelected
                    ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    : 'border-slate-700 hover:border-slate-500'
                    }`}
            >
                {char ? (
                    <div className="text-[10px] text-center">{char.name.substring(0, 3)}</div>
                ) : (
                    <span className="text-slate-600 text-xs">Ban</span>
                )}
                {/* Slash overlay for bans */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <div className="w-[1px] h-full bg-red-500 rotate-45 transform"></div>
                </div>
            </button>
        );
    };

    const renderPlayerSlot = (char: Character | null, index: number, side: TeamSide) => {
        const isSelected = state.selection?.side === side && state.selection?.index === index && state.selection?.type === 'pick';
        const sideColor = side === 'blue' ? 'border-blue-500' : 'border-red-500';

        return (
            <button
                key={`${side}-pick-${index}`}
                onClick={() => onSlotClick(side, index, 'pick')}
                className={`flex items-center gap-3 p-2 rounded-xl transition-all w-full border-l-4 bg-slate-900/50 ${isSelected
                    ? `${sideColor} bg-slate-800 shadow-lg rings-1 ring-white/10`
                    : 'border-transparent hover:bg-slate-800'
                    }`}
            >
                <div className={`w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border-2 ${char ? sideColor : 'border-slate-700'}`}>
                    {char ? (
                        <span className="text-xs font-bold text-white">{char.name.substring(0, 2)}</span>
                    ) : (
                        <span className="text-slate-600 font-mono text-lg">{index + 1}</span>
                    )}
                </div>
                <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${char ? 'text-white' : 'text-slate-500'}`}>
                        {char ? char.name : 'Empty Slot'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        {char ? char.role.join(', ') : 'Select...'}
                    </p>
                </div>
            </button>
        );
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">

            {/* Helper / Recommendation Tip */}
            {state.selection && state.selection.type === 'pick' && (
                <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-xl animate-in fade-in zoom-in duration-300">
                    <h4 className="text-brand-primary text-sm font-bold uppercase tracking-wider mb-2">Optimal Picks</h4>
                    {recommendations.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {recommendations.map(rec => (
                                <div key={rec.character.name} className="flex flex-col">
                                    <span className="font-bold text-white">{rec.character.name} <span className="text-green-400">+{rec.score}</span></span>
                                    <span className="text-xs text-slate-400 truncate">{rec.reason.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-400 text-sm">Select more characters to calculate synergies.</p>
                    )}
                </div>
            )}

            {/* Bans Header */}
            <div className="flex justify-between items-start px-2">
                <div className="flex gap-1 flex-wrap w-[45%]">
                    {state.blueBans.map((c, i) => renderBanSlot(c, i, 'blue'))}
                </div>
                <div className="flex gap-1 flex-wrap w-[45%] justify-end">
                    {state.redBans.map((c, i) => renderBanSlot(c, i, 'red'))}
                </div>
            </div>

            {/* Teams Display */}
            <div className="grid grid-cols-2 gap-4 sm:gap-8 relative">
                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-10 h-10 bg-slate-950 rounded-full flex items-center justify-center border border-slate-700 shadow-xl">
                        <span className="text-xs font-black text-slate-500">VS</span>
                    </div>
                </div>

                {/* Blue Team (Left) */}
                <div className="space-y-2">
                    <h2 className="text-blue-400 font-bold uppercase text-xs tracking-widest mb-2 pl-2">Blue Side</h2>
                    {state.blueTeam.map((c, i) => renderPlayerSlot(c, i, 'blue'))}
                </div>

                {/* Red Team (Right) */}
                <div className="space-y-2">
                    <h2 className="text-red-400 font-bold uppercase text-xs tracking-widest mb-2 text-right pr-2">Red Side</h2>
                    {state.redTeam.map((c, i) => renderPlayerSlot(c, i, 'red'))}
                </div>
            </div>

        </div>
    );
};
