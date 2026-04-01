import React from 'react'

export const CoverPhoto = ({coverUrl}) => {

  return (
    
    <div className="h-40 sm:h-52 w-full relative bg-card">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt="Capa do perfil"
          className="w-full h-full object-cover rounded-b-xl md:rounded-b-3xl" 
        />
      ) : (
        <div className={`w-full h-full bg-gradient-sparkle`}></div>
      )}
    </div>
  );
}
