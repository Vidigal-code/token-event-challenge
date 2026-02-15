import { useMutation, useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/http-client';
import type { DeleteResponse, ImageResponse } from '../../../page/panel/interface-panel';

export const useImagesQuery = (enabled: boolean, userId: string | null) =>
  useQuery({
    queryKey: ['panel', 'images', userId],
    enabled,
    retry: false,
    queryFn: async () => {
      try {
        const response = await httpClient.get<ImageResponse>('/image/all');
        return { images: response.data.images, isAdmin: true };
      } catch (error: any) {
        if (error?.response?.status !== 403) {
          throw error;
        }
        const userResponse = await httpClient.get<ImageResponse>('/image/user');
        return { images: userResponse.data.images, isAdmin: false };
      }
    },
  });

export const useDeleteImageMutation = (isAdmin: boolean) =>
  useMutation({
    mutationFn: async (payload: { qrCodeId: string; csrfToken: string }) => {
      const endpoint = isAdmin
        ? `/image/qr/${payload.qrCodeId}`
        : `/image/user/qr/${payload.qrCodeId}`;
      const response = await httpClient.delete<DeleteResponse>(endpoint, {
        headers: { 'X-CSRF-Token': payload.csrfToken },
      });
      return response.data;
    },
  });

