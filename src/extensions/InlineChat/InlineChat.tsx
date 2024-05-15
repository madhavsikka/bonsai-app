import { CommandProps, mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { v4 as uuid } from 'uuid';
import { InlineChatView } from './components/InlineChatView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineChat: {
      setInlineChat: () => ReturnType;
      insertInlineChatAfterBlock: (
        blockId: string,
        initialMessage?: string
      ) => ReturnType;
      insertOrReuseInlineChatAfterBlock: (
        blockId: string,
        initialMessage?: string
      ) => ReturnType;
      hideAllInlineChats: () => ReturnType;
    };
  }
}

export const InlineChat = Node.create({
  name: 'inlineChat',

  group: 'block',

  draggable: false,

  addKeyboardShortcuts() {
    return {
      'Mod-j': () => this.editor.commands.setInlineChat(),
    };
  },

  addOptions() {
    return {
      authorId: undefined,
      authorName: undefined,
      HTMLAttributes: {
        class: `node-${this.name}`,
      },
    };
  },

  addAttributes() {
    return {
      id: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-id'),
        renderHTML: (attributes) => ({
          'data-id': attributes.id,
        }),
      },
      blockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-block-id'),
        renderHTML: (attributes) => ({
          'data-block-id': attributes.blockId,
        }),
      },
      authorId: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-author-id'),
        renderHTML: (attributes) => ({
          'data-author-id': attributes.authorId,
        }),
      },
      authorName: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-author-name'),
        renderHTML: (attributes) => ({
          'data-author-name': attributes.authorName,
        }),
      },
      hidden: {
        default: false,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-hidden') === 'true',
        renderHTML: (attributes: { hidden?: boolean }) => ({
          'data-hidden': attributes.hidden ? 'true' : 'false',
        }),
      },
      initialMessage: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-initial-message'),
        renderHTML: (attributes) => ({
          'data-initial-message': attributes.initialMessage,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `div.node-${this.name}`,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setInlineChat:
        () =>
        ({ chain }: CommandProps) =>
          chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: {
                id: uuid(),
                blockId: uuid(),
                authorId: this.options.authorId,
                authorName: this.options.authorName,
              },
            })
            .run(),

      insertInlineChatAfterBlock:
        (blockId: string, initialMessage?: string) =>
        ({ chain, tr }: CommandProps) => {
          const { doc } = tr;
          let blockPos: number | null = null;

          doc.nodesBetween(0, doc.content.size, (node, pos) => {
            if (node.attrs.blockId === blockId) {
              blockPos = pos + node.nodeSize;
              return false; // Stop the iteration
            }
          });

          if (blockPos === null) {
            return false;
          }

          chain()
            .focus()
            .insertContentAt(blockPos, {
              type: this.name,
              attrs: {
                id: uuid(),
                blockId: blockId, // target blockId
                authorId: this.options.authorId,
                authorName: this.options.authorName,
                initialMessage,
              },
            })
            .run();

          return true;
        },

      insertOrReuseInlineChatAfterBlock:
        (blockId: string, initialMessage?: string) =>
        ({ state, dispatch }: CommandProps) => {
          const { tr } = state;
          const { doc } = tr;
          let blockPos: number | null = null;
          let existingInlineChatPos: number | null = null;

          doc.descendants((node, pos) => {
            if (
              node.type.name === this.name &&
              node.attrs.blockId === blockId
            ) {
              existingInlineChatPos = pos;
              return false; // Stop the iteration
            }
            if (node.attrs.blockId === blockId) {
              blockPos = pos + node.nodeSize;
            }
          });

          if (existingInlineChatPos !== null) {
            tr.delete(existingInlineChatPos, existingInlineChatPos + 1);
          }

          // Recalculate blockPos after deleting the node
          blockPos = null;
          doc.descendants((node, pos) => {
            if (node.attrs.blockId === blockId) {
              blockPos = pos + node.nodeSize;
            }
          });

          if (blockPos !== null) {
            tr.insert(
              blockPos,
              this.type.create({
                id: uuid(),
                blockId: blockId,
                authorId: this.options.authorId,
                authorName: this.options.authorName,
                initialMessage,
              })
            );
          }

          dispatch?.(tr);

          return true;
        },

      hideAllInlineChats:
        () =>
        ({ chain, state }: CommandProps) => {
          const { tr } = state;
          const { doc } = tr;

          doc.descendants((node, pos) => {
            if (node.type.name === this.name) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                hidden: true,
              });
            }
          });

          return chain().updateAttributes(this.name, { hidden: true }).run();
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineChatView, {
      attrs: { blockId: uuid() },
    });
  },
});

export default InlineChat;
