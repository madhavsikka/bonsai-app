import { createPortal } from 'react-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDarkmode } from '@/hooks/useDarkMode';

export const ThemeSwitcher = () => {
  const { isDarkMode, darkMode, lightMode } = useDarkmode();
  return createPortal(
    <Tabs
      defaultValue={isDarkMode ? 'dark' : 'light'}
      className="flex items-center gap-1 fixed bottom-6 right-6 z-[99999] p-1"
    >
      <TabsList>
        <TabsTrigger value="dark" onClick={darkMode}>
          Dark
        </TabsTrigger>
        <TabsTrigger value="light" onClick={lightMode}>
          Light
        </TabsTrigger>
      </TabsList>
    </Tabs>,
    document.body
  );
};

export default ThemeSwitcher;
