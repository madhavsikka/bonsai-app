import { CommandProps, ReactNodeViewRenderer } from '@tiptap/react';
import { AIParagraphView } from './AIParagraphView';
import Paragraph from '@tiptap/extension-paragraph';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiParagraph: {
      toggleAIChat: (blockId: string) => ReturnType;
    };
  }
}

export const AIParagraph = Paragraph.extend({
  addAttributes() {
    return {
      aiChatHidden: {
        default: false,
        parseHTML: (element) =>
          element.getAttribute('data-ai-chat-hidden') === 'true',
        renderHTML: (attributes) => {
          return {
            'data-ai-chat-hidden': attributes['data-ai-chat-hidden'],
          };
        },
      },
      blockId: {
        default: null,
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
              console.log('toggleAIChat found', blockId);
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                aiChatHidden: !node.attrs.aiChatHidden,
              });
            }
          });
          return true;
        },
    };
  },
});
