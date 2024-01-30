import { Sidebar } from '@/components/sidebar/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListLeafs } from '@/hooks/leaf/useListLeafs';
import { Link } from 'react-router-dom';
import { LeafCard } from '@/components/leaf/LeafCard';
import { Menu } from '@/components/menubar/Menu';
import ThemeSwitcher from '@/components/theme-switcher';

export const HomePage = () => {
  const { leafs, loading } = useListLeafs();
  return (
    <div className="flex flex-col h-full">
      <ThemeSwitcher />
      <Menu />
      <div className="flex border-t mt-2 h-full">
        <Sidebar className="min-w-[300px] h-full" />
        <div className="col-span-2 lg:border-l flex-grow">
          <div className="h-full px-4 py-6 lg:px-8">
            <Tabs defaultValue="leafs" className="h-full space-y-6">
              <div className="space-between flex items-center">
                <TabsList>
                  <TabsTrigger value="leafs" className="relative">
                    Leafs
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent
                value="leafs"
                className="border-none p-0 outline-none"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                  {!loading &&
                    leafs.map((leaf) => (
                      <Link to={`/leafs/${leaf.id}`} key={leaf.id}>
                        <LeafCard
                          leaf={leaf}
                          key={leaf.id}
                          className="min-h-[500px]"
                          coverImageClassName="min-h-[200px]"
                        />
                      </Link>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
