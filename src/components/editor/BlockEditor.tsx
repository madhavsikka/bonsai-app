import { EditorContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';
import { LinkMenu } from './menus';
import { useBlockEditor } from '../../hooks/editor/useEditor';
import { Sidebar } from './sidebar/Sidebar';
import { ColumnsMenu } from '@/extensions/MultiColumn/menus';
import { TableColumnMenu, TableRowMenu } from '@/extensions/Table/menus';
import { TiptapProps } from './types';
import { TextMenu } from './menus/TextMenu';
import { EditorHeader } from './bars/EditorHeader';
import './styles/index.css';

export const BlockEditor = ({
  initialContent,
  onEditorUpdate,
  isEditable,
}: TiptapProps) => {
  const menuContainerRef = useRef(null);

  const { editor, leftSidebar, characterCount } = useBlockEditor({
    initialContent,
    isEditable,
    onEditorUpdate,
  });

  useEffect(() => {
    if (editor) {
      editor.commands.focus('end');
    }
  }, [editor]);

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
        <EditorHeader
          characters={characterCount.characters()}
          words={characterCount.words()}
          isSidebarOpen={leftSidebar.isOpen}
          toggleSidebar={leftSidebar.toggle}
        />
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
      </div>
    </div>
  );
};

export default BlockEditor;
