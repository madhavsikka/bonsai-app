import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomElement(array: Array<any>) {
  return array[Math.floor(Math.random() * array.length)];
}

export * from './cssVar';
export * from './getRenderContainer';
export * from './isCustomNodeSelected';
export * from './isTextSelected';
