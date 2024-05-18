import { useNavigate, useLocation } from 'react-router-dom';
import { BonsaiAvatar } from '../avatar/BonsaiAvatar';
import { Leaf, Rainbow } from 'lucide-react';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="hidden border-r md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div
          className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <BonsaiAvatar />
          <span className="text-md font-light">bonsai</span>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary cursor-pointer font-normal ${
                location.pathname === '/'
                  ? 'bg-muted text-primary'
                  : 'hover:bg-muted-100'
              }`}
              onClick={() => navigate('/')}
            >
              <Leaf className="h-4 w-4" />
              Leaves
            </div>
            <div
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary cursor-pointer font-normal ${
                location.pathname === '/sages'
                  ? 'bg-muted text-primary'
                  : 'hover:bg-muted-100'
              }`}
              onClick={() => navigate('/sages')}
            >
              <Rainbow className="h-4 w-4" />
              Sages
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};
