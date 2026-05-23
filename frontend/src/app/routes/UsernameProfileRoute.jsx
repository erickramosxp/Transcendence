import { Navigate, useParams } from 'react-router-dom';
import { Profile } from '@/pages/Profile';
import { isReservedUsername } from '@/shared/routing/reservedUsernames';

/**
 * Rota /:username — só renderiza perfil se o segmento não for rota reservada do app.
 */
export function UsernameProfileRoute() {
  const { username } = useParams();

  if (isReservedUsername(username)) {
    return <Navigate to="/404" replace />;
  }

  return <Profile />;
}
