import wavedark from "@/assets/wave-dark.svg";
import leaf from "@/assets/leaf-round.svg";
import { useMemo } from "react";
import { Divider } from "@/components/ui/PopoverMenu";
import { UITextarea } from "@/components/ui/Textarea";
import { v4 as uuid } from "uuid";
import { ChatMessage } from "@/hooks/ai/useChat";

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
}: {
  messages: ChatMessage[];
  onSubmit: (input: string) => void;
  onInputChange: (input: string) => void;
  input: string;
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
              <div className="flex flex-col px-1 text-black/80 dark:text-white/80 text-xs font-semibold">
                <span className="mb-1">{m.role}</span>
                <div
                  dangerouslySetInnerHTML={{ __html: m.content }}
                  className="font-normal"
                />
              </div>
            </div>
          ))}
      </div>
      {messages.length > 0 && <Divider />}
      <div className="mt-auto">
        <UITextarea
          ref={(input) => input && input.focus()}
          id={textareaId}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={"Write here, bonsai has context of this document..."}
          required
          className="mb-2 text-xs font-normal outline-none resize-none"
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
