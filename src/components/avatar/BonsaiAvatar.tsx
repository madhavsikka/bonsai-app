import sprout from '@/assets/sprout.svg';

export const BonsaiAvatar = () => {
  return (
    <img
      src={sprout}
      alt="avatar"
      width={30}
      height={30}
      style={{ borderRadius: '6px' }}
    />
  );
};
