import { describe, expect, it } from "vitest";
import { favoritesViewState } from "../favoritesView";

const cards = [
  { id: "1", category: "experiences" },
  { id: "2", category: "gastronomy" },
  { id: "3", category: "gastronomy" },
];

describe("favoritesViewState", () => {
  it("shows only favorite cards under 'all'", () => {
    expect(favoritesViewState(cards, ["1", "3"], "all")).toEqual({ visibleIds: ["1", "3"], empty: "none" });
  });

  it("combines the favorite and category filters", () => {
    expect(favoritesViewState(cards, ["1", "3"], "gastronomy")).toEqual({ visibleIds: ["3"], empty: "none" });
  });

  it("reports no favorites when nothing is saved", () => {
    expect(favoritesViewState(cards, [], "all")).toEqual({ visibleIds: [], empty: "no-favorites" });
  });

  it("treats saved ids that are no longer on the page as no favorites", () => {
    expect(favoritesViewState(cards, ["99"], "all")).toEqual({ visibleIds: [], empty: "no-favorites" });
  });

  it("reports no matches when favorites exist but none fit the chip", () => {
    expect(favoritesViewState(cards, ["1"], "crafts")).toEqual({ visibleIds: [], empty: "no-matches" });
  });
});
