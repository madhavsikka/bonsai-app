import { EditorInfo } from './EditorInfo';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type EditorHeaderProps = {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  characters: number;
  words: number;
};

export const EditorHeader = ({ characters, words }: EditorHeaderProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={cn(
        'flex flex-row items-center justify-between py-1 px-3',
        'fixed bottom-0 left-0 w-full z-10',
        'transition-opacity duration-400',
        {
          'opacity-0': !isVisible,
          'opacity-100': isVisible,
        }
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Button variant="ghost" className="p-1 m-0">
        <ArrowLeftIcon className="m-0" onClick={() => navigate(-1)} />
      </Button>
      <EditorInfo characters={characters} words={words} />
    </div>
  );
};
