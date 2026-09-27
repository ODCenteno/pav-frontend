/** Transient toasts hide on their own after this delay. */
export const TOAST_AUTO_HIDE_MS = 5000;

interface ToastElements {
  toast: { hidden: boolean | string };
  message: { textContent: string | null };
}

/**
 * Show/close logic for the offline-ready toast. Elements are looked up on
 * every call so it survives view-transition page swaps. A message type the
 * visitor closed is not shown again in this session.
 */
export function createToastController(getElements: () => ToastElements | null, delay = TOAST_AUTO_HIDE_MS) {
  const dismissed = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let currentType: string | null = null;

  const clear = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return {
    show(text: string, type: string, { sticky = false }: { sticky?: boolean } = {}) {
      const els = getElements();
      if (!els || dismissed.has(type)) return;
      currentType = type;
      els.message.textContent = text;
      els.toast.hidden = false;
      clear();
      if (!sticky) {
        timer = setTimeout(() => {
          const current = getElements();
          if (current) current.toast.hidden = true;
        }, delay);
      }
    },
    close() {
      clear();
      if (currentType) dismissed.add(currentType);
      const els = getElements();
      if (els) els.toast.hidden = true;
    },
  };
}
