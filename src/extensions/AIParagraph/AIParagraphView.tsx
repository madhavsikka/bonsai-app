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
          <Tabs
            defaultValue={Object.keys(aiChatMessages)?.[0]}
            className="m-2 flex flex-col justify-center items-center w-full"
          >
            <TabsList className="mb-4 bg-background text-foreground max-w-fit">
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
            {Object.entries(aiChatMessages).map(([group, messages]) => (
              <TabsContent value={group} key={group} className="w-full">
                <AIParagraphViewGroup
                  editor={editor}
                  blockId={blockId}
                  groupId={group}
                  aiChatMessages={messages}
                />
              </TabsContent>
            ))}
          </Tabs>
        </Panel>
      )}
    </NodeViewWrapper>
  );
};
