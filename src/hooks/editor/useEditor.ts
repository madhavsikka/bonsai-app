import { useEditor } from '@tiptap/react';
import { ExtensionKit } from '../../extensions/extension-kit';
import { useSidebar } from '../useSidebar';
import { Editor } from '@tiptap/core';
import { useDebouncedCallback } from 'use-debounce';
import { useAppConfig } from '@/providers/AppConfigProvider';

export interface useBlockEditorProps {
  initialContent?: string;
  onEditorUpdate?: (editor: Editor) => void;
  isEditable?: boolean;
}

export const useBlockEditor = ({
  initialContent,
  onEditorUpdate,
}: useBlockEditorProps) => {
  const leftSidebar = useSidebar();

  const { openAIAPIKey } = useAppConfig();

  const onDebouncedEditorUpdate = useDebouncedCallback((value) => {
    onEditorUpdate?.(value);
  }, 2000);

  const editor = useEditor(
    {
      autofocus: true,
      content: initialContent || '',
      extensions: [...ExtensionKit({ openAIAPIKey })],
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
    [openAIAPIKey]
  );

  const characterCount = editor?.storage.characterCount || {
    characters: () => 0,
    words: () => 0,
  };

  // @ts-ignore
  window.editor = editor;

  return { editor, characterCount, leftSidebar };
};
