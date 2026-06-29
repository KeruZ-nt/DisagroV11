import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 segundos en lugar de 5 minutos
      retry: 1,
      refetchOnWindowFocus: true, // Refrescar al volver a la ventana
      refetchOnMount: true, // Siempre refrescar al montar
    },
  },
});
