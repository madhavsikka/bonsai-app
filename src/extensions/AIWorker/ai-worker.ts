import { Extension, JSONContent } from '@tiptap/core';
export const AIWorkerExtensionName = 'aiWorker';

export interface WorkerAIExtensions {
  name: string;
  prompt: string;
  interval: number;
}

export interface WorkerAIBlock {
  blockId: string;
  text: string;
}

interface AIWorkerExtensionOptions {
  openAIAPIKey?: string;
  worker: Worker | null;
  workerExtensions: WorkerAIExtensions[];
  debouncedUpdate: (() => void) | undefined;
}

function debounce(func: (...args: any[]) => void, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: any[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export const AIWorkerExtension = Extension.create<AIWorkerExtensionOptions>({
  name: AIWorkerExtensionName,

  addOptions() {
    return {
      worker: null,
      openAIAPIKey: '',
      workerExtensions: [] as WorkerAIExtensions[],
      debouncedUpdate: undefined,
    };
  },

  onCreate() {
    const worker = new Worker(
      new URL('@/workers/reflect.ts', import.meta.url),
      {
        type: 'module',
      }
    );
    worker.onmessage = (event: MessageEvent) => {
      console.log('Received message from worker:', event.data);
    };
    this.options.worker = worker;

    this.options.debouncedUpdate = debounce(() => {
      console.log('OnUpdate Worker Extensions:', this.options.workerExtensions);

      const worker = this.options.worker;
      const workerExtensions: WorkerAIExtensions[] =
        this.options.workerExtensions;

      const collectTextBlocks = (doc: JSONContent): string[] => {
        const blocks: string[] = [];

        if (doc.text) {
          blocks.push(doc.text);
        }
        blocks.push(...(doc.content?.flatMap(collectTextBlocks) ?? []));

        return blocks;
      };

      const collectReflectBlocks = (doc: JSONContent): WorkerAIBlock[] => {
        const blocks: WorkerAIBlock[] = [];

        if (doc.attrs?.blockId) {
          blocks.push({
            blockId: doc.attrs.blockId,
            text: collectTextBlocks(doc).join(' '),
          });
        }
        blocks.push(...(doc.content?.flatMap(collectReflectBlocks) ?? []));

        return blocks;
      };

      const blocks = collectReflectBlocks(this.editor.getJSON());

      workerExtensions.forEach((workExt) => {
        const { name, prompt } = workExt;

        worker?.postMessage({
          name: name,
          prompt: prompt,
          blocks: blocks,
          openaiApiKey: this.options.openAIAPIKey,
        });
      });
    }, 5000);
  },

  addWorkerExtension(extension: WorkerAIExtensions) {
    console.log('Adding Worker Extension:', extension);
    this.options.workerExtensions.push(extension);
  },

  onUpdate() {
    this.options.debouncedUpdate?.();
  },

  onDestroy() {
    this.options.workerExtensions.forEach((workExt: WorkerAIExtensions) => {
      clearInterval(workExt.interval);
    });
    if (this.options.worker) {
      this.options.worker.terminate();
    }
  },
});
