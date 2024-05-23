import { diffWords, Change } from 'diff';

interface IndexedChange extends Change {
  start: number;
  end: number;
}

export function findDiff(
  firstString: string,
  secondString: string
): IndexedChange[] {
  // Use the 'diffWords' function to find the changes
  const changes = diffWords(firstString, secondString);

  let start = 0;

  // Create an array of IndexedChange objects
  const indexedChanges: IndexedChange[] = changes.map(
    (change: Change): IndexedChange => {
      const indexedChange: IndexedChange = {
        ...change,
        start: start,
        end: start + change.value.length,
      };
      start = indexedChange.end;
      return indexedChange;
    }
  );

  // Return the indexed changes
  return indexedChanges;
}
