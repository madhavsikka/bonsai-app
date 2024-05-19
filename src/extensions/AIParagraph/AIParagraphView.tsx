import {
  NodeViewContent,
  NodeViewWrapper,
  NodeViewWrapperProps,
} from '@tiptap/react';
import { useCallback, useEffect, useMemo } from 'react';
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

export interface AIParagraphViewProps extends NodeViewWrapperProps {
  editor: Editor;
  node: Node;
  getPos: () => number;
  deleteNode: () => void;
}

export const AIParagraphView = ({
  editor,
  node,
  getPos,
  deleteNode,
}: AIParagraphViewProps) => {
  const { blockId, aiChatHidden } = node.attrs;
  console.log('blockId and aiChatHidden:', blockId, aiChatHidden);
  const { isDarkMode } = useDarkmode();
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

  const handleTextAreaSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <NodeViewWrapper data-block-id={blockId}>
      <div className="relative">
        <span
          className={`absolute left-0 top-0 transform -translate-x-6 translate-y-2.5 w-2 h-2 rounded-full ${
            aiChatHidden ? 'bg-gray-400' : 'bg-green-500'
          } hover:cursor-pointer`}
          onClick={() => editor.commands.toggleAIChat(blockId)}
        />
        <NodeViewContent as="p" />
      </div>
      {!aiChatHidden && (
        <Panel noShadow className="w-full" contentEditable={false}>
          <CrossCircledIcon
            onClick={() => editor.commands.toggleAIChat(blockId)}
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
              ref={(input) => input}
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
      )}
    </NodeViewWrapper>
  );
};
