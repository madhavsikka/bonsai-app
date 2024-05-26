import { Extension, JSONContent } from '@tiptap/core';
import { WorkerAIMessagePayload, WorkerAIResponse } from '@/workers/reflect';
import { ChatMessageRole } from '@/hooks/ai/useChat';
import { WorkerAIBlock } from '../Reflect';
export const AIWorkerExtensionName = 'aiWorker';

export interface WorkerAIExtensions {
  name: string;
  prompt: string;
  interval: number;
}

interface AIWorkerExtensionOptions {
  openAIAPIKey?: string;
}

interface AIWorkerExtensionStorage {
  worker: Worker | null;
  workerExtensions: WorkerAIExtensions[];
  debouncedUpdate: (() => void) | undefined;
  previousBlocks: WorkerAIBlock[];
}

export function debounce(func: (...args: any[]) => void, delay: number) {
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
    const text = collectTextBlocks(doc).join(' ');
    if (text.trim().length > 0) {
      blocks.push({
        blockId: doc.attrs.blockId,
        text: text.trim(),
        aiChatMessages: doc.attrs?.aiChatMessages ?? [],
      });
    }
  }
  blocks.push(...(doc.content?.flatMap(collectReflectBlocks) ?? []));

  return blocks;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    AIWorkerExtensionName: {
      setWorkerExtensions(extensions: WorkerAIExtensions[]): ReturnType;
    };
  }
}

export const AIWorkerExtension = Extension.create<AIWorkerExtensionOptions>({
  name: AIWorkerExtensionName,

  addOptions() {
    return {
      openAIAPIKey: '',
    };
  },

  addStorage() {
    return {
      worker: null,
      workerExtensions: [] as WorkerAIExtensions[],
      debouncedUpdate: undefined,
      previousBlocks: [],
    } as AIWorkerExtensionStorage;
  },

  onCreate() {
    const worker = new Worker(
      new URL('@/workers/reflect.ts', import.meta.url),
      {
        type: 'module',
      }
    );

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as WorkerAIResponse;
      data.response.forEach((block) => {
        const { blockId, updatedText } = block;
        this.editor.commands.pushAIChatMessagesForGroup(blockId, data.name, [
          {
            id: new Date().getTime().toString(),
            role: data.name as ChatMessageRole,
            content: updatedText,
          },
        ]);
      });
    };
    this.storage.worker = worker;

    this.storage.debouncedUpdate = debounce(() => {
      const worker = this.storage.worker;

      const currentBlocks = collectReflectBlocks(this.editor.getJSON());
      const hasChanged = (block: WorkerAIBlock) => {
        const prevBlock = this.storage.previousBlocks.find(
          (prevBlock: WorkerAIBlock) => prevBlock.blockId === block.blockId
        );
        return !prevBlock || prevBlock.text !== block.text;
      };
      const changedBlocks: WorkerAIBlock[] = currentBlocks.filter(hasChanged);

      changedBlocks.forEach((block) => {
        this.editor.commands.unsetAIChatMessages(block.blockId);
      });

      if (changedBlocks.length > 0) {
        this.storage.previousBlocks = currentBlocks;
        this.storage.workerExtensions?.forEach(
          (workExt: WorkerAIExtensions) => {
            const { name, prompt } = workExt;
            const workerAIMessagePayload: WorkerAIMessagePayload = {
              name: name,
              prompt: prompt,
              blocks: changedBlocks,
              openaiApiKey: this.options.openAIAPIKey ?? '',
            };
            worker?.postMessage(workerAIMessagePayload);
          }
        );
      }
    }, 5000);
  },

  addCommands() {
    return {
      setWorkerExtensions:
        (extensions: WorkerAIExtensions[]) =>
        ({}) => {
          this.storage.workerExtensions = extensions;
          return true;
        },
    };
  },

  onUpdate() {
    this.storage.debouncedUpdate?.();
  },

  onDestroy() {
    this.storage.workerExtensions.forEach((workExt: WorkerAIExtensions) => {
      clearInterval(workExt.interval);
    });
    if (this.storage.worker) {
      this.storage.worker.terminate();
    }
  },
});
