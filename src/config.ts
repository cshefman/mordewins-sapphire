// Player's real values (brief §6) + the seeded default save state (brief §6 table).
import type { PowerKey, SaveState, TierKey } from "./types";

export const config = {
  character: {
    name: "Mordewin",
    level: 10,
    class: "Tempest Cleric",
    subtitle: "Lvl 10 Tempest Cleric",
    deity: "Deudelaphon", // context only, not surfaced
    signatureWeapon: "Tidepiercer", // context only
    hitDie: "d8", // Storm Tornado self-heal = raw d8, NO modifier
    spellAttackMod: 4, // spiritual-weapon attack the player rolls separately
    spellSaveDC: 16,
    proficiencyBonus: 4,
    maxHP: 73, // exists on the sheet; NOT tracked in this app
  },

  // Aurum unlock economy (brief §6). Enhanced/Superior/Ultimate confirmed; base assumed = 1.
  aurumCostByTier: { base: 1, enhanced: 2, superior: 3, ultimate: 4 } as Record<TierKey, number>,
  defaultAurumPool: 0, // player edits to their current total

  // Level gating — HARD BLOCK (brief §6/§8).
  levelRequirement: { base: 1, enhanced: 6, superior: 8, ultimate: 11 } as Record<TierKey, number>,

  // Spiritual weapon (player rolls the attack separately; here for the rules reference).
  spiritualWeapon: { dice: "1d8", flatBonus: 4, type: "Shock" as const },
} as const;

/** Seeded unlock levels (brief §6): 0 locked · 1 Base · 2 Enhanced · 3 Superior · 4 Ultimate. */
export const SEED_UNLOCKS: Record<PowerKey, 0 | 1 | 2 | 3 | 4> = {
  tornado: 3, // Superior
  thunder: 3, // Superior
  stormBorn: 3, // Superior
  bull: 2, // Enhanced
  coral: 1, // Base
  owl: 0, // Locked
};

export const SAVE_VERSION = 1;

export function makeSeedState(): SaveState {
  return {
    version: SAVE_VERSION,
    aurumPool: config.defaultAurumPool,
    unlocked: { ...SEED_UNLOCKS },
    baseAurumCost: config.aurumCostByTier.base,
    aurumModel: "spend",
    manualOverride: true,
  };
}

/**
 * Documented rules conflicts between the docx (source of truth) and the brief §7 table,
 * resolved with the player (see app brief Q4). Surfaced in-app per the brief's instruction
 * to flag, not silently resolve.
 */
export const RULES_CONFLICTS = [
  {
    power: "tornado" as PowerKey,
    tier: "superior" as TierKey,
    summary:
      "Storm Tornado · Superior: using the brief's Contact 4d6 / suction DC 21. The docx bundles " +
      "the 4d6 + DC +5 upgrade with “useable at any HP” (Ultimate); at Superior the docx still has " +
      "2d6 / DC 16. Player chose the brief values — confirm with Keith.",
  },
  {
    power: "thunder" as PowerKey,
    tier: "superior" as TierKey,
    summary:
      "Thunder Step · Superior: using the docx's origin blast 3d6 Thunder (the 3-weapons/40ft tier). " +
      "The brief §7 keeps the origin blast at 2d6 until Ultimate. Player chose the docx value.",
  },
];
