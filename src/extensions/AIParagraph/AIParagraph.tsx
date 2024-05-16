import { ReactNodeViewRenderer, mergeAttributes, Node } from '@tiptap/react';
import { AIParagraphView } from './AIParagraphView';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiParagraph: {
      setAIParagraph: () => ReturnType;
    };
  }
}

export const AIParagraph = Node.create({
  name: 'aiParagraph',

  group: 'block',

  content: 'inline*',

  priority: 1000,

  defining: true,

  draggable: false,

  parseHTML() {
    return [
      {
        tag: 'p',
      },
    ];
  },

  addCommands() {
    return {
      setAIParagraph:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [],
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.commands.setAIParagraph(),
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIParagraphView);
  },
});
