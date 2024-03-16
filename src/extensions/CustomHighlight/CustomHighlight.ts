import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import { Decoration, DecorationSet } from 'prosemirror-view';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customHighlight: {
      setHighlightedParagraphIds: (ids: string[]) => ReturnType;
    };
  }
}

function getDecorations(
  doc: ProseMirrorNode,
  highlightedParagraphIds: string[] = []
): DecorationSet {
  const decorations: Decoration[] = [];

  doc.descendants((node, pos) => {
    if (node.type.name === 'paragraph' && node.attrs.blockId) {
      const paragraphId: string = node.attrs.blockId;
      if (highlightedParagraphIds.includes(paragraphId)) {
        const from: number = pos;
        const to: number = pos + node.nodeSize;
        const decoration: Decoration = Decoration.node(from, to, {
          class: 'custom-highlight',
        });
        decorations.push(decoration);
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}
export const CustomHighlight = Extension.create({
  name: 'customHighlight',

  addOptions() {
    return {
      highlightedParagraphIds: [],
    };
  },

  addCommands() {
    return {
      setHighlightedParagraphIds:
        (ids) =>
        ({ tr, dispatch }) => {
          // Update the options within the command
          this.options.highlightedParagraphIds = ids;
          if (dispatch) {
            const decorations = getDecorations(tr.doc, ids);
            // Instead of using `tr.setMeta`, directly dispatch a transaction that updates the decorations
            dispatch(tr.setMeta(this.name, { add: decorations }));
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this; // Capture 'this' to use inside plugin
    return [
      new Plugin({
        key: new PluginKey('customHighlight'), // Ensure the key is unique and matches the extension name
        state: {
          init: (_, { doc }) => {
            // Initialize with the current document and options from the extension
            return getDecorations(
              doc,
              extension.options.highlightedParagraphIds
            );
          },
          apply: (tr, oldState, oldEditorState, newEditorState) => {
            // Check for updates in highlightedParagraphIds through transactions
            const meta = tr.getMeta(extension.name);
            if (meta) {
              // If there's a meta with new decorations, use it
              return meta.add;
            } else if (tr.docChanged) {
              // If the document has changed, but not due to an update in highlights, recalculate decorations
              return getDecorations(
                newEditorState.doc,
                extension.options.highlightedParagraphIds
              );
            }
            return oldState;
          },
        },
        props: {
          decorations(state) {
            // Access the current plugin state for decorations
            const pluginState = this.getState(state);
            return pluginState;
          },
        },
      }),
    ];
  },
});
