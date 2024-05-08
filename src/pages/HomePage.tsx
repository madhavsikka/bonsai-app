import { Sidebar } from '@/components/sidebar/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListLeafs } from '@/hooks/leaf/useListLeafs';
import { Link } from 'react-router-dom';
import { LeafCard } from '@/components/leaf/LeafCard';
import { Menu } from '@/components/menubar/Menu';
import ThemeSwitcher from '@/components/theme-switcher';
import { LeafTable } from '@/components/leaf/LeafTable';

export const HomePage = () => {
  const { leafs, loading } = useListLeafs();
  return (
    <div className="flex flex-col h-full">
      <ThemeSwitcher />
      {/* <Menu /> */}
      <LeafTable />
    </div>
  );
};
