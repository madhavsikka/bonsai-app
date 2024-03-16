import { Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { v4 as uuid } from 'uuid';

export enum Type {
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
}

const types = {
  [Type.HEADING]: true,
  [Type.PARAGRAPH]: true,
};

export const BlockID = Node.create({
  name: 'blockId',

  addGlobalAttributes() {
    return [
      {
        types: Object.keys(types),
        attributes: {
          blockId: {
            default: null,
            rendered: false,
            keepOnSplit: false,
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockID'),
        appendTransaction: (_transactions, oldState, newState) => {
          // no changes
          if (newState.doc === oldState.doc) {
            return;
          }
          const tr = newState.tr;

          newState.doc.descendants((node, pos, parent) => {
            if (
              node.isBlock &&
              parent === newState.doc &&
              !node.attrs.blockId &&
              types[node.type.name as Type]
            ) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                blockId: uuid(),
              });
            }
          });

          return tr;
        },
      }),
    ];
  },
});
