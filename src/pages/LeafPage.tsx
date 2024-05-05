import { BlockEditor } from '@/components/editor';
import { useGetLeaf } from '@/hooks/leaf/useGetLeaf';
import { useUpdateLeaf } from '@/hooks/leaf/useUpdateLeaf';
import { useParams } from 'react-router-dom';
import { Editor } from '@tiptap/core';
import { useCallback } from 'react';

export const LeafPage = () => {
  const { name } = useParams();
  const { leaf, loading } = useGetLeaf({ name: name ?? '' });
  const { updateLeaf } = useUpdateLeaf();

  const editorUpdateHandler = useCallback(
    (editor: Editor) => {
      updateLeaf({ name, content: editor.getHTML() });
    },
    [name, updateLeaf]
  );

  return (
    <>
      {!loading && leaf ? (
        <BlockEditor
          initialContent={`${leaf.content}`}
          onEditorUpdate={editorUpdateHandler}
        />
      ) : null}
    </>
  );
};
