import type { RunStatus, RunSummary } from '../domain/types';
import { SOURCE_SNAPSHOT } from './source';

const names = [
  'llama-3.1-8b-finetune',
  'mistral-7b-instruct-v3',
  'bert-base-sentiment',
  'llama-3.1-8b-lr-sweep',
  'vit-base-imagenet',
  'gpt2-wikitext-baseline',
  'resnet50-cifar100',
  'qwen2.5-7b-dpo',
  'whisper-small-en',
  't5-base-summarization',
  'llama-3.1-8b-lora-r16',
  'mistral-7b-lora-r32',
  'bert-large-ner',
  'vit-large-patch16',
  'gemma-2-9b-sft',
  'resnet101-imagenet',
  'distilbert-classification',
  'qwen2.5-3b-instruct',
  'gpt2-medium-pretrain',
  't5-small-translation',
];
const models = [
  'Llama 3.1',
  'Mistral',
  'BERT',
  'Llama 3.1',
  'ViT',
  'GPT-2',
  'ResNet',
  'Qwen 2.5',
  'Whisper',
  'T5',
  'Llama 3.1',
  'Mistral',
  'BERT',
  'ViT',
  'Gemma 2',
  'ResNet',
  'DistilBERT',
  'Qwen 2.5',
  'GPT-2',
  'T5',
];
const datasets = [
  'Alpaca',
  'OpenHermes',
  'SST-2',
  'Alpaca',
  'ImageNet',
  'WikiText',
  'CIFAR-100',
  'UltraFeedback',
  'LibriSpeech',
  'CNN/DailyMail',
  'Alpaca',
  'OpenHermes',
  'CoNLL-2003',
  'ImageNet',
  'UltraChat',
  'ImageNet',
  'SST-2',
  'OpenHermes',
  'WikiText',
  'WMT16',
];
const statuses: RunStatus[] = [
  'running',
  'running',
  'failed',
  'failed',
  'completed',
  'completed',
  'running',
  'stopped',
  'completed',
  'running',
  'completed',
  'stopped',
  'completed',
  'running',
  'completed',
  'completed',
  'failed',
  'completed',
  'stopped',
  'completed',
];
export function measurementAt(runIndex: number, step: number, pointCount: number) {
  const t = step / Math.max(1, pointCount - 1);
  const texture = Math.sin(step * 0.047 + runIndex) * 0.026 + Math.sin(step * 0.0071) * 0.016;
  let loss = Math.max(0.015, 2.6 * Math.exp(-t * 5.2) + 0.24 + runIndex * 0.014 + texture);
  let lr = Math.max(
    0,
    0.0003 * (t < 0.04 ? t / 0.04 : 0.5 * (1 + Math.cos((Math.PI * (t - 0.04)) / 0.96))),
  );
  let grad_norm = Math.max(0.01, 1.6 * Math.exp(-t * 2.4) + 0.22 + Math.sin(step * 0.031) * 0.12);
  if (runIndex === 0 && step === 500_000) {
    loss = 9.4;
    grad_norm = 12.8;
  }
  if (runIndex === 2 && step >= 4_200 && step <= 4_210) loss = NaN;
  if (runIndex === 3 && step === 6_000) {
    loss = Infinity;
    grad_norm = Infinity;
  }
  if (runIndex === 7 && step >= 600 && step <= 605) {
    loss = 0;
    lr = 0;
  }
  if (runIndex === 16 && t > 0.84) {
    loss = 1.5 + t * 2;
    grad_norm = 3 + t * 4;
  }
  return { loss, lr, grad_norm };
}
export const RUNS: readonly RunSummary[] = names.map((name, index) => {
  const pointCount = index === 0 ? 1_000_000 : 8_000 + index * 1_700;
  const lastStep = pointCount - 1 + (index === 6 ? 120 : 0);
  const loss = measurementAt(index, lastStep, pointCount).loss;
  const durationSeconds = index === 0 ? 18_742 : 1_200 + index * 1_373;
  const recordedEnd = Date.parse(SOURCE_SNAPSHOT.recordedAt) - index * 4_080_000;
  return {
    id: `run-${String(index + 1).padStart(3, '0')}`,
    name,
    model: models[index]!,
    dataset: datasets[index]!,
    status: statuses[index]!,
    steps: lastStep,
    maxSteps:
      index === 0
        ? 1_200_000
        : statuses[index] === 'completed'
          ? lastStep
          : Math.ceil((lastStep + 1) * 1.2),
    loss: Number.isFinite(loss) ? loss : null,
    startedAt: new Date(recordedEnd - durationSeconds * 1_000).toISOString(),
    durationSeconds,
    tags:
      index === 0
        ? ['fine-tuning', '1M points']
        : [index % 3 === 0 ? 'fine-tuning' : index % 3 === 1 ? 'experiment' : 'baseline'],
    issueCount:
      index === 3 || index === 5
        ? 2
        : index === 0 || (index >= 2 && index <= 7) || index === 16
          ? 1
          : 0,
    pointCount,
  };
});
