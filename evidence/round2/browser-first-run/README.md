# Initial adversarial browser run

This is the initial execution against the prior production build, before second-round UI changes. Eight scenarios passed; four failed.

- Two failures (320px and390px) expose the same real defect: transformed closed navigation remained keyboard-focusable off screen.
- The drag test successfully changed the shared numeric range, then failed because the old chart lacked the new renderer-derived axis diagnostics the strengthened assertion expected. This is an instrumentation/evidence gap, not proof that dragging itself failed.
- The keyboard End test contained an incorrect hardcoded expected boundary16199; the actual inclusive range rounded its upper bound up to16200. The revised test derives the boundary from the explicit requested End step and checks keyboard inspection agrees.

The original output, JSON, screenshots and traces remain unchanged here. Later passing output must not be read as erasing this chronology.
