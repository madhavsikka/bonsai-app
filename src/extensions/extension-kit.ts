import {
  BlockquoteFigure,
  CharacterCount,
  Color,
  Document,
  Dropcursor,
  Figcaption,
  Focus,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  HorizontalRule,
  Link,
  Placeholder,
  Selection,
  SlashCommand,
  StarterKit,
  Subscript,
  Superscript,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  TextAlign,
  TextStyle,
  TrailingNode,
  Typography,
  Underline,
  Columns,
  Column,
  TaskItem,
  TaskList,
  InlineChat,
  BlockID,
  ImageUpload,
  Image,
  ImageBlock,
  CustomHighlight,
  AIWorkerExtension,
  AIParagraph,
  AILinter,
  BadWords,
} from './index';
import { Markdown } from 'tiptap-markdown';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';

interface ExtensionKitProps {
  userId?: string;
  userName?: string;
  userColor?: string;
  openAIAPIKey?: string;
}

const DocumentWithTitle = Document.extend({
  // content: 'heading block*',
});

export const ExtensionKit = ({ openAIAPIKey }: ExtensionKitProps) => [
  DocumentWithTitle,
  Columns,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Column,
  Selection,
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  TrailingNode,
  ImageBlock,
  ImageUpload,
  Image.configure({}),
  HorizontalRule,
  StarterKit.configure({
    document: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    codeBlock: false,
    paragraph: false,
  }),
  AIParagraph,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: null,
  }),
  TextStyle,
  FontSize,
  FontFamily,
  Color,
  Link.configure({
    openOnClick: false,
  }),
  Highlight.configure({ multicolor: true }),
  Underline,
  CharacterCount.configure({ limit: 50000 }),
  TextAlign.extend({
    addKeyboardShortcuts() {
      return {};
    },
  }).configure({
    types: ['heading', 'paragraph'],
  }),
  Subscript,
  Superscript,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  Typography,
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: false,
    placeholder: () => '',
  }),
  SlashCommand,
  Focus,
  Figcaption,
  BlockquoteFigure,
  Dropcursor.configure({
    width: 2,
    class: 'ProseMirror-dropcursor border-black',
  }),
  InlineChat,
  BlockID,
  CustomHighlight,
  AIWorkerExtension.configure({
    openAIAPIKey,
  }),
  AILinter.configure({
    plugins: [BadWords],
  }),
  Markdown,
];

export default ExtensionKit;
