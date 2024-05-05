import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { useCreateLeaf } from '@/hooks/leaf/useCreateLeaf';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { createLeaf } = useCreateLeaf();
  const navigate = useNavigate();

  // Use current time as the default leaf name
  const handleCreateLeaf = useCallback(async () => {
    const name = `${Date.now()}`;
    await createLeaf({ name: name, content: '' });
    navigate(`/leafs/${name}`);
  }, []);

  return (
    <div className={cn('pb-12', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Library
          </h2>
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleCreateLeaf}
            >
              <PlusCircledIcon className="mr-2" />
              <span>New Leaf</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
