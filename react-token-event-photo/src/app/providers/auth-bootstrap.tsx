import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  logoutSession,
  setAuthInitialized,
  setCsrfToken,
  setSession,
} from '../../entities/auth/model/auth-slice';
import { useAuthCheckQuery, useCsrfTokenQuery } from '../../features/auth/api/auth-queries';

type AuthBootstrapProps = {
  children: ReactNode;
};

export const AuthBootstrap = ({ children }: AuthBootstrapProps) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const authCheckQuery = useAuthCheckQuery();
  const csrfQuery = useCsrfTokenQuery();

  useEffect(() => {
    if (!csrfQuery.data) {
      return;
    }
    dispatch(setCsrfToken(csrfQuery.data));
  }, [csrfQuery.data, dispatch]);

  useEffect(() => {
    if (authCheckQuery.isError) {
      dispatch(logoutSession());
      dispatch(setAuthInitialized(true));
      queryClient.removeQueries({ queryKey: ['panel', 'images'] });
      return;
    }

    if (!authCheckQuery.data) {
      return;
    }

    if (!authCheckQuery.data.authenticated) {
      if (auth.authenticated || auth.user) {
        dispatch(logoutSession());
      }
      dispatch(setAuthInitialized(true));
      queryClient.removeQueries({ queryKey: ['panel', 'images'] });
      queryClient.setQueryData(['auth', 'sync-health'], {
        authenticated: false,
        id: '0',
        role: 'unknown',
        hasAccessTokenCookie: false,
        hasRefreshTokenCookie: false,
        hasCsrfCookie: Boolean(auth.csrfToken),
        synced: false,
      });
      return;
    }

    const authenticatedUserId = authCheckQuery.data.id;
    const shouldSyncSession =
      !auth.authenticated || auth.user?.id !== authenticatedUserId;

    if (shouldSyncSession) {
      const sameUser = auth.user?.id === authenticatedUserId;
      dispatch(
        setSession({
          initialized: true,
          authenticated: true,
          user: {
            id: authenticatedUserId,
            email: sameUser ? auth.user?.email : undefined,
            role: sameUser ? auth.user?.role : undefined,
          },
          csrfToken: auth.csrfToken,
        })
      );
    } else if (!auth.initialized) {
      dispatch(setAuthInitialized(true));
    }
  }, [
    authCheckQuery.data,
    authCheckQuery.isError,
    auth.authenticated,
    auth.user,
    auth.csrfToken,
    auth.initialized,
    dispatch,
    queryClient,
  ]);

  return <>{children}</>;
};


