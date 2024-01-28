import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';

export type EditorTopbarProps = {};

export const EditorTopbar = ({}: EditorTopbarProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-row items-center justify-between py-2 px-6">
      <Button
        variant="secondary"
        className="m-0 p-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon />
      </Button>
    </div>
  );
};
