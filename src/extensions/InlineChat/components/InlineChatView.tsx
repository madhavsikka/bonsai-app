import { NodeViewWrapper, NodeViewWrapperProps } from '@tiptap/react';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Editor } from '@tiptap/core';
import { Panel } from '@/components/ui/Panel';
import { Textarea } from '@/components/ui/Textarea';
import wavedark from '@/assets/wave-dark.svg';
import leaf from '@/assets/leaf-round.svg';

import { useDarkmode } from '@/hooks/useDarkMode';
import { ChatMessageRole, useChat } from '@/hooks/ai/useChat';
import { Divider } from '@/components/ui/PopoverMenu';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import { Node } from '@tiptap/pm/model';

const UserAvatar = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <img
      src={isDarkMode ? wavedark : wavedark}
      alt="avatar"
      width={24}
      height={24}
      style={{ maxWidth: '24px', borderRadius: '6px' }}
    />
  );
};

const BonsaiAvatar = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <img
      src={isDarkMode ? leaf : leaf}
      alt="avatar"
      width={24}
      height={24}
      style={{ maxWidth: '24px', borderRadius: '6px' }}
    />
  );
};

export interface InlineChatViewProps extends NodeViewWrapperProps {
  editor: Editor;
  node: Node;
  getPos: () => number;
  deleteNode: () => void;
}

export const InlineChatView = ({
  editor,
  node,
  getPos,
  deleteNode,
}: InlineChatViewProps) => {
  const { blockId, hidden } = node.attrs;
  const { isDarkMode } = useDarkmode();
  // @ts-ignore
  const [previewText, setPreviewText] = useState(undefined);
  const textareaId = useMemo(() => uuid(), []);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        role: ChatMessageRole.System,
        content: `You are a helpful AI writing assistant embedded inside a rich text editor. \nYour task is to answer user's questions and help them write better. Here is the document content: "${(
          editor as Editor
        ).getText()}".`,
        id: uuid(),
      },
      ...(node.attrs.initialMessage
        ? [
            {
              role: ChatMessageRole.Bonsai,
              content: node.attrs.initialMessage,
              id: uuid(),
            },
          ]
        : []),
    ],
  });

  // @ts-ignore
  const insert = useCallback(() => {
    const from = getPos();
    const to = from + node.nodeSize;

    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, previewText ?? '')
      .run();
  }, [editor, previewText, getPos, node.nodeSize]);

  const handleTextAreaSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        handleSubmit();
        // editor.commands.setHighlightedParagraphIds(['temp']);
        e.preventDefault();
      }
    },
    [handleSubmit]
  );

  if (hidden) {
    return null; // If hidden, don't render the inline chat
  }

  return (
    <NodeViewWrapper data-drag-handle data-block-id={blockId}>
      <Panel noShadow className="w-full">
        <CrossCircledIcon
          onClick={() => deleteNode()}
          className="ml-auto hover:cursor-pointer"
          width={14}
        />
        <div className="flex flex-col p-1">
          {messages
            .filter((m) => m.role === 'user' || m.role === 'bonsai')
            .map((m) => (
              <div key={m.id} className="flex gap-2 items-start mb-4">
                {m.role === 'bonsai' ? (
                  <BonsaiAvatar isDarkMode={isDarkMode} />
                ) : (
                  <UserAvatar isDarkMode={isDarkMode} />
                )}
                <div className="flex flex-col px-1 text-black/80 dark:text-white/80 text-xs font-semibold">
                  <span className="mb-1">{m.role}</span>
                  <div
                    dangerouslySetInnerHTML={{ __html: m.content }}
                    className="font-normal"
                  />
                </div>
              </div>
            ))}
          {messages.length > 0 && <Divider />}
          <Textarea
            ref={(input) => input && input.focus()}
            id={textareaId}
            value={input}
            onChange={handleInputChange}
            placeholder={'Write here, bonsai has context of this document...'}
            required
            className="mb-2 text-xs font-normal outline-none resize-none"
            onKeyDown={handleTextAreaSubmit}
          />
        </div>
      </Panel>
    </NodeViewWrapper>
  );
};
