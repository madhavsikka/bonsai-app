import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export interface NotificationDotOptions {
  className?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notificationDot: {
      addNotificationDot: (blockIds: string[]) => ReturnType;
      removeNotificationDot: () => ReturnType;
    };
  }
}

export const NotificationDot = Extension.create<NotificationDotOptions>({
  name: 'notificationDot',

  addOptions() {
    return {
      className: 'notification-dot',
    };
  },

  addProseMirrorPlugins() {
    const { className } = this.options;

    return [
      new Plugin({
        key: new PluginKey('notificationDot'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, set) {
            const action = tr.getMeta('notificationDot');
            if (action && action.type === 'add') {
              const { blockIds } = action;
              const decorations: Decoration[] = [];
              tr.doc.descendants((node, pos) => {
                if (
                  node.type.name === 'paragraph' &&
                  node.attrs.blockId &&
                  blockIds.includes(node.attrs.blockId)
                ) {
                  const decoration = Decoration.node(pos, pos + node.nodeSize, {
                    class: className,
                  });
                  decorations.push(decoration);
                }
              });
              set = set.add(tr.doc, decorations);
            } else if (action && action.type === 'remove') {
              set = set.remove(
                set.find(
                  undefined,
                  undefined,
                  (spec) =>
                    spec.type.name === 'node' && spec.attrs.class === className
                )
              );
            }
            return set;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      addNotificationDot:
        (blockIds: string[]) =>
        ({ tr, dispatch }) => {
          tr.setMeta('notificationDot', { type: 'add', blockIds });
          if (dispatch) {
            dispatch(tr);
          }
          return true;
        },
      removeNotificationDot:
        () =>
        ({ tr, dispatch }) => {
          tr.setMeta('notificationDot', { type: 'remove' });
          if (dispatch) {
            dispatch(tr);
          }
          return true;
        },
    };
  },
});
