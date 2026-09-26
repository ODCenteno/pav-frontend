/**
 * Disclosure behavior for the desktop "Nuestras Comunidades" submenu.
 *
 * - Opens on pointer hover and when focus enters the item; closes when both
 *   leave.
 * - The toggle button also opens/closes it on click (keyboard); a click while
 *   hovering keeps it open.
 * - Escape closes it and returns focus to the toggle.
 * - `aria-expanded` on the toggle always mirrors the `is-open` class.
 *
 * Returns a cleanup function that removes every listener, so re-running on
 * `astro:page-load` never stacks handlers.
 */
export function initCommunityMenu(item: HTMLElement): () => void {
  const toggle = item.querySelector<HTMLButtonElement>("[aria-controls]");
  if (!toggle) return () => {};

  let hovered = false;
  let focused = false;

  const setOpen = (open: boolean) => {
    item.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  const sync = () => setOpen(hovered || focused);

  const onMouseEnter = () => {
    hovered = true;
    sync();
  };
  const onMouseLeave = () => {
    hovered = false;
    sync();
  };
  const onFocusIn = () => {
    focused = true;
    sync();
  };
  const onFocusOut = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && item.contains(event.relatedTarget)) return;
    focused = false;
    sync();
  };
  const onClick = () => {
    // Pointer users already opened it by hovering; a click must not close it.
    if (hovered) {
      setOpen(true);
      return;
    }
    focused = toggle.getAttribute("aria-expanded") !== "true";
    setOpen(focused);
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !item.classList.contains("is-open")) return;
    event.preventDefault();
    toggle.focus();
    // Returning focus to the toggle fires focusin; close after it.
    hovered = false;
    focused = false;
    setOpen(false);
  };

  item.addEventListener("mouseenter", onMouseEnter);
  item.addEventListener("mouseleave", onMouseLeave);
  item.addEventListener("focusin", onFocusIn);
  item.addEventListener("focusout", onFocusOut);
  item.addEventListener("keydown", onKeyDown);
  toggle.addEventListener("click", onClick);

  return () => {
    item.removeEventListener("mouseenter", onMouseEnter);
    item.removeEventListener("mouseleave", onMouseLeave);
    item.removeEventListener("focusin", onFocusIn);
    item.removeEventListener("focusout", onFocusOut);
    item.removeEventListener("keydown", onKeyDown);
    toggle.removeEventListener("click", onClick);
  };
}
