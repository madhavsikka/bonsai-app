import { cn } from '@/lib/utils';
import { Leaf } from '@/types/leaf';
import { patterns } from './patterns';

interface LeafCardProps extends React.HTMLAttributes<HTMLDivElement> {
  leaf: Leaf;
}

const getRandomPattern = () => {
  return patterns[Math.floor(Math.random() * patterns.length)];
};

export function LeafCard({ className, leaf, ...props }: LeafCardProps) {
  return (
    <div className="flex flex-col flex-grow justify-between">
      <div
        className={cn(
          'space-y-3 rounded-t-lg h-32 border border-b-0',
          className
        )}
        {...props}
        style={{ ...getRandomPattern() }}
      />
      <div className="p-4 border border-t-0 rounded-b-lg flex-grow">
        <h3 className="font-semibold">{leaf.title}</h3>
      </div>
    </div>
  );
}
