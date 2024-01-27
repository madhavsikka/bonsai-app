import { EditorContent, PureEditorContent } from '@tiptap/react';
import { useRef } from 'react';

import { LinkMenu } from './menus';

import { useBlockEditor } from '../../hooks/editor/useEditor';

import './styles/index.css';

import { Sidebar } from './sidebar/Sidebar';
import ImageBlockMenu from '@/extensions/ImageBlock/components/ImageBlockMenu';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { TiptapProps } from './types';
import { TextMenu } from './menus/TextMenu';
import { ContentItemMenu } from './menus/ContentItemMenu';

export const BlockEditor = ({
  initialContent,
  onEditorUpdate,
  isEditable,
}: TiptapProps) => {
  const menuContainerRef = useRef(null);
  const editorRef = useRef<PureEditorContent | null>(null);

  const { editor, characterCount, leftSidebar } = useBlockEditor({
    initialContent,
    isEditable,
    onEditorUpdate,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <Sidebar
        isOpen={leftSidebar.isOpen}
        onClose={leftSidebar.close}
        editor={editor}
      />
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        <EditorContent
          editor={editor}
          ref={editorRef}
          className="flex-1 overflow-y-auto"
        />
        <ContentItemMenu editor={editor} />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
      </div>
    </div>
  );
};

export default BlockEditor;
