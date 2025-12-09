import charactersData from './characters.json';

export type Lane = 'Baron' | 'Jungle' | 'Mid' | 'Dragon' | 'Support';

export interface CounterWeight {
    characterName: string;
    weight: number;
}

export interface SynergyWeight {
    characterName: string;
    weight: number;
}

export interface Character {
    name: string;
    role: Lane[];
    weight: number;
    counters: CounterWeight[];
    synergies: SynergyWeight[];
    icon?: string;
}

// Validation / Type Casting
// We assume the JSON is valid, but we cast it to ensure TypeScript is happy.
export const ALL_CHARACTERS: Character[] = charactersData as unknown as Character[];
