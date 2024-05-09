import { UIButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCallback, useState } from 'react';
import { useCreateLeaf } from '@/hooks/leaf/useCreateLeaf';
import { useNavigate } from 'react-router-dom';
import { PlusCircledIcon } from '@radix-ui/react-icons';

export const CreateLeafDialog = () => {
  const { createLeaf } = useCreateLeaf();
  const navigate = useNavigate();

  const [leafName, setLeafName] = useState('');

  const handleCreateLeaf = useCallback(async () => {
    await createLeaf({ name: leafName, content: '' });
    navigate(`/leafs/${leafName}`);
  }, [leafName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCreateLeaf();
      }
    },
    [handleCreateLeaf]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <UIButton className="mt-4 text-background">
          <PlusCircledIcon className="mr-2 text-background" />
          Add Leaf
        </UIButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Leaf</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new leaf.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={leafName}
              autoFocus
              placeholder="The origins of Bonsai"
              className="col-span-3"
              onKeyDown={handleKeyDown}
              onChange={(e) => setLeafName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <UIButton type="submit" onClick={handleCreateLeaf}>
            Done
          </UIButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
