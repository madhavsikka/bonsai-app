import { useListLeafs } from '@/hooks/leaf/useListLeafs';
import { LeafCard } from './LeafCard';
import { Link } from 'react-router-dom';

export const LeafGrid = () => {
  const { leafs, loading } = useListLeafs();

  return (
    <div className="grid grid-cols-6 gap-8 flex-grow">
      {/* <Button onClick={() => createLeaf({ title: 'test', body: 'test' })} /> */}
      {!loading &&
        leafs.map((leaf) => (
          <Link to={`/leafs/${leaf.id}`} key={leaf.id}>
            <LeafCard leaf={leaf} key={leaf.id} />
          </Link>
        ))}
    </div>
  );
};
