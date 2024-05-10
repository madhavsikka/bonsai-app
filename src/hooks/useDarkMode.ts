import { useConfig } from '@/providers/ConfigProvider';
import { useEffect } from 'react';

export const useDarkmode = () => {
  const { config, setConfig } = useConfig();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', config.theme === 'dark');
  }, [config.theme]);

  const toggleDarkMode = () =>
    setConfig({ theme: config.theme === 'dark' ? 'light' : 'dark' });
  const lightMode = () => setConfig({ theme: 'light' });
  const darkMode = () => setConfig({ theme: 'dark' });

  return {
    isDarkMode: config.theme === 'dark',
    toggleDarkMode,
    lightMode,
    darkMode,
  };
};
