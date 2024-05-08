import leaf from '@/assets/leaf-round.svg';

export const BonsaiAvatar = () => {
  return (
    <img
      src={leaf}
      alt="avatar"
      width={30}
      height={30}
      style={{ borderRadius: '6px' }}
    />
  );
};
