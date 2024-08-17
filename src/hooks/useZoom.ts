import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const useZoom = () => {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((curr) => {
      const newZoomLevel = Math.min(curr + 0.1, 2);
      invoke('zoom_window', { scaleFactor: newZoomLevel });
      return newZoomLevel;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((curr) => {
      const newZoomLevel = Math.max(curr - 0.1, 0.1);
      invoke('zoom_window', { scaleFactor: newZoomLevel });
      return newZoomLevel;
    });
  }, []);

  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      // Replace "Control" with "Meta" for macOS or adapt as needed
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '+': // Zoom in
            event.preventDefault();
            handleZoomIn();
            break;
          case '-': // Zoom out
            event.preventDefault();
            handleZoomOut();
            break;
          default:
            break;
        }
      }
    },
    [handleZoomIn, handleZoomOut]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  return { zoomLevel, handleZoomIn, handleZoomOut };
};
