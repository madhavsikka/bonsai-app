import { Extension, JSONContent } from '@tiptap/core';

interface ReflectExtensionOptions {
  shortcut: string;
  onShortcut: () => void;
  openAIAPIKey?: string;
}

interface ReflectBlock {
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

const collectReflectBlocks = (doc: JSONContent): ReflectBlock[] => {
  const blocks: ReflectBlock[] = [];

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
        const blockIds = reflectBlocks.map((block) => block.blockId);
        console.log(JSON.stringify(editor.getJSON()));
        console.log('Reflect blocks:', blockIds);
        editor.commands.addNotificationDot(blockIds);
        return true;

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