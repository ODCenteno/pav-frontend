import { describe, it, expect } from "vitest";
import { feedIndex } from "../feedPosition";

describe("feedIndex", () => {
  it("returns the photo that fills the track at the scroll offset", () => {
    expect(feedIndex(0, 500, 8)).toBe(0);
    expect(feedIndex(1000, 500, 8)).toBe(2);
  });

  it("rounds to the nearest snapped photo", () => {
    expect(feedIndex(740, 500, 8)).toBe(1);
    expect(feedIndex(760, 500, 8)).toBe(2);
  });

  it("clamps to the photo range and survives an unmeasured track", () => {
    expect(feedIndex(99999, 500, 8)).toBe(7);
    expect(feedIndex(-20, 500, 8)).toBe(0);
    expect(feedIndex(300, 0, 8)).toBe(0);
    expect(feedIndex(300, 500, 0)).toBe(0);
  });
});
