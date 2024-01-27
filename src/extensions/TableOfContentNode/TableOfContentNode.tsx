import { Node, NodeViewRendererProps } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { TableOfContents } from '@/components/editor/sidebar/TableOfContents';

const TableOfNodeContent = (props: NodeViewRendererProps) => {
  const { editor } = props;

  return (
    <NodeViewWrapper>
      <div className="p-2 -m-2 rounded-lg" contentEditable={false}>
        <TableOfContents editor={editor} />
      </div>
    </NodeViewWrapper>
  );
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableOfContentNode: {
      insertTableOfContent: () => ReturnType;
    };
  }
}

export const TableOfContentNode = Node.create({
  name: 'tableOfContentNode',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  inline: false,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="table-of-content"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-type': 'table-of-content' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableOfNodeContent);
  },

  addCommands() {
    return {
      insertTableOfContent:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});
