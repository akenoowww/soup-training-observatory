import { useLayoutEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  children: ReactNode;
  className: string;
  label?: string;
  labelledBy?: string;
  onDismiss: () => void;
}

/** Native modal behavior supplies focus containment and an inert background. */
export function Dialog({ children, className, label, labelledBy, onDismiss }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element.showModal();
    return () => {
      element.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={className}
      aria-label={label}
      aria-labelledby={labelledBy}
      onKeyDown={(event) => {
        if (event.key !== 'Tab' || event.metaKey || event.ctrlKey || event.altKey) return;
        // WebKit on macOS may skip buttons according to system keyboard settings.
        // Keep this modal's explicit controls reachable consistently across engines.
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]',
          ),
        ).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
        if (!controls.length) return;
        event.preventDefault();
        const current = controls.indexOf(document.activeElement as HTMLElement);
        const next =
          current < 0
            ? event.shiftKey
              ? controls.length - 1
              : 0
            : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[next]?.focus();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss();
      }}
    >
      {children}
    </dialog>
  );
}
