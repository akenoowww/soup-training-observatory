# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: observatory.spec.ts >> keyboard search opens a run and chart keyboard inspection reveals measured values
- Location: tests/e2e/observatory.spec.ts:156:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('dialog') with timeout 10000ms
  - waiting for getByRole('dialog')

```

```yaml
- link "Skip to content":
  - /url: "#main"
- complementary "Workspace":
  - link "Soup home":
    - /url: "#/"
    - text: soup.
  - text: O
  - strong: Observatory
  - text: Demo workspace
  - button "Find a run ⌘ K":
    - img
    - text: Find a run ⌘ K
  - paragraph: WORKSPACE
  - navigation "Main navigation":
    - link "Training runs 20":
      - /url: "#/"
      - img
      - text: Training runs 20
    - link "Field guide":
      - /url: "#/guide"
      - img
      - text: Field guide
      - img
  - text: PROJECT Foundation models 20 experiments · 3 metrics
  - img
  - strong: A little room to experiment.
  - paragraph: Explore synthetic runs. Your production training is untouched.
  - text: SC
  - strong: Soup collective
  - text: Research workspace
- banner:
  - text: Foundation models / Training runs Synthetic data
  - button "Search runs":
    - img
  - text: SC
- main:
  - text: THE EXPERIMENT LOG
  - heading "Every run. A clearer picture." [level=1]
  - paragraph: Your training experiments, with the whole story left in.
  - link "Explore a run":
    - /url: "#/runs/run-001"
    - text: Explore a run
    - img
  - text: Total experiments
  - img
  - text: 20 Foundation models Running in snapshot
  - img
  - text: 05 Frozen synthetic snapshot Completed
  - img
  - text: 09 Finished in snapshot Runs with data issues
  - img
  - text: 08 Worth a closer look
  - heading "Training runs" [level=2]
  - text: 20 Good decisions start with honest data.
  - group "Filter runs by status":
    - button "All runs 20"
    - button "Running"
    - button "Completed"
    - button "Failed"
    - button "Stopped"
  - img
  - text: Search runs
  - textbox "Search runs":
    - /placeholder: Search runs…
  - img
  - text: Sort runs
  - combobox "Sort runs":
    - option "Most recent" [selected]
    - option "Lowest loss"
    - option "Most steps"
    - option "Name A–Z"
  - table:
    - rowgroup:
      - row "Run name Status Loss Training steps Duration Started at UTC Data issues":
        - columnheader "Run name"
        - columnheader "Status"
        - columnheader "Loss"
        - columnheader "Training steps"
        - columnheader "Duration"
        - columnheader "Started at UTC"
        - columnheader "Data issues"
    - rowgroup:
      - row "mistral-7b-instruct-v3 Mistral OpenHermes Running 0.2392 9.7K / 11.6K 42m 53s Nov 9, 16:09 —":
        - cell "mistral-7b-instruct-v3 Mistral OpenHermes":
          - link "mistral-7b-instruct-v3 Mistral OpenHermes":
            - /url: "#/runs/run-002"
            - img
            - strong: mistral-7b-instruct-v3
            - text: Mistral OpenHermes
            - img
        - cell "Running"
        - cell "0.2392"
        - cell "9.7K / 11.6K"
        - cell "42m 53s"
        - cell "Nov 9, 16:09"
        - cell "—"
      - row "bert-base-sentiment BERT SST-2 Failed 0.2581 11.4K / 13.7K 1h 5m Nov 9, 14:38 1 data issues in bert-base-sentiment":
        - cell "bert-base-sentiment BERT SST-2":
          - link "bert-base-sentiment BERT SST-2":
            - /url: "#/runs/run-003"
            - img
            - strong: bert-base-sentiment
            - text: BERT SST-2
            - img
        - cell "Failed"
        - cell "0.2581"
        - cell "11.4K / 13.7K"
        - cell "1h 5m"
        - cell "Nov 9, 14:38"
        - cell "1 data issues in bert-base-sentiment":
          - link "1 data issues in bert-base-sentiment":
            - /url: "#/runs/run-003?tab=quality"
            - img
            - text: "1"
      - row "llama-3.1-8b-lr-sweep Llama 3.1 Alpaca Failed 0.2874 13.1K / 15.7K 1h 28m Nov 9, 13:07 2 data issues in llama-3.1-8b-lr-sweep":
        - cell "llama-3.1-8b-lr-sweep Llama 3.1 Alpaca":
          - link "llama-3.1-8b-lr-sweep Llama 3.1 Alpaca":
            - /url: "#/runs/run-004"
            - img
            - strong: llama-3.1-8b-lr-sweep
            - text: Llama 3.1 Alpaca
            - img
        - cell "Failed"
        - cell "0.2874"
        - cell "13.1K / 15.7K"
        - cell "1h 28m"
        - cell "Nov 9, 13:07"
        - cell "2 data issues in llama-3.1-8b-lr-sweep":
          - link "2 data issues in llama-3.1-8b-lr-sweep":
            - /url: "#/runs/run-004?tab=quality"
            - img
            - text: "2"
      - row "llama-3.1-8b-finetune Llama 3.1 Alpaca Running 0.2799 1M / 1.2M 5h 12m Nov 9, 12:47 1 data issues in llama-3.1-8b-finetune":
        - cell "llama-3.1-8b-finetune Llama 3.1 Alpaca":
          - link "llama-3.1-8b-finetune Llama 3.1 Alpaca":
            - /url: "#/runs/run-001"
            - img
            - strong: llama-3.1-8b-finetune
            - text: Llama 3.1 Alpaca
            - img
        - cell "Running"
        - cell "0.2799"
        - cell "1M / 1.2M"
        - cell "5h 12m"
        - cell "Nov 9, 12:47"
        - cell "1 data issues in llama-3.1-8b-finetune":
          - link "1 data issues in llama-3.1-8b-finetune":
            - /url: "#/runs/run-001?tab=quality"
            - img
            - text: "1"
      - row "vit-base-imagenet ViT ImageNet Completed 0.3168 14.8K / 14.8K 1h 51m Nov 9, 11:36 1 data issues in vit-base-imagenet":
        - cell "vit-base-imagenet ViT ImageNet":
          - link "vit-base-imagenet ViT ImageNet":
            - /url: "#/runs/run-005"
            - img
            - strong: vit-base-imagenet
            - text: ViT ImageNet
            - img
        - cell "Completed"
        - cell "0.3168"
        - cell "14.8K / 14.8K"
        - cell "1h 51m"
        - cell "Nov 9, 11:36"
        - cell "1 data issues in vit-base-imagenet":
          - link "1 data issues in vit-base-imagenet":
            - /url: "#/runs/run-005?tab=quality"
            - img
            - text: "1"
      - row "gpt2-wikitext-baseline GPT-2 WikiText Completed 0.3371 16.5K / 16.5K 2h 14m Nov 9, 10:05 2 data issues in gpt2-wikitext-baseline":
        - cell "gpt2-wikitext-baseline GPT-2 WikiText":
          - link "gpt2-wikitext-baseline GPT-2 WikiText":
            - /url: "#/runs/run-006"
            - img
            - strong: gpt2-wikitext-baseline
            - text: GPT-2 WikiText
            - img
        - cell "Completed"
        - cell "0.3371"
        - cell "16.5K / 16.5K"
        - cell "2h 14m"
        - cell "Nov 9, 10:05"
        - cell "2 data issues in gpt2-wikitext-baseline":
          - link "2 data issues in gpt2-wikitext-baseline":
            - /url: "#/runs/run-006?tab=quality"
            - img
            - text: "2"
      - row "resnet50-cifar100 ResNet CIFAR-100 Running 0.3204 18.3K / 22K 2h 37m Nov 9, 08:34 1 data issues in resnet50-cifar100":
        - cell "resnet50-cifar100 ResNet CIFAR-100":
          - link "resnet50-cifar100 ResNet CIFAR-100":
            - /url: "#/runs/run-007"
            - img
            - strong: resnet50-cifar100
            - text: ResNet CIFAR-100
            - img
        - cell "Running"
        - cell "0.3204"
        - cell "18.3K / 22K"
        - cell "2h 37m"
        - cell "Nov 9, 08:34"
        - cell "1 data issues in resnet50-cifar100":
          - link "1 data issues in resnet50-cifar100":
            - /url: "#/runs/run-007?tab=quality"
            - img
            - text: "1"
      - row "qwen2.5-7b-dpo Qwen 2.5 UltraFeedback Stopped 0.3480 19.9K / 23.9K 3h 0m Nov 9, 07:03 1 data issues in qwen2.5-7b-dpo":
        - cell "qwen2.5-7b-dpo Qwen 2.5 UltraFeedback":
          - link "qwen2.5-7b-dpo Qwen 2.5 UltraFeedback":
            - /url: "#/runs/run-008"
            - img
            - strong: qwen2.5-7b-dpo
            - text: Qwen 2.5 UltraFeedback
            - img
        - cell "Stopped"
        - cell "0.3480"
        - cell "19.9K / 23.9K"
        - cell "3h 0m"
        - cell "Nov 9, 07:03"
        - cell "1 data issues in qwen2.5-7b-dpo":
          - link "1 data issues in qwen2.5-7b-dpo":
            - /url: "#/runs/run-008?tab=quality"
            - img
            - text: "1"
      - row "whisper-small-en Whisper LibriSpeech Completed 0.3532 21.6K / 21.6K 3h 23m Nov 9, 05:32 —":
        - cell "whisper-small-en Whisper LibriSpeech":
          - link "whisper-small-en Whisper LibriSpeech":
            - /url: "#/runs/run-009"
            - img
            - strong: whisper-small-en
            - text: Whisper LibriSpeech
            - img
        - cell "Completed"
        - cell "0.3532"
        - cell "21.6K / 21.6K"
        - cell "3h 23m"
        - cell "Nov 9, 05:32"
        - cell "—"
      - row "t5-base-summarization T5 CNN/DailyMail Running 0.3691 23.3K / 28K 3h 45m Nov 9, 04:02 —":
        - cell "t5-base-summarization T5 CNN/DailyMail":
          - link "t5-base-summarization T5 CNN/DailyMail":
            - /url: "#/runs/run-010"
            - img
            - strong: t5-base-summarization
            - text: T5 CNN/DailyMail
            - img
        - cell "Running"
        - cell "0.3691"
        - cell "23.3K / 28K"
        - cell "3h 45m"
        - cell "Nov 9, 04:02"
        - cell "—"
      - row "llama-3.1-8b-lora-r16 Llama 3.1 Alpaca Completed 0.3963 25K / 25K 4h 8m Nov 9, 02:31 —":
        - cell "llama-3.1-8b-lora-r16 Llama 3.1 Alpaca":
          - link "llama-3.1-8b-lora-r16 Llama 3.1 Alpaca":
            - /url: "#/runs/run-011"
            - img
            - strong: llama-3.1-8b-lora-r16
            - text: Llama 3.1 Alpaca
            - img
        - cell "Completed"
        - cell "0.3963"
        - cell "25K / 25K"
        - cell "4h 8m"
        - cell "Nov 9, 02:31"
        - cell "—"
      - row "mistral-7b-lora-r32 Mistral OpenHermes Stopped 0.4277 26.7K / 32K 4h 31m Nov 9, 01:00 —":
        - cell "mistral-7b-lora-r32 Mistral OpenHermes":
          - link "mistral-7b-lora-r32 Mistral OpenHermes":
            - /url: "#/runs/run-012"
            - img
            - strong: mistral-7b-lora-r32
            - text: Mistral OpenHermes
            - img
        - cell "Stopped"
        - cell "0.4277"
        - cell "26.7K / 32K"
        - cell "4h 31m"
        - cell "Nov 9, 01:00"
        - cell "—"
      - row "bert-large-ner BERT CoNLL-2003 Completed 0.4527 28.4K / 28.4K 4h 54m Nov 8, 23:29 —":
        - cell "bert-large-ner BERT CoNLL-2003":
          - link "bert-large-ner BERT CoNLL-2003":
            - /url: "#/runs/run-013"
            - img
            - strong: bert-large-ner
            - text: BERT CoNLL-2003
            - img
        - cell "Completed"
        - cell "0.4527"
        - cell "28.4K / 28.4K"
        - cell "4h 54m"
        - cell "Nov 8, 23:29"
        - cell "—"
      - row "vit-large-patch16 ViT ImageNet Running 0.4630 30.1K / 36.1K 5h 17m Nov 8, 21:58 —":
        - cell "vit-large-patch16 ViT ImageNet":
          - link "vit-large-patch16 ViT ImageNet":
            - /url: "#/runs/run-014"
            - img
            - strong: vit-large-patch16
            - text: ViT ImageNet
            - img
        - cell "Running"
        - cell "0.4630"
        - cell "30.1K / 36.1K"
        - cell "5h 17m"
        - cell "Nov 8, 21:58"
        - cell "—"
      - row "gemma-2-9b-sft Gemma 2 UltraChat Completed 0.4582 31.8K / 31.8K 5h 40m Nov 8, 20:27 —":
        - cell "gemma-2-9b-sft Gemma 2 UltraChat":
          - link "gemma-2-9b-sft Gemma 2 UltraChat":
            - /url: "#/runs/run-015"
            - img
            - strong: gemma-2-9b-sft
            - text: Gemma 2 UltraChat
            - img
        - cell "Completed"
        - cell "0.4582"
        - cell "31.8K / 31.8K"
        - cell "5h 40m"
        - cell "Nov 8, 20:27"
        - cell "—"
      - row "resnet101-imagenet ResNet ImageNet Completed 0.4466 33.5K / 33.5K 6h 3m Nov 8, 18:56 —":
        - cell "resnet101-imagenet ResNet ImageNet":
          - link "resnet101-imagenet ResNet ImageNet":
            - /url: "#/runs/run-016"
            - img
            - strong: resnet101-imagenet
            - text: ResNet ImageNet
            - img
        - cell "Completed"
        - cell "0.4466"
        - cell "33.5K / 33.5K"
        - cell "6h 3m"
        - cell "Nov 8, 18:56"
        - cell "—"
      - row "distilbert-classification DistilBERT SST-2 Failed 3.5000 35.2K / 42.2K 6h 26m Nov 8, 17:25 1 data issues in distilbert-classification":
        - cell "distilbert-classification DistilBERT SST-2":
          - link "distilbert-classification DistilBERT SST-2":
            - /url: "#/runs/run-017"
            - img
            - strong: distilbert-classification
            - text: DistilBERT SST-2
            - img
        - cell "Failed"
        - cell "3.5000"
        - cell "35.2K / 42.2K"
        - cell "6h 26m"
        - cell "Nov 8, 17:25"
        - cell "1 data issues in distilbert-classification":
          - link "1 data issues in distilbert-classification":
            - /url: "#/runs/run-017?tab=quality"
            - img
            - text: "1"
      - row "qwen2.5-3b-instruct Qwen 2.5 OpenHermes Completed 0.4517 36.9K / 36.9K 6h 49m Nov 8, 15:54 —":
        - cell "qwen2.5-3b-instruct Qwen 2.5 OpenHermes":
          - link "qwen2.5-3b-instruct Qwen 2.5 OpenHermes":
            - /url: "#/runs/run-018"
            - img
            - strong: qwen2.5-3b-instruct
            - text: Qwen 2.5 OpenHermes
            - img
        - cell "Completed"
        - cell "0.4517"
        - cell "36.9K / 36.9K"
        - cell "6h 49m"
        - cell "Nov 8, 15:54"
        - cell "—"
      - row "gpt2-medium-pretrain GPT-2 WikiText Stopped 0.4808 38.6K / 46.3K 7h 11m Nov 8, 14:24 —":
        - cell "gpt2-medium-pretrain GPT-2 WikiText":
          - link "gpt2-medium-pretrain GPT-2 WikiText":
            - /url: "#/runs/run-019"
            - img
            - strong: gpt2-medium-pretrain
            - text: GPT-2 WikiText
            - img
        - cell "Stopped"
        - cell "0.4808"
        - cell "38.6K / 46.3K"
        - cell "7h 11m"
        - cell "Nov 8, 14:24"
        - cell "—"
      - row "t5-small-translation T5 WMT16 Completed 0.5211 40.3K / 40.3K 7h 34m Nov 8, 12:53 —":
        - cell "t5-small-translation T5 WMT16":
          - link "t5-small-translation T5 WMT16":
            - /url: "#/runs/run-020"
            - img
            - strong: t5-small-translation
            - text: T5 WMT16
            - img
        - cell "Completed"
        - cell "0.5211"
        - cell "40.3K / 40.3K"
        - cell "7h 34m"
        - cell "Nov 8, 12:53"
        - cell "—"
  - text: Showing
  - strong: "20"
  - text: of
  - strong: "20"
  - text: experiments All timestamps in UTC Deterministic demo
  - img
  - heading "One million points. One spike. Nothing swept away." [level=3]
  - paragraph: Open the large-series run to see why a smooth chart isn’t always an honest one.
  - link "Investigate the signal":
    - /url: "#/runs/run-001"
    - text: Investigate the signal
    - img
- contentinfo:
  - img
  - text: Built for the signal, including the noise. SOUP OBSERVATORY / 1.0
```

# Test source

```ts
  61  |   await page.reload();
  62  |   await expect(page.getByRole('combobox', { name: 'Sort runs' })).toHaveValue('name');
  63  |   await page.getByRole('combobox', { name: 'Sort runs' }).selectOption('loss');
  64  |   const losses = await page.locator('.runs-table tbody tr td:nth-child(3)').allTextContents();
  65  |   const numeric = losses.map((text) => Number(text.replaceAll(',', '')));
  66  |   expect(numeric).toEqual([...numeric].sort((a, b) => a - b));
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
> 161 |   await expect(page.getByRole('dialog')).toBeVisible();
      |                                          ^ Error: expect(locator).toBeVisible() failed
  162 |   await page.getByRole('textbox', { name: 'Find a training run' }).fill('whisper');
  163 |   await page.keyboard.press('Tab');
  164 |   await page.keyboard.press('Tab');
  165 |   await page.keyboard.press('Enter');
  166 |   await expect(page.getByRole('dialog')).toHaveCount(0);
  167 |   await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  168 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  169 |   await page.getByTestId('chart-loss').focus();
  170 |   await page.keyboard.press('Home');
  171 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText(
  172 |     'Sampled step 0',
  173 |   );
  174 |   await page.keyboard.press('End');
  175 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('21,599');
  176 | });
  177 | 
  178 | test('export identifies a sampled viewport and retains spike numeric value', async ({ page }) => {
  179 |   await openRun(page, 'run-001', '?min=499999&max=500001');
  180 |   const downloadEvent = page.waitForEvent('download');
  181 |   await page.getByRole('button', { name: 'Export view' }).click();
  182 |   const download = await downloadEvent;
  183 |   expect(download.suggestedFilename()).toBe('run-001-sampled-viewport.csv');
  184 |   const path = await download.path();
  185 |   expect(path).not.toBeNull();
  186 |   const csv = await readFile(path!, 'utf8');
  187 |   expect(csv).toContain('metric,step,value');
  188 |   expect(csv).toContain('loss,500000,9.4');
  189 |   await expect(
  190 |     page.getByRole('status').filter({ hasText: 'Sampled viewport exported.' }),
  191 |   ).toBeVisible();
  192 | });
  193 | 
  194 | test('mobile layout fits viewport and navigation remains reachable', async ({ page }) => {
  195 |   await page.setViewportSize({ width: 390, height: 844 });
  196 |   await page.goto('/#/');
  197 |   await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  198 |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  199 |   await page.getByRole('button', { name: 'Open navigation' }).click();
  200 |   await page.getByRole('link', { name: 'Field guide' }).click();
  201 |   await expect(page.getByRole('heading', { name: 'Look closer. Keep the signal.' })).toBeVisible();
  202 |   await openRun(page);
  203 |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  204 |   await expect(page.getByTestId('chart-loss')).toBeVisible();
  205 |   await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  206 |   await waitRenderedViewport(page, 999999 / 4, (999999 * 3) / 4);
  207 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  208 | });
  209 | 
  210 | test('unknown run fails clearly with a working recovery route', async ({ page }) => {
  211 |   await page.goto('/#/runs/does-not-exist');
  212 |   await expect(page.getByRole('heading', { name: 'Run not found' })).toBeVisible();
  213 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  214 |   await page.getByRole('link', { name: 'Back to training runs' }).click();
  215 |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  216 | });
  217 | 
  218 | test('a worker failure never substitutes fabricated values and has a working retry path', async ({
  219 |   page,
  220 | }) => {
  221 |   await page.route(/data\.worker-[^/]+\.js(?:\?.*)?$/, (route) => route.abort('failed'));
  222 |   await page.goto('/#/runs/run-001');
  223 |   await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  224 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  225 |   await page.unroute(/data\.worker-[^/]+\.js(?:\?.*)?$/);
  226 |   await page.getByRole('button', { name: 'Try again', exact: false }).click();
  227 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  228 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  229 | });
  230 | 
  231 | test('an entirely invalid viewport shows unavailable values and never fabricates a zero curve', async ({
  232 |   page,
  233 | }) => {
  234 |   await openRun(page, 'run-003', '?min=4200&max=4210');
  235 |   await expect(page.locator('.metric-chart--loss')).toContainText('No finite values in this range');
  236 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  237 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', 'missing');
  238 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', 'missing');
  239 |   await page.locator('.metric-chart--loss summary').click();
  240 |   await expect(
  241 |     page.getByRole('table', { name: 'Plotted training loss values', exact: true }).locator('tbody'),
  242 |   ).toContainText('Missing / excluded');
  243 | });
  244 | 
  245 | test('initial worker loading exposes a reserved loading view before any chart is drawn', async ({
  246 |   page,
  247 | }) => {
  248 |   let release: () => void = () => {};
  249 |   const gate = new Promise<void>((resolve) => {
  250 |     release = resolve;
  251 |   });
  252 |   await page.route(/data\.worker-[^/]+\.js(?:\?.*)?$/, async (route) => {
  253 |     await gate;
  254 |     await route.continue();
  255 |   });
  256 |   await page.goto('/#/runs/run-001');
  257 |   await expect(page.getByRole('status', { name: 'Loading run metrics' })).toBeVisible();
  258 |   await expect(page.getByText('Preparing training metrics…', { exact: true })).toBeVisible();
  259 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  260 |   release();
  261 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
```