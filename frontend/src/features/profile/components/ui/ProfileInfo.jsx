import React from 'react'
import { MapPin, Link, Calendar } from 'lucide-react';
import { formatJoinDate } from '@/features/profile/utils/formatJoinDate';


//////--
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';

import { Button } from '@/design-system';

// {
//   "id": 0,
//   "avatarUrl": "string",
//   "bannerImgUrl": "string",
//   "username": "string",
//   "name": "string",
//   "followers": 0,
//   "following": 0,
//   "registerDate": "2022-03-10T12:15:50-04:00"
// }


export const ProfileInfo = ({ name, username, bio, location, websiteUrl, registerDate, followers, following, onFollowersClick, onFollowingClick }) => {

  const { currentLanguage } = useLanguage();
  const { t } = useTranslation('profile');
  
  return (
    <div className="">
      <h1 className={`text-xl font-bold text-foreground`}>{name}</h1>
      { username && 
        <p className="text-muted-foreground text-sm">@{username}</p>
      }
      {bio && (
        <p className="mt-3 text-sm text-foreground">
            {bio}
        </p> 
    )}

        {/* SEÇÃO DE DETALHES */}
      {/* flex-wrap garante que, em telas muito pequenas, os itens pulem para a linha de baixo */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-muted-foreground text-sm">
        
        {/* Renderização Condicional: Só aparece se "location" não for nulo/vazio */}
        {location && (
          <span className="flex items-center gap-1" title={t('info.location')}>
            {/* Ícone de Pin */}
            <MapPin className="h-4 w-4"/>
            {location}
          </span>
        )}

        {/* Só aparece se "website" não for nulo/vazio */}
        {websiteUrl && (
          <span className="flex items-center gap-1" title={t('info.website')}>
            {/* Ícone de Link */}
            <Link className="h-4 w-4"/>
            {/* Adicionando a tag <a> para tornar o link clicável */}
            <a 
              href={`${websiteUrl}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-primary hover:underline`}>
              {websiteUrl}
            </a>
          </span>
        )}

        {/* Só aparece se "joinDate" não for nulo/vazio */}
        {registerDate && (
          <span className="flex items-center gap-1">
            {/* Ícone de Calendário */}
            <Calendar className="h-4 w-4" />
            {t('info.joined')} {formatJoinDate(registerDate, currentLanguage)}
          </span>
        )}
      </div>
      {/* Seguidores e Seguindo */}
      <div className="flex gap-4 mt-3 text-sm">
        <Button size='sm' variant='link' onClick={onFollowingClick}>
          <span className='hover:underline'>
            <span className={`font-bold text-foreground`}>{following ?? 0}</span>{' '}
            <span className="text-muted-foreground">{t('info.following')}</span>
          </span>
        </Button>
        <Button size='sm' variant='link' onClick={onFollowersClick}>
          <span className='hover:underline'>
            <span className={`font-bold text-foreground`}>{followers ?? 0}</span>{' '}
            <span className="text-muted-foreground">{t('info.followers')}</span>
          </span>
        </Button>
      </div>
    </div>
  )
}
