import { CommandProps, mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { v4 as uuid } from 'uuid';
import { InlineChatView } from './components/InlineChatView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineChat: {
      setInlineChat: () => ReturnType;
      insertInlineChatAfterBlock: (blockId: string) => ReturnType;
      hideAllInlineChats: () => ReturnType;
    };
  }
}

export const InlineChat = Node.create({
  name: 'inlineChat',

  group: 'block',

  draggable: true,

  addKeyboardShortcuts() {
    return {
      'Mod-k': () => this.editor.commands.setInlineChat(),
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
                authorId: this.options.authorId,
                authorName: this.options.authorName,
              },
            })
            .run(),

      insertInlineChatAfterBlock:
        (blockId: string) =>
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
                authorId: this.options.authorId,
                authorName: this.options.authorName,
              },
            })
            .run();

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
    return ReactNodeViewRenderer(InlineChatView);
  },
});

export default InlineChat;
