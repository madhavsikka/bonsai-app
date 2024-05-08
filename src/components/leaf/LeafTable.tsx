import { User, Leaf, Search } from 'lucide-react';

import { UIButton } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { BonsaiAvatar } from '../avatar/BonsaiAvatar';
import { LeafDataTable } from './LeafDataTable';
import { useListLeafs } from '@/hooks/leaf/useListLeafs';

export const LeafTable = () => {
  const { leafs } = useListLeafs();
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <a
              href="/"
              className="flex items-center justify-center gap-2 font-semibold"
            >
              <BonsaiAvatar />
              <span className="text-lg font-normal">bonsai</span>
            </a>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary"
              >
                <Leaf className="h-4 w-4" />
                Leaves
              </a>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground" />
                <Input
                  type="search"
                  placeholder="Search leaves..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <UIButton
                variant="secondary"
                size="icon"
                className="rounded-full"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </UIButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-1 rounded-lg border border-dashed shadow-sm">
            {leafs && leafs.length > 0 ? (
              <LeafDataTable leafs={leafs} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-center w-full">
                <h3 className="text-2xl font-bold tracking-tight">
                  You have no leaves!
                </h3>
                <p className="text-sm text-foreground">
                  Start writing your first leaf by clicking the button above.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
