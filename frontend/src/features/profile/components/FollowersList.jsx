import React from "react";

export function FollowersList({ followers, loading, currentUserId, onClose }) {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-6 w-6 rounded-full border-2
                        border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!followers.length) {
    return (
      <p className="text-center text-muted-foreground py-10 text-sm">
        Nenhum seguidor ainda.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border -mx-4 max-h-[60vh] overflow-y-auto">
      {followers.map((user) => (
        <li
          key={user.id}
          className="flex items-center gap-3 px-4 py-3
                     hover:bg-accent transition-colors"
        >
          {/* Avatar */}
          <img
            src={user.avatar ?? "/default-avatar.png"}
            alt={user.displayName}
            className="h-10 w-10 rounded-full object-cover
                       ring-1 ring-border shrink-0"
          />

          {/* Info */}
          <div className="flex flex-col flex-1 min-w-0">
            <a
              href={`/profile/${user.id}`}
              onClick={() => onClose?.()}
              className="text-sm font-medium text-foreground
                         hover:text-primary transition-colors truncate"
            >
              {user.displayName}
            </a>
            <span className="text-xs text-muted-foreground truncate">
              @{user.username}
            </span>
          </div>

          {/* Botão seguir */}
          {user.id !== currentUserId && (
            <button
              className={`shrink-0 text-xs font-medium px-3 py-1.5
                          rounded-[var(--radius-md)] transition-colors cursor-pointer
                          ${user.isFollowing
                            ? "bg-secondary text-secondary-foreground hover:bg-accent"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                          }`}
            >
              {user.isFollowing ? "Seguindo" : "Seguir"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}