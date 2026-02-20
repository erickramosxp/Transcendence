import React, { useState } from 'react'
import { cn } from '../../../components/utils/colors';

const sizeVariants = {
  sm: 'size-10', // Pequeno (40x40)
  md: 'size-16', // Médio (64x64)
  lg: 'size-24', // Grande (96x96)
  xl: 'size-32', // Gigante (128x128)
  xxl: 'size-48'
};

export const Avatar = ({imgUrl, name = 'Usuário',size = 'md'}) => {

    
    const [imageError, setImageError] = useState(false);
    const initial = name.charAt(0).toUpperCase();
    const showFallback = !imgUrl || imageError;

    return (
        <div className={cn(
            'inline-block border-2 rounded-full overflow-hidden flex items-center justify-center',
            sizeVariants[size]
        )}>
            { showFallback ? (
                <span>{initial}</span>
            ) : (
                <img className='w-full h-full object-cover' src={imgUrl} alt="Profile picture" onError={() => setImageError(true)}/>
            )

            }
        </div>
    )
}
