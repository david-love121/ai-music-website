// src/lib/sizing.ts
// A small utility to keep a single source of truth for canvas sizing with DPR and ResizeObserver.
// Usage:
// const dispose = makeSizer(hostElement, (w, h, dpr) => { /* handle resize */ });
// dispose() to disconnect the observer when unmounting.

// Allow global override for max DPR by setting window.__MAX_DPR or data-max-dpr on <html>
export function getEffectiveDpr(maxCap = 2): number {
  const w = typeof window !== 'undefined' ? (window as any) : undefined;
  const override = w?.__MAX_DPR;
  const attr = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-max-dpr')
    : undefined;
  const cap = Number.isFinite(override) ? Number(override)
    : (attr ? Number(attr) : maxCap);
  const device = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  return Math.min(device, cap || maxCap);
}

export function makeSizer(
  host: HTMLElement,
  onSize: (w: number, h: number, dpr: number) => void
) {
  const update = () => {
    const { clientWidth: w, clientHeight: h } = host;
    const dpr = getEffectiveDpr(2);
    if (w > 0 && h > 0) onSize(w, h, dpr);
  };

  const ro = new ResizeObserver(update);
  ro.observe(host);

  // initial tick
  update();

  return () => ro.disconnect();
}
