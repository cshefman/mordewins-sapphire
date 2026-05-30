// Power dataset (brief §7) + roller behaviour. Tier values resolved with the player (brief Q4);
// see RULES_CONFLICTS in config.ts for the two docx/brief divergences.
import { RollBuilder, type Rng } from "./dice";
import type { DamageType, PowerKey, PowerKind, RollOutput, TierLevel } from "./types";

// ----------------------------------------------------------------------------
// Static descriptors (layout, icon, identity)
// ----------------------------------------------------------------------------
export interface PowerMeta {
  key: PowerKey;
  name: string;
  kind: PowerKind;
  /** Tabler icon name (mapped to the component in the UI). */
  icon: string;
  /** Fire-button verb for active powers. */
  fire?: string;
  /** Orbit-node position on the stage, % of stage box (active + passive nodes). */
  node: { x: number; y: number };
}

export const POWERS: Record<PowerKey, PowerMeta> = {
  tornado: { key: "tornado", name: "Storm Tornado", kind: "active", icon: "tornado", fire: "Unleash the funnel", node: { x: 50, y: 7 } },
  thunder: { key: "thunder", name: "Mordewin's Thunder Step", kind: "active", icon: "bolt", fire: "Step through thunder", node: { x: 10, y: 35 } },
  coral: { key: "coral", name: "Static Coral", kind: "active", icon: "windmill", fire: "Raise the coral", node: { x: 90, y: 35 } },
  bull: { key: "bull", name: "Bull's Strength", kind: "passive", icon: "barbell", node: { x: 14, y: 74 } },
  stormBorn: { key: "stormBorn", name: "Storm Born", kind: "passive", icon: "shield-bolt", node: { x: 86, y: 74 } },
  owl: { key: "owl", name: "Owl's Wisdom", kind: "passive", icon: "feather", node: { x: 50, y: 88 } },
};

/** Short display name used on the orbit nodes. */
export const SHORT_NAME: Record<PowerKey, string> = {
  tornado: "Storm Tornado",
  thunder: "Thunder Step",
  coral: "Static Coral",
  bull: "Bull's Strength",
  stormBorn: "Storm Born",
  owl: "Owl's Wisdom",
};

export const POWER_ORDER: PowerKey[] = ["tornado", "thunder", "coral", "bull", "owl", "stormBorn"];

// ----------------------------------------------------------------------------
// Per-tier numbers (index 0 = Base … 3 = Ultimate)
// ----------------------------------------------------------------------------
const tornadoTiers = {
  selfHealD8: [2, 3, 4, 4],
  contactN: [2, 2, 4, 4], // d6 — Superior 4d6 per player's choice (brief)
  funnelDie: 6, // 1d6 per caught, all tiers
  maxCaught: [3, 4, 4, 5],
  suctionDC: [16, 16, 21, 21], // Superior DC21 (+5) per player's choice (brief)
  hpGate: ["≤25%", "≤50%", "≤75%", "any"],
  duration: [3, 3, 3, 4],
};

const thunderTiers = {
  weapons: [1, 2, 3, 4],
  originN: [2, 2, 3, 3], // d6 thunder — Superior 3d6 per player's choice (docx)
  lineN: [2, 3, 3, 3], // d6 shock
  chaining: ["—", "2", "3", "4"],
};

const coralTiers = {
  formations: [1, 2, 3, 3],
  allyMeleeN: [1, 1, 1, 2], // d4 shock
  fieldBonus: ["+1 die", "+1 die", "+1 die", "+2 dice"],
  arc: ["—", "2d6 (DEX ½)", "3d6", "3d6"],
};

const bullStr = ["+1", "+2", "+3", "+4"];
const owlWis = ["+1", "+2", "+3", "+4"];
const stormBornFx = ["Resistance", "Immunity", "Absorb", "Absorb + slot"];

// ----------------------------------------------------------------------------
// Roller inputs (trimmed to only what changes the math — brief §2/§7)
// ----------------------------------------------------------------------------
export interface InputDef {
  id: string;
  label: string;
  val: number;
  min: number;
  max: number;
}

export function inputsFor(key: PowerKey, level: TierLevel): InputDef[] {
  const t = level - 1;
  if (key === "tornado")
    return [{ id: "caught", label: "Caught in the funnel", val: Math.min(2, tornadoTiers.maxCaught[t]), min: 0, max: tornadoTiers.maxCaught[t] }];
  if (key === "coral") return [{ id: "hits", label: "Empowered ally hits", val: 1, min: 0, max: 8 }];
  return []; // thunder: no inputs (brief §2)
}

// ----------------------------------------------------------------------------
// Rollers — each returns the brief §9 output contract via RollBuilder
// ----------------------------------------------------------------------------
export function rollPower(key: PowerKey, level: TierLevel, inputs: Record<string, number>, rng?: Rng): RollOutput {
  const t = level - 1;
  const b = new RollBuilder(rng);

  if (key === "tornado") {
    b.add({ label: "Self-heal", n: tornadoTiers.selfHealD8[t], sides: 8, type: "heal", heal: true, note: "raw d8 · no modifier" });
    b.add({ label: "Contact", n: tornadoTiers.contactN[t], sides: 6, type: "shock", note: "creatures touched" });
    const caught = inputs.caught ?? 0;
    b.add({ label: "Funnel tick", n: 1, sides: tornadoTiers.funnelDie, type: "bludgeon", targets: caught, note: "Bludgeon · re-roll each turn it churns" });
    return b.build();
  }

  if (key === "thunder") {
    b.add({ label: "Origin blast", n: thunderTiers.originN[t], sides: 6, type: "thunder", note: "CON ½ — halve the thunder yourself" });
    b.add({ label: "Teleport line", n: thunderTiers.lineN[t], sides: 6, type: "shock" });
    if (level === 4) b.reminder("Full circle", "+3d10 Shock to bounded creatures (if you complete the circle)", "shock");
    return b.build();
  }

  if (key === "coral") {
    const hits = inputs.hits ?? 0;
    b.add({ label: "Empowered melee", n: coralTiers.allyMeleeN[t], sides: 4, type: "shock", targets: hits, note: "Shock · per empowered ally hit" });
    b.reminder("Field bonus", `${coralTiers.fieldBonus[t]} to your Shock spells in the field`, "shock");
    if (level >= 2) b.reminder("Arc between formations", `${coralTiers.arc[t]} Shock to a creature passing between`, "shock");
    return b.build();
  }

  // passives never roll
  return b.build();
}

// ----------------------------------------------------------------------------
// Informational meta (prereqs + key effects), derived from the active tier
// ----------------------------------------------------------------------------
export function metaFor(key: PowerKey, level: TierLevel): string {
  const t = level - 1;
  if (key === "tornado")
    return `Usable at <b>${tornadoTiers.hpGate[t]} HP</b> · self-heal <b>${tornadoTiers.selfHealD8[t]}d8</b>. Suction: STR save vs <b>DC ${tornadoTiers.suctionDC[t]}</b>. Up to <b>${tornadoTiers.maxCaught[t]}</b> held; lasts ${tornadoTiers.duration[t]} turns. Roll once each turn it churns.`;
  if (key === "thunder")
    return `Spends a <b>1st-level slot</b> · <b>${thunderTiers.weapons[t]}</b> Spiritual Weapons (Shock, 1d8+4, attacked separately). Teleport blast — halve the thunder on a CON save.`;
  if (key === "coral")
    return `Spends a <b>2nd-level slot</b> · ${coralTiers.formations[t]} formation${coralTiers.formations[t] > 1 ? "s" : ""}. Allies within 10ft: <b>+${coralTiers.allyMeleeN[t]}d4 Shock</b> on melee. Your Shock spells in the field gain <b>${coralTiers.fieldBonus[t]}</b>.`;
  return "";
}

/** Current effect string for a passive (or active) at a tier; "—" when locked. */
export function passiveValue(key: PowerKey, level: TierLevel): string {
  if (level === 0) return "—";
  const t = level - 1;
  if (key === "bull") return `${bullStr[t]} STR`;
  if (key === "owl") return `${owlWis[t]} WIS`;
  if (key === "stormBorn") return stormBornFx[t];
  return "";
}

// ----------------------------------------------------------------------------
// Tier reference for the progression view (brief §7 tables)
// ----------------------------------------------------------------------------
export interface TierRefRow {
  field: string;
  values: [string, string, string, string]; // Base, Enhanced, Superior, Ultimate
}

export const TIER_REFERENCE: Record<PowerKey, TierRefRow[]> = {
  tornado: [
    { field: "Self-heal", values: ["2d8", "3d8", "4d8", "4d8"] },
    { field: "Contact", values: ["2d6", "2d6", "4d6", "4d6"] },
    { field: "Funnel tick (per caught)", values: ["1d6", "1d6", "1d6", "1d6"] },
    { field: "Max caught", values: ["3", "4", "4", "5"] },
    { field: "Suction DC", values: ["16", "16", "21 (+5)", "21"] },
    { field: "HP gate", values: ["≤25%", "≤50%", "≤75%", "any"] },
    { field: "Duration", values: ["3 turns", "3", "3", "4 +Dazed"] },
  ],
  thunder: [
    { field: "Spiritual Weapons", values: ["1", "2", "3", "4"] },
    { field: "Origin blast", values: ["2d6 thunder", "2d6", "3d6", "3d6"] },
    { field: "Teleport line", values: ["2d6 shock", "3d6", "3d6", "3d6"] },
    { field: "Chaining", values: ["—", "2", "3", "4"] },
    { field: "Full-circle bonus", values: ["—", "—", "—", "+3d10 shock"] },
  ],
  coral: [
    { field: "Formations", values: ["1", "2", "3", "3"] },
    { field: "Ally melee bonus", values: ["+1d4", "+1d4", "+1d4", "+2d4"] },
    { field: "Field Shock bonus", values: ["+1 die", "+1", "+1", "+2 dice"] },
    { field: "Arc between formations", values: ["—", "2d6 DEX½", "3d6", "3d6"] },
  ],
  bull: [{ field: "STR bonus (total)", values: ["+1", "+2", "+3", "+4"] }],
  owl: [{ field: "WIS bonus (total)", values: ["+1", "+2", "+3", "+4"] }],
  stormBorn: [{ field: "Shock defence", values: ["Resistance", "Immunity", "Absorb", "Absorb + slot"] }],
};

/** Chip colour mapping for damage types (brief §5.3). */
export const TYPE_CLASS: Record<DamageType, string> = {
  shock: "sh",
  thunder: "th",
  heal: "he",
  bludgeon: "",
  generic: "",
};
