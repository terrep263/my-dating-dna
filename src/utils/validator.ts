// emailValid.ts
export function isValidEmail(email: string) {
  const e = email.trim();

  // overall length guard (common provider limits)
  if (e.length === 0 || e.length > 254) return false;

  const at = e.lastIndexOf("@");
  if (at <= 0 || at === e.length - 1) return false; // needs local@domain

  const local = e.slice(0, at);
  const domain = e.slice(at + 1);

  if (local.length > 64) return false;

  // local part: no spaces, no consecutive dots, no leading/trailing dot
  if (
    !/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  )
    return false;

  // domain: labels 1–63 chars, letters/digits/hyphen, no leading/trailing hyphen
  const labels = domain.split(".");
  if (labels.length < 2) return false; // need a TLD
  if (labels.some((l) => l.length === 0 || l.length > 63)) return false;
  if (labels.some((l) => !/^[A-Za-z0-9-]+$/.test(l))) return false;
  if (labels.some((l) => l.startsWith("-") || l.endsWith("-"))) return false;

  // TLD at least 2 chars
  if (labels[labels.length - 1].length < 2) return false;

  return true;
}
