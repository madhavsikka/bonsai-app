import { useCallback, useEffect, useMemo } from 'react';
import { v4 as uuid } from 'uuid';
import { Editor } from '@tiptap/core';
import { UITextarea } from '@/components/ui/Textarea';
import wavedark from '@/assets/wave-dark.svg';
import stardark from '@/assets/star-dark.svg';
import { ChatMessage, ChatMessageRole, useChat } from '@/hooks/ai/useChat';
import { Divider } from '@/components/ui/PopoverMenu';
import { Node } from '@tiptap/pm/model';
import {
  AIWorkerExtensionName,
  WorkerAIExtensions,
} from '../AIWorker/AIWorker';

const UserAvatar = () => {
  return (
    <img
      src={wavedark}
      alt="avatar"
      width={20}
      height={20}
      style={{
        maxWidth: '20px',
        borderRadius: '4px',
        marginTop: '2px',
      }}
    />
  );
};

const AIAvatar = () => {
  return (
    <img
      src={stardark}
      alt="avatar"
      width={20}
      height={20}
      style={{ maxWidth: '20px', borderRadius: '4px', marginTop: '2px' }}
    />
  );
};

function toCamelCase(str: string): string {
  // Split the string into words
  const words = str.split(/[-_\s]+/);

  // Capitalize the first letter of each word
  const camelCaseWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join the words to form the camel case string
  const camelCaseStr = camelCaseWords.join('');

  return camelCaseStr;
}

export interface AIParagraphViewGroupProps {
  editor: Editor;
  node: Node;
  blockId: string;
  groupId: string;
  aiChatMessages: ChatMessage[];
}

export const AIParagraphViewGroup = ({
  editor,
  blockId,
  groupId,
  node,
  aiChatMessages,
}: AIParagraphViewGroupProps) => {
  const textareaId = useMemo(() => uuid(), []);

  const chatInput = useMemo(() => {
    const templateMessages: ChatMessage[] = [];

    // Add system message.
    if (aiChatMessages?.[0].role !== ChatMessageRole.System) {
      const workerExts: WorkerAIExtensions[] =
        editor.storage[AIWorkerExtensionName]?.workerExtensions;
      const groupPrompt = workerExts?.find(
        (ext) => ext.name === groupId
      )?.prompt;

      if (groupPrompt) {
        const content = `${groupPrompt}. Here is the current paragraph's content: ${node.textContent}`;
        templateMessages.push({
          id: uuid(),
          role: ChatMessageRole.System,
          content,
        });
      }
    }

    return { initialMessages: [...templateMessages, ...aiChatMessages] };
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
    <div className="flex flex-col px-3 justify-center items-center">
      {messages
        .filter((m) => m.role !== 'system')
        .map((m) => (
          <div key={m.id} className="flex gap-2 items-start mb-4 w-full">
            {m.role === 'user' ? <UserAvatar /> : <AIAvatar />}
            <div className="flex flex-col px-1 text-black/80 dark:text-white/80 text-xs font-semibold">
              <span className="mb-1">
                {m.role === 'user' ? 'You' : toCamelCase(groupId)}
              </span>
              <div
                dangerouslySetInnerHTML={{ __html: m.content }}
                className="font-normal"
              />
            </div>
          </div>
        ))}
      {messages.length > 0 && <Divider />}
      <UITextarea
        ref={(input) => input}
        id={textareaId}
        value={input}
        onChange={handleInputChange}
        placeholder={'Write here, bonsai has context of this document...'}
        required
        className="text-xs font-normal outline-none resize-none p-4"
        onKeyDown={handleTextAreaSubmit}
      />
    </div>
  );
};
