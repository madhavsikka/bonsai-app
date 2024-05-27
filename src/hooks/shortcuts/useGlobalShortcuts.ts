import { useEffect } from 'react';
import {
  register,
  isRegistered,
  unregister,
} from '@tauri-apps/plugin-global-shortcut';
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
      const isCtrlLeftRegistered = await isRegistered(COMMAND_OR_CONTROL_LEFT);
      if (!isCtrlLeftRegistered) {
        await register(COMMAND_OR_CONTROL_LEFT, () => {
          navigate(-1);
        });
      }

      const isCtrlRightRegistered = await isRegistered(
        COMMAND_OR_CONTROL_RIGHT
      );
      if (!isCtrlRightRegistered) {
        await register(COMMAND_OR_CONTROL_RIGHT, () => {
          navigate(1);
        });
      }

      const isCtrlPlusRegistered = await isRegistered(COMMAND_OR_CONTROL_PLUS);
      if (!isCtrlPlusRegistered) {
        await register(COMMAND_OR_CONTROL_PLUS, () => {
          handleZoomIn();
        });
      }

      const isCtrlMinusRegistered = await isRegistered(
        COMMAND_OR_CONTROL_MINUS
      );
      if (!isCtrlMinusRegistered) {
        await register(COMMAND_OR_CONTROL_MINUS, () => {
          handleZoomOut();
        });
      }
    };

    registerShortcuts();

    return () => {
      unregister(COMMAND_OR_CONTROL_LEFT);
      unregister(COMMAND_OR_CONTROL_RIGHT);
      unregister(COMMAND_OR_CONTROL_PLUS);
      unregister(COMMAND_OR_CONTROL_MINUS);
    };
  }, [navigate]);
};

export default useGlobalShortcuts;
