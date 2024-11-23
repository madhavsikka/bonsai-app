import ChatPanel from "@/components/chat/ChatPanel";
import { ChatArtifact, ChatMessage } from "@/hooks/ai/useChat";
import { Editor } from "@tiptap/react";

const SideBarChat = ({
  // @ts-ignore
  editor,
  messages,
  handleSubmit,
  handleInputChange,
  input,
  inputArtifacts,
}: {
  editor: Editor;
  messages: ChatMessage[];
  handleSubmit: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  input: string;
  inputArtifacts: ChatArtifact[];
}) => {
  // const targetBlockId = useMemo(() => {
  //   const { selection } = editor.state;
  //   const node = selection.$anchor.parent;
  //   return node.attrs.blockId || null;
  // }, [editor.state.selection]);

  // const chatInput = useMemo(() => {
    // const storedMessages = (editor.storage.inlineChat.messages[targetBlockId] ??
    //   []) as ChatMessage[];
  //   return { initialMessages: initialMessages };
  // }, [initialMessages]);

  // const { messages, input, handleInputChange, handleSubmit } =
  //   useChat(chatInput);

  // useEffect(() => {
  //   console.log("setting messages for block", targetBlockId, messages);
  //   editor.storage.inlineChat.messages[targetBlockId] = messages;
  // }, [messages]);

  return (
    <ChatPanel
      messages={messages}
      onSubmit={handleSubmit}
      inputArtifacts={inputArtifacts}
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
