import { useEffect } from 'react';
import { globalShortcut } from '@tauri-apps/api';
import { useNavigate } from 'react-router-dom';
import { useZoom } from '../useZoom';

const COMMAND_OR_CONTROL_LEFT = 'CommandOrControl+Left';
const COMMAND_OR_CONTROL_RIGHT = 'CommandOrControl+Right';
const COMMAND_OR_CONTROL_PLUS = 'CommandOrControl+Plus';
const COMMAND_OR_CONTROL_MINUS = 'CommandOrControl+Minus';

const useGlobalShortcuts = () => {
  const navigate = useNavigate();
  const { handleZoomIn, handleZoomOut } = useZoom();

  useEffect(() => {
    const registerShortcuts = async () => {
      const isCtrlLeftRegistered = await globalShortcut.isRegistered(
        COMMAND_OR_CONTROL_LEFT
      );
      if (!isCtrlLeftRegistered) {
        await globalShortcut.register(COMMAND_OR_CONTROL_LEFT, () => {
          navigate(-1);
        });
      }

      const isCtrlRightRegistered = await globalShortcut.isRegistered(
        COMMAND_OR_CONTROL_RIGHT
      );
      if (!isCtrlRightRegistered) {
        await globalShortcut.register(COMMAND_OR_CONTROL_RIGHT, () => {
          navigate(1);
        });
      }

      const isCtrlPlusRegistered = await globalShortcut.isRegistered(
        COMMAND_OR_CONTROL_PLUS
      );
      if (!isCtrlPlusRegistered) {
        await globalShortcut.register(COMMAND_OR_CONTROL_PLUS, () => {
          handleZoomIn();
        });
      }

      const isCtrlMinusRegistered = await globalShortcut.isRegistered(
        COMMAND_OR_CONTROL_MINUS
      );
      if (!isCtrlMinusRegistered) {
        await globalShortcut.register(COMMAND_OR_CONTROL_MINUS, () => {
          handleZoomOut();
        });
      }
    };

    registerShortcuts();

    return () => {
      globalShortcut.unregister(COMMAND_OR_CONTROL_LEFT);
      globalShortcut.unregister(COMMAND_OR_CONTROL_RIGHT);
      globalShortcut.unregister(COMMAND_OR_CONTROL_PLUS);
      globalShortcut.unregister(COMMAND_OR_CONTROL_MINUS);
    };
  }, [navigate]);
};

export default useGlobalShortcuts;
