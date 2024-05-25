import { CommandProps, mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { v4 as uuid } from 'uuid';
import { InlineChatView } from './components/InlineChatView';
import { ChatMessage } from '@/hooks/ai/useChat';
import { message } from '@tauri-apps/api/dialog';

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
      updateInlineChatMessagesInStorage: (
        blockId: string,
        updatedMessages: ChatMessage[]
      ) => ReturnType;
      insertInlineChatInput: (blockId: string) => ReturnType;
      deleteInlineChat: (blockId: string) => ReturnType;
      hideAllInlineChats: () => ReturnType;
      toggleInlineChatInput: (blockId: string) => ReturnType;
    };
  }
}

interface InlineChatStorage {
  messages: Record<string, ChatMessage[]>;
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
      targetBlockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-target-block-id'),
        renderHTML: (attributes) => ({
          'data-target-block-id': attributes.targetBlockId,
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
      initialMessages: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('data-initial-messages'),
        renderHTML: (attributes) => ({
          'data-initial-messages': attributes.initialMessages,
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

  addStorage() {
    return {
      messages: {},
      visibility: {},
      targetToInlineChatBlockIdMap: {},
    } as InlineChatStorage;
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

      updateInlineChatMessagesInStorage:
        (blockId: string, updatedMessages: ChatMessage[]) =>
        ({ tr, dispatch }: CommandProps) => {
          const chatMessages = this.storage.messages as Record<
            string,
            ChatMessage[]
          >;

          chatMessages[blockId] = updatedMessages;
        },

      toggleInlineChatInput:
        (blockId: string) =>
        ({ chain, tr }: CommandProps) => {
          const { doc } = this.editor.state;
          const chatBlockId =
            this.storage.targetToInlineChatBlockIdMap[blockId];

          if (!chatBlockId) {
            doc.descendants((node, pos) => {
              if (
                node.type.name === 'paragraph' &&
                node.attrs.blockId === blockId &&
                node.textContent.length > 0
              ) {
                const chatPos = pos + node.nodeSize;
                const chatBlockId = uuid();
                this.storage.targetToInlineChatBlockIdMap[blockId] =
                  chatBlockId;

                this.editor
                  .chain()
                  .focus()
                  .insertContentAt(chatPos, {
                    type: this.name,
                    attrs: {
                      id: uuid(),
                      targetBlockId: blockId,
                      blockId: chatBlockId,
                      authorId: this.options.authorId,
                      authorName: this.options.authorName,
                      hidden: false,
                    },
                  })
                  .run();
              }
            });
          } else {
            doc.descendants((node, pos) => {
              if (node.attrs.blockId === chatBlockId) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  hidden: node.attrs.hidden === true ? false : true,
                });
              }
            });
          }
        },

      insertInlineChatInput:
        (blockId: string) =>
        ({}) => {
          const messages = this.storage.messages as Record<
            string,
            ChatMessage[]
          >;

          const chatMessages = messages[blockId] ?? [];

          this.editor.commands.insertOrReuseInlineChatAfterBlock(
            blockId,
            chatMessages[0]?.content
          );

          return true;
        },

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

      deleteInlineChat:
        (blockId: string) =>
        ({ chain, state, view }: CommandProps) => {
          const { tr } = state;
          const { doc } = tr;

          let existingInlineChatPos: number | null = null;
          let existingInlineChatNodeSize: number | null = null;

          doc.descendants((node, pos) => {
            if (node.attrs.blockId === blockId) {
              const nd = doc.nodeAt(pos + node.nodeSize);
              if (nd?.type.name === this.name) {
                existingInlineChatPos = pos + node.nodeSize;
                existingInlineChatNodeSize = nd.nodeSize;
              }
              return false;
            }
          });

          if (
            existingInlineChatPos !== null &&
            existingInlineChatNodeSize !== null
          ) {
            const deleteTransaction = view.state.tr.delete(
              existingInlineChatPos,
              existingInlineChatPos + existingInlineChatNodeSize
            );
            view.dispatch(deleteTransaction);
          }
          return true;
        },

      insertOrReuseInlineChatAfterBlock:
        (blockId: string, initialMessage?: string) =>
        ({ state, view }: CommandProps) => {
          const { tr } = state;
          const { doc } = tr;

          let existingInlineChatPos: number | null = null;
          let existingInlineChatNodeSize: number | null = null;

          doc.descendants((node, pos) => {
            if (node.attrs.blockId === blockId) {
              const nd = doc.nodeAt(pos + node.nodeSize);
              if (nd?.type.name === this.name) {
                existingInlineChatPos = pos + node.nodeSize;
                existingInlineChatNodeSize = nd.nodeSize;
              }
              return false;
            }
          });

          if (
            existingInlineChatPos !== null &&
            existingInlineChatNodeSize !== null
          ) {
            const deleteTransaction = view.state.tr.delete(
              existingInlineChatPos,
              existingInlineChatPos + existingInlineChatNodeSize
            );
            view.dispatch(deleteTransaction);
          }

          let newInlineChatPos: number | null = null;
          doc.descendants((node, pos) => {
            if (node.attrs.blockId === blockId) {
              newInlineChatPos = pos + node.nodeSize;
              return false;
            }
          });

          if (newInlineChatPos !== null) {
            const insertTransaction = view.state.tr.insert(
              newInlineChatPos,
              this.type.create({
                id: uuid(),
                blockId: uuid(),
                authorId: this.options.authorId,
                authorName: this.options.authorName,
                initialMessage,
              })
            );
            view.dispatch(insertTransaction);
          }

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
