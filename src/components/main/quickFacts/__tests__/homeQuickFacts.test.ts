import { describe, it, expect } from "vitest";
import { homeQuickFacts } from "../homeQuickFacts";

const fact = (title: string) => ({ title, value: "v", description: "d" });

describe("homeQuickFacts", () => {
  it("drops the sixth bento slot, the 'Qué hacer' box", () => {
    const items = ["Loreto", "La Paz", "Época", "Islas", "Especies", "Qué hacer"].map(fact);
    expect(homeQuickFacts(items).map((f) => f.title)).toEqual(["Loreto", "La Paz", "Época", "Islas", "Especies"]);
  });

  it("keeps shorter lists untouched", () => {
    const items = ["A", "B"].map(fact);
    expect(homeQuickFacts(items)).toEqual(items);
  });
});
