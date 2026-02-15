import { useMutation, useQuery } from '@tanstack/react-query';
import { getImageById, uploadImage } from '../../../supabase/supabase-config';

export const useUploadImageMutation = () =>
  useMutation({
    mutationFn: async (payload: { qrCodeId: string; photo: string }) => {
      return uploadImage(payload.qrCodeId, payload.photo);
    },
  });

export const useImageByIdQuery = (qrCodeId: string) =>
  useQuery({
    queryKey: ['photo', 'preview', qrCodeId],
    enabled: Boolean(qrCodeId),
    queryFn: async () => {
      return getImageById(qrCodeId);
    },
  });

