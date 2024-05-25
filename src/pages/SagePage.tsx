import { CommandK } from '@/components/command/commandk';
import { SageDataTable } from '@/components/sage/SageDataTable';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useListSages } from '@/hooks/sage/useSages';
import { useState } from 'react';

export const SagePage = () => {
  const [refreshSages, setRefreshStages] = useState(false);
  const { sages } = useListSages([refreshSages]);

  const handleRefreshSages = () => {
    setRefreshStages((prevRefresh) => !prevRefresh);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6 justify-end">
            <CommandK />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex flex-1 rounded-lg border border-dashed shadow-sm">
              <SageDataTable
                sages={sages}
                onRefreshSages={handleRefreshSages}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
