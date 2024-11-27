import {
  NodeViewContent,
  NodeViewWrapper,
  NodeViewWrapperProps,
} from "@tiptap/react";
import { Editor } from "@tiptap/core";
import { Node } from "@tiptap/pm/model";

export interface AIParagraphViewWithoutChatProps extends NodeViewWrapperProps {
  editor: Editor;
  node: Node;
  getPos: () => number;
  deleteNode: () => void;
}

export const AIParagraphViewWithoutChat = ({
  node,
}: AIParagraphViewWithoutChatProps) => {
  const { blockId } = node.attrs as {
    blockId: string;
  };

  return (
    <NodeViewWrapper data-block-id={blockId}>
      <NodeViewContent as="p" />
    </NodeViewWrapper>
  );
};
