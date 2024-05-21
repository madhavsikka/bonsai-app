import { Extension, JSONContent } from '@tiptap/core';
import {
  WorkerAIMessage,
  WorkerAIMessagePayload,
  WorkerAIResponse,
} from '@/workers/reflect';
import { ChatMessage } from '@/hooks/ai/useChat';
export const AIWorkerExtensionName = 'aiWorker';

export interface WorkerAIExtensions {
  name: string;
  prompt: string;
  interval: number;
}

export interface WorkerAIBlock {
  blockId: string;
  text: string;
  aiChatMessages: ChatMessage[];
}

interface AIWorkerExtensionOptions {
  openAIAPIKey?: string;
  worker: Worker | null;
  workerExtensions: WorkerAIExtensions[];
  debouncedUpdate: (() => void) | undefined;
  previousBlocks: WorkerAIBlock[];
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
      worker: null,
      openAIAPIKey: '',
      workerExtensions: [] as WorkerAIExtensions[],
      debouncedUpdate: undefined,
      previousBlocks: [],
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
      const data = event.data as WorkerAIResponse;
      data.response.forEach((block) => {
        const { blockId, updatedText } = block;
        this.editor.commands.pushAIChatMessages(blockId, [
          {
            id: new Date().getTime().toString(),
            role: data.name,
            content: updatedText,
          },
        ]);
      });
    };
    this.options.worker = worker;

    // Debounce the update function.
    this.options.debouncedUpdate = debounce(() => {
      const worker = this.options.worker;
      // Compare current blocks with previous blocks
      const currentBlocks = collectReflectBlocks(this.editor.getJSON());
      const hasChanged = (block: WorkerAIBlock) => {
        const prevBlock = this.options.previousBlocks.find(
          (prevBlock) => prevBlock.blockId === block.blockId
        );
        return !prevBlock || prevBlock.text !== block.text;
      };
      const changedBlocks = currentBlocks.filter(hasChanged);

      changedBlocks.forEach((block) => {
        this.editor.commands.setAIChatMessages(block.blockId, []);
      });

      if (changedBlocks.length > 0) {
        this.options.previousBlocks = currentBlocks;
        this.options.workerExtensions?.forEach((workExt) => {
          const { name, prompt } = workExt;
          const workerAIMessagePayload: WorkerAIMessagePayload = {
            name: name,
            prompt: prompt,
            blocks: changedBlocks,
            openaiApiKey: this.options.openAIAPIKey ?? '',
          };
          worker?.postMessage(workerAIMessagePayload);
        });
      }
    }, 5000);
  },

  addCommands() {
    return {
      setWorkerExtensions:
        (extensions: WorkerAIExtensions[]) =>
        ({}) => {
          this.options.workerExtensions = extensions;
          return true;
        },
    };
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
