import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

import { CreateLeafDialog } from './CreateLeafDialog';
import { Leaf } from '@/types/leaf';
import { LeafAvatar } from '../avatar/LeafAvatar';
import { useNavigate } from 'react-router-dom';

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

export const LeafDataTable = ({ leafs }: { leafs: Leaf[] }) => {
  const navigate = useNavigate();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex justify-between items-center">
          <span>Leaves </span>
          <CreateLeafDialog />
        </CardTitle>
        <CardDescription>
          Manage your leaves. Add, edit, or delete them as you see fit.
        </CardDescription>
      </CardHeader>
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
            {leafs.map((leaf) => (
              <TableRow key={leaf.name}>
                <TableCell
                  className="hidden sm:table-cell cursor-pointer"
                  onClick={() => navigate(`/leafs/${leaf.name}`)}
                >
                  <LeafAvatar />
                </TableCell>
                <TableCell
                  className="font-medium hover:underline cursor-pointer"
                  onClick={() => navigate(`/leafs/${leaf.name}`)}
                >
                  {leaf.name}
                </TableCell>
                <TableCell>{formatTimestamp(leaf.createdAt)}</TableCell>
                <TableCell>{formatTimestamp(leaf.modifiedAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
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
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div>
      </CardFooter>
    </Card>
  );
};