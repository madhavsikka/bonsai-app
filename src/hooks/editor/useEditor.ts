import { useEditor } from '@tiptap/react';
import { ExtensionKit } from '../../extensions/extension-kit';
import { useSidebar } from '../useSidebar';
import { Editor } from '@tiptap/core';
import { useDebouncedCallback } from 'use-debounce';
import { useConfig } from '@/providers/ConfigProvider';
import { useListSages } from '../sage/useSages';
import { useEffect } from 'react';
import { AIWorkerExtensionName } from '@/extensions/AIWorker/ai-worker';

export interface useBlockEditorProps {
  initialContent?: string;
  onEditorUpdate?: (editor: Editor) => void;
  isEditable?: boolean;
}

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

  const { sages } = useListSages();

  const editor = useEditor(
    {
      autofocus: true,
      content: initialContent || '',
      extensions: ExtensionKit({
        openAIAPIKey: config.openaiApiKey,
      }),
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

  useEffect(() => {
    const exts = sages?.map((sage) => {
      return {
        name: sage.name,
        prompt: sage.description,
        interval: 5000,
      };
    });
    editor?.commands.setWorkerExtensions(exts);
  }, [sages, editor]);

  const characterCount = editor?.storage.characterCount || {
    characters: () => 0,
    words: () => 0,
  };

  // @ts-ignore
  window.editor = editor;

  return { editor, characterCount, leftSidebar };
};
