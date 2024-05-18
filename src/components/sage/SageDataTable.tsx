import { UIButton } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { MoreHorizontal } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { SageDialog } from './SageDialog';
import { LeafAvatar } from '../avatar/LeafAvatar';
import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { Sage } from '@/types/sage';
import { useDeleteSage } from '@/hooks/sage/useSages';

const dateOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
} as const;

export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleString('en-US', dateOptions);
  const formattedDateWithSuffix = formattedDate.replace(
    /(\d+)(st|nd|rd|th)/,
    '$1<sup>$2</sup>'
  );

  return formattedDateWithSuffix;
};

export const SageDataTable = ({
  sages,
  onRefreshSages,
}: {
  sages: Sage[];
  onRefreshSages: () => void;
}) => {
  const [selectedSage, setSelectedSage] = useState<Sage | null>(null);

  const { deleteSage } = useDeleteSage();

  const handleDeleteSage = useCallback(
    async (sageName: string) => {
      await deleteSage(sageName);
      onRefreshSages();
    },
    [deleteSage, onRefreshSages]
  );

  return (
    <Card className="w-full overflow-y-auto flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl flex justify-between items-center">
          <span>Sages </span>
          <SageDialog
            onRefreshSages={() => {
              setSelectedSage(null);
              onRefreshSages();
            }}
            sage={selectedSage}
            open={selectedSage ? !!selectedSage : undefined}
          />
        </CardTitle>
        <CardDescription>
          Seek wisdom from the sages of the past.
        </CardDescription>
      </CardHeader>
      {!sages?.length && (
        <CardContent className="flex-1">
          <div className="flex flex-col items-center justify-center gap-1 text-center w-full h-full">
            <h3 className="text-2xl font-bold tracking-tight">
              You have no sages!
            </h3>
            <p className="text-sm text-foreground">
              Sages are the keepers of wisdom. Add a sage to start your journey.
            </p>
          </div>
        </CardContent>
      )}
      {sages && sages.length > 0 && (
        <>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Modified At</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sages.map((sage) => (
                  <TableRow key={sage.name}>
                    <TableCell
                      className="hidden sm:table-cell cursor-pointer"
                      onClick={() => setSelectedSage(sage)}
                    >
                      <LeafAvatar />
                    </TableCell>
                    <TableCell
                      className="font-medium hover:underline cursor-pointer"
                      onClick={() => setSelectedSage(sage)}
                    >
                      {sage.name}
                    </TableCell>
                    <TableCell>{formatTimestamp(sage.createdAt)}</TableCell>
                    <TableCell>{formatTimestamp(sage.modifiedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <UIButton
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </UIButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteSage(sage.name)}
                            className="cursor-pointer"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{(sages ?? []).length}</strong>{' '}
              {sages?.length === 1 ? 'sage' : 'sages'}
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};
