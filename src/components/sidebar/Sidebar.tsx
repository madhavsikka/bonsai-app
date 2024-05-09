import { BonsaiAvatar } from '../avatar/BonsaiAvatar';
import { Leaf } from 'lucide-react';

export const Sidebar = () => {
  return (
    <div className="hidden border-r md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a
            href="/"
            className="flex items-center justify-center gap-2 font-semibold"
          >
            <BonsaiAvatar />
            <span className="text-md font-normal">bonsai</span>
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
  );
};
