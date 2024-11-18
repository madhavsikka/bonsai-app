import ChatPanel from "@/components/chat/ChatPanel";
import { ChatMessage, useChat } from "@/hooks/ai/useChat";
import { Editor } from "@tiptap/react";
import { useMemo } from "react";

const SideBarChat = ({ editor }: { editor: Editor }) => {
  const targetBlockId = useMemo(() => {
    const { selection } = editor.state;
    const node = selection.$anchor.parent;
    return node.attrs.blockId || null;
  }, [editor.state.selection]);

  const chatInput = useMemo(() => {
    const storedMessages = (editor.storage.inlineChat.messages[targetBlockId] ??
      []) as ChatMessage[];
    return { initialMessages: storedMessages };
  }, [targetBlockId]);

  const { messages, input, handleInputChange, handleSubmit } = useChat(chatInput);

  // useEffect(() => {
  //   console.log("setting messages for block", targetBlockId, messages);
  //   editor.storage.inlineChat.messages[targetBlockId] = messages;
  // }, [messages]);

  return (
    <ChatPanel
      messages={messages}
      onSubmit={handleSubmit}
      onInputChange={(value: string) =>
        handleInputChange({
          target: { value },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      }
      input={input}
    />
  );
};

export default SideBarChat;
