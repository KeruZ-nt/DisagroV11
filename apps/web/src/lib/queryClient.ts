import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto de frescura antes de recargar en background
      retry: 1,
      refetchOnWindowFocus: true, // Refrescar al volver a la pestaña
      refetchOnMount: true, // Siempre refrescar al navegar
    },
  },
});
