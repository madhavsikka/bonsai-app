import { NodeViewWrapper, NodeViewWrapperProps } from '@tiptap/react';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Editor } from '@tiptap/core';
import { Panel } from '@/components/ui/Panel';
import { Textarea } from '@/components/ui/Textarea';

import { useDarkmode } from '@/hooks/useDarkMode';
import { useChat } from '@/hooks/ai/useChat';

const UserAvatar = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <img
      src={isDarkMode ? '/static/wave-dark.svg' : '/static/wave-dark.svg'}
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
      src={isDarkMode ? '/static/star-light.svg' : '/static/star-dark.svg'}
      alt="avatar"
      width={24}
      height={24}
      style={{ maxWidth: '24px', borderRadius: '6px' }}
    />
  );
};

export const InlineChatView = ({
  editor,
  node,
  getPos,
}: NodeViewWrapperProps) => {
  const { isDarkMode } = useDarkmode();
  const [previewText, setPreviewText] = useState(undefined);
  const textareaId = useMemo(() => uuid(), []);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        role: 'system',
        content: `You are a helpful AI writing assistant embedded inside a rich text editor. Here is the prior context: ${(
          editor as Editor
        ).state.doc.textBetween(
          0,
          getPos(),
          '\n'
        )}. Answer user's questions and help them write better.`,
        id: uuid(),
      },
    ],
  });

  const insert = useCallback(() => {
    const from = getPos();
    const to = from + node.nodeSize;

    editor.chain().focus().insertContentAt({ from, to }, previewText).run();
  }, [editor, previewText, getPos, node.nodeSize]);

  const handleTextAreaSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // @ts-ignore
        e.target.form.requestSubmit();
        e.preventDefault();
      }
    },
    []
  );

  return (
    <NodeViewWrapper data-drag-handle>
      <Panel noShadow className="w-full">
        <form onSubmit={handleSubmit}>
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
            <Textarea
              ref={(input) => input && input.focus()}
              id={textareaId}
              value={input}
              onChange={handleInputChange}
              placeholder={'Write something...'}
              required
              className="mb-2 text-xs font-normal"
              onKeyDown={handleTextAreaSubmit}
            />
          </div>
        </form>
      </Panel>
    </NodeViewWrapper>
  );
};
