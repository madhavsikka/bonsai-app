import { UIButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCallback, useEffect, useState } from 'react';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { useCreateSage, useUpdateSage } from '@/hooks/sage/useSages';
import { Sage } from '@/types/sage';
import { InputTextArea } from '../ui/InputTextArea';

export const SageDialog = ({
  onRefreshSages,
  sage = null,
  open,
  onOpenChange,
}: {
  onRefreshSages: () => void;
  sage?: Sage | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const { createSage } = useCreateSage();
  const { updateSage } = useUpdateSage();
  const [sageName, setSageName] = useState(sage?.name || '');
  const [sageDescription, setSageDescription] = useState(
    sage?.description || ''
  );

  useEffect(() => {
    setSageName(sage?.name || '');
    setSageDescription(sage?.description || '');
  }, [sage]);

  const handleSaveSage = useCallback(async () => {
    if (sage) {
      await updateSage({
        name: sageName,
        description: sageDescription,
      });
    } else {
      await createSage({ name: sageName, description: sageDescription });
    }
    onRefreshSages();
  }, [sage, sageName, sageDescription]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveSage();
      }
    },
    [handleSaveSage]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <UIButton className="mt-4 text-background">
          <PlusCircledIcon className="mr-2 text-background" />
          {sage ? 'Edit Sage' : 'Add Sage'}
        </UIButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{sage ? 'Edit Sage' : 'New Sage'}</DialogTitle>
          <DialogDescription>
            {sage
              ? 'Update the details of the sage.'
              : 'Fill in the details below to create a new sage.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={sageName}
              autoFocus
              placeholder="Grammar Sage"
              className="col-span-3"
              onKeyDown={handleKeyDown}
              disabled={!!sage}
              onChange={(e) => setSageName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <InputTextArea
              id="description"
              value={sageDescription}
              placeholder="You are an expert in English grammar and literature. Help me correct my mistakes."
              className="col-span-3"
              onChange={(e) => setSageDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex w-full justify-between">
          <DialogClose asChild>
            <UIButton
              type="submit"
              onClick={handleSaveSage}
              disabled={!sageName}
            >
              {sage ? 'Update' : 'Create'}
            </UIButton>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
