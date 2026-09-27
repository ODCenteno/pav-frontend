import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createToastController, TOAST_AUTO_HIDE_MS } from "../toastController";

function fakeToast() {
  return { toast: { hidden: true }, message: { textContent: "" } };
}

describe("createToastController", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("auto-dismisses a transient toast after about 5 seconds", () => {
    expect(TOAST_AUTO_HIDE_MS).toBe(5000);
    const els = fakeToast();
    const toast = createToastController(() => els);
    toast.show("Ready offline", "PRECACHE_COMPLETE");
    expect(els.toast.hidden).toBe(false);
    expect(els.message.textContent).toBe("Ready offline");
    vi.advanceTimersByTime(4999);
    expect(els.toast.hidden).toBe(false);
    vi.advanceTimersByTime(1);
    expect(els.toast.hidden).toBe(true);
  });

  it("keeps a sticky toast until the visitor closes it", () => {
    const els = fakeToast();
    const toast = createToastController(() => els);
    toast.show("New version", "SW_UPDATED", { sticky: true });
    vi.advanceTimersByTime(60_000);
    expect(els.toast.hidden).toBe(false);
    toast.close();
    expect(els.toast.hidden).toBe(true);
  });

  it("does not show a message type again after the visitor dismissed it", () => {
    const els = fakeToast();
    const toast = createToastController(() => els);
    toast.show("Ready offline", "PRECACHE_COMPLETE");
    toast.close();
    toast.show("Ready offline", "PRECACHE_COMPLETE");
    expect(els.toast.hidden).toBe(true);
  });

  it("restarts the timer when a new message replaces the current one", () => {
    const els = fakeToast();
    const toast = createToastController(() => els);
    toast.show("A", "PRECACHE_COMPLETE");
    vi.advanceTimersByTime(4000);
    toast.show("B", "OTHER");
    vi.advanceTimersByTime(4000);
    expect(els.toast.hidden).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(els.toast.hidden).toBe(true);
  });

  it("does nothing when the toast is not on the page", () => {
    const toast = createToastController(() => null);
    expect(() => toast.show("A", "X")).not.toThrow();
    expect(() => toast.close()).not.toThrow();
  });
});
