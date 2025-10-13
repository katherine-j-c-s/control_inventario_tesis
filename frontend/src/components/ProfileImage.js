import { useState } from 'react';

const ProfileImage = ({ user, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitials = () => {
    const firstName = user?.nombre?.charAt(0)?.toUpperCase() || '';
    const lastName = user?.apellido?.charAt(0)?.toUpperCase() || '';
    return `${firstName}${lastName}`;
  };

  if (!user?.foto || imageError) {
    return (
      <div className={`${currentSizeClass} rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold border-2 border-gray-300 ${className}`}>
        {getInitials()}
      </div>
    );
  }

  return (
    <img
      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${user.foto}`}
      alt="Foto de perfil"
      className={`${currentSizeClass} rounded-full object-cover border-2 border-gray-300 ${className}`}
      onError={handleImageError}
    />
  );
};

export default ProfileImage;
