import { useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';
import { useNavigate } from 'react-router-dom';

const useGlobalShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const registerShortcuts = async () => {
      const isCtrlLeftRegistered = await globalShortcut.isRegistered(
        'Ctrl+Left'
      );
      if (!isCtrlLeftRegistered) {
        await globalShortcut.register('Ctrl+Left', () => {
          navigate(-1);
        });
      }

      const isCtrlRightRegistered = await globalShortcut.isRegistered(
        'Ctrl+Right'
      );
      if (!isCtrlRightRegistered) {
        await globalShortcut.register('Ctrl+Right', () => {
          navigate(1);
        });
      }
    };

    registerShortcuts();

    return () => {
      globalShortcut.unregister('Ctrl+Left');
      globalShortcut.unregister('Ctrl+Right');
    };
  }, [navigate]);
};

export default useGlobalShortcuts;
