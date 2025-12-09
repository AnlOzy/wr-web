import React, { useState, useMemo } from 'react';
import { ALL_CHARACTERS } from '../data/characters';
import type { Character, Lane } from '../data/characters';

interface CharacterSelectorProps {
    onSelect: (char: Character) => void;
    bannedNames: Set<string>;
    isOpen: boolean;
    onClose: () => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
    onSelect,
    bannedNames,
    isOpen,
    onClose
}) => {
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [laneFilter, setLaneFilter] = useState<Lane | 'All'>('All');

    const filteredCharacters = useMemo(() => {
        let result = ALL_CHARACTERS.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase())
        );

        if (laneFilter !== 'All') {
            result = result.filter(c => c.role.includes(laneFilter));
        }

        result.sort((a, b) => {
            return sortOrder === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        });

        return result;
    }, [search, sortOrder, laneFilter]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="fixed inset-x-0 bottom-0 top-[40%] bg-dark-bg border-t border-slate-700 shadow-2xl flex flex-col z-50 rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">

                {/* Header / Controls */}
                <div className="p-4 bg-dark-surface border-b border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-100">Select Character</h3>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 bg-slate-800 rounded-lg text-slate-300 border border-slate-700 hover:bg-slate-700"
                        >
                            {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                        </button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {['All', 'Baron', 'Jungle', 'Mid', 'Dragon', 'Support'].map(role => (
                            <button
                                key={role}
                                onClick={() => setLaneFilter(role as any)}
                                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${laneFilter === role
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {filteredCharacters.map(char => {
                            const isBanned = bannedNames.has(char.name);
                            return (
                                <button
                                    key={char.name}
                                    disabled={isBanned}
                                    onClick={() => onSelect(char)}
                                    className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all group ${isBanned
                                        ? 'opacity-40 grayscale border-slate-800 cursor-not-allowed'
                                        : 'border-slate-700 hover:border-brand-primary hover:scale-105 cursor-pointer bg-slate-800'
                                        }`}
                                >
                                    {/* Placeholder for Image */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-xs text-center p-1">
                                        {char.name.substring(0, 2)}
                                    </div>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1">
                                        <p className="text-[10px] text-center truncate text-slate-200">{char.name}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};
