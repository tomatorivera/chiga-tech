// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { useSesion } from "../hooks/useSesion";
import type { UsuarioDTO } from "../models/UsuarioDTO";
import { AuthGuard } from "./AuthGuard";

const usuario: UsuarioDTO = {
  id: 1,
  nombreUsuario: "vendedor",
  nombre: "Ana",
  apellido: "Pérez",
  roles: ["Vendedor"],
  permisos: [],
};

function renderGuard() {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <p>login</p> },
      { element: <AuthGuard />, children: [{ path: "/inicio", element: <p>inicio</p> }] },
    ],
    { initialEntries: ["/inicio"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

describe("AuthGuard", () => {
  afterEach(() => {
    cleanup();
    useSesion.getState().logout();
  });

  it("redirige a /login si no hay usuario", () => {
    const router = renderGuard();

    expect(router.state.location.pathname).toBe("/login");
  });

  it("renderiza la ruta hija si hay usuario", () => {
    useSesion.getState().login(usuario);
    const router = renderGuard();

    expect(router.state.location.pathname).toBe("/inicio");
    expect(screen.getByText("inicio")).toBeTruthy();
  });
});
