import starlight from '@/assets/star-light.svg';
import stardark from '@/assets/star-dark.svg';
import { useDarkmode } from '@/hooks/useDarkMode';

export const BonsaiAvatar = () => {
  const { isDarkMode } = useDarkmode();
  return (
    <img
      src={isDarkMode ? starlight : stardark}
      alt="avatar"
      width={24}
      height={24}
      style={{ maxWidth: '24px', borderRadius: '6px' }}
    />
  );
};
