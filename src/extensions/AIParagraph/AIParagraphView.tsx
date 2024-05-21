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

import { ChatMessage, useChat } from '@/hooks/ai/useChat';
import { Divider } from '@/components/ui/PopoverMenu';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import { Node } from '@tiptap/pm/model';

const UserAvatar = () => {
  return (
    <img
      src={wavedark}
      alt="avatar"
      width={24}
      height={24}
      style={{ maxWidth: '24px', borderRadius: '6px' }}
    />
  );
};

const BonsaiAvatar = () => {
  return (
    <img
      src={leaf}
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

export const AIParagraphView = ({ editor, node }: AIParagraphViewProps) => {
  const { blockId, aiChatHidden, aiChatMessages } = node.attrs as {
    blockId: string;
    aiChatHidden: boolean;
    aiChatMessages: ChatMessage[];
  };

  const textareaId = useMemo(() => uuid(), []);

  const chatInput = useMemo(() => {
    return { initialMessages: aiChatMessages };
  }, [aiChatMessages]);

  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat(chatInput);

  useEffect(() => {
    const updatedMessages = aiChatMessages.map((msg) => {
      const existingMessage = messages.find((m) => m.id === msg.id);
      return existingMessage || msg;
    });
    setMessages(updatedMessages);
  }, [aiChatMessages]);

  useEffect(() => {
    editor.commands.setAIChatMessages(blockId, messages);
  }, [messages]);

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
        <Panel noShadow className="w-full mt-4" contentEditable={false}>
          <CrossCircledIcon
            onClick={() => editor.commands.toggleAIChat(blockId)}
            className="ml-auto hover:cursor-pointer"
            width={14}
          />
          <div className="flex flex-col p-1">
            {messages
              .filter((m) => m.role !== 'system')
              .map((m) => (
                <div key={m.id} className="flex gap-2 items-start mb-4">
                  {m.role === 'bonsai' ? <BonsaiAvatar /> : <UserAvatar />}
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
