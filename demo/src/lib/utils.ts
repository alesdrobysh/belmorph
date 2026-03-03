export function cap(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
