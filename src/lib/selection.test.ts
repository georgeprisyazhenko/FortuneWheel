import { describe, expect, it } from "vitest";
import { poolForToday, pickRandom } from "./selection";

const members = [
  { id: "1", name: "A", vacation: false },
  { id: "2", name: "B", vacation: false },
  { id: "3", name: "C", vacation: true },
];

describe("poolForToday", () => {
  it("filters vacation and last winner", () => {
    const pool = poolForToday(members, "1");
    expect(pool.map((m) => m.id)).toEqual(["2"]);
  });
});

describe("pickRandom", () => {
  it("returns null for empty", () => {
    expect(pickRandom([])).toBeNull();
  });

  it("returns item from list", () => {
    const result = pickRandom(["a", "b", "c"]);
    expect(["a", "b", "c"]).toContain(result);
  });
});

