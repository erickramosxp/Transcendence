import React from 'react'
import { MapPin, Link, Calendar } from 'lucide-react';


export const ProfileInfo = ({ name, username, bio, location, website, joinDate, followers, following }) => {
  return (
    <div className="">
      <h1 className={`text-xl font-bold text-foreground`}>{name}</h1>
      <p className="text-muted-foreground text-sm">@{username}</p>
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
          <span className="flex items-center gap-1">
            {/* Ícone de Pin */}
            <MapPin className="h-4 w-4"/>
            {location}
          </span>
        )}

        {/* Só aparece se "website" não for nulo/vazio */}
        {website && (
          <span className="flex items-center gap-1">
            {/* Ícone de Link */}
            <Link className="h-4 w-4"/>
            {/* Adicionando a tag <a> para tornar o link clicável */}
            <a 
              href={`https://${website}`}
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-primary hover:underline`}>
              {website}
            </a>
          </span>
        )}

        {/* Só aparece se "joinDate" não for nulo/vazio */}
        {joinDate && (
          <span className="flex items-center gap-1">
            {/* Ícone de Calendário */}
            <Calendar className="h-4 w-4" />
            Entrou em {joinDate}
          </span>
        )}
      </div>
      {/* Seguidores e Seguindo */}
      <div className="flex gap-4 mt-3 text-sm">
        <p>
          <span className={`font-bold text-foreground`}>{following}</span>{' '}
          <span className="text-muted-foreground">Seguindo</span>
        </p>
        <p>
          <span className={`font-bold text-foreground`}>{followers}</span>{' '}
          <span className="text-muted-foreground">Seguidores</span>
        </p>
      </div>
    </div>
  )
}
