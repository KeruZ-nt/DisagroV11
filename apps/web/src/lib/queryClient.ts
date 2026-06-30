import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Siempre obtener los datos más frescos inmediatamente
      retry: 1,
      refetchOnWindowFocus: true, // Refrescar al volver a la pestaña
      refetchOnMount: true, // Siempre refrescar al navegar
    },
  },
});
