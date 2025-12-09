import { ALL_CHARACTERS } from '../data/characters';
import type { Character } from '../data/characters';

// Helper to calculate score for a single character against current board
export const calculateScore = (
    character: Character,
    enemies: (Character | null)[],
    allies: (Character | null)[]
): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Enemy Counters
    enemies.forEach(enemy => {
        if (!enemy) return;
        // Check if THIS character counters the enemy
        // "character.counters" lists who THIS character counters
        // Wait, data structure says: `counters: CounterWeight[]`. 
        // Logic request: "Look enemy characters -> check their 'counters' list"
        // If Enemy A lists Character B as a counter, it means B is good against A.
        // So we look at `enemy.counters` to see if `character.name` is in it.
        const counterMatch = enemy.counters.find(c => c.characterName === character.name);
        if (counterMatch) {
            const normalizedWeight = counterMatch.weight / 100;
            score += normalizedWeight;
            reasons.push(`Counters ${enemy.name} (+${normalizedWeight.toFixed(2)})`);
        }
    });

    // 2. Ally Synergies
    allies.forEach(ally => {
        if (!ally) return;
        // Check if Ally has synergy with THIS character
        const synergyMatch = ally.synergies.find(s => s.characterName === character.name);
        if (synergyMatch) {
            const normalizedWeight = synergyMatch.weight / 100;
            score += normalizedWeight;
            reasons.push(`Synergy with ${ally.name} (+${normalizedWeight.toFixed(2)})`);
        }
    });

    return { score, reasons };
};

// Returns a sorted list of characters with their calculated score
export const calculateRecommendations = (
    enemies: (Character | null)[],
    allies: (Character | null)[],
    banned: Set<string>
): { character: Character; score: number; reason: string[] }[] => {

    // Convert to array and sort
    const filledRoles = new Set<string>();
    allies.forEach(a => {
        if (a) a.role.forEach(r => filledRoles.add(r));
    });

    return ALL_CHARACTERS.map(char => {
        // Filter out if already picked or banned
        const isPicked = enemies.some(e => e?.name === char.name) || allies.some(a => a?.name === char.name);
        const isBanned = banned.has(char.name);

        if (isPicked || isBanned) return null;

        // Filter out if role is already filled
        if (char.role.some(r => filledRoles.has(r))) return null;

        const { score, reasons } = calculateScore(char, enemies, allies);

        return {
            character: char,
            score,
            reason: reasons
        };
    }).filter(Boolean).sort((a, b) => (b!.score - a!.score)) as { character: Character; score: number; reason: string[] }[];
};
