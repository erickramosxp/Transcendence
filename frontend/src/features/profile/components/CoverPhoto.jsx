import React from 'react'
import { yaleBlue } from '../../../components/utils/colors';

export const CoverPhoto = ({coverUrl}) => {

  return (
    // Definimos a altura fixa aqui. O relative é para o Avatar poder se sobrepor depois
    <div className="h-32 sm:h-48 w-full relative bg-gray-200">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt="Capa do perfil"
          className="w-full h-full object-cover" 
        />
      ) : (
        <div className={`w-full h-full ${yaleBlue.gradient.primary}`}></div>
      )}
    </div>
  );
}
