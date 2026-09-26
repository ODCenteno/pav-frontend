/**
 * Phone number helpers (redesign contract §5b).
 *
 * The view model stores `phone` / `whatsapp` as E.164 strings
 * (`+52XXXXXXXXXX`). Every tel: / wa.me link and every displayed number goes
 * through this module so the rules live in one place.
 *
 * Legacy free-text values are normalized with the same rules as the backend
 * migration (digits only, then):
 *   - 13 digits starting with `521` → `+52` + last 10 digits
 *   - 12 digits starting with `52`  → `+52` + last 10 digits
 *   - 10 digits                     → `+52` + the 10 digits
 *   - anything else                 → cannot be normalized (undefined)
 */

const DEFAULT_COUNTRY_CODE = '+52';
const COUNTRY_CODE_RE = /^\+[1-9]\d{0,2}$/;
const NATIONAL_NUMBER_RE = /^\d{10}$/;
/** An already composed number: country code (1-3 digits) + 10-digit national number. */
const E164_RE = /^\+[1-9]\d{10,12}$/;

/** Normalize a legacy free-text Mexican number to E.164, or undefined. */
export function normalizePhone(value?: string | null): string | undefined {
  const digits = (value ?? '').replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('521')) return `+52${digits.slice(3)}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+52${digits.slice(2)}`;
  if (digits.length === 10) return `+52${digits}`;
  return undefined;
}

/**
 * Compose E.164 from the contract fields (`*CountryCode` + `*Number`). An
 * empty or invalid country code falls back to the `+52` schema default; a
 * national number that is not exactly 10 digits yields undefined.
 */
export function composePhone(
  countryCode?: string | null,
  nationalNumber?: string | null,
): string | undefined {
  const number = (nationalNumber ?? '').trim();
  if (!NATIONAL_NUMBER_RE.test(number)) return undefined;
  const code = (countryCode ?? '').trim();
  return `${COUNTRY_CODE_RE.test(code) ? code : DEFAULT_COUNTRY_CODE}${number}`;
}

/** Legacy rules first, then accept an already composed E.164 value. */
function toE164(value?: string | null): string | undefined {
  const normalized = normalizePhone(value);
  if (normalized) return normalized;
  const trimmed = (value ?? '').trim();
  return E164_RE.test(trimmed) ? trimmed : undefined;
}

/** `tel:+52XXXXXXXXXX`, or undefined when the number cannot be normalized. */
export function telHref(value?: string | null): string | undefined {
  const e164 = toE164(value);
  return e164 ? `tel:${e164}` : undefined;
}

/** `https://wa.me/52XXXXXXXXXX` (no `+`), or undefined. */
export function whatsappHref(value?: string | null): string | undefined {
  const e164 = toE164(value);
  return e164 ? `https://wa.me/${e164.slice(1)}` : undefined;
}

/** Display form `+52 XXX XXX XXXX`, or undefined. */
export function formatPhone(value?: string | null): string | undefined {
  const e164 = toE164(value);
  if (!e164) return undefined;
  const national = e164.slice(-10);
  const code = e164.slice(0, -10);
  return `${code} ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}
