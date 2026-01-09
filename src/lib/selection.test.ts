import { describe, expect, it } from "vitest";
import { poolForToday, pickRandom } from "./selection";

const members = [
  { id: "1", name: "A", vacation: false },
  { id: "2", name: "B", vacation: false },
  { id: "3", name: "C", vacation: true },
];

describe("poolForToday", () => {
  it("filters only vacation members", () => {
    const pool = poolForToday(members, null);
    expect(pool.map((m) => m.id)).toEqual(["1", "2"]);
  });

  it("includes all non-vacation members regardless of lastWinnerId", () => {
    const pool = poolForToday(members, "1");
    expect(pool.map((m) => m.id)).toEqual(["1", "2"]); // lastWinnerId не влияет
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

