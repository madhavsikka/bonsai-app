import * as React from 'react';
import { GearIcon } from '@radix-ui/react-icons';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { useSearchLeaf } from '@/hooks/leaf/useSearchLeaf';

export const CommandK = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const { leaves: searchedLeaves } = useSearchLeaf({ query });

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <p className="text-md text-foreground">
        Press{' '}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg px-1.5 font-mono text-[10px] font-medium text-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>{' '}
        to search
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search for leaves..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchedLeaves.length > 0 && (
            <CommandGroup heading="Leaves">
              {searchedLeaves.map((leaf) => {
                return (
                  <CommandItem
                    forceMount
                    key={leaf.name}
                    onSelect={() => {
                      navigate(`/leafs/${leaf.name}`);
                    }}
                    className="cursor-pointer"
                  >
                    <span>{leaf.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
          <CommandGroup heading="Settings">
            <CommandItem
              onSelect={() => {
                navigate('/preferences');
              }}
              className="cursor-pointer"
            >
              <GearIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
