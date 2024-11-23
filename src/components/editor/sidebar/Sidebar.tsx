import { memo } from "react";
import { Editor } from "@tiptap/react";
import SideBarChat from "./SideBarChat";
import { ChatArtifact, ChatMessage } from "@/hooks/ai/useChat";

export const Sidebar = memo(
  ({
    editor,
    messages,
    handleSubmit,
    handleInputChange,
    input,
    inputArtifacts,
  }: {
    editor: Editor;
    isOpen?: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    handleSubmit: (input: string) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    input: string;
    inputArtifacts: ChatArtifact[];
  }) => {
    return (
      <div className="flex flex-col h-full">
        <div className="w-full h-full overflow-hidden flex-grow flex">
          <div className="w-full h-full p-6 overflow-auto flex flex-col flex-grow">
            <SideBarChat
              editor={editor}
              messages={messages}
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
              input={input}
              inputArtifacts={inputArtifacts}
            />
          </div>
        </div>
      </div>
    );
  }
);

Sidebar.displayName = "TableOfContentSidepanel";
