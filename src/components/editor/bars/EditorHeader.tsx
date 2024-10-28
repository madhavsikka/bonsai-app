import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { EditorButton } from "@/components/ui/EditorButton";
import { cn } from "@/lib/utils";

export type EditorHeaderProps = {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  characters: number;
  words: number;
};

export const EditorHeader = ({}: EditorHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between py-3 px-6",
        "fixed top-0 left-0 w-full z-10",
        "transition-opacity duration-400"
      )}
    >
      <EditorButton variant="ghost" className="p-1 m-0">
        <ArrowLeftIcon className="m-0" onClick={() => navigate(-1)} />
      </EditorButton>
      {/* <div className="flex flex-row gap-x-1.5 items-center">
        <EditorInfo characters={characters} words={words} />
      </div> */}
    </div>
  );
};
