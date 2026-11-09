# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: observatory.spec.ts >> keyboard search opens a run and chart keyboard inspection reveals measured values
- Location: tests/e2e/observatory.spec.ts:128:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('dialog')
Expected: 0
Received: 1
Timeout:  10000ms

Call log:
  - Expect "toHaveCount" getByRole('dialog') with timeout 10000ms
  - waiting for getByRole('dialog')
    24 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4]:
    - /url: "#main"
  - complementary "Main navigation" [ref=e5]:
    - link "Soup home" [ref=e6]:
      - /url: "#/"
      - generic [ref=e9]: soup.
    - generic [ref=e10]:
      - generic [ref=e11]: O
      - generic [ref=e12]:
        - strong [ref=e13]: Observatory
        - generic [ref=e14]: Demo workspace
    - button "Find a run ⌘ K" [ref=e15] [cursor=pointer]:
      - generic [ref=e19]: Find a run
      - generic [ref=e20]: ⌘ K
    - paragraph [ref=e21]: WORKSPACE
    - navigation [ref=e22]:
      - link "Training runs 20" [ref=e23]:
        - /url: "#/"
        - generic [ref=e28]: Training runs
        - generic [ref=e29]: "20"
      - link "Field guide" [ref=e30]:
        - /url: "#/guide"
    - generic [ref=e37]:
      - generic [ref=e38]: PROJECT
      - generic [ref=e39]: Foundation models
      - generic [ref=e41]: 20 experiments · 3 metrics
    - generic [ref=e42]:
      - generic [ref=e46]:
        - strong [ref=e47]: A little room to experiment.
        - paragraph [ref=e48]: Explore synthetic runs. Your production training is untouched.
      - generic [ref=e49]:
        - generic [ref=e50]: SC
        - generic [ref=e51]:
          - strong [ref=e52]: Soup collective
          - generic [ref=e53]: Research workspace
  - generic [ref=e54]:
    - banner [ref=e55]:
      - generic [ref=e56]:
        - generic [ref=e57]: Foundation models
        - generic [ref=e58]: /
        - generic [ref=e59]: Training runs
      - generic [ref=e60]:
        - generic [ref=e61]: Synthetic data
        - button "Search runs" [ref=e64] [cursor=pointer]
        - generic [ref=e68]: SC
    - main [ref=e69]:
      - generic [ref=e70]:
        - generic [ref=e71]: THE EXPERIMENT LOG
        - generic [ref=e73]:
          - generic [ref=e74]:
            - heading "Every run. A clearer picture." [level=1] [ref=e75]
            - paragraph [ref=e76]: Your training experiments, with the whole story left in.
          - link "Explore a run" [ref=e77]:
            - /url: "#/runs/run-001"
        - generic [ref=e81]:
          - generic [ref=e82]:
            - generic [ref=e83]: Total experiments
            - generic [ref=e89]: "20"
            - generic [ref=e91]: Foundation models
          - generic [ref=e93]:
            - generic [ref=e94]: Running in snapshot
            - generic [ref=e98]: "05"
            - generic [ref=e100]: Frozen synthetic snapshot
          - generic [ref=e102]:
            - generic [ref=e103]: Completed
            - generic [ref=e107]: "09"
            - generic [ref=e109]: Finished in snapshot
          - generic [ref=e111]:
            - generic [ref=e112]: Runs with data issues
            - generic [ref=e116]: "08"
            - generic [ref=e118]: Worth a closer look
        - generic [ref=e120]:
          - generic [ref=e121]:
            - heading "Training runs" [level=2] [ref=e122]
            - generic [ref=e123]: "20"
          - generic [ref=e124]: Good decisions start with honest data.
        - generic [ref=e125]:
          - generic [ref=e126]:
            - group "Filter runs by status" [ref=e127]:
              - button "All runs 20" [ref=e128] [cursor=pointer]:
                - text: All runs
                - generic [ref=e129]: "20"
              - button "Running" [ref=e130] [cursor=pointer]
              - button "Completed" [ref=e131] [cursor=pointer]
              - button "Failed" [ref=e132] [cursor=pointer]
              - button "Stopped" [ref=e133] [cursor=pointer]
            - generic [ref=e134]:
              - generic [ref=e135]:
                - generic [ref=e139]: Search runs
                - textbox "Search runs" [active] [ref=e140]:
                  - /placeholder: Search runs…
              - generic [ref=e141]:
                - generic [ref=e144]: Sort runs
                - combobox "Sort runs" [ref=e145]:
                  - option "Most recent" [selected]
                  - option "Lowest loss"
                  - option "Most steps"
                  - option "Name A–Z"
          - table [ref=e147]:
            - rowgroup [ref=e148]:
              - row [ref=e149]:
                - columnheader "Run name" [ref=e150]
                - columnheader "Status" [ref=e151]
                - columnheader "Loss" [ref=e152]
                - columnheader "Training steps" [ref=e153]
                - columnheader "Duration" [ref=e154]
                - columnheader "Started at UTC" [ref=e155]
                - columnheader "Data issues" [ref=e156]
            - rowgroup [ref=e158]:
              - row [ref=e159]:
                - cell [ref=e160]:
                  - link "llama-3.1-8b-finetune Llama 3.1 · Alpaca" [ref=e161]:
                    - /url: "#/runs/run-001"
                    - generic [ref=e165]:
                      - strong [ref=e166]: llama-3.1-8b-finetune
                      - generic [ref=e167]: Llama 3.1 · Alpaca
                - cell "Running" [ref=e171]
                - cell "0.2799" [ref=e174]
                - cell "1M / 1.2M" [ref=e175]:
                  - generic [ref=e177]:
                    - text: 1M
                    - generic [ref=e178]: / 1.2M
                - cell "5h 12m" [ref=e181]
                - cell "Nov 9 at 18:42" [ref=e182]
                - cell [ref=e183]:
                  - link "1 data issues in llama-3.1-8b-finetune" [ref=e184]:
                    - /url: "#/runs/run-001?tab=quality"
                    - text: "1"
              - row [ref=e187]:
                - cell [ref=e188]:
                  - link "mistral-7b-instruct-v3 Mistral · OpenHermes" [ref=e189]:
                    - /url: "#/runs/run-002"
                    - generic [ref=e193]:
                      - strong [ref=e194]: mistral-7b-instruct-v3
                      - generic [ref=e195]: Mistral · OpenHermes
                - cell "Running" [ref=e199]
                - cell "0.2392" [ref=e202]
                - cell "9.7K / 11.6K" [ref=e203]:
                  - generic [ref=e205]:
                    - text: 9.7K
                    - generic [ref=e206]: / 11.6K
                - cell "42m 53s" [ref=e209]
                - cell "Nov 9 at 17:34" [ref=e210]
                - cell "—" [ref=e211]
              - row [ref=e212]:
                - cell [ref=e213]:
                  - link "bert-base-sentiment BERT · SST-2" [ref=e214]:
                    - /url: "#/runs/run-003"
                    - generic [ref=e218]:
                      - strong [ref=e219]: bert-base-sentiment
                      - generic [ref=e220]: BERT · SST-2
                - cell "Failed" [ref=e224]
                - cell "0.2581" [ref=e227]
                - cell "11.4K / 13.7K" [ref=e228]:
                  - generic [ref=e230]:
                    - text: 11.4K
                    - generic [ref=e231]: / 13.7K
                - cell "1h 5m" [ref=e234]
                - cell "Nov 9 at 16:26" [ref=e235]
                - cell [ref=e236]:
                  - link "1 data issues in bert-base-sentiment" [ref=e237]:
                    - /url: "#/runs/run-003?tab=quality"
                    - text: "1"
              - row [ref=e240]:
                - cell [ref=e241]:
                  - link "llama-3.1-8b-lr-sweep Llama 3.1 · Alpaca" [ref=e242]:
                    - /url: "#/runs/run-004"
                    - generic [ref=e246]:
                      - strong [ref=e247]: llama-3.1-8b-lr-sweep
                      - generic [ref=e248]: Llama 3.1 · Alpaca
                - cell "Failed" [ref=e252]
                - cell "0.2874" [ref=e255]
                - cell "13.1K / 15.7K" [ref=e256]:
                  - generic [ref=e258]:
                    - text: 13.1K
                    - generic [ref=e259]: / 15.7K
                - cell "1h 28m" [ref=e262]
                - cell "Nov 9 at 15:18" [ref=e263]
                - cell [ref=e264]:
                  - link "2 data issues in llama-3.1-8b-lr-sweep" [ref=e265]:
                    - /url: "#/runs/run-004?tab=quality"
                    - text: "2"
              - row [ref=e268]:
                - cell [ref=e269]:
                  - link "vit-base-imagenet ViT · ImageNet" [ref=e270]:
                    - /url: "#/runs/run-005"
                    - generic [ref=e274]:
                      - strong [ref=e275]: vit-base-imagenet
                      - generic [ref=e276]: ViT · ImageNet
                - cell "Completed" [ref=e280]
                - cell "0.3168" [ref=e283]
                - cell "14.8K / 14.8K" [ref=e284]:
                  - generic [ref=e286]:
                    - text: 14.8K
                    - generic [ref=e287]: / 14.8K
                - cell "1h 51m" [ref=e290]
                - cell "Nov 9 at 14:10" [ref=e291]
                - cell [ref=e292]:
                  - link "1 data issues in vit-base-imagenet" [ref=e293]:
                    - /url: "#/runs/run-005?tab=quality"
                    - text: "1"
              - row [ref=e296]:
                - cell [ref=e297]:
                  - link "gpt2-wikitext-baseline GPT-2 · WikiText" [ref=e298]:
                    - /url: "#/runs/run-006"
                    - generic [ref=e302]:
                      - strong [ref=e303]: gpt2-wikitext-baseline
                      - generic [ref=e304]: GPT-2 · WikiText
                - cell "Completed" [ref=e308]
                - cell "0.3371" [ref=e311]
                - cell "16.5K / 16.5K" [ref=e312]:
                  - generic [ref=e314]:
                    - text: 16.5K
                    - generic [ref=e315]: / 16.5K
                - cell "2h 14m" [ref=e318]
                - cell "Nov 9 at 13:02" [ref=e319]
                - cell [ref=e320]:
                  - link "2 data issues in gpt2-wikitext-baseline" [ref=e321]:
                    - /url: "#/runs/run-006?tab=quality"
                    - text: "2"
              - row [ref=e324]:
                - cell [ref=e325]:
                  - link "resnet50-cifar100 ResNet · CIFAR-100" [ref=e326]:
                    - /url: "#/runs/run-007"
                    - generic [ref=e330]:
                      - strong [ref=e331]: resnet50-cifar100
                      - generic [ref=e332]: ResNet · CIFAR-100
                - cell "Running" [ref=e336]
                - cell "0.3204" [ref=e339]
                - cell "18.3K / 22K" [ref=e340]:
                  - generic [ref=e342]:
                    - text: 18.3K
                    - generic [ref=e343]: / 22K
                - cell "2h 37m" [ref=e346]
                - cell "Nov 9 at 11:54" [ref=e347]
                - cell [ref=e348]:
                  - link "1 data issues in resnet50-cifar100" [ref=e349]:
                    - /url: "#/runs/run-007?tab=quality"
                    - text: "1"
              - row [ref=e352]:
                - cell [ref=e353]:
                  - link "qwen2.5-7b-dpo Qwen 2.5 · UltraFeedback" [ref=e354]:
                    - /url: "#/runs/run-008"
                    - generic [ref=e358]:
                      - strong [ref=e359]: qwen2.5-7b-dpo
                      - generic [ref=e360]: Qwen 2.5 · UltraFeedback
                - cell "Stopped" [ref=e364]
                - cell "0.3480" [ref=e367]
                - cell "19.9K / 23.9K" [ref=e368]:
                  - generic [ref=e370]:
                    - text: 19.9K
                    - generic [ref=e371]: / 23.9K
                - cell "3h 0m" [ref=e374]
                - cell "Nov 9 at 10:46" [ref=e375]
                - cell [ref=e376]:
                  - link "1 data issues in qwen2.5-7b-dpo" [ref=e377]:
                    - /url: "#/runs/run-008?tab=quality"
                    - text: "1"
              - row [ref=e380]:
                - cell [ref=e381]:
                  - link "whisper-small-en Whisper · LibriSpeech" [ref=e382]:
                    - /url: "#/runs/run-009"
                    - generic [ref=e386]:
                      - strong [ref=e387]: whisper-small-en
                      - generic [ref=e388]: Whisper · LibriSpeech
                - cell "Completed" [ref=e392]
                - cell "0.3532" [ref=e395]
                - cell "21.6K / 21.6K" [ref=e396]:
                  - generic [ref=e398]:
                    - text: 21.6K
                    - generic [ref=e399]: / 21.6K
                - cell "3h 23m" [ref=e402]
                - cell "Nov 9 at 09:38" [ref=e403]
                - cell "—" [ref=e404]
              - row [ref=e405]:
                - cell [ref=e406]:
                  - link "t5-base-summarization T5 · CNN/DailyMail" [ref=e407]:
                    - /url: "#/runs/run-010"
                    - generic [ref=e411]:
                      - strong [ref=e412]: t5-base-summarization
                      - generic [ref=e413]: T5 · CNN/DailyMail
                - cell "Running" [ref=e417]
                - cell "0.3691" [ref=e420]
                - cell "23.3K / 28K" [ref=e421]:
                  - generic [ref=e423]:
                    - text: 23.3K
                    - generic [ref=e424]: / 28K
                - cell "3h 45m" [ref=e427]
                - cell "Nov 9 at 08:30" [ref=e428]
                - cell "—" [ref=e429]
              - row [ref=e430]:
                - cell [ref=e431]:
                  - link "llama-3.1-8b-lora-r16 Llama 3.1 · Alpaca" [ref=e432]:
                    - /url: "#/runs/run-011"
                    - generic [ref=e436]:
                      - strong [ref=e437]: llama-3.1-8b-lora-r16
                      - generic [ref=e438]: Llama 3.1 · Alpaca
                - cell "Completed" [ref=e442]
                - cell "0.3963" [ref=e445]
                - cell "25K / 25K" [ref=e446]:
                  - generic [ref=e448]:
                    - text: 25K
                    - generic [ref=e449]: / 25K
                - cell "4h 8m" [ref=e452]
                - cell "Nov 9 at 07:22" [ref=e453]
                - cell "—" [ref=e454]
              - row [ref=e455]:
                - cell [ref=e456]:
                  - link "mistral-7b-lora-r32 Mistral · OpenHermes" [ref=e457]:
                    - /url: "#/runs/run-012"
                    - generic [ref=e461]:
                      - strong [ref=e462]: mistral-7b-lora-r32
                      - generic [ref=e463]: Mistral · OpenHermes
                - cell "Stopped" [ref=e467]
                - cell "0.4277" [ref=e470]
                - cell "26.7K / 32K" [ref=e471]:
                  - generic [ref=e473]:
                    - text: 26.7K
                    - generic [ref=e474]: / 32K
                - cell "4h 31m" [ref=e477]
                - cell "Nov 9 at 06:14" [ref=e478]
                - cell "—" [ref=e479]
              - row [ref=e480]:
                - cell [ref=e481]:
                  - link "bert-large-ner BERT · CoNLL-2003" [ref=e482]:
                    - /url: "#/runs/run-013"
                    - generic [ref=e486]:
                      - strong [ref=e487]: bert-large-ner
                      - generic [ref=e488]: BERT · CoNLL-2003
                - cell "Completed" [ref=e492]
                - cell "0.4527" [ref=e495]
                - cell "28.4K / 28.4K" [ref=e496]:
                  - generic [ref=e498]:
                    - text: 28.4K
                    - generic [ref=e499]: / 28.4K
                - cell "4h 54m" [ref=e502]
                - cell "Nov 9 at 05:06" [ref=e503]
                - cell "—" [ref=e504]
              - row [ref=e505]:
                - cell [ref=e506]:
                  - link "vit-large-patch16 ViT · ImageNet" [ref=e507]:
                    - /url: "#/runs/run-014"
                    - generic [ref=e511]:
                      - strong [ref=e512]: vit-large-patch16
                      - generic [ref=e513]: ViT · ImageNet
                - cell "Running" [ref=e517]
                - cell "0.4630" [ref=e520]
                - cell "30.1K / 36.1K" [ref=e521]:
                  - generic [ref=e523]:
                    - text: 30.1K
                    - generic [ref=e524]: / 36.1K
                - cell "5h 17m" [ref=e527]
                - cell "Nov 9 at 03:58" [ref=e528]
                - cell "—" [ref=e529]
              - row [ref=e530]:
                - cell [ref=e531]:
                  - link "gemma-2-9b-sft Gemma 2 · UltraChat" [ref=e532]:
                    - /url: "#/runs/run-015"
                    - generic [ref=e536]:
                      - strong [ref=e537]: gemma-2-9b-sft
                      - generic [ref=e538]: Gemma 2 · UltraChat
                - cell "Completed" [ref=e542]
                - cell "0.4582" [ref=e545]
                - cell "31.8K / 31.8K" [ref=e546]:
                  - generic [ref=e548]:
                    - text: 31.8K
                    - generic [ref=e549]: / 31.8K
                - cell "5h 40m" [ref=e552]
                - cell "Nov 9 at 02:50" [ref=e553]
                - cell "—" [ref=e554]
              - row [ref=e555]:
                - cell [ref=e556]:
                  - link "resnet101-imagenet ResNet · ImageNet" [ref=e557]:
                    - /url: "#/runs/run-016"
                    - generic [ref=e561]:
                      - strong [ref=e562]: resnet101-imagenet
                      - generic [ref=e563]: ResNet · ImageNet
                - cell "Completed" [ref=e567]
                - cell "0.4466" [ref=e570]
                - cell "33.5K / 33.5K" [ref=e571]:
                  - generic [ref=e573]:
                    - text: 33.5K
                    - generic [ref=e574]: / 33.5K
                - cell "6h 3m" [ref=e577]
                - cell "Nov 9 at 01:42" [ref=e578]
                - cell "—" [ref=e579]
              - row [ref=e580]:
                - cell [ref=e581]:
                  - link "distilbert-classification DistilBERT · SST-2" [ref=e582]:
                    - /url: "#/runs/run-017"
                    - generic [ref=e586]:
                      - strong [ref=e587]: distilbert-classification
                      - generic [ref=e588]: DistilBERT · SST-2
                - cell "Failed" [ref=e592]
                - cell "3.5000" [ref=e595]
                - cell "35.2K / 42.2K" [ref=e596]:
                  - generic [ref=e598]:
                    - text: 35.2K
                    - generic [ref=e599]: / 42.2K
                - cell "6h 26m" [ref=e602]
                - cell "Nov 9 at 00:34" [ref=e603]
                - cell [ref=e604]:
                  - link "1 data issues in distilbert-classification" [ref=e605]:
                    - /url: "#/runs/run-017?tab=quality"
                    - text: "1"
              - row [ref=e608]:
                - cell [ref=e609]:
                  - link "qwen2.5-3b-instruct Qwen 2.5 · OpenHermes" [ref=e610]:
                    - /url: "#/runs/run-018"
                    - generic [ref=e614]:
                      - strong [ref=e615]: qwen2.5-3b-instruct
                      - generic [ref=e616]: Qwen 2.5 · OpenHermes
                - cell "Completed" [ref=e620]
                - cell "0.4517" [ref=e623]
                - cell "36.9K / 36.9K" [ref=e624]:
                  - generic [ref=e626]:
                    - text: 36.9K
                    - generic [ref=e627]: / 36.9K
                - cell "6h 49m" [ref=e630]
                - cell "Nov 8 at 23:26" [ref=e631]
                - cell "—" [ref=e632]
              - row [ref=e633]:
                - cell [ref=e634]:
                  - link "gpt2-medium-pretrain GPT-2 · WikiText" [ref=e635]:
                    - /url: "#/runs/run-019"
                    - generic [ref=e639]:
                      - strong [ref=e640]: gpt2-medium-pretrain
                      - generic [ref=e641]: GPT-2 · WikiText
                - cell "Stopped" [ref=e645]
                - cell "0.4808" [ref=e648]
                - cell "38.6K / 46.3K" [ref=e649]:
                  - generic [ref=e651]:
                    - text: 38.6K
                    - generic [ref=e652]: / 46.3K
                - cell "7h 11m" [ref=e655]
                - cell "Nov 8 at 22:18" [ref=e656]
                - cell "—" [ref=e657]
              - row [ref=e658]:
                - cell [ref=e659]:
                  - link "t5-small-translation T5 · WMT16" [ref=e660]:
                    - /url: "#/runs/run-020"
                    - generic [ref=e664]:
                      - strong [ref=e665]: t5-small-translation
                      - generic [ref=e666]: T5 · WMT16
                - cell "Completed" [ref=e670]
                - cell "0.5211" [ref=e673]
                - cell "40.3K / 40.3K" [ref=e674]:
                  - generic [ref=e676]:
                    - text: 40.3K
                    - generic [ref=e677]: / 40.3K
                - cell "7h 34m" [ref=e680]
                - cell "Nov 8 at 21:10" [ref=e681]
                - cell "—" [ref=e682]
          - generic [ref=e683]:
            - generic [ref=e684]:
              - text: Showing
              - strong [ref=e685]: "20"
              - text: of
              - strong [ref=e686]: "20"
              - text: experiments
            - generic [ref=e687]: All timestamps in UTC Deterministic demo
        - generic [ref=e689]:
          - generic [ref=e693]:
            - heading "One million points. One spike. Nothing swept away." [level=3] [ref=e694]
            - paragraph [ref=e695]: Open the large-series run to see why a smooth chart isn’t always an honest one.
          - link "Investigate the signal" [ref=e696]:
            - /url: "#/runs/run-001"
    - contentinfo [ref=e699]:
      - generic [ref=e700]: Built for the signal, including the noise.
      - generic [ref=e703]:
        - text: SOUP OBSERVATORY
        - generic [ref=e704]: / 1.0
  - dialog "Find a training run" [ref=e706]:
    - generic [ref=e707]:
      - generic [ref=e711]: Find a training run
      - textbox "Find a training run" [ref=e712]:
        - /placeholder: Search by name, model, or run ID…
        - text: whisper
      - button "Close search" [ref=e713] [cursor=pointer]
    - button "whisper-small-en Whisper Completed" [ref=e718] [cursor=pointer]:
      - generic [ref=e722]:
        - strong [ref=e723]: whisper-small-en
        - generic [ref=e724]: Whisper
      - generic [ref=e725]: Completed
    - generic [ref=e727]:
      - text: K to toggle
      - generic [ref=e730]: ESC to close
```

# Test source

```ts
  36  |   await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  37  |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  38  |   await page.getByRole('button', { name: 'Failed', exact: true }).click();
  39  |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(3);
  40  |   await expect(page).toHaveURL(/status=failed/);
  41  |   await page.getByRole('textbox', { name: 'Search runs', exact: true }).fill('not-a-real-run');
  42  |   await expect(page.getByRole('heading', { name: 'No runs in this view' })).toBeVisible();
  43  |   await page.getByRole('button', { name: 'Clear filters' }).click();
  44  |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  45  |   await page.getByRole('combobox', { name: 'Sort runs' }).selectOption('name');
  46  |   await expect(page.locator('.runs-table tbody tr').first()).toContainText('bert-base-sentiment');
  47  |   await page.reload();
  48  |   await expect(page.getByRole('combobox', { name: 'Sort runs' })).toHaveValue('name');
  49  |   await page.getByRole('combobox', { name: 'Sort runs' }).selectOption('loss');
  50  |   const losses = await page.locator('.runs-table tbody tr td:nth-child(3)').allTextContents();
  51  |   const numeric = losses.map(text => Number(text.replaceAll(',', '')));
  52  |   expect(numeric).toEqual([...numeric].sort((a, b) => a - b));
  53  | });
  54  | 
  55  | test('million-point spike remains painted in overview, narrow zoom and reset', async ({ page }) => {
  56  |   await openRun(page);
  57  |   await expect(page.getByText('Synthetic data', { exact: true })).toBeVisible();
  58  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  59  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  60  |   await assertSpikeActuallyDrawn(page);
  61  |   await page.getByRole('button', { name: 'Inspect spike' }).click();
  62  |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  63  |   await expect(page.getByRole('spinbutton', { name: 'Start step' })).toHaveValue('490000');
  64  |   await expect(page.getByRole('spinbutton', { name: 'End step' })).toHaveValue('510000');
  65  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '20001');
  66  |   await assertSpikeActuallyDrawn(page);
  67  |   await page.getByRole('spinbutton', { name: 'Start step' }).fill('499999');
  68  |   await page.getByRole('spinbutton', { name: 'End step' }).fill('500001');
  69  |   await page.getByRole('button', { name: 'Apply range' }).click();
  70  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '3');
  71  |   await assertSpikeActuallyDrawn(page);
  72  |   await page.getByRole('button', { name: 'Reset zoom', exact: true }).click();
  73  |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '1000000');
  74  |   await assertSpikeActuallyDrawn(page);
  75  | });
  76  | 
  77  | test('non-finite values produce visible disclosure and exact missing-value inspection', async ({ page }) => {
  78  |   await openRun(page, 'run-003', '?min=4199&max=4211');
  79  |   await expect(page.locator('.metric-chart--loss')).toContainText('11 non-finite');
  80  |   const chart = page.getByTestId('chart-loss');
  81  |   await chart.focus();
  82  |   await page.keyboard.press('Home');
  83  |   await page.keyboard.press('ArrowRight');
  84  |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('Missing / excluded');
  85  |   await page.locator('.metric-chart--loss summary').click();
  86  |   await expect(page.locator('.metric-chart--loss table')).toContainText('Missing / excluded');
  87  |   await page.getByRole('tab', { name: /Data quality/ }).click();
  88  |   await expect(page.getByRole('tabpanel')).toContainText('Non-finite loss measurements are shown as gaps, never as zero.');
  89  |   await expect(page.getByRole('tabpanel')).toContainText('11 affected');
  90  | });
  91  | 
  92  | test('duplicate, unordered and missing-step observations remain discoverable', async ({ page }) => {
  93  |   for (const [id, expected] of [
  94  |     ['run-005', 'Out-of-order measurements were sorted by numeric step.'],
  95  |     ['run-006', 'Duplicate steps use the last received measurement.'],
  96  |     ['run-007', 'Missing steps break the line; values are not interpolated.'],
  97  |   ]) {
  98  |     await openRun(page, id);
  99  |     await page.getByRole('tab', { name: /Data quality/ }).click();
  100 |     await expect(page.getByRole('tabpanel')).toContainText(expected);
  101 |   }
  102 | });
  103 | 
  104 | test('log scale discloses zero exclusions and linear restores the measured zero', async ({ page }) => {
  105 |   await openRun(page, 'run-008', '?min=595&max=610');
  106 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '0');
  107 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('log');
  108 |   await expect(page.locator('.metric-chart--loss')).toContainText(/plotted zero or negative/);
  109 |   await expect(page.locator('.metric-chart--loss')).toContainText('excluded from the log scale');
  110 |   await page.getByRole('combobox', { name: 'Chart scale' }).selectOption('linear');
  111 |   await expect(page.locator('.metric-chart--loss .metric-chart__warning')).toHaveCount(0);
  112 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', '0');
  113 | });
  114 | 
  115 | test('rapid run switching never paints previous run measurements under the next run title', async ({ page }) => {
  116 |   await page.goto('/#/runs/run-001');
  117 |   await expect(page.getByRole('heading', { name: 'llama-3.1-8b-finetune' })).toBeVisible();
  118 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  119 |   await page.getByRole('button', { name: 'Next run', exact: true }).click();
  120 |   await expect(page.getByRole('heading', { name: 'bert-base-sentiment' })).toBeVisible();
  121 |   await expect(page.locator('[data-run-id="run-003"]')).toHaveAttribute('data-ready', 'true');
  122 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-source-points', '11400');
  123 |   const max = Number(await page.getByTestId('chart-loss').getAttribute('data-max-value'));
  124 |   expect(max).toBeLessThan(4);
  125 |   await expect(page.locator('.metric-chart--loss')).toContainText('non-finite');
  126 | });
  127 | 
  128 | test('keyboard search opens a run and chart keyboard inspection reveals measured values', async ({ page }) => {
  129 |   await page.goto('/#/');
  130 |   await page.keyboard.press('Control+k');
  131 |   await expect(page.getByRole('dialog')).toBeVisible();
  132 |   await page.getByRole('textbox', { name: 'Find a training run' }).fill('whisper');
  133 |   await page.keyboard.press('Tab');
  134 |   await page.keyboard.press('Tab');
  135 |   await page.keyboard.press('Enter');
> 136 |   await expect(page.getByRole('dialog')).toHaveCount(0);
      |                                          ^ Error: expect(locator).toHaveCount(expected) failed
  137 |   await expect(page.getByRole('heading', { name: 'whisper-small-en' })).toBeVisible();
  138 |   await expect(page.locator('[data-ready="true"]')).toBeVisible();
  139 |   await page.getByTestId('chart-loss').focus();
  140 |   await page.keyboard.press('Home');
  141 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('Sampled step 0');
  142 |   await page.keyboard.press('End');
  143 |   await expect(page.locator('.metric-chart--loss .metric-chart__tooltip')).toContainText('21,599');
  144 | });
  145 | 
  146 | test('export identifies a sampled viewport and retains spike numeric value', async ({ page }) => {
  147 |   await openRun(page, 'run-001', '?min=499999&max=500001');
  148 |   const downloadEvent = page.waitForEvent('download');
  149 |   await page.getByRole('button', { name: 'Export view' }).click();
  150 |   const download = await downloadEvent;
  151 |   expect(download.suggestedFilename()).toBe('run-001-sampled-viewport.csv');
  152 |   const path = await download.path();
  153 |   expect(path).not.toBeNull();
  154 |   const csv = await readFile(path!, 'utf8');
  155 |   expect(csv).toContain('metric,step,value');
  156 |   expect(csv).toContain('loss,500000,9.4');
  157 |   await expect(page.getByRole('status').filter({ hasText: 'Sampled viewport exported.' })).toBeVisible();
  158 | });
  159 | 
  160 | test('mobile layout fits viewport and navigation remains reachable', async ({ page }) => {
  161 |   await page.setViewportSize({ width: 390, height: 844 });
  162 |   await page.goto('/#/');
  163 |   await expect(page.getByRole('heading', { name: 'Every run. A clearer picture.' })).toBeVisible();
  164 |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  165 |   await page.getByRole('button', { name: 'Open navigation' }).click();
  166 |   await page.getByRole('link', { name: 'Field guide' }).click();
  167 |   await expect(page.getByRole('heading', { name: 'Look closer. Keep the signal.' })).toBeVisible();
  168 |   await openRun(page);
  169 |   expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  170 |   await expect(page.getByTestId('chart-loss')).toBeVisible();
  171 |   await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  172 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  173 | });
  174 | 
  175 | test('unknown run fails clearly with a working recovery route', async ({ page }) => {
  176 |   await page.goto('/#/runs/does-not-exist');
  177 |   await expect(page.getByRole('heading', { name: 'Run not found' })).toBeVisible();
  178 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  179 |   await page.getByRole('link', { name: 'Back to training runs' }).click();
  180 |   await expect(page.locator('.runs-table tbody tr')).toHaveCount(20);
  181 | });
  182 | 
  183 | test('a worker failure never substitutes fabricated values and has a working retry path', async ({ page }) => {
  184 |   await page.route(/data\.worker-[^/]+\.js(?:\?.*)?$/, route => route.abort('failed'));
  185 |   await page.goto('/#/runs/run-001');
  186 |   await expect(page.getByRole('heading', { name: 'We couldn’t load this run' })).toBeVisible();
  187 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  188 |   await page.unroute(/data\.worker-[^/]+\.js(?:\?.*)?$/);
  189 |   await page.getByRole('button', { name: 'Try again', exact: false }).click();
  190 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  191 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  192 | });
  193 | 
  194 | test('an entirely invalid viewport shows unavailable values and never fabricates a zero curve', async ({ page }) => {
  195 |   await openRun(page, 'run-003', '?min=4200&max=4210');
  196 |   await expect(page.locator('.metric-chart--loss')).toContainText('No finite values in this range');
  197 |   await expect(page.locator('.detail-stats .overview-card').first()).toContainText('Unavailable');
  198 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-min-value', 'missing');
  199 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', 'missing');
  200 |   await page.locator('.metric-chart--loss summary').click();
  201 |   await expect(page.locator('.metric-chart--loss table tbody')).toContainText('Missing / excluded');
  202 | });
  203 | 
  204 | test('loading keeps previous-run charts out of the new run before worker data arrives', async ({ page }) => {
  205 |   let release: () => void = () => {};
  206 |   const gate = new Promise<void>(resolve => { release = resolve; });
  207 |   await page.route(/data\.worker-[^/]+\.js(?:\?.*)?$/, async route => { await gate; await route.continue(); });
  208 |   await page.goto('/#/runs/run-001');
  209 |   await expect(page.getByRole('status', { name: 'Loading run metrics' })).toBeVisible();
  210 |   await expect(page.getByText('Preparing training metrics…', { exact: true })).toBeVisible();
  211 |   await expect(page.getByTestId('chart-loss')).toHaveCount(0);
  212 |   release();
  213 |   await expect(page.locator('[data-run-id="run-001"]')).toHaveAttribute('data-ready', 'true');
  214 |   await expect(page.getByTestId('chart-loss')).toHaveAttribute('data-max-value', '9.4');
  215 | });
  216 | 
```