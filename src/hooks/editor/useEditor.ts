import { useEditor } from '@tiptap/react';

import { ExtensionKit } from '../../extensions/extension-kit';
import { useSidebar } from '../useSidebar';
import { Editor } from '@tiptap/core';

export interface useBlockEditorProps {
  initialContent?: string;
  onEditorUpdate?: (editor: Editor) => void;
  isEditable?: boolean;
}

export const useBlockEditor = ({ initialContent }: useBlockEditorProps) => {
  const leftSidebar = useSidebar();

  const editor = useEditor(
    {
      autofocus: true,
      content: initialContent || '',
      extensions: [...ExtensionKit({})],
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
