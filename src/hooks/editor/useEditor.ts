import { useEditor } from '@tiptap/react';
import { ExtensionKit } from '../../extensions/extension-kit';
import { useSidebar } from '../useSidebar';
import { Editor, Extension } from '@tiptap/core';
import { useDebouncedCallback } from 'use-debounce';
import {
  AIWorkerExtensionName,
  WorkerAIExtensions,
} from '@/extensions/AIWorker/ai-worker';
import { useConfig } from '@/providers/ConfigProvider';

export const createDynamicExtension = (options: WorkerAIExtensions) => {
  return Extension.create({
    name: options.name,

    onCreate() {
      const aiWorkerExtension: any =
        this.editor.extensionManager.extensions.find(
          (extension) => extension.name === AIWorkerExtensionName
        );

      if (aiWorkerExtension) {
        const workerExtensions =
          aiWorkerExtension.options.workerExtensions || [];
        workerExtensions.push({
          extensionName: this.name,
          prompt: options.prompt,
          interval: options.interval,
        });
        aiWorkerExtension.options.workerExtensions = workerExtensions;
      } else {
        console.error('AIWorkerExtension not found.');
      }
    },
  });
};

export interface useBlockEditorProps {
  initialContent?: string;
  onEditorUpdate?: (editor: Editor) => void;
  isEditable?: boolean;
}

const myDynamicExtension = createDynamicExtension({
  name: 'myDynamicExtension',
  prompt: 'Enter your prompt here',
  interval: 5000,
});

const DEFAULT_RETURN = {
  editor: null,
  characterCount: null,
  leftSidebar: null,
};

export const useBlockEditor = ({
  initialContent,
  onEditorUpdate,
}: useBlockEditorProps) => {
  const { config } = useConfig();
  if (!config) {
    return DEFAULT_RETURN;
  }

  const leftSidebar = useSidebar();

  const onDebouncedEditorUpdate = useDebouncedCallback((value) => {
    onEditorUpdate?.(value);
  }, 1000);

  const editor = useEditor(
    {
      autofocus: true,
      content: initialContent || '',
      extensions: [
        ...ExtensionKit({
          openAIAPIKey: config.openaiApiKey,
        }),
        myDynamicExtension,
      ],
      onUpdate: ({ editor }) => {
        onDebouncedEditorUpdate(editor);
      },
      editorProps: {
        attributes: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          spellcheck: 'false',
          class: 'min-h-full',
        },
      },
    },
    []
  );

  const characterCount = editor?.storage.characterCount || {
    characters: () => 0,
    words: () => 0,
  };

  // @ts-ignore
  window.editor = editor;

  return { editor, characterCount, leftSidebar };
};
