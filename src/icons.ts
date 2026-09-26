const paths: Record<string, string> = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2 6-6 2 2-6 6-2Z"/>',
  book: '<path d="M4 4h6c1 0 2 1 2 2 0-1 1-2 2-2h6v15h-6c-1 0-2 1-2 2-0-1-1-2-2-2H4V4Z"/><path d="M12 6v15"/>',
  bag: '<path d="M8 7V5a4 4 0 0 1 8 0v2M7 7h10a3 3 0 0 1 3 3v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a3 3 0 0 1 3-3Z"/><rect x="8" y="13" width="8" height="5" rx="1"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  sound:
    '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  leaf: '<path d="M20 3c-7 0-15 1-15 9a7 7 0 0 0 7 7c8 0 8-9 8-16Z"/><path d="m3 21 12-12"/>',
  sparkles:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2m0 3h.01"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  potion:
    '<path d="M9 3h6m-5 0v5l-5 8c-1 2 0 5 3 5h8c3 0 4-3 3-5l-5-8V3M7 15h10"/><path d="M10 17h4m-2-2v4"/>',
  heart:
    '<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-4 4 1 10 8 15 7-5 12-11 8-15Z"/>',
  flag: '<path d="M5 21V3m0 1c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
  trophy:
    '<path d="M8 3h8v7a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v6m-4 1h8"/>',
  refresh:
    '<path d="M20 7V2m0 5h-5M4 17v5m0-5h5M5 7a8 8 0 0 1 13-2l2 2M4 17l2 2a8 8 0 0 0 13-2"/>',
  keyboard:
    '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10"/>',
};
export function icon(name: string, size = 20): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.sparkles}</svg>`;
}
export function ball(size = 22): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M2.5 12h19a9.5 9.5 0 0 1-19 0" fill="#fff"/><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="#fff" stroke="currentColor" stroke-width="2"/></svg>`;
}
