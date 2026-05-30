import { describe, it, expect } from "vitest";
import { rollPower, inputsFor, passiveValue } from "./powers";
import type { Rng } from "./dice";

const max: Rng = () => 0.999; // every die rolls its maximum face

describe("Storm Tornado @ Superior (level 3)", () => {
  it("rolls 4d8 heal (separate) + 4d6 contact + 1d6×caught, heal excluded from damage", () => {
    const out = rollPower("tornado", 3, { caught: 2 }, max);
    const [heal, contact, tick] = out.effects;
    expect(heal.heal).toBe(true);
    expect(heal.faces).toHaveLength(4); // 4d8
    expect(contact.faces).toHaveLength(4); // 4d6 (player's Superior choice)
    expect(tick.faces).toHaveLength(2); // 1d6 × 2 caught
    expect(out.healTotal).toBe(32); // 4×8
    expect(out.damageTotal).toBe(24 + 12); // 4d6 max + 2×6
  });

  it("caught input is capped to max-caught (4) at Superior and defaults to 2", () => {
    const [caught] = inputsFor("tornado", 3);
    expect(caught.val).toBe(2);
    expect(caught.max).toBe(4);
  });
});

describe("Thunder Step @ Superior (level 3)", () => {
  it("has no inputs", () => {
    expect(inputsFor("thunder", 3)).toEqual([]);
  });

  it("origin blast is 3d6 thunder, labelled CON ½, and NOT auto-halved", () => {
    const out = rollPower("thunder", 3, {}, max);
    const origin = out.effects[0];
    expect(origin.type).toBe("thunder");
    expect(origin.faces).toHaveLength(3); // 3d6 (player's docx choice)
    expect(origin.note).toMatch(/CON ½/);
    expect(origin.subtotal).toBe(18); // raw 3×6, not halved
  });

  it("teleport line is 3d6 shock", () => {
    const line = rollPower("thunder", 3, {}, max).effects[1];
    expect(line.type).toBe("shock");
    expect(line.faces).toHaveLength(3);
  });
});

describe("Static Coral @ Base (level 1)", () => {
  it("rolls 1d4×hits shock and adds a non-rolling field-bonus reminder", () => {
    const out = rollPower("coral", 1, { hits: 3 }, max);
    const melee = out.effects[0];
    const field = out.effects[1];
    expect(melee.faces).toHaveLength(3); // 1d4 × 3
    expect(melee.subtotal).toBe(12);
    expect(field.rolling).toBe(false);
    expect(field.subtotal).toBeNull();
    expect(out.damageTotal).toBe(12);
  });

  it("hits=0 yields no melee dice and zero damage", () => {
    const out = rollPower("coral", 1, { hits: 0 }, max);
    expect(out.effects[0].faces).toHaveLength(0);
    expect(out.damageTotal).toBe(0);
  });
});

describe("passive values (totals, not additive)", () => {
  it("Bull's Strength Enhanced = +2 STR total", () => {
    expect(passiveValue("bull", 2)).toBe("+2 STR");
  });
  it("Storm Born Superior = Absorb", () => {
    expect(passiveValue("stormBorn", 3)).toBe("Absorb");
  });
  it("locked power shows —", () => {
    expect(passiveValue("owl", 0)).toBe("—");
  });
});
