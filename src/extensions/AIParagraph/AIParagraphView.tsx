import {
  NodeViewContent,
  NodeViewWrapper,
  NodeViewWrapperProps,
} from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { Panel } from '@/components/ui/Panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatMessage } from '@/hooks/ai/useChat';
import { Node } from '@tiptap/pm/model';
import { AIParagraphViewGroup } from './AIParagraphViewGroup';
import { Divider } from '@/components/ui/PopoverMenu';
import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

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
    aiChatMessages: Record<string, ChatMessage[]>;
  };

  const sortedAIChatMessages = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(aiChatMessages).sort(([a], [b]) => a.localeCompare(b))
      ),
    [aiChatMessages]
  );

  const isAIChatHidden =
    aiChatHidden !== false || Object.keys(aiChatMessages).length === 0;

  const canShowAIChat = Object.keys(aiChatMessages).length > 0;

  return (
    <NodeViewWrapper data-block-id={blockId}>
      <div className="relative">
        {canShowAIChat && (
          <ChevronDown
            className={`absolute left-0 top-0 transform -translate-x-8 translate-y-1.5 w-4 h-4 animate-pulse ${
              aiChatHidden ? 'rotate-0' : 'rotate-180'
            } hover:cursor-pointer`}
            onClick={() => editor.commands.toggleAIChat(blockId)}
          />
        )}
      </div>
      <NodeViewContent as="p" />
      <div
        className={`ai-chat-transition ${
          isAIChatHidden ? 'ai-chat-hidden' : 'ai-chat-visible'
        }`}
      >
        {!isAIChatHidden && (
          <Panel
            noShadow
            className="w-full mt-4 flex flex-col justify-center items-center"
            contentEditable={false}
          >
            <Tabs
              defaultValue={Object.keys(sortedAIChatMessages)[0]}
              className="m-2 flex flex-col justify-center items-center w-full"
            >
              <TabsList className="mb-2 bg-background text-foreground">
                {Object.keys(aiChatMessages).map((group) => (
                  <TabsTrigger
                    value={group}
                    key={group}
                    className="data-[state=active]:bg-muted text-xs"
                  >
                    {group}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Divider />
              {Object.entries(sortedAIChatMessages).map(([group, messages]) => (
                <TabsContent value={group} key={group} className="w-full">
                  <AIParagraphViewGroup
                    editor={editor}
                    node={node}
                    blockId={blockId}
                    groupId={group}
                    aiChatMessages={messages}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </Panel>
        )}
      </div>
    </NodeViewWrapper>
  );
};
