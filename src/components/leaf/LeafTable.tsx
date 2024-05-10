import { LeafDataTable } from './LeafDataTable';
import { useListLeafs } from '@/hooks/leaf/useListLeafs';
import { CommandK } from '../command/commandk';
import { useState } from 'react';

export const LeafTable = () => {
  const [refreshLeaves, setRefreshLeaves] = useState(false);
  const { leafs } = useListLeafs([refreshLeaves]);

  const handleRefreshLeaves = () => {
    setRefreshLeaves((prevRefresh) => !prevRefresh);
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6 justify-end">
        <CommandK />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex flex-1 rounded-lg border border-dashed shadow-sm">
          <LeafDataTable leafs={leafs} onRefreshLeaves={handleRefreshLeaves} />
        </div>
      </main>
    </>
  );
};
