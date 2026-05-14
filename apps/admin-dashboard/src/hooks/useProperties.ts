import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface PropertyFilter {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
}

export function useProperties(filter: PropertyFilter = {}) {
  return useQuery({
    queryKey: ['properties', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filter).forEach(([k, v]) => v && params.append(k, String(v)));
      const { data } = await api.get(`/properties?${params}`);
      return data.data;
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useApproveProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/properties/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useRejectProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/properties/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
