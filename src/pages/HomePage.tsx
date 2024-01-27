import { Sidebar } from '@/components/sidebar/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useListLeafs } from '@/hooks/leaf/useListLeafs';
import { Link } from 'react-router-dom';
import { LeafCard } from '@/components/leaf/LeafCard';

export const HomePage = () => {
  const { leafs, loading } = useListLeafs();
  return (
    <div className="flex h-full">
      <Sidebar className="min-w-[300px] h-full" />
      <div className="col-span-3 lg:col-span-4 lg:border-l flex-grow">
        <div className="h-full px-4 py-6 lg:px-8">
          <Tabs defaultValue="leafs" className="h-full space-y-6">
            <div className="space-between flex items-center">
              <TabsList>
                <TabsTrigger value="leafs" className="relative">
                  Leafs
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="leafs" className="border-none p-0 outline-none">
              <div className="relative">
                <ScrollArea>
                  <div className="flex space-x-4 pb-4">
                    {!loading &&
                      leafs.map((leaf) => (
                        <Link to={`/leafs/${leaf.id}`} key={leaf.id}>
                          <LeafCard leaf={leaf} key={leaf.id} />
                        </Link>
                      ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
