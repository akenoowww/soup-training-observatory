# Interim candidate failed the soak

This directory is the original result for the interim `app-CdawIVe3.js` candidate with the custom inactive-query pruner. It is not the final fixed release.

After 19 completed active iterations and a normalized 1M-point checkpoint:

- Main document V8 heap: 461,691,324 bytes (after requested GC).
- Main backing stores: 417,044 bytes.
- Worker V8 heap: 398,148 bytes.
- Worker backing stores: 32,317,969 bytes.
- Combined: 494,824,485 bytes; renderer RSS approximately 1.85 GB.
- The document still had three chart canvases and no tooltip.

The script later timed out for a separate harness defect. At wraparound it clicked the first row and expected run001. Corrected snapshot chronology had made another run the most recent row. The harness was changed to select the run001 link explicitly. This timeout does not invalidate the earlier recorded memory growth, and it must not be misreported as a production routing failure.

The independent bounded allocation diagnostic is retained in the sibling `retention-diagnostic` tree. Root then reproduced a custom-cache-pruner / QueryObserver transition defect and removed the custom pruner. A later fixed-build run is separate; no measurements here have been replaced.
