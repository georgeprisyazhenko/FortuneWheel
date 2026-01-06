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
});

