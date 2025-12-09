import { ALL_CHARACTERS } from '../data/characters';
import type { Character } from '../data/characters';

// Helper to calculate score for a single character against current board
export const calculateScore = (
    character: Character,
    enemies: (Character | null)[],
    allies: (Character | null)[]
): { score: number; reasons: string[] } => {
    let score = 0.5;
    const reasons: string[] = [];

    const BASE_WINRATE = 50;

    // Helper: Apply delta logic
    // impact > 0: Advantage (Add score with INCREASE factor)
    // impact < 0: Disadvantage (Subtract score with DECREASE factor)
    const applyImpact = (rawWeight: number, isEnemyPerspective: boolean) => {
        // If isEnemyPerspective (Enemy vs Me):
        //   Weight 60 means Enemy wins 60% -> Bad for Me -> Disadvantage.
        //   Weight 40 means Enemy wins 40% -> Good for Me -> Advantage.
        //   So Impact for Me = (50 - Weight)
        // If !isEnemyPerspective (Me vs Enemy or Synergy):
        //   Weight 60 means I win 60% -> Good for Me -> Advantage.
        //   Impact for Me = (Weight - 50)

        let delta = 0;
        if (isEnemyPerspective) {
            delta = BASE_WINRATE - rawWeight;
        } else {
            delta = rawWeight - BASE_WINRATE;
        }

        const normalized = delta / 100; // e.g., 10 diff -> 0.10

        if (normalized > 0) {
            // Advantage
            const val = normalized;
            score += val;
            return { val, type: 'advantage' };
        } else if (normalized < 0) {
            // Disadvantage
            const absVal = Math.abs(normalized);
            const val = absVal;
            score -= val;
            return { val, type: 'disadvantage' };
        }
        return { val: 0, type: 'neutral' };
    };

    // 1. Check ENEMY lists (Enemy vs Me)
    enemies.forEach(enemy => {
        if (!enemy) return;
        const match = enemy.counters.find(c => c.characterName === character.name);
        if (match) {
            const { val, type } = applyImpact(match.weight, true);
            if (val !== 0) {
                if (type === 'advantage') reasons.push(`Strong vs ${enemy.name} (+${val.toFixed(2)})`);
                else reasons.push(`Weak vs ${enemy.name} (-${val.toFixed(2)})`);
            }
        }
    });

    // 2. Check MY lists (Me vs Enemy)
    enemies.forEach(enemy => {
        if (!enemy) return;
        const match = character.counters.find(c => c.characterName === enemy.name);
        if (match) {
            const { val, type } = applyImpact(match.weight, false);
            if (val !== 0) {
                if (type === 'advantage') reasons.push(`Counters ${enemy.name} (+${val.toFixed(2)})`);
                else reasons.push(`Countered by ${enemy.name} (-${val.toFixed(2)})`);
            }
        }
    });

    // 3. Synergies (Ally vs Me - wait, Synergy is cooperative)
    // Weight implies "Combined Winrate" or "Ally happiness with Me"?
    // Assuming Weight > 50 is Good.
    allies.forEach(ally => {
        if (!ally) return;
        const match = ally.synergies.find(s => s.characterName === character.name);
        if (match) {
            const { val, type } = applyImpact(match.weight, false);
            if (val !== 0) {
                if (type === 'advantage') reasons.push(`Synergy w/ ${ally.name} (+${val.toFixed(2)})`);
                else reasons.push(`Anti-Synergy w/ ${ally.name} (-${val.toFixed(2)})`);
            }
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
    const filledRoleCounts = new Map<string, number>();
    allies.forEach(a => {
        if (a) {
            a.role.forEach(r => {
                filledRoleCounts.set(r, (filledRoleCounts.get(r) || 0) + 1);
            });
        }
    });

    return ALL_CHARACTERS.map(char => {
        // Filter out if already picked or banned
        const isPicked = enemies.some(e => e?.name === char.name) || allies.some(a => a?.name === char.name);
        const isBanned = banned.has(char.name);

        if (isPicked || isBanned) return null;

        // Filter out if role is already filled (User request: allow 2 Baron, 2 Mid)
        // Check if ANY of the character's roles are still open.
        // If a char is ["Mid", "Baron"], they are valid if EITHER Mid count < 2 OR Baron count < 2.
        const isRoleOpen = char.role.some(r => {
            const currentCount = filledRoleCounts.get(r) || 0;
            if (r === 'Baron' || r === 'Mid') {
                return currentCount < 2;
            }
            return currentCount < 1;
        });

        if (!isRoleOpen) return null;

        const { score, reasons } = calculateScore(char, enemies, allies);

        return {
            character: char,
            score,
            reason: reasons
        };
    }).filter(Boolean).sort((a, b) => (b!.score - a!.score)) as { character: Character; score: number; reason: string[] }[];
};
