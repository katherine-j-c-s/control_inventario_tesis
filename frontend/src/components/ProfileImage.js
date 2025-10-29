import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileImage = ({ user, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  const handleImageError = () => {
    setImageError(true);
  };

  const getInitials = () => {
    const firstName = user?.nombre?.charAt(0)?.toUpperCase() || '';
    const lastName = user?.apellido?.charAt(0)?.toUpperCase() || '';
    return `${firstName}${lastName}` || 'U';
  };

  // Construir la URL de la imagen
  const getImageUrl = () => {
    if (!user?.foto) return null;
    
    // Si ya es una URL completa, usarla directamente
    if (user.foto.startsWith('http')) {
      return user.foto;
    }
    
    // Construir URL desde el backend
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const serverUrl = baseUrl.replace('/api', '');
    return `${serverUrl}/uploads/${user.foto}`;
  };

  const imageUrl = getImageUrl();

  return (
    <Avatar className={`${currentSizeClass} ${className}`}>
      {imageUrl && !imageError ? (
        <AvatarImage 
          src={imageUrl} 
          alt={`Foto de ${user?.nombre || 'Usuario'}`}
          onError={handleImageError}
        />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileImage;
