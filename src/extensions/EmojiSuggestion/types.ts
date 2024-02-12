export interface EmojiItem {
  name: string;
  fallbackImage?: string;
  emoji: string;
}

export interface Command {
  name: string;
}

export interface EmojiListProps {
  command: (command: Command) => void;
  items: EmojiItem[];
}
