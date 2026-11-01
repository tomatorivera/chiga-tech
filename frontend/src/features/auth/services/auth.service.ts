import { http } from "../../../shared/lib/http";
import type { LoginRequestDTO } from "../models/LoginRequestDTO";
import type { UsuarioDTO } from "../models/UsuarioDTO";

export interface IAuthService {
  login: (credentials: LoginRequestDTO) => Promise<UsuarioDTO>;
  logout: () => Promise<void>;
}

export const authService: IAuthService = {
  login: async (credentials: LoginRequestDTO): Promise<UsuarioDTO> => {
    const response = await http.post<UsuarioDTO>("/auth/login", credentials);
    return response.data;
  },

  // El backend borra la cookie de sesión, que JavaScript no puede tocar (ADR técnico 0003)
  logout: async (): Promise<void> => {
    await http.post("/auth/logout");
  },
};
