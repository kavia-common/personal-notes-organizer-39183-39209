export function uid(prefix = ''): string {
  // Simple uid using timestamp + random; deterministic enough for client use
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300): T {
  let timer: number | null = null;
  return function (this: any, ...args: any[]) {
    const g: any = (typeof globalThis !== 'undefined') ? globalThis : {};
    const _clear = g.clearTimeout ? g.clearTimeout.bind(g) : (h: any) => {};
    const _set = g.setTimeout ? g.setTimeout.bind(g) : ((cb: any, d: number) => 0);
    if (timer !== null) {
      _clear(timer);
    }
    timer = _set(() => fn.apply(this, args), delay);
  } as T;
}
