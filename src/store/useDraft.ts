import { useState, useCallback } from 'react';
import type { Character } from '../data/characters';

export type TeamSide = 'blue' | 'red';
export type SlotType = 'pick' | 'ban';

export interface DraftState {
    blueTeam: (Character | null)[];
    redTeam: (Character | null)[];
    blueBans: (Character | null)[];
    redBans: (Character | null)[];
    selection: {
        side: TeamSide;
        index: number;
        type: SlotType;
    } | null;
}

export const useDraft = () => {
    const [state, setState] = useState<DraftState>({
        blueTeam: Array(5).fill(null),
        redTeam: Array(5).fill(null),
        blueBans: Array(5).fill(null),
        redBans: Array(5).fill(null),
        selection: null,
    });

    const selectSlot = useCallback((side: TeamSide, index: number, type: SlotType) => {
        setState(prev => ({ ...prev, selection: { side, index, type } }));
    }, []);

    const clearSelection = useCallback(() => {
        setState(prev => ({ ...prev, selection: null }));
    }, []);

    const lockCharacter = useCallback((character: Character) => {
        setState(prev => {
            if (!prev.selection) return prev;

            const { side, index, type } = prev.selection;
            const newState = { ...prev };

            if (type === 'pick') {
                if (side === 'blue') {
                    const newTeam = [...prev.blueTeam];
                    newTeam[index] = character;
                    newState.blueTeam = newTeam;
                } else {
                    const newTeam = [...prev.redTeam];
                    newTeam[index] = character;
                    newState.redTeam = newTeam;
                }
            } else {
                if (side === 'blue') {
                    const newBans = [...prev.blueBans];
                    newBans[index] = character;
                    newState.blueBans = newBans;
                } else {
                    const newBans = [...prev.redBans];
                    newBans[index] = character;
                    newState.redBans = newBans;
                }
            }

            // Auto deselect or move to next? For now just deselect.
            newState.selection = null;
            return newState;
        });
    }, []);

    const getBannedNames = useCallback(() => {
        const bans = new Set<string>();
        state.blueBans.forEach(c => c && bans.add(c.name));
        state.redBans.forEach(c => c && bans.add(c.name));
        state.blueTeam.forEach(c => c && bans.add(c.name)); // Picked chars effectively banned for others
        state.redTeam.forEach(c => c && bans.add(c.name));
        return bans;
    }, [state]);

    return {
        state,
        selectSlot,
        clearSelection,
        lockCharacter,
        getBannedNames
    };
};
