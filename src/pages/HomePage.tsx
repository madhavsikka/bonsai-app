import ThemeSwitcher from '@/components/theme-switcher';
import { LeafTable } from '@/components/leaf/LeafTable';

export const HomePage = () => {
  return (
    <div className="flex flex-col h-full">
      <ThemeSwitcher />
      {/* <Menu /> */}
      <LeafTable />
    </div>
  );
};
