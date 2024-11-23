import { DropdownButton } from "@/components/ui/Dropdown";
import { Icon } from "@/components/ui/Icon";
import { Surface } from "@/components/ui/Surface";
import { Toolbar } from "@/components/ui/Toolbar";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { useHotkeys } from "react-hotkeys-hook";

export type AIDropdownProps = {
  onAddToChat: () => void;
};

export const AIDropdown = ({ onAddToChat }: AIDropdownProps) => {
  useHotkeys(
    "mod+shift+l",
    (e: KeyboardEvent) => {
      e.preventDefault();
      onAddToChat();
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
      enableOnContentEditable: true,
    }
  );

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Toolbar.Button
          className="text-purple-500 hover:text-purple-600 active:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 dark:active:text-purple-400"
          activeClassname="text-purple-600 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-200"
        >
          <Icon name="Sparkles" className="mr-1" />
          AI Tools
          <Icon name="ChevronDown" className="w-2 h-2 ml-1" />
        </Toolbar.Button>
      </Dropdown.Trigger>
      <Dropdown.Content asChild>
        <Surface className="p-2 min-w-[10rem]">
          <Dropdown.Item onClick={onAddToChat}>
            <DropdownButton>
              <Icon name="CircleSlash" />
              Add to Chat
            </DropdownButton>
          </Dropdown.Item>
        </Surface>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
