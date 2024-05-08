import { Icon } from '@/components/ui/Icon';
import { Surface } from '@/components/ui/Surface';
import { Toolbar } from '@/components/ui/Toolbar';
import EditorTooltip from '@/components/ui/EditorTooltip';

export type LinkPreviewPanelProps = {
  url: string;
  onEdit: () => void;
  onClear: () => void;
};

export const LinkPreviewPanel = ({
  onClear,
  onEdit,
  url,
}: LinkPreviewPanelProps) => {
  return (
    <Surface className="flex items-center gap-2 p-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline"
      >
        {url}
      </a>
      <Toolbar.Divider />
      <EditorTooltip title="Edit link">
        <Toolbar.Button onClick={onEdit}>
          <Icon name="Pen" />
        </Toolbar.Button>
      </EditorTooltip>
      <EditorTooltip title="Remove link">
        <Toolbar.Button onClick={onClear}>
          <Icon name="Trash2" />
        </Toolbar.Button>
      </EditorTooltip>
    </Surface>
  );
};
