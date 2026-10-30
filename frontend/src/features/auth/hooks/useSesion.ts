import { create } from "zustand";
import type { UsuarioDTO } from "../models/UsuarioDTO";
import { devtools } from "zustand/middleware";

interface SessionState {
  usuario: UsuarioDTO | null;
  login: (usuario: UsuarioDTO) => void;
  logout: () => void;
}

// Store global de la sesión, solo en memoria: la sesión real es la cookie HttpOnly (ADR técnico 0003)
export const useSesion = create<SessionState>()(
  devtools(
    (set) => ({
      usuario: null,
      login: (usuario) => set({ usuario }, false, "sesion/login"),
      logout: () => set({ usuario: null }, false, "sesion/logout"),
    }),
    { name: "session", enabled: import.meta.env.VITE_ENV === "development" },
  ),
);
