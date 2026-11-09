# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: observatory.spec.ts >> run browser filters, searches, sorts, persists URL state, and recovers from empty results
- Location: tests/e2e/observatory.spec.ts:46:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 14
+ Received  + 14

  Array [
-   0.2392,
    0.2581,
+   0.4527,
+   3.5,
+   0.4582,
+   0.4808,
+   0.3371,
    0.2799,
+   0.3963,
    0.2874,
-   0.3168,
-   0.3204,
-   0.3371,
-   0.348,
-   0.3532,
-   0.3691,
-   0.3963,
+   0.2392,
    0.4277,
+   0.4517,
+   0.348,
    0.4466,
-   0.4517,
-   0.4527,
-   0.4582,
+   0.3204,
+   0.3691,
+   0.5211,
+   0.3168,
    0.463,
-   0.4808,
-   0.5211,
-   3.5,
+   0.3532,
  ]
```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - link "Skip to content" [ref=f1e4]:
    - /url: "#main"
  - complementary "Workspace" [ref=f1e5]:
    - link "Soup home" [ref=f1e7]:
      - /url: "#/"
      - generic [ref=f1e10]: soup.
    - generic [ref=f1e11]:
      - generic [ref=f1e12]: O
      - generic [ref=f1e13]:
        - strong [ref=f1e14]: Observatory
        - generic [ref=f1e15]: Demo workspace
    - button "Find a run ⌘ K" [ref=f1e16] [cursor=pointer]:
      - generic [ref=f1e20]: Find a run
      - generic [ref=f1e21]: ⌘ K
    - paragraph [ref=f1e22]: WORKSPACE
    - navigation "Main navigation" [ref=f1e23]:
      - link "Training runs 20" [ref=f1e24]:
        - /url: "#/"
        - generic [ref=f1e29]: Training runs
        - generic [ref=f1e30]: "20"
      - link "Field guide" [ref=f1e31]:
        - /url: "#/guide"
    - generic [ref=f1e38]:
      - generic [ref=f1e39]: PROJECT
      - generic [ref=f1e40]: Foundation models
      - generic [ref=f1e42]: 20 experiments · 3 metrics
    - generic [ref=f1e43]:
      - generic [ref=f1e47]:
        - strong [ref=f1e48]: A little room to experiment.
        - paragraph [ref=f1e49]: Explore synthetic runs. Your production training is untouched.
      - generic [ref=f1e50]:
        - generic [ref=f1e51]: SC
        - generic [ref=f1e52]:
          - strong [ref=f1e53]: Soup collective
          - generic [ref=f1e54]: Research workspace
  - generic [ref=f1e55]:
    - banner [ref=f1e56]:
      - generic [ref=f1e57]:
        - generic [ref=f1e58]: Foundation models
        - generic [ref=f1e59]: /
        - generic [ref=f1e60]: Training runs
      - generic [ref=f1e61]:
        - generic [ref=f1e62]: Synthetic data
        - button "Search runs" [ref=f1e65] [cursor=pointer]
        - generic [ref=f1e69]: SC
    - main [ref=f1e70]:
      - generic [ref=f1e71]:
        - generic [ref=f1e72]: THE EXPERIMENT LOG
        - generic [ref=f1e74]:
          - generic [ref=f1e75]:
            - heading "Every run. A clearer picture." [level=1] [ref=f1e76]
            - paragraph [ref=f1e77]: Your training experiments, with the whole story left in.
          - link "Explore a run" [ref=f1e78]:
            - /url: "#/runs/run-001"
        - generic [ref=f1e82]:
          - generic [ref=f1e83]:
            - generic [ref=f1e84]: Total experiments
            - generic [ref=f1e90]: "20"
            - generic [ref=f1e92]: Foundation models
          - generic [ref=f1e94]:
            - generic [ref=f1e95]: Running in snapshot
            - generic [ref=f1e99]: "05"
            - generic [ref=f1e101]: Frozen synthetic snapshot
          - generic [ref=f1e103]:
            - generic [ref=f1e104]: Completed
            - generic [ref=f1e108]: "09"
            - generic [ref=f1e110]: Finished in snapshot
          - generic [ref=f1e112]:
            - generic [ref=f1e113]: Runs with data issues
            - generic [ref=f1e117]: "08"
            - generic [ref=f1e119]: Worth a closer look
        - generic [ref=f1e121]:
          - generic [ref=f1e122]:
            - heading "Training runs" [level=2] [ref=f1e123]
            - generic [ref=f1e124]: "20"
          - generic [ref=f1e125]: Good decisions start with honest data.
        - generic [ref=f1e126]:
          - generic [ref=f1e127]:
            - group "Filter runs by status" [ref=f1e128]:
              - button "All runs 20" [ref=f1e129] [cursor=pointer]:
                - text: All runs
                - generic [ref=f1e130]: "20"
              - button "Running" [ref=f1e131] [cursor=pointer]
              - button "Completed" [ref=f1e132] [cursor=pointer]
              - button "Failed" [ref=f1e133] [cursor=pointer]
              - button "Stopped" [ref=f1e134] [cursor=pointer]
            - generic [ref=f1e135]:
              - generic [ref=f1e136]:
                - generic [ref=f1e140]: Search runs
                - textbox "Search runs" [ref=f1e141]:
                  - /placeholder: Search runs…
              - generic [ref=f1e142]:
                - generic [ref=f1e145]: Sort runs
                - combobox "Sort runs" [ref=f1e146]:
                  - option "Most recent"
                  - option "Lowest loss" [selected]
                  - option "Most steps"
                  - option "Name A–Z"
          - table [ref=f1e148]:
            - rowgroup [ref=f1e149]:
              - row [ref=f1e150]:
                - columnheader "Run name" [ref=f1e151]
                - columnheader "Status" [ref=f1e152]
                - columnheader "Loss" [ref=f1e153]
                - columnheader "Training steps" [ref=f1e154]
                - columnheader "Duration" [ref=f1e155]
                - columnheader "Started at UTC" [ref=f1e156]
                - columnheader "Data issues" [ref=f1e157]
            - rowgroup [ref=f1e159]:
              - row [ref=f1e160]:
                - cell [ref=f1e161]:
                  - link [ref=f1e162]:
                    - /url: "#/runs/run-002"
                    - generic [ref=f1e166]:
                      - strong [ref=f1e167]: mistral-7b-instruct-v3
                      - generic [ref=f1e168]: Mistral OpenHermes
                - cell "Running" [ref=f1e173]
                - cell "0.2392" [ref=f1e176]
                - cell "9.7K / 11.6K" [ref=f1e177]:
                  - generic [ref=f1e179]:
                    - text: 9.7K
                    - generic [ref=f1e180]: / 11.6K
                - cell "42m 53s" [ref=f1e183]
                - cell "Nov 9, 16:09" [ref=f1e184]
                - cell "—" [ref=f1e185]
              - row [ref=f1e186]:
                - cell [ref=f1e187]:
                  - link [ref=f1e188]:
                    - /url: "#/runs/run-003"
                    - generic [ref=f1e192]:
                      - strong [ref=f1e193]: bert-base-sentiment
                      - generic [ref=f1e194]: BERT SST-2
                - cell "Failed" [ref=f1e199]
                - cell "0.2581" [ref=f1e202]
                - cell "11.4K / 13.7K" [ref=f1e203]:
                  - generic [ref=f1e205]:
                    - text: 11.4K
                    - generic [ref=f1e206]: / 13.7K
                - cell "1h 5m" [ref=f1e209]
                - cell "Nov 9, 14:38" [ref=f1e210]
                - cell [ref=f1e211]:
                  - link "1 data issues in bert-base-sentiment" [ref=f1e212]:
                    - /url: "#/runs/run-003?tab=quality"
                    - text: "1"
              - row [ref=f1e215]:
                - cell [ref=f1e216]:
                  - link [ref=f1e217]:
                    - /url: "#/runs/run-001"
                    - generic [ref=f1e221]:
                      - strong [ref=f1e222]: llama-3.1-8b-finetune
                      - generic [ref=f1e223]: Llama 3.1 Alpaca
                - cell "Running" [ref=f1e228]
                - cell "0.2799" [ref=f1e231]
                - cell "1M / 1.2M" [ref=f1e232]:
                  - generic [ref=f1e234]:
                    - text: 1M
                    - generic [ref=f1e235]: / 1.2M
                - cell "5h 12m" [ref=f1e238]
                - cell "Nov 9, 12:47" [ref=f1e239]
                - cell [ref=f1e240]:
                  - link "1 data issues in llama-3.1-8b-finetune" [ref=f1e241]:
                    - /url: "#/runs/run-001?tab=quality"
                    - text: "1"
              - row [ref=f1e244]:
                - cell [ref=f1e245]:
                  - link [ref=f1e246]:
                    - /url: "#/runs/run-004"
                    - generic [ref=f1e250]:
                      - strong [ref=f1e251]: llama-3.1-8b-lr-sweep
                      - generic [ref=f1e252]: Llama 3.1 Alpaca
                - cell "Failed" [ref=f1e257]
                - cell "0.2874" [ref=f1e260]
                - cell "13.1K / 15.7K" [ref=f1e261]:
                  - generic [ref=f1e263]:
                    - text: 13.1K
                    - generic [ref=f1e264]: / 15.7K
                - cell "1h 28m" [ref=f1e267]
                - cell "Nov 9, 13:07" [ref=f1e268]
                - cell [ref=f1e269]:
                  - link "2 data issues in llama-3.1-8b-lr-sweep" [ref=f1e270]:
                    - /url: "#/runs/run-004?tab=quality"
                    - text: "2"
              - row [ref=f1e273]:
                - cell [ref=f1e274]:
                  - link [ref=f1e275]:
                    - /url: "#/runs/run-005"
                    - generic [ref=f1e279]:
                      - strong [ref=f1e280]: vit-base-imagenet
                      - generic [ref=f1e281]: ViT ImageNet
                - cell "Completed" [ref=f1e286]
                - cell "0.3168" [ref=f1e289]
                - cell "14.8K / 14.8K" [ref=f1e290]:
                  - generic [ref=f1e292]:
                    - text: 14.8K
                    - generic [ref=f1e293]: / 14.8K
                - cell "1h 51m" [ref=f1e296]
                - cell "Nov 9, 11:36" [ref=f1e297]
                - cell [ref=f1e298]:
                  - link "1 data issues in vit-base-imagenet" [ref=f1e299]:
                    - /url: "#/runs/run-005?tab=quality"
                    - text: "1"
              - row [ref=f1e302]:
                - cell [ref=f1e303]:
                  - link [ref=f1e304]:
                    - /url: "#/runs/run-007"
                    - generic [ref=f1e308]:
                      - strong [ref=f1e309]: resnet50-cifar100
                      - generic [ref=f1e310]: ResNet CIFAR-100
                - cell "Running" [ref=f1e315]
                - cell "0.3204" [ref=f1e318]
                - cell "18.3K / 22K" [ref=f1e319]:
                  - generic [ref=f1e321]:
                    - text: 18.3K
                    - generic [ref=f1e322]: / 22K
                - cell "2h 37m" [ref=f1e325]
                - cell "Nov 9, 08:34" [ref=f1e326]
                - cell [ref=f1e327]:
                  - link "1 data issues in resnet50-cifar100" [ref=f1e328]:
                    - /url: "#/runs/run-007?tab=quality"
                    - text: "1"
              - row [ref=f1e331]:
                - cell [ref=f1e332]:
                  - link [ref=f1e333]:
                    - /url: "#/runs/run-006"
                    - generic [ref=f1e337]:
                      - strong [ref=f1e338]: gpt2-wikitext-baseline
                      - generic [ref=f1e339]: GPT-2 WikiText
                - cell "Completed" [ref=f1e344]
                - cell "0.3371" [ref=f1e347]
                - cell "16.5K / 16.5K" [ref=f1e348]:
                  - generic [ref=f1e350]:
                    - text: 16.5K
                    - generic [ref=f1e351]: / 16.5K
                - cell "2h 14m" [ref=f1e354]
                - cell "Nov 9, 10:05" [ref=f1e355]
                - cell [ref=f1e356]:
                  - link "2 data issues in gpt2-wikitext-baseline" [ref=f1e357]:
                    - /url: "#/runs/run-006?tab=quality"
                    - text: "2"
              - row [ref=f1e360]:
                - cell [ref=f1e361]:
                  - link [ref=f1e362]:
                    - /url: "#/runs/run-008"
                    - generic [ref=f1e366]:
                      - strong [ref=f1e367]: qwen2.5-7b-dpo
                      - generic [ref=f1e368]: Qwen 2.5 UltraFeedback
                - cell "Stopped" [ref=f1e373]
                - cell "0.3480" [ref=f1e376]
                - cell "19.9K / 23.9K" [ref=f1e377]:
                  - generic [ref=f1e379]:
                    - text: 19.9K
                    - generic [ref=f1e380]: / 23.9K
                - cell "3h 0m" [ref=f1e383]
                - cell "Nov 9, 07:03" [ref=f1e384]
                - cell [ref=f1e385]:
                  - link "1 data issues in qwen2.5-7b-dpo" [ref=f1e386]:
                    - /url: "#/runs/run-008?tab=quality"
                    - text: "1"
              - row [ref=f1e389]:
                - cell [ref=f1e390]:
                  - link [ref=f1e391]:
                    - /url: "#/runs/run-009"
                    - generic [ref=f1e395]:
                      - strong [ref=f1e396]: whisper-small-en
                      - generic [ref=f1e397]: Whisper LibriSpeech
                - cell "Completed" [ref=f1e402]
                - cell "0.3532" [ref=f1e405]
                - cell "21.6K / 21.6K" [ref=f1e406]:
                  - generic [ref=f1e408]:
                    - text: 21.6K
                    - generic [ref=f1e409]: / 21.6K
                - cell "3h 23m" [ref=f1e412]
                - cell "Nov 9, 05:32" [ref=f1e413]
                - cell "—" [ref=f1e414]
              - row [ref=f1e415]:
                - cell [ref=f1e416]:
                  - link [ref=f1e417]:
                    - /url: "#/runs/run-010"
                    - generic [ref=f1e421]:
                      - strong [ref=f1e422]: t5-base-summarization
                      - generic [ref=f1e423]: T5 CNN/DailyMail
                - cell "Running" [ref=f1e428]
                - cell "0.3691" [ref=f1e431]
                - cell "23.3K / 28K" [ref=f1e432]:
                  - generic [ref=f1e434]:
                    - text: 23.3K
                    - generic [ref=f1e435]: / 28K
                - cell "3h 45m" [ref=f1e438]
                - cell "Nov 9, 04:02" [ref=f1e439]
                - cell "—" [ref=f1e440]
              - row [ref=f1e441]:
                - cell [ref=f1e442]:
                  - link [ref=f1e443]:
                    - /url: "#/runs/run-011"
                    - generic [ref=f1e447]:
                      - strong [ref=f1e448]: llama-3.1-8b-lora-r16
                      - generic [ref=f1e449]: Llama 3.1 Alpaca
                - cell "Completed" [ref=f1e454]
                - cell "0.3963" [ref=f1e457]
                - cell "25K / 25K" [ref=f1e458]:
                  - generic [ref=f1e460]:
                    - text: 25K
                    - generic [ref=f1e461]: / 25K
                - cell "4h 8m" [ref=f1e464]
                - cell "Nov 9, 02:31" [ref=f1e465]
                - cell "—" [ref=f1e466]
              - row [ref=f1e467]:
                - cell [ref=f1e468]:
                  - link [ref=f1e469]:
                    - /url: "#/runs/run-012"
                    - generic [ref=f1e473]:
                      - strong [ref=f1e474]: mistral-7b-lora-r32
                      - generic [ref=f1e475]: Mistral OpenHermes
                - cell "Stopped" [ref=f1e480]
                - cell "0.4277" [ref=f1e483]
                - cell "26.7K / 32K" [ref=f1e484]:
                  - generic [ref=f1e486]:
                    - text: 26.7K
                    - generic [ref=f1e487]: / 32K
                - cell "4h 31m" [ref=f1e490]
                - cell "Nov 9, 01:00" [ref=f1e491]
                - cell "—" [ref=f1e492]
              - row [ref=f1e493]:
                - cell [ref=f1e494]:
                  - link [ref=f1e495]:
                    - /url: "#/runs/run-016"
                    - generic [ref=f1e499]:
                      - strong [ref=f1e500]: resnet101-imagenet
                      - generic [ref=f1e501]: ResNet ImageNet
                - cell "Completed" [ref=f1e506]
                - cell "0.4466" [ref=f1e509]
                - cell "33.5K / 33.5K" [ref=f1e510]:
                  - generic [ref=f1e512]:
                    - text: 33.5K
                    - generic [ref=f1e513]: / 33.5K
                - cell "6h 3m" [ref=f1e516]
                - cell "Nov 8, 18:56" [ref=f1e517]
                - cell "—" [ref=f1e518]
              - row [ref=f1e519]:
                - cell [ref=f1e520]:
                  - link [ref=f1e521]:
                    - /url: "#/runs/run-018"
                    - generic [ref=f1e525]:
                      - strong [ref=f1e526]: qwen2.5-3b-instruct
                      - generic [ref=f1e527]: Qwen 2.5 OpenHermes
                - cell "Completed" [ref=f1e532]
                - cell "0.4517" [ref=f1e535]
                - cell "36.9K / 36.9K" [ref=f1e536]:
                  - generic [ref=f1e538]:
                    - text: 36.9K
                    - generic [ref=f1e539]: / 36.9K
                - cell "6h 49m" [ref=f1e542]
                - cell "Nov 8, 15:54" [ref=f1e543]
                - cell "—" [ref=f1e544]
              - row [ref=f1e545]:
                - cell [ref=f1e546]:
                  - link [ref=f1e547]:
                    - /url: "#/runs/run-013"
                    - generic [ref=f1e551]:
                      - strong [ref=f1e552]: bert-large-ner
                      - generic [ref=f1e553]: BERT CoNLL-2003
                - cell "Completed" [ref=f1e558]
                - cell "0.4527" [ref=f1e561]
                - cell "28.4K / 28.4K" [ref=f1e562]:
                  - generic [ref=f1e564]:
                    - text: 28.4K
                    - generic [ref=f1e565]: / 28.4K
                - cell "4h 54m" [ref=f1e568]
                - cell "Nov 8, 23:29" [ref=f1e569]
                - cell "—" [ref=f1e570]
              - row [ref=f1e571]:
                - cell [ref=f1e572]:
                  - link [ref=f1e573]:
                    - /url: "#/runs/run-015"
                    - generic [ref=f1e577]:
                      - strong [ref=f1e578]: gemma-2-9b-sft
                      - generic [ref=f1e579]: Gemma 2 UltraChat
                - cell "Completed" [ref=f1e584]
                - cell "0.4582" [ref=f1e587]
                - cell "31.8K / 31.8K" [ref=f1e588]:
                  - generic [ref=f1e590]:
                    - text: 31.8K
                    - generic [ref=f1e591]: / 31.8K
                - cell "5h 40m" [ref=f1e594]
                - cell "Nov 8, 20:27" [ref=f1e595]
                - cell "—" [ref=f1e596]
              - row [ref=f1e597]:
                - cell [ref=f1e598]:
                  - link [ref=f1e599]:
                    - /url: "#/runs/run-014"
                    - generic [ref=f1e603]:
                      - strong [ref=f1e604]: vit-large-patch16
                      - generic [ref=f1e605]: ViT ImageNet
                - cell "Running" [ref=f1e610]
                - cell "0.4630" [ref=f1e613]
                - cell "30.1K / 36.1K" [ref=f1e614]:
                  - generic [ref=f1e616]:
                    - text: 30.1K
                    - generic [ref=f1e617]: / 36.1K
                - cell "5h 17m" [ref=f1e620]
                - cell "Nov 8, 21:58" [ref=f1e621]
                - cell "—" [ref=f1e622]
              - row [ref=f1e623]:
                - cell [ref=f1e624]:
                  - link [ref=f1e625]:
                    - /url: "#/runs/run-019"
                    - generic [ref=f1e629]:
                      - strong [ref=f1e630]: gpt2-medium-pretrain
                      - generic [ref=f1e631]: GPT-2 WikiText
                - cell "Stopped" [ref=f1e636]
                - cell "0.4808" [ref=f1e639]
                - cell "38.6K / 46.3K" [ref=f1e640]:
                  - generic [ref=f1e642]:
                    - text: 38.6K
                    - generic [ref=f1e643]: / 46.3K
                - cell "7h 11m" [ref=f1e646]
                - cell "Nov 8, 14:24" [ref=f1e647]
                - cell "—" [ref=f1e648]
              - row [ref=f1e649]:
                - cell [ref=f1e650]:
                  - link [ref=f1e651]:
                    - /url: "#/runs/run-020"
                    - generic [ref=f1e655]:
                      - strong [ref=f1e656]: t5-small-translation
                      - generic [ref=f1e657]: T5 WMT16
                - cell "Completed" [ref=f1e662]
                - cell "0.5211" [ref=f1e665]
                - cell "40.3K / 40.3K" [ref=f1e666]:
                  - generic [ref=f1e668]:
                    - text: 40.3K
                    - generic [ref=f1e669]: / 40.3K
                - cell "7h 34m" [ref=f1e672]
                - cell "Nov 8, 12:53" [ref=f1e673]
                - cell "—" [ref=f1e674]
              - row [ref=f1e675]:
                - cell [ref=f1e676]:
                  - link [ref=f1e677]:
                    - /url: "#/runs/run-017"
                    - generic [ref=f1e681]:
                      - strong [ref=f1e682]: distilbert-classification
                      - generic [ref=f1e683]: DistilBERT SST-2
                - cell "Failed" [ref=f1e688]
                - cell "3.5000" [ref=f1e691]
                - cell "35.2K / 42.2K" [ref=f1e692]:
                  - generic [ref=f1e694]:
                    - text: 35.2K
                    - generic [ref=f1e695]: / 42.2K
                - cell "6h 26m" [ref=f1e698]
                - cell "Nov 8, 17:25" [ref=f1e699]
                - cell [ref=f1e700]:
                  - link "1 data issues in distilbert-classification" [ref=f1e701]:
                    - /url: "#/runs/run-017?tab=quality"
                    - text: "1"
          - generic [ref=f1e704]:
            - generic [ref=f1e705]:
              - text: Showing
              - strong [ref=f1e706]: "20"
              - text: of
              - strong [ref=f1e707]: "20"
              - text: experiments
            - generic [ref=f1e708]: All timestamps in UTC Deterministic demo
        - generic [ref=f1e710]:
          - generic [ref=f1e714]:
            - heading "One million points. One spike. Nothing swept away." [level=3] [ref=f1e715]
            - paragraph [ref=f1e716]: Open the large-series run to see why a smooth chart isn’t always an honest one.
          - link "Investigate the signal" [ref=f1e717]:
            - /url: "#/runs/run-001"
    - contentinfo [ref=f1e720]:
      - generic [ref=f1e721]: Built for the signal, including the noise.
      - generic [ref=f1e724]:
        - text: SOUP OBSERVATORY
        - generic [ref=f1e725]: / 1.0
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | import { waitRenderedViewport } from './support/chart-assertions';
  4   | 
  5   | async function openRun(page: Page, id = 'run-001', query = '') {
  6   |   await page.goto(`/#/runs/${id}${query}`);
  7   |   await expect(page.locator(`[data-run-id="${id}"]`)).toHaveAttribute('data-ready', 'true');
  8   |   await expect(page.getByTestId('chart-loss')).toBeVisible();
  9   | }
  10  | async function assertSpikeActuallyDrawn(page: Page) {
  11  |   // Inspect rendered pixels, independently of the sampler's reported max. The spike
  12  |   // must place mint line pixels high in the central half of the loss canvas;
  13  |   // normal loss values remain below 2.9, so they cannot satisfy this check.
  14  |   await expect(page.getByTestId('chart-loss').locator('canvas').first()).toBeVisible();
  15  |   const counts = await page
  16  |     .getByTestId('chart-loss')
  17  |     .locator('canvas')
  18  |     .evaluateAll((canvases) => {
  19  |       return canvases.map((node) => {
  20  |         const canvas = node as HTMLCanvasElement;
  21  |         const context = canvas.getContext('2d');
  22  |         if (!context) return 0;
  23  |         const { width, height } = canvas;
  24  |         const pixels = context.getImageData(0, 0, width, height).data;
  25  |         let count = 0;
  26  |         for (let y = Math.floor(height * 0.03); y < height * 0.45; y++) {
  27  |           for (let x = Math.floor(width * 0.35); x < width * 0.7; x++) {
  28  |             const offset = (y * width + x) * 4;
  29  |             if (
  30  |               pixels[offset]! > 55 &&
  31  |               pixels[offset]! < 155 &&
  32  |               pixels[offset + 1]! > 150 &&
  33  |               pixels[offset + 2]! > 105 &&
  34  |               pixels[offset + 2]! < 205 &&
  35  |               pixels[offset + 3]! > 100
  36  |             )
  37  |               count++;
  38  |           }
  39  |         }
  40  |         return count;
  41  |       });
  42  |     });
  43  |   expect(Math.max(...counts)).toBeGreaterThan(20);
  44  | }
  45  | 
  46  | test('run browser filters, searches, sorts, persists URL state, and recovers from empty results', async ({
  47  |   page,
  48  | }) => {
  49  |   await page.goto('/#/');
  50  |   await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  51  |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  52  |   await page.getByRole('button', { name: 'Failed', exact: true }).click();
  53  |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(3);
  54  |   await expect(page).toHaveURL(/status=failed/);
  55  |   await page.getByRole('textbox', { name: 'Search runs', exact: true }).fill('not-a-real-run');
  56  |   await expect(page.getByRole('heading', { name: 'No runs in this view' })).toBeVisible();
  57  |   await page.getByRole('button', { name: 'Clear filters' }).click();
  58  |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  59  |   await page.getByRole('combobox', { name: 'Sort runs' }).selectOption('name');
  60  |   await expect(page.locator('.runs-table tbody tr').first()).toContainText('bert-base-sentiment');
  61  |   await page.reload();
  62  |   await expect(page.getByRole('combobox', { name: 'Sort runs' })).toHaveValue('name');
  63  |   await page.getByRole('combobox', { name: 'Sort runs' }).selectOption('loss');
  64  |   const losses = await page.locator('.runs-table tbody tr td:nth-child(3)').allTextContents();
  65  |   const numeric = losses.map((text) => Number(text.replaceAll(',', '')));
> 66  |   expect(numeric).toEqual([...numeric].sort((a, b) => a - b));
      |                   ^ Error: expect(received).toEqual(expected) // deep equality
  67  | });
  68  | 
  69  | test('million-point spike remains painted in overview, narrow zoom and reset', async ({ page }) => {
  70  |   await openRun(page);
  71  |   await expect(page.getByText('Synthetic data', { exact: true })).toBeVisible();
  72  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  73  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  74  |   await assertSpikeActuallyDrawn(page);
  75  |   await page.getByRole('button', { name: 'Inspect spike' }).click();
  76  |   await waitRenderedViewport(page, 490000, 510000);
  77  |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('490000');
  78  |   await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('510000');
  79  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '20001');
  80  |   await assertSpikeActuallyDrawn(page);
  81  |   await page.getByRole('spinbutton', { name: 'Start step' }).fill('499999');
  82  |   await page.getByRole('spinbutton', { name: 'End step' }).fill('500001');
  83  |   await page.getByRole('button', { name: 'Apply range' }).click();
  84  |   await waitRenderedViewport(page, 499999, 500001);
  85  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  86  |   await assertSpikeActuallyDrawn(page);
  87  |   await page.getByRole('button', { name: 'Reset zoom', exact: true }).click();
  88  |   await waitRenderedViewport(page, 0, 999999);
  89  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  90  |   await assertSpikeActuallyDrawn(page);
  91  | });
  92  | 
  93  | test('non-finite values produce visible disclosure and exact missing-value inspection', async ({
  94  |   page,
  95  | }) => {
  96  |   await openRun(page, 'run-003', '?min=4199&max=4211');
  97  |   await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  98  |   const chart = page.getByTestId('chart-loss');
  99  |   await chart.focus();
  100 |   await page.keyboard.press('Home');
  101 |   await page.keyboard.press('ArrowRight');
  102 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  103 |     'Missing / excluded',
  104 |   );
  105 |   await page.locator('.metric-chart--loss summary').click();
  106 |   await expect(
  107 |     page.getByRole('table', { name: 'Plotted training loss values', exact: true }),
  108 |   ).toContainText('Missing / excluded');
  109 |   await page.getByRole('tab', { name: /Data quality/ }).click();
  110 |   await expect(page.getByRole('tabpanel')).toContainText(
  111 |     'Non-finite loss measurements are shown as gaps, never as zero.',
  112 |   );
  113 |   await expect(page.getByRole('tabpanel')).toContainText('11 affected');
  114 | });
  115 | 
  116 | test('duplicate, unordered and missing-step observations remain discoverable', async ({ page }) => {
  117 |   for (const [id, expected] of [
  118 |     ['run-005', 'Out-of-order measurements were sorted by numeric step.'],
  119 |     ['run-006', 'Duplicate steps use the last received measurement.'],
  120 |     ['run-007', 'Missing steps break the line; values are not interpolated.'],
  121 |   ]) {
  122 |     await openRun(page, id);
  123 |     await page.getByRole('tab', { name: /Data quality/ }).click();
  124 |     await expect(page.getByRole('tabpanel')).toContainText(expected);
  125 |   }
  126 | });
  127 | 
  128 | test('log scale discloses zero exclusions and linear restores the measured zero', async ({
  129 |   page,
  130 | }) => {
  131 |   await openRun(page, 'run-008', '?min=595&max=610');
  132 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '0');
  133 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  134 |   await expect(page.locator('.metric-chart--loss')).toContainText(/plotted zero or negative/);
  135 |   await expect(page.locator('.metric-chart--loss')).toContainText('excluded from the log scale');
  136 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
  137 |   await expect(page.locator('.metric-chart--loss .metric-chart__warning')).toHaveCount(0);
  138 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '0');
  139 | });
  140 | 
  141 | test('rapid run switching never paints previous run measurements under the next run title', async ({
  142 |   page,
  143 | }) => {
  144 |   await page.goto('/#/runs/run-001');
  145 |   await expect(page.getByRole('heading', { name: 'llama-3.1-8b-finetune' })).toBeVisible();
  146 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  147 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  148 |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  149 |   await expect(page.locator('[data-run-id="run-003"]')).toHaveAttribute('data-ready', 'true');
  150 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  151 |   const max = Number(await page.getByTestId('chart-loss').getAttribute('data-max-value'));
  152 |   expect(max).toBeLessThan(4);
  153 |   await expect(page.locator('.metric-chart--loss')).toContainText('non-finite');
  154 | });
  155 | 
  156 | test('keyboard search opens a run and chart keyboard inspection reveals measured values', async ({
  157 |   page,
  158 | }) => {
  159 |   await page.goto('/#/');
  160 |   await page.keyboard.press('Control+k');
  161 |   await expect(page.getByRole('dialog')).toBeVisible();
  162 |   await page.getByRole('textbox', { name: 'Find a training run' }).fill('whisper');
  163 |   await page.keyboard.press('Tab');
  164 |   await page.keyboard.press('Tab');
  165 |   await page.keyboard.press('Enter');
  166 |   await expect(page.getByRole('dialog')).toHaveCount(0);
```