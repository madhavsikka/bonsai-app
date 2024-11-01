import ChatPanel from "@/components/chat/ChatPanel";
import { ChatMessage, useChat } from "@/hooks/ai/useChat";

const SideBarChat = ({ initialMessages }: { initialMessages: ChatMessage[] }) => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: initialMessages,
  });

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
