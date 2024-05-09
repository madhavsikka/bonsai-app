import ThemeSwitcher from '@/components/theme-switcher';
import { LeafTable } from '@/components/leaf/LeafTable';
import { Sidebar } from '@/components/sidebar/Sidebar';

export const HomePage = () => {
  return (
    <div className="flex flex-col h-full">
      <ThemeSwitcher />
      {/* <Menu /> */}
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <LeafTable />
        </div>
      </div>
    </div>
  );
};
