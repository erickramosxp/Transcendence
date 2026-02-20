import React from 'react'
import { yaleBlue } from '../../../components/utils/colors'

export const ProfileInfo = ({ name, username, bio, location, website, joinDate, followers, following }) => {
  return (
    <div className="">
      <h1 className={`text-xl font-bold ${yaleBlue.text.dark}`}>{name}</h1>
      <p className="text-gray-500 text-sm">@{username}</p>
      {bio && (
        <p className="mt-3 text-[#0f1419] text-sm">
            {bio}
        </p> 
    )}

        {/* SEÇÃO DE DETALHES */}
      {/* flex-wrap garante que, em telas muito pequenas, os itens pulem para a linha de baixo */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-gray-500 text-sm">
        
        {/* Renderização Condicional: Só aparece se "location" não for nulo/vazio */}
        {location && (
          <span className="flex items-center gap-1">
            {/* Ícone de Pin */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {location}
          </span>
        )}

        {/* Só aparece se "website" não for nulo/vazio */}
        {website && (
          <span className="flex items-center gap-1">
            {/* Ícone de Link */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            {/* Adicionando a tag <a> para tornar o link clicável */}
            <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className={`${yaleBlue.text.light} hover:underline`}>
              {website}
            </a>
          </span>
        )}

        {/* Só aparece se "joinDate" não for nulo/vazio */}
        {joinDate && (
          <span className="flex items-center gap-1">
            {/* Ícone de Calendário */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Entrou em {joinDate}
          </span>
        )}
      </div>
      {/* Seguidores e Seguindo */}
      <div className="flex gap-4 mt-3 text-sm">
        <p>
          <span className={`font-bold ${yaleBlue.text.dark}`}>{following}</span>{' '}
          <span className="text-gray-500">Seguindo</span>
        </p>
        <p>
          <span className={`font-bold ${yaleBlue.text.dark}`}>{followers}</span>{' '}
          <span className="text-gray-500">Seguidores</span>
        </p>
      </div>
    </div>
  )
}
