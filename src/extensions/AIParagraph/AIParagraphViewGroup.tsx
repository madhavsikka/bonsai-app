import { useCallback, useEffect, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { Editor } from '@tiptap/core';
import { Textarea } from '@/components/ui/Textarea';
import wavedark from '@/assets/wave-dark.svg';
import leaf from '@/assets/leaf-round.svg';
import { ChatMessage, useChat } from '@/hooks/ai/useChat';
import { Divider } from '@/components/ui/PopoverMenu';

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

export interface AIParagraphViewGroupProps {
  editor: Editor;
  blockId: string;
  groupId: string;
  aiChatMessages: ChatMessage[];
}

export const AIParagraphViewGroup = ({
  editor,
  blockId,
  groupId,
  aiChatMessages,
}: AIParagraphViewGroupProps) => {
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
    editor.commands.setAIChatMessagesForGroup(blockId, groupId, messages);
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
        className="mb-2 text-xs font-normal outline-none resize-none h-[40px]"
        onKeyDown={handleTextAreaSubmit}
      />
    </div>
  );
};
