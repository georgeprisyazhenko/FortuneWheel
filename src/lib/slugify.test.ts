import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("transliterates russian and normalizes", () => {
    expect(slugify("Команда Аналитики")).toBe("komanda-analitiki");
    expect(slugify("QA / Mobile")).toBe("qa-mobile");
  });

  it("collapses dashes and trims", () => {
    expect(slugify("  test -- name  ")).toBe("test-name");
  });

  it("fallback to team when empty", () => {
    expect(slugify("")).toBe("team");
  });

  it("handles only whitespace", () => {
    expect(slugify("   ")).toBe("team");
    expect(slugify("\t\n")).toBe("team");
  });

  it("transliterates all russian letters correctly", () => {
    expect(slugify("АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ")).toBe("abvgdeezhziiklmnoprstufhcchshschyeyuya");
    expect(slugify("абвгдеёжзийклмнопрстуфхцчшщъыьэюя")).toBe("abvgdeezhziiklmnoprstufhcchshschyeyuya");
  });

  it("handles special characters", () => {
    expect(slugify("Team@#$%^&*()Name")).toBe("team-name");
    expect(slugify("Test!!!Name???")).toBe("test-name");
  });

  it("preserves alphanumeric characters", () => {
    expect(slugify("Team123Name")).toBe("team123name");
    expect(slugify("Test-Name-2024")).toBe("test-name-2024");
  });

  it("handles mixed languages", () => {
    expect(slugify("Команда Team 123")).toBe("komanda-team-123");
    expect(slugify("Frontend / Backend")).toBe("frontend-backend");
  });

  it("respects maxLen parameter", () => {
    const longString = "a".repeat(100);
    const result = slugify(longString, 20);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("handles default maxLen when not specified", () => {
    const longString = "a".repeat(100);
    const result = slugify(longString);
    expect(result.length).toBeLessThanOrEqual(50);
  });

  it("removes leading and trailing dashes", () => {
    expect(slugify("-test-")).toBe("test");
    expect(slugify("---test---")).toBe("test");
  });

  it("handles multiple consecutive dashes", () => {
    expect(slugify("test---name")).toBe("test-name");
    expect(slugify("a---b---c")).toBe("a-b-c");
  });

  it("handles edge cases with numbers only", () => {
    expect(slugify("123")).toBe("123");
    expect(slugify("  123  ")).toBe("123");
  });

  it("handles unicode characters that are not in translit map", () => {
    expect(slugify("中文")).toBe("team"); // Falls back to team if no valid chars
    expect(slugify("日本語")).toBe("team");
  });

  it("handles case sensitivity", () => {
    expect(slugify("TEAM NAME")).toBe("team-name");
    expect(slugify("Team Name")).toBe("team-name");
    expect(slugify("team name")).toBe("team-name");
  });
});

