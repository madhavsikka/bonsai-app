import wavedark from "@/assets/wave-dark.svg";
import leaf from "@/assets/leaf-round.svg";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { UITextarea } from "@/components/ui/Textarea";
import { v4 as uuid } from "uuid";
import { ChatArtifact, ChatMessage } from "@/hooks/ai/useChat";
import "highlight.js/styles/github-dark.css";
import { Divider } from "../ui/PopoverMenu";

const UserAvatar = () => {
  return (
    <img
      src={wavedark}
      alt="avatar"
      width={24}
      height={24}
      style={{ maxWidth: "24px", borderRadius: "6px" }}
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
      style={{ maxWidth: "24px", borderRadius: "6px" }}
    />
  );
};

const ChatPanel = ({
  messages,
  onSubmit,
  onInputChange,
  input,
  inputArtifacts,
}: {
  messages: ChatMessage[];
  onSubmit: (input: string) => void;
  onInputChange: (input: string) => void;
  input: string;
  inputArtifacts: ChatArtifact[];
}) => {
  const textareaId = useMemo(() => uuid(), []);

  return (
    <div className="flex flex-col p-1 flex-grow h-full">
      <div className="flex-grow overflow-y-auto">
        {messages
          .filter((m) => m.role !== "system")
          .map((m) => (
            <div key={m.id} className="flex gap-2 items-start mb-4">
              {m.role === "bonsai" ? <BonsaiAvatar /> : <UserAvatar />}
              <div className="flex flex-col px-1 text-black/80 dark:text-white/80 text-xs max-w-full overflow-hidden">
                <span className="mb-1 font-semibold">
                  {m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                </span>
                <ReactMarkdown
                  className="font-light prose dark:prose-invert max-w-none break-words overflow-hidden leading-relaxed"
                  rehypePlugins={[rehypeHighlight]}
                >
                  {m.content}
                </ReactMarkdown>
                {m.artifacts
                  ?.filter((artifact) => artifact.content.length > 0)
                  .map((artifact) => (
                    <div
                      key={artifact.id}
                      className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50"
                    >
                      <ReactMarkdown
                        className="font-normal prose dark:prose-invert max-w-none break-words overflow-hidden text-xs"
                        rehypePlugins={[rehypeHighlight]}
                      >
                        {`\`\`\`${artifact.content}\`\`\``}
                      </ReactMarkdown>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
      <div className="mt-auto">
        {inputArtifacts
          .filter((artifact) => artifact.content.length > 0)
          .map((artifact) => (
            <div
              key={artifact.id}
              className="mb-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50"
            >
              <ReactMarkdown
                className="font-normal prose dark:prose-invert max-w-none break-words overflow-hidden text-xs"
                rehypePlugins={[rehypeHighlight]}
              >
                {`\`\`\`${artifact.content}\`\`\``}
              </ReactMarkdown>
            </div>
          ))}
        <Divider />
        <UITextarea
          ref={(input) => input && input.focus()}
          id={textareaId}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={"Write here, bonsai has context of this document..."}
          required
          className="mb-2 mt-4 text-xs font-light outline-none resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(input);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
