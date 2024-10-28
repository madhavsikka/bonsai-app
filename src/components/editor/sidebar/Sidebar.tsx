import { cn } from '@/lib/utils';
import { memo, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { Icon } from "@/components/ui/Icon";
import { Toolbar } from "@/components/ui/Toolbar";

export const Sidebar = memo(
  ({
    // @ts-ignore
    editor,
    isOpen,
    onClose,
  }: {
    editor: Editor;
    isOpen?: boolean;
    onClose: () => void;
  }) => {
    // @ts-ignore
    const handlePotentialClose = useCallback(() => {
      if (window.innerWidth < 1024) {
        onClose();
      }
    }, [onClose]);

    const windowClassName = cn(
      'absolute top-0 right-0 bg-white lg:bg-white/30 lg:backdrop-blur-xl h-full lg:h-auto lg:relative z-[999] w-0 duration-300 transition-all',
      'dark:bg-black lg:dark:bg-black/30',
      !isOpen && 'border-l-transparent',
      isOpen && 'w-80 border-l border-l-neutral-200 dark:border-l-neutral-800'
    );

    const handleClick = () => {
      console.log('Sidebar toggle clicked', { isOpen });
      onClose();
    };

    return (
      <>
        <Toolbar.Button
          tooltip={isOpen ? "Close sidebar" : "Open sidebar"}
          onClick={handleClick}
          className={cn(
            "fixed right-6 top-3 z-[999]",
            "transition-all duration-300", // Match the sidebar's transition
            isOpen && "right-[calc(20rem+1.5rem)]"
          )}
        >
          <Icon name={isOpen ? "PanelRightClose" : "PanelRight"} />
        </Toolbar.Button>
        <div className={windowClassName}>
          <div className="w-full h-full overflow-hidden">
            <div className="w-full h-full p-6 overflow-auto">
              {/* <TableOfContents
                onItemClick={handlePotentialClose}
                editor={editor}
              /> */}
            </div>
          </div>
        </div>
      </>
    );
  }
);

Sidebar.displayName = 'TableOfContentSidepanel';
