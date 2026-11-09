import type { Page } from '@playwright/test';

/** Passive test-side diagnostics only: real input and application state are never
 * synthesized or changed by the observer. The event buffer is deliberately bounded. */
export async function installDragObserver(page: Page) {
  await page.evaluate(() => {
    const describe = (target: EventTarget | null) =>
      target instanceof Element
        ? {
            tag: target.tagName,
            class: target.getAttribute('class'),
            label: target.getAttribute('aria-label'),
          }
        : {
            tag: target === window ? 'window' : target === document ? 'document' : null,
            class: null,
            label: null,
          };
    const snapshot = () => {
      const root = document.querySelector('[data-run-id]');
      const chart = document.querySelector('[data-testid="chart-grad_norm"]');
      const selection = chart?.querySelector<HTMLElement>('.u-select');
      return {
        time: performance.now(),
        url: location.href,
        ready: root?.getAttribute('data-ready'),
        busy: chart?.closest('.metric-chart')?.getAttribute('aria-busy'),
        xMin: chart?.getAttribute('data-x-min'),
        xMax: chart?.getAttribute('data-x-max'),
        selectionWidth: Number.parseFloat(selection?.style.width || '0'),
        selectionStyle: selection?.getAttribute('style'),
        documentHasFocus: document.hasFocus(),
        active: describe(document.activeElement),
        scroll: { x: scrollX, y: scrollY },
        viewport: { width: innerWidth, height: innerHeight },
      };
    };
    const store = { events: [] as unknown[], phases: [] as unknown[], snapshot };
    Object.defineProperty(window, '__soupObservedDrag', { value: store, configurable: true });
    for (const type of [
      'pointerdown',
      'pointermove',
      'pointerup',
      'mousedown',
      'mousemove',
      'mouseup',
      'scroll',
      'focus',
      'blur',
      'focusin',
      'focusout',
    ]) {
      window.addEventListener(
        type,
        (event) => {
          if (store.events.length >= 500) return;
          const pointer = event instanceof MouseEvent ? event : null;
          store.events.push({
            ...snapshot(),
            type: event.type,
            trusted: event.isTrusted,
            target: describe(event.target),
            clientX: pointer?.clientX,
            clientY: pointer?.clientY,
            movementX: pointer?.movementX,
            movementY: pointer?.movementY,
            button: pointer?.button,
            buttons: pointer?.buttons,
          });
        },
        { capture: true, passive: true },
      );
    }
  });
}

export async function recordDragPhase(page: Page, phase: string, details?: unknown) {
  await page.evaluate(
    ({ phase, details }) => {
      const store = (
        window as unknown as { __soupObservedDrag: { phases: unknown[]; snapshot: () => unknown } }
      ).__soupObservedDrag;
      store.phases.push({ phase, state: store.snapshot(), details });
    },
    { phase, details },
  );
}

export async function readDragObservations(page: Page) {
  return page.evaluate(() => {
    const store = (
      window as unknown as { __soupObservedDrag: { events: unknown[]; phases: unknown[] } }
    ).__soupObservedDrag;
    return { events: store.events, phases: store.phases };
  });
}
