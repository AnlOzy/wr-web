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

    // Coefficients as per user request
    const FACTOR_INCREASE = 0.25; // 25% increase for Advantages
    const FACTOR_DECREASE = 0.20; // 20% decrease for Disadvantages

    // 1. ADVANTAGE: I Counter Enemy (Enemy is weak against me)
    // Data definition: enemy.counters contains ME
    enemies.forEach(enemy => {
        if (!enemy) return;
        const iCounterThem = enemy.counters.find(c => c.characterName === character.name);
        if (iCounterThem) {
            const raw = iCounterThem.weight / 100;
            const val = raw * FACTOR_INCREASE;
            score += val;
            reasons.push(`Counters ${enemy.name} (+${val.toFixed(2)})`);
        }
    });

    // 2. DISADVANTAGE: Enemy Counters Me (I am weak against enemy)
    // Data definition: character.counters contains ENEMY
    enemies.forEach(enemy => {
        if (!enemy) return;
        const theyCounterMe = character.counters.find(c => c.characterName === enemy.name);
        if (theyCounterMe) {
            const raw = theyCounterMe.weight / 100;
            const val = raw * FACTOR_DECREASE;
            score -= val; // DECREASE
            reasons.push(`Countered by ${enemy.name} (-${val.toFixed(2)})`);
        }
    });

    // 3. ADVANTAGE: Synergy (Ally works well with Me)
    // Data definition: ally.synergies contains ME
    allies.forEach(ally => {
        if (!ally) return;
        const synergyMatch = ally.synergies.find(s => s.characterName === character.name);
        if (synergyMatch) {
            const raw = synergyMatch.weight / 100;
            const val = raw * FACTOR_INCREASE;
            score += val;
            reasons.push(`Synergy with ${ally.name} (+${val.toFixed(2)})`);
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
