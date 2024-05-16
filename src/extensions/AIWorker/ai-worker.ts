import { ChatMessageRole } from '@/hooks/ai/useChat';
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
      });
    }
  }
  blocks.push(...(doc.content?.flatMap(collectReflectBlocks) ?? []));

  return blocks;
};

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
      console.log('Received message from worker:', event.data);
      event.data.response.forEach((block: any) => {
        // this.editor.commands.insertOrReuseInlineChatAfterBlock(
        //   block.blockId,
        //   block.updatedText,
        //   true
        // );
        // this.editor.storage.
        const blockId = block.blockId as string;
        const updatedText = block.updatedText as string;
        // this.editor.commands.updateInlineChatMessagesInStorage(blockId, [
        //   {
        //     id: blockId,
        //     role: ChatMessageRole.Bonsai,
        //     content: updatedText,
        //   },
        // ]);
        // this.editor.commands.addNotificationDot(block.blockId);
      });
    };
    this.options.worker = worker;

    // Debounce the update function.
    this.options.debouncedUpdate = debounce(() => {
      const worker = this.options.worker;
      const workerExtensions: WorkerAIExtensions[] =
        this.options.workerExtensions;

      // Compare current blocks with previous blocks
      const currentBlocks = collectReflectBlocks(this.editor.getJSON());
      const hasChanged = (block: WorkerAIBlock) => {
        const prevBlock = this.options.previousBlocks.find(
          (prevBlock) => prevBlock.blockId === block.blockId
        );
        return !prevBlock || prevBlock.text !== block.text;
      };
      const changedBlocks = currentBlocks.filter(hasChanged);

      // changedBlocks.forEach((block) => {
      //   this.editor.commands.deleteInlineChat(block.blockId);
      // });

      if (changedBlocks.length > 0) {
        this.options.previousBlocks = currentBlocks;
        workerExtensions.forEach((workExt) => {
          const { name, prompt } = workExt;
          worker?.postMessage({
            name: name,
            prompt: prompt,
            blocks: changedBlocks,
            openaiApiKey: this.options.openAIAPIKey,
          });
        });
      }
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
