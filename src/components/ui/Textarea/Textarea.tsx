import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => {
  const textAreaClassName = cn(
    'bg-black/5 rounded-lg caret-black block text-black text-sm font-medium h-[4.5rem] px-2 py-1 w-full',
    'dark:bg-black dark:text-white dark:caret-white',
    className
  );

  return <textarea className={textAreaClassName} ref={ref} {...rest} />;
});

Textarea.displayName = 'Textarea';
