import { useListLeafs } from '@/hooks/leaf/useListLeafs';
import { LeafCard } from './LeafCard';
import { Link } from 'react-router-dom';

export const LeafGrid = () => {
  const { leafs, loading } = useListLeafs();

  // const { createLeaf } = useCreateLeaf();

  return (
    <div className="grid grid-cols-6 gap-8 flex-grow">
      {/* <Button onClick={() => createLeaf({ title: 'test', body: 'test' })} /> */}
      {!loading &&
        leafs.map((leaf) => (
          <Link to={`/leafs/${leaf.name}`} key={leaf.name}>
            <LeafCard leaf={leaf} key={leaf.name} />
          </Link>
        ))}
    </div>
  );
};
