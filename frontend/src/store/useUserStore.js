import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store para manejar la sesión del usuario actual.
// El JWT viaja como cookie HttpOnly (el browser lo maneja automáticamente).
// Solo guardamos los datos del usuario (no el token) en el store/localStorage.
const useUserStore = create(
    persist(
        (set) => ({
            user: null,

            setUser: (userData) => set({ user: userData }),
            updateUser: (newData) => set((state) => ({ user: { ...state.user, ...newData } })),

            logout: async () => {
                // Llamar al servidor para que limpie la cookie HttpOnly
                try {
                    await fetch('http://localhost:5000/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include', // Necesario para enviar/recibir cookies
                    });
                } catch (_) {
                    // Si falla la red, igual limpiamos el estado local
                }
                set({ user: null });
            },

            isDonante: () => set((state) => state.user?.role === 'DONANTE'),
            isRecolector: () => set((state) => state.user?.role === 'RECOLECTOR'),
        }),
        {
            name: 'fooddrop-session', // solo guarda `user` en localStorage (sin token)
        }
    )
);

export default useUserStore;
