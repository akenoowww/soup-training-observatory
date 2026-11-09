# Final native-GC interaction soak

Result: **completed**, with zero page errors and zero browser console errors. This is short local retained-memory evidence, not a guarantee that no slower leak exists.

- Build assets: `./assets/app-DsJyw_oe.js, ./assets/client-Saz_VHki.css, ./assets/app-DfZOBv6h.css`.
- Browser: 156.0.8078.81; desktop 1440 x 1000, no CPU throttling.
- Actual duration: 217.1 seconds, including 180 seconds paced activity and 35 seconds idle recovery.
- Completed active iterations: 136, covering all 20 synthetic runs.
- Counted business actions: 546: 136 run switches, 136 numeric range submissions, 136 keyboard inspections, 92 scale changes and 46 zoom resets. These are not a count of individual DOM events; checkpoint normalization actions are additional.

| Normalized checkpoint | V8 heap + backing stores | Worker backing stores | Renderer RSS, approximate |
| --- | ---: | ---: | ---: |
| warmup-full-1M | 38.816 MB | 32.318 MB | 556.745 MB |
| active-31s | 43.417 MB | 32.318 MB | 473.973 MB |
| active-61s | 43.721 MB | 32.318 MB | 495.256 MB |
| active-91s | 44.369 MB | 32.318 MB | 501.826 MB |
| active-121s | 44.780 MB | 32.318 MB | 507.593 MB |
| active-151s | 44.928 MB | 32.318 MB | 510.525 MB |
| after-active | 44.675 MB | 32.318 MB | 500.793 MB |
| after-idle-recovery | 41.431 MB | 32.318 MB | 496.763 MB |

Main/worker GC was requested at each checkpoint. Each checkpoint reloads run002 then run001, restores the full run001 domain and linear scale, so the canonical worker LRU holds the same source runs. The million-point worker backing stores remained approximately 32.318 MB throughout. Document DOM counts stayed at 397 live elements, about 651 total nodes, 240 event listeners and three chart canvases after warmup.

The largest measured combined allocation was 44.928 MB. After idle it was 41.431 MB, 2.615 MB above initial warmup. This bounded three-minute run did not reproduce the interim custom-pruner refetch storm, but the remaining increase must not be advertised as proof of zero leaks. V8/backing stores exclude native/GPU allocations. Renderer RSS includes all renderers in the isolated one-page browser and may include spare renderer/allocator overhead. See the orchestration note for small concurrent non-browser work.

## Preserved history

- `../../baseline-oldcache/2026-11-09T20-37-54-135Z/`: initial release, 90 active + 35 idle seconds; 75 iterations and all20 runs; combined 39.05 MB warmup, 52.74 MB maximum and 48.70 MB after idle. Its original inactive-view TTL was 60 seconds.
- `../../final-bounded-cache/2026-11-09T20-52-15-274Z/`: failed interim custom-pruner candidate. Combined retained allocation reached 494.82 MB, while worker backing and chart DOM counts remained stable. The original timeout also revealed an independent harness row-order assumption. Both findings remain documented there.
- `../../retention-diagnostic/2026-11-09T20-55-59-017Z/`: bounded allocation sampling of that failed candidate; about 213.30 MB sampled retained allocation attributed to worker-response handling. An actual QueryObserver transition regression independently exposed the custom pruner orphaning a newly created query.
- `../../final-native-gc-probe/2026-11-09T20-58-00-388Z/`: fixed native-GC candidate, 30 active +15 idle seconds, all20 runs, zero browser errors; 38.92 ->43.41 ->40.34 MB.

The custom query pruner was removed in favor of the library's normal 10-second inactive-query GC. The failed artifacts were not replaced by the final result. Raw measurements and exact scope remain in each original JSON.
