import { CommandProps, ReactNodeViewRenderer } from '@tiptap/react';
import { AIParagraphView } from './AIParagraphView';
import Paragraph from '@tiptap/extension-paragraph';
import { ChatMessage } from '@/hooks/ai/useChat';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiParagraph: {
      toggleAIChat: (blockId: string) => ReturnType;
      pushAIChatMessagesForGroup: (
        blockId: string,
        groupId: string,
        messages: ChatMessage[]
      ) => ReturnType;
      setAIChatMessagesForGroup: (
        blockId: string,
        groupId: string,
        messages: ChatMessage[]
      ) => ReturnType;
      unsetAIChatMessages: (blockId: string) => ReturnType;
    };
  }
}

export const AIParagraph = Paragraph.extend({
  addAttributes() {
    return {
      aiChatHidden: {
        default: true,
        keepOnSplit: false,
        parseHTML: (element) =>
          element.getAttribute('data-ai-chat-hidden') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-ai-chat-hidden': attributes['data-ai-chat-hidden'],
          };
        },
      },
      aiChatMessages: {
        default: {},
        keepOnSplit: false,
        parseHTML: (element) => {
          const messages = element.getAttribute('data-ai-chat-messages');
          return messages ? JSON.parse(messages) : {};
        },
        renderHTML: (attributes) => {
          return {
            'data-ai-chat-messages': JSON.stringify(attributes.aiChatMessages),
          };
        },
      },
      blockId: {
        default: null,
        keepOnSplit: false,
        parseHTML: (element) => element.getAttribute('data-block-id'),
        renderHTML: (attributes) => ({
          'data-block-id': attributes.blockId,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIParagraphView);
  },

  addCommands() {
    return {
      toggleAIChat:
        (blockId: string) =>
        ({ tr }: CommandProps) => {
          const { doc } = this.editor.state;
          doc.descendants((node, pos) => {
            if (
              node.type.name === 'paragraph' &&
              node.attrs.blockId === blockId &&
              node.textContent.length > 0
            ) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                aiChatHidden: !node.attrs.aiChatHidden,
              });
            }
          });
          return true;
        },

      pushAIChatMessagesForGroup:
        (blockId: string, groupId: string, messages: ChatMessage[]) =>
        ({ tr }: CommandProps) => {
          const { doc } = this.editor.state;
          doc.descendants((node, pos) => {
            if (
              node.type.name === 'paragraph' &&
              node.attrs.blockId === blockId
            ) {
              const updatedMessages = {
                ...node.attrs.aiChatMessages,
                [groupId]: messages,
              };
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                aiChatMessages: updatedMessages,
              });
            }
          });
          return true;
        },

      setAIChatMessagesForGroup:
        (blockId: string, groupId: string, messages: ChatMessage[]) =>
        ({ tr }: CommandProps) => {
          const { doc } = this.editor.state;
          doc.descendants((node, pos) => {
            if (
              node.type.name === 'paragraph' &&
              node.attrs.blockId === blockId
            ) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                aiChatMessages: {
                  ...node.attrs.aiChatMessages,
                  [groupId]: messages,
                },
              });
            }
          });
          return true;
        },

      unsetAIChatMessages:
        (blockId: string) =>
        ({ tr }: CommandProps) => {
          const { doc } = this.editor.state;
          doc.descendants((node, pos) => {
            if (
              node.type.name === 'paragraph' &&
              node.attrs.blockId === blockId
            ) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                aiChatMessages: {},
              });
            }
          });
          return true;
        },
    };
  },
});