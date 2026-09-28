import { describe, it, expect } from "vitest";
import { textParagraphs } from "../textParagraphs";

describe("textParagraphs", () => {
  it("splits plain text into paragraphs on blank lines", () => {
    expect(textParagraphs("First line\nstill first.\n\nSecond.\n\n\n  Third.  ")).toEqual([
      "First line\nstill first.",
      "Second.",
      "Third.",
    ]);
  });

  it("returns nothing for empty, blank or missing text", () => {
    expect(textParagraphs(undefined)).toEqual([]);
    expect(textParagraphs("")).toEqual([]);
    expect(textParagraphs(" \n\n  ")).toEqual([]);
  });

  it("normalizes Windows line endings", () => {
    expect(textParagraphs("A\r\n\r\nB")).toEqual(["A", "B"]);
  });
});
