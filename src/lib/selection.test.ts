import { describe, expect, it } from "vitest";
import { poolForToday, pickRandom, type Member } from "./selection";

const members: Member[] = [
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

  it("returns empty array when all members are on vacation", () => {
    const allVacation: Member[] = [
      { id: "1", name: "A", vacation: true },
      { id: "2", name: "B", vacation: true },
    ];
    const pool = poolForToday(allVacation, null);
    expect(pool).toEqual([]);
  });

  it("returns all members when none are on vacation", () => {
    const noVacation: Member[] = [
      { id: "1", name: "A", vacation: false },
      { id: "2", name: "B", vacation: false },
      { id: "3", name: "C", vacation: false },
    ];
    const pool = poolForToday(noVacation, null);
    expect(pool.length).toBe(3);
    expect(pool.map((m) => m.id)).toEqual(["1", "2", "3"]);
  });

  it("handles empty members array", () => {
    const pool = poolForToday([], null);
    expect(pool).toEqual([]);
  });

  it("preserves member properties in filtered result", () => {
    const pool = poolForToday(members, null);
    expect(pool[0]).toHaveProperty("id");
    expect(pool[0]).toHaveProperty("name");
    expect(pool[0]).toHaveProperty("vacation");
    expect(pool[0]?.vacation).toBe(false);
  });
});

describe("pickRandom", () => {
  it("returns null for empty array", () => {
    expect(pickRandom([])).toBeNull();
  });

  it("returns item from list", () => {
    const result = pickRandom(["a", "b", "c"]);
    expect(["a", "b", "c"]).toContain(result);
  });

  it("returns the only item from single-item array", () => {
    expect(pickRandom(["single"])).toBe("single");
  });

  it("returns one of the items from array (statistical test)", () => {
    const items = ["a", "b", "c", "d", "e"];
    const results = new Set();
    // Запускаем много раз, чтобы проверить, что все элементы могут быть выбраны
    for (let i = 0; i < 100; i++) {
      const result = pickRandom(items);
      if (result) results.add(result);
    }
    // Должны быть выбраны разные элементы (хотя бы 2 из 5)
    expect(results.size).toBeGreaterThan(1);
  });

  it("handles array of numbers", () => {
    const result = pickRandom([1, 2, 3, 4, 5]);
    expect([1, 2, 3, 4, 5]).toContain(result);
  });

  it("handles array of objects", () => {
    const objects = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = pickRandom(objects);
    expect(objects).toContain(result);
  });
});

