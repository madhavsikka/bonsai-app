import { BlockEditor } from '@/components/editor';
import { useGetLeaf } from '@/hooks/leaf/useGetLeaf';
import { useUpdateLeaf } from '@/hooks/leaf/useUpdateLeaf';
import { useParams } from 'react-router-dom';
import { Editor } from '@tiptap/core';
import { useCallback } from 'react';

export const LeafPage = () => {
  const { id } = useParams();
  const { leaf, loading } = useGetLeaf({ id });
  const { updateLeaf } = useUpdateLeaf({ id });

  const editorUpdateHandler = useCallback(
    (editor: Editor) => {
      updateLeaf({ id: id, title: leaf?.title, body: editor.getHTML() });
    },
    [id, leaf]
  );

  return !loading && leaf ? (
    <div className="h-full w-full">
      <BlockEditor
        initialContent={`${leaf.body}`}
        onEditorUpdate={editorUpdateHandler}
      />
    </div>
  ) : null;
};
