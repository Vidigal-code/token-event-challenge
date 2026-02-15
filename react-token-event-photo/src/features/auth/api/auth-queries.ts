import { useMutation, useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/http-client';

type AuthUser = { id: string; email: string; role: string };
type AuthResponse = { user: AuthUser; csrfToken: string };
type AuthCheckResponse = { authenticated: boolean; id: string };
type AuthSyncHealthResponse = {
  authenticated: boolean;
  id: string;
  role: string;
  hasAccessTokenCookie: boolean;
  hasRefreshTokenCookie: boolean;
  hasCsrfCookie: boolean;
  synced: boolean;
};

export const useCsrfTokenQuery = () =>
  useQuery({
    queryKey: ['auth', 'csrf'],
    staleTime: 0,
    queryFn: async () => {
      const response = await httpClient.get<{ csrfToken: string }>('/auth/csrf');
      return response.data.csrfToken;
    },
  });

export const useAuthCheckQuery = () =>
  useQuery({
    queryKey: ['auth', 'check'],
    retry: false,
    queryFn: async () => {
      try {
        const response = await httpClient.get<AuthCheckResponse>('/auth/check');
        return response.data;
      } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return { authenticated: false, id: '0' };
        }
        throw error;
      }
    },
  });

export const useAuthSyncHealthQuery = (enabled: boolean) =>
  useQuery({
    queryKey: ['auth', 'sync-health'],
    enabled,
    retry: false,
    refetchInterval: 15000,
    queryFn: async () => {
      try {
        const response =
          await httpClient.get<AuthSyncHealthResponse>('/auth/sync-health');
        return response.data;
      } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return {
            authenticated: false,
            id: '0',
            role: 'unknown',
            hasAccessTokenCookie: false,
            hasRefreshTokenCookie: false,
            hasCsrfCookie: false,
            synced: false,
          };
        }
        throw error;
      }
    },
  });

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      csrfToken: string;
    }) => {
      const response = await httpClient.post<AuthResponse>(
        '/auth/login',
        { email: payload.email, password: payload.password },
        { headers: { 'X-CSRF-Token': payload.csrfToken } }
      );
      return response.data;
    },
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      csrfToken: string;
    }) => {
      const response = await httpClient.post<AuthResponse>(
        '/auth/register',
        { name: payload.name, email: payload.email, password: payload.password },
        { headers: { 'X-CSRF-Token': payload.csrfToken } }
      );
      return response.data;
    },
  });

export const useLogoutMutation = () =>
  useMutation({
    mutationFn: async (csrfToken?: string | null) => {
      await httpClient.post('/auth/logout', {}, {
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
      });
    },
  });

