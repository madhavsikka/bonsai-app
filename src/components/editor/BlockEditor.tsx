import { EditorContent } from "@tiptap/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { LinkMenu } from "./menus";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useBlockEditor } from "../../hooks/editor/useEditor";
import { Sidebar } from "./sidebar/Sidebar";
import { ColumnsMenu } from "@/extensions/MultiColumn/menus";
import { TableColumnMenu, TableRowMenu } from "@/extensions/Table/menus";
import { TiptapProps } from "./types";
import { TextMenu } from "./menus/TextMenu";
import { EditorHeader } from "./bars/EditorHeader";
import "./styles/index.css";
import { useChat } from "@/hooks/ai/useChat";
import { v4 as uuidv4 } from "uuid";
import { useHotkeys } from "react-hotkeys-hook";

export const BlockEditor = ({
  initialContent,
  onEditorUpdate,
  isEditable,
}: TiptapProps) => {
  const menuContainerRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { editor, characterCount } = useBlockEditor({
    initialContent,
    isEditable,
    onEditorUpdate,
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInputArtifacts,
    inputArtifacts,
  } = useChat({
    initialMessages: [],
  });

  const onAddToChat = useCallback(() => {
    const currentSelection = editor?.state.selection;
    if (!currentSelection) return;
    const selectedText = editor.state.doc.textBetween(
      currentSelection.from,
      currentSelection.to,
      " "
    );
    setInputArtifacts((prev) => [
      ...prev,
      { id: uuidv4(), content: selectedText, type: "text" },
    ]);
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editor.commands.focus("end");
    }
  }, [editor]);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useHotkeys(
    "mod+l",
    (e: KeyboardEvent) => {
      e.preventDefault();
      setIsSidebarOpen((prev) => !prev);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
      enableOnContentEditable: true,
    }
  );

  if (!editor) {
    return null;
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="flex h-full">
      <ResizablePanel defaultSize={isSidebarOpen ? 80 : 100} minSize={60}>
        <div className="relative flex flex-col flex-1 h-full overflow-hidden">
          <EditorHeader
            characters={characterCount.characters()}
            words={characterCount.words()}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={handleSidebarToggle}
          />
          <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
          <LinkMenu editor={editor} appendTo={menuContainerRef} />
          <TextMenu editor={editor} onAddToChat={onAddToChat} />
          <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
          <TableRowMenu editor={editor} appendTo={menuContainerRef} />
          <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        </div>
      </ResizablePanel>
      {isSidebarOpen && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={20}
            minSize={15}
            maxSize={40}
            className="md:block flex flex-col h-full"
          >
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={handleSidebarToggle}
              editor={editor}
              messages={messages}
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
              input={input}
              inputArtifacts={inputArtifacts}
            />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default BlockEditor;
