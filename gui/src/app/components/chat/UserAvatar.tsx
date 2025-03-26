
// components/chat/UserAvatar.tsx
interface UserAvatarProps {
  name: string;
  initials?: string;
}

export function UserAvatar({ name, initials }: UserAvatarProps) {
  const getInitials = () => {
    if (initials) return initials;
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return (
    <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium text-sm">
      {getInitials()}
    </div>
  );
}