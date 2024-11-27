import { ChatMessage } from '@/hooks/ai/useChat';
import { Extension, JSONContent } from '@tiptap/core';

interface ReflectExtensionOptions {
  shortcut: string;
  onShortcut: () => void;
  openAIAPIKey?: string;
}

export interface WorkerAIBlock {
  blockId: string;
  text: string;
  aiChatMessages?: Record<string, ChatMessage[]>;
}

export interface WorkerAIResponseBlock {
  blockId: string;
  text: string;
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
    blocks.push({
      blockId: doc.attrs.blockId,
      text: collectTextBlocks(doc).join(' '),
    });
  }
  blocks.push(...(doc.content?.flatMap(collectReflectBlocks) ?? []));

  return blocks;
};

export const Reflect = Extension.create<ReflectExtensionOptions>({
  name: 'reflect',

  addOptions() {
    return {
      shortcut: 'Mod-j',
      onShortcut: () => {},
      openAIAPIKey: undefined,
    };
  },

  addKeyboardShortcuts() {
    return {
      [this.options.shortcut]: () => {
        const editor = this.editor;
        const reflectBlocks = collectReflectBlocks(editor.getJSON());
        for (const block of reflectBlocks) {
          editor.commands.insertInlineChatAfterBlock(block.blockId);
        }

        const worker = new Worker(
          new URL('@/workers/reflect.ts', import.meta.url),
          {
            type: 'module',
          }
        );

        worker.onmessage = (event: MessageEvent) => {
          console.log('Received message from worker:', event.data);
        };

        worker.postMessage({
          key: this.options.openAIAPIKey ?? '',
          blocks: reflectBlocks,
        });

        return true;
      },
    };
  },
});
