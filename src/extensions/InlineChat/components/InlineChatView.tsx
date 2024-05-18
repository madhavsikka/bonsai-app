import { NodeViewWrapper, NodeViewWrapperProps } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Editor } from '@tiptap/core';
import { Panel } from '@/components/ui/Panel';
import { Textarea } from '@/components/ui/Textarea';
import wavedark from '@/assets/wave-dark.svg';
import leaf from '@/assets/leaf-round.svg';

import { ChatMessage, ChatMessageRole, useChat } from '@/hooks/ai/useChat';
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

export interface InlineChatViewProps extends NodeViewWrapperProps {
  editor: Editor;
  node: Node;
  getPos: () => number;
  deleteNode: () => void;
}

export interface InlineChatMessage {
  id: string;
  author: string;
  content: string;
}

export const InlineChatView = ({
  editor,
  node,
  getPos,
  deleteNode,
}: InlineChatViewProps) => {
  const { blockId, targetBlockId } = node.attrs;

  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    setIsHidden(node.attrs.hidden ?? true);
  }, [node.attrs.hidden]);

  // @ts-ignore
  const [previewText, setPreviewText] = useState(undefined);
  const textareaId = useMemo(() => uuid(), []);

  const chatInput = useMemo(() => {
    const storedMessages = (editor.storage.inlineChat.messages[targetBlockId] ??
      []) as ChatMessage[];
    return { initialMessages: storedMessages };
  }, []);

  const { messages, input, handleInputChange, handleSubmit } =
    useChat(chatInput);

  useEffect(() => {
    console.log('messages', messages);
    editor.storage.inlineChat.messages[targetBlockId] = messages;
  }, [messages]);

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

  if (isHidden) {
    return null;
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
